import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setApiConnected, loadHistory } from '../store/chatSlice';
import { checkHealth, getHistory } from '../services/api';
import { Message } from '../types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './ChatContainer.scss';

const ChatContainer: React.FC = () => {
  const dispatch = useDispatch();

  // 检查API连接状态
  useEffect(() => {
    const checkApiHealth = async () => {
      const isConnected = await checkHealth();
      dispatch(setApiConnected(isConnected));
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // 加载历史记录
  useEffect(() => {
    const loadChatHistory = async () => {
      const sessionId = localStorage.getItem('kb_session_id');
      if (!sessionId) return;

      try {
        const historyItems = await getHistory(sessionId);
        if (historyItems.length === 0) return;

        // 转换历史记录为Message格式
        const messages: Message[] = historyItems.map((item) => ({
          id: item._id || `${item.role}-${item.ts}`,
          role: item.role as 'user' | 'bot',
          text: item.text,
          timestamp: item.ts ? item.ts * 1000 : Date.now(),
          imageUrls: item.image_urls || [],
        }));

        dispatch(loadHistory(messages));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadChatHistory();
  }, [dispatch]);

  return (
    <div className="app">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatContainer;
