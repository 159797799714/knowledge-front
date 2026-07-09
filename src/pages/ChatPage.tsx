import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSessionId, loadHistory, clearMessages, setApiConnected } from '../store/chatSlice';
import { getHistory, checkHealth } from '../services/api';
import { Message } from '../types';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import '../components/ChatContainer.scss';

const ChatPage: React.FC = () => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkApiHealth = async () => {
      const isConnected = await checkHealth();
      dispatch(setApiConnected(isConnected));
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 5000);

    return () => clearInterval(interval);
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