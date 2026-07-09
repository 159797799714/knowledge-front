import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addMessage, updateMessage, setLoading, clearAllProgress } from '../store/chatSlice';
import { sendQuery, createSSEConnection } from '../services/api';
import { Message } from '../types';
import './ChatInput.scss';

const ChatInput: React.FC = () => {
  const dispatch = useDispatch();
  const { sessionId, isStreaming, isLoading } = useSelector((state: RootState) => state.chat);
  const [inputValue, setInputValue] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');

    dispatch(clearAllProgress());

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    dispatch(addMessage(userMessage));

    const botMessageId = `bot-${Date.now()}`;
    const botMessage: Message = {
      id: botMessageId,
      role: 'bot',
      text: '',
      timestamp: Date.now(),
      progress: {
        doneList: [],
        runningList: [],
        status: 'pending',
      },
    };
    dispatch(addMessage(botMessage));
    dispatch(setLoading(true));

    try {
      const response = await sendQuery(text, sessionId, isStreaming);

      if (!isStreaming) {
        dispatch(updateMessage({
          id: botMessageId,
          updates: {
            text: response.answer || '',
            imageUrls: response.image_urls || [],
            progress: {
              doneList: response.done_list || [],
              runningList: [],
              status: response.error ? 'failed' : 'completed',
            },
            error: response.error,
          },
        }));
        dispatch(setLoading(false));
      } else {
        let rawAnswerText = '';

        eventSourceRef.current = createSSEConnection(
          response.session_id,
          (data) => {
            dispatch(updateMessage({
              id: botMessageId,
              updates: {
                progress: {
                  doneList: data.done_list || [],
                  runningList: data.running_list || [],
                  status: data.status || 'processing',
                },
              },
            }));

            if (data.status === 'completed') {
              dispatch(setLoading(false));
            }
          },
          (data) => {
            const delta = data.delta || '';
            if (delta) {
              rawAnswerText += delta;
              dispatch(updateMessage({
                id: botMessageId,
                updates: {
                  text: rawAnswerText,
                },
              }));
            }
          },
          (data) => {
            const finalText = (data && typeof data.answer === 'string' && data.answer.trim().length > 0)
              ? data.answer
              : rawAnswerText;

            dispatch(updateMessage({
              id: botMessageId,
              updates: {
                text: finalText,
                imageUrls: data.image_urls || [],
                progress: {
                  doneList: data.done_list || [],
                  runningList: [],
                  status: 'completed',
                },
              },
            }));
            dispatch(setLoading(false));
          },
          (error) => {
            dispatch(updateMessage({
              id: botMessageId,
              updates: {
                text: rawAnswerText + `\n\n（错误：${error.error || 'SSE连接中断/失败'}）`,
                progress: {
                  doneList: [],
                  runningList: [],
                  status: 'failed',
                },
                error: error.error,
              },
            }));
            dispatch(setLoading(false));
          }
        );
      }
    } catch (error) {
      dispatch(updateMessage({
        id: botMessageId,
        updates: {
          text: `请求失败：${error instanceof Error ? error.message : String(error)}`,
          progress: {
            doneList: [],
            runningList: [],
            status: 'failed',
          },
          error: error instanceof Error ? error.message : String(error),
        },
      }));
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="composer">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入问题（Enter 发送，Shift+Enter 换行）"
          disabled={isLoading}
        />
        <button
          className="send"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          发送
        </button>
      </div>
      <div className="hint">
        快捷键：<span className="kbd">Enter</span> 发送，<span className="kbd">Shift</span>+<span className="kbd">Enter</span> 换行
      </div>
    </>
  );
};

export default ChatInput;