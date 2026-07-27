import { QueryResponse, HistoryItem } from '../types';

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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '登录失败');
  }

  return await response.json();
};

export const apiRegister = async (username: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '注册失败');
  }

  return await response.json();
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '请求失败');
  }

  return await response.json();
};

export const getHistory = async (sessionId: string): Promise<HistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/history/${sessionId}`, {
      headers: createAuthHeaders(),
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
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
    return response.ok;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
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