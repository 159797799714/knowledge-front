import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../types';

interface ChatState {
  messages: Message[];
  sessionId: string;
  isStreaming: boolean;
  apiConnected: boolean;
  isLoading: boolean;
}

// 从localStorage获取或生成sessionId
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('kb_session_id');
  if (!sessionId) {
    sessionId = 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('kb_session_id', sessionId);
  }
  return sessionId;
};

const initialState: ChatState = {
  messages: [
    {
      id: 'welcome',
      role: 'bot',
      text: '你好，我是掌柜智库知识库客服。你可以直接提问，我会在"阶段进度"里展示处理过程。',
      timestamp: Date.now(),
    },
  ],
  sessionId: getOrCreateSessionId(),
  isStreaming: true,
  apiConnected: false,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const { id, updates } = action.payload;
      const message = state.messages.find(m => m.id === id);
      if (message) {
        Object.assign(message, updates);
      }
    },
    clearMessages: (state) => {
      state.messages = [state.messages[0]]; // 保留欢迎消息
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
      localStorage.setItem('kb_session_id', action.payload);
    },
    setIsStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setApiConnected: (state, action: PayloadAction<boolean>) => {
      state.apiConnected = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loadHistory: (state, action: PayloadAction<Message[]>) => {
      // 保留欢迎消息，添加历史记录
      state.messages = [state.messages[0], ...action.payload];
    },
    clearAllProgress: (state) => {
      // 清除所有消息的 progress，用于发送新消息时重置之前的进度显示
      state.messages.forEach(msg => {
        if (msg.progress) {
          msg.progress = undefined;
        }
      });
    },
    // 切换会话
    switchSession: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
      state.messages = [state.messages[0]]; // 保留欢迎消息
      state.isStreaming = true;
      state.apiConnected = false;
      state.isLoading = false;
      localStorage.setItem('kb_session_id', action.payload);
    },
    // 创建新会话
    createNewSession: (state) => {
      const newSessionId = 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      state.sessionId = newSessionId;
      state.messages = [state.messages[0]];
      state.isStreaming = true;
      state.apiConnected = false;
      state.isLoading = false;
      localStorage.setItem('kb_session_id', newSessionId);
    },
  },
});

export const {
  addMessage,
  updateMessage,
  clearMessages,
  setSessionId,
  setIsStreaming,
  setApiConnected,
  setLoading,
  loadHistory,
  switchSession,
  createNewSession,
  clearAllProgress,
} = chatSlice.actions;

export default chatSlice.reducer;
