import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSessionId, loadHistory, clearMessages, setApiConnected } from '../store/chatSlice';
import { getHistory, checkHealth } from '../services/api';
import { Message } from '../types';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import './ChatPage.scss';

const ChatPage: React.FC = () => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkApiHealth = async () => {
      const isConnected = await checkHealth();
      dispatch(setApiConnected(isConnected));
    };

    let intervalId: ReturnType<typeof setInterval>;

    const startPolling = () => {
      checkApiHealth(); // 立即执行一次
      intervalId = setInterval(checkApiHealth, 5000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    // 初始启动
    startPolling();

    // 监听可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!routeSessionId || routeSessionId === 'new') {
      return;
    }

    dispatch(setSessionId(routeSessionId));

    const loadChatHistory = async () => {
      try {
        const historyItems = await getHistory(routeSessionId);
        if (historyItems.length === 0) {
          dispatch(clearMessages());
          return;
        }

        const historyMessages: Message[] = historyItems.map((item) => ({
          id: item._id || `${item.role}-${item.ts}`,
          role: item.role as 'user' | 'bot',
          text: item.text,
          timestamp: item.ts ? item.ts * 1000 : Date.now(),
          imageUrls: item.image_urls || [],
        }));

        dispatch(loadHistory(historyMessages));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadChatHistory();
  }, [routeSessionId, dispatch]);

  return (
    <div className="app">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatPage;