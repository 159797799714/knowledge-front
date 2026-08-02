import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Empty, Button, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { createNewSession } from '../store/chatSlice';
import { getSessionList } from '../services/api';
import { SessionItem } from '../types';

const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessionId } = useSelector((state: RootState) => state.chat);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [prevSessionId, setPrevSessionId] = useState<string>(sessionId);
  const hasLoadedRef = React.useRef(false);

  // 加载会话列表
  const loadSessions = async (forceRefresh: boolean = false) => {
    // 如果正在加载或已经加载过（非强制刷新），则不重复加载
    if (loading || (hasLoadedRef.current && !forceRefresh)) {
      return;
    }
    
    setLoading(true);
    hasLoadedRef.current = true;
    try {
      const response = await getSessionList(50);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // 加载失败时重置标志，允许重试
      hasLoadedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载会话列表
  useEffect(() => {
    loadSessions();
  }, []);

  // 监听 sessionId 变化，当创建新会话时自动导航
  useEffect(() => {
    if (sessionId && sessionId !== prevSessionId && prevSessionId) {
      // sessionId 发生变化且不是初始化，说明创建了 new session
      navigate(`/chat/${sessionId}`);
    }
    setPrevSessionId(sessionId);
  }, [sessionId, prevSessionId, navigate]);

  const handleSessionClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleNewChat = () => {
    // 直接创建新会话，会生成新的 sessionId
    // sessionId 变化会自动触发上面的 useEffect 进行导航
    onClose?.();
    dispatch(createNewSession());
  };

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>历史会话</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={() => loadSessions(true)}
            loading={loading}
            title="刷新会话列表"
          />
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleNewChat}>
            新建
          </Button>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="small" />
        </div>
      ) : sessions.length === 0 ? (
        <Empty description="暂无历史会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              onClick={() => handleSessionClick(session.session_id)}
              style={{
                cursor: 'pointer',
                backgroundColor: session.session_id === sessionId ? '#e6f7ff' : 'transparent',
                borderRadius: '4px',
                padding: '8px 12px',
                marginBottom: '4px',
              }}
            >
              <List.Item.Meta
                title={<span style={{ fontSize: '13px' }}>{`会话 ${session.session_id.slice(0, 8)}...`}</span>}
                description={
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {session.last_ts 
                      ? new Date(session.last_ts * 1000).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                    {' · '}{session.message_count || 0} 条消息
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Sidebar;
