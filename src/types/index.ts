// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp?: number;
  imageUrls?: string[];
  progress?: ProgressState;
  error?: string;
}

// 进度状态
export interface ProgressState {
  doneList: string[];
  runningList: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// API响应类型
export interface QueryResponse {
  session_id: string;
  answer?: string;
  done_list?: string[];
  error?: string;
  message?: string;
  image_urls?: string[];
}

// SSE事件类型
export interface SSEEvent {
  type: 'progress' | 'delta' | 'final' | 'final_answer' | 'error';
  data: any;
}

// 历史记录项
export interface HistoryItem {
  _id: string;
  session_id: string;
  role: string;
  text: string;
  ts?: number;
  image_urls?: string[];
}

// 会话项
export interface SessionItem {
  session_id: string;
  last_ts?: number;
  message_count?: number;
}

// 会话列表响应
export interface SessionListResponse {
  sessions: SessionItem[];
  total: number;
}
