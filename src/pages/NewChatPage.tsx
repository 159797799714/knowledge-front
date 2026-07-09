import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Empty } from 'antd';
import { createNewSession } from '../store/chatSlice';

const NewChatPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // 创建新会话
    dispatch(createNewSession());
    
    // 获取新生成的 sessionId
    const newSessionId = localStorage.getItem('kb_session_id');
    
    // 立即导航到新会话页面
    if (newSessionId) {
      navigate(`/chat/${newSessionId}`, { replace: true });
    }
  }, [navigate, dispatch]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card>
        <Empty
          description="正在创建新对话..."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    </div>
  );
};

export default NewChatPage;
