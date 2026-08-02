import { QueryResponse, HistoryItem, SessionListResponse } from '../types';
import { message } from 'antd';

const API_BASE = 'http://119.29.206.59/knowledge/queryApi';

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const createAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// 统一处理HTTP响应状态码
let redirectTimer: NodeJS.Timeout | null = null;

const handleResponse = async (response: Response): Promise<any> => {
  // 401未授权，重定向到登录页面
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('kb_session_id');
    localStorage.removeItem('username');

    // 清除之前的定时器（如果存在）
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      // 显示toast提示（持续1.5秒，比重定向时间短）
      message.warning('认证已过期，即将跳转到登录页面...', 1.5);

    }

    // 延迟2秒后重定向
    redirectTimer = setTimeout(() => {
      console.log('执行401重定向到/login');
      window.location.hash = '#/login';
      redirectTimer = null;
    }, 2000);

    throw new Error('认证已过期，请重新登录');
  }

  // 其他错误状态码
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `请求失败 (${response.status})`);
  }

  // 成功响应，尝试解析JSON
  try {
    return await response.json();
  } catch {
    debugger
    return null;
  }
};

export interface LoginResponse {
  message: string;
  username: string;
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
}

export const apiLogin = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  return await handleResponse(response);
};

export const apiRegister = async (username: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  return await handleResponse(response);
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const sendQuery = async (
  query: string,
  sessionId: string,
  isStream: boolean
): Promise<QueryResponse> => {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({
      query,
      session_id: sessionId,
      is_stream: isStream,
    }),
  });

  return await handleResponse(response);
};

export const getHistory = async (sessionId: string): Promise<HistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/history/${sessionId}`, {
      headers: createAuthHeaders(),
    });
    
    // 401已经在handleResponse中处理，会抛出异常
    const data = await handleResponse(response);
    return Array.isArray(data?.items) ? data.items : [];
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
};

export const clearHistory = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/history/${sessionId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    // 401已经在handleResponse中处理
    await handleResponse(response);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
};

export const getSessionList = async (limit: number = 100): Promise<SessionListResponse> => {
  try {
    const response = await fetch(`${API_BASE}/sessions?limit=${limit}`, {
      headers: createAuthHeaders(),
    });
    
    // 401已经在handleResponse中处理，会抛出异常
    const data = await handleResponse(response);
    return {
      sessions: Array.isArray(data?.sessions) ? data.sessions : [],
      total: data?.total || 0,
    };
  } catch (error) {
    console.error('Failed to fetch session list:', error);
    return { sessions: [], total: 0 };
  }
};

export const createSSEConnection = (
  sessionId: string,
  onProgress: (data: any) => void,
  onDelta: (data: any) => void,
  onFinal: (data: any) => void,
  onError: (error: any) => void
): EventSource => {
  const token = getToken();
  const url = token
    ? `${API_BASE}/stream/${sessionId}?token=${encodeURIComponent(token)}`
    : `${API_BASE}/stream/${sessionId}`;

  const eventSource = new EventSource(url);

  eventSource.addEventListener('progress', (e) => {
    try {
      const data = JSON.parse(e.data || '{}');
      onProgress(data);
    } catch (error) {
      console.error('Failed to parse progress event:', error);
    }
  });

  eventSource.addEventListener('delta', (e) => {
    try {
      const data = JSON.parse(e.data || '{}');
      onDelta(data);
    } catch (error) {
      console.error('Failed to parse delta event:', error);
    }
  });

  eventSource.addEventListener('final', (e) => {
    try {
      const data = JSON.parse(e.data || '{}');
      onFinal(data);
      eventSource.close();
    } catch (error) {
      console.error('Failed to parse final event:', error);
    }
  });

  eventSource.addEventListener('final_answer', (e) => {
    try {
      const data = JSON.parse(e.data || '{}');
      onFinal(data);
      eventSource.close();
    } catch (error) {
      console.error('Failed to parse final_answer event:', error);
    }
  });

  eventSource.addEventListener('error', (e) => {
    try {
      const data = (e as MessageEvent).data ? JSON.parse((e as MessageEvent).data) : { error: 'SSE连接中断/失败' };
      onError(data);
      eventSource.close();
    } catch (error) {
      onError({ error: 'SSE连接中断/失败' });
      eventSource.close();
    }
  });

  return eventSource;
};

export default API_BASE;