import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { List, Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface SessionInfo {
  id: string;
  title: string;
  timestamp: number;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const { sessionId } = useSelector((state: RootState) => state.chat);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    // TODO: 实际项目中需要从API获取会话列表
    // 这里暂时使用静态数据
    const currentSessionId = routeSessionId || sessionId;
    if (currentSessionId && currentSessionId !== 'new') {
      setSessions([
        {
          id: currentSessionId,
          title: '当前会话',
          timestamp: Date.now(),
        },
      ]);
    } else {
      setSessions([]);
    }
  }, [routeSessionId, sessionId]);

  const handleSessionClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleNewChat = () => {
    navigate('/chat/new');
  };

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>历史会话</h3>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleNewChat}>
          新建
        </Button>
      </div>
      {sessions.length === 0 ? (
        <Empty description="暂无历史会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              onClick={() => handleSessionClick(session.id)}
              style={{
                cursor: 'pointer',
                backgroundColor: session.id === sessionId ? '#e6f7ff' : 'transparent',
                borderRadius: '4px',
                padding: '8px 12px',
                marginBottom: '4px',
              }}
            >
              <List.Item.Meta
                title={<span style={{ fontSize: '13px' }}>{session.title}</span>}
                description={
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {new Date(session.timestamp).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
