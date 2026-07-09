import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setIsStreaming, clearMessages } from '../store/chatSlice';
import { clearHistory } from '../services/api';
import './ChatHeader.scss';

const ChatHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { apiConnected, isStreaming, sessionId } = useSelector((state: RootState) => state.chat);

  const handleClearChat = async () => {
    if (!window.confirm('确定要清空当前会话的历史记录吗？这将无法恢复。')) {
      return;
    }

    try {
      await clearHistory(sessionId);
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('服务端清空失败，仅清空本地显示');
    }

    dispatch(clearMessages());
  };

  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo"></div>
        <div className="title">
          <strong>智能知识库</strong>
          <span>在线 · 可查询知识库与联网信息</span>
        </div>
      </div>
      <div className="top-actions">
        <label className="stream-toggle">
          <input
            type="checkbox"
            checked={isStreaming}
            onChange={(e) => dispatch(setIsStreaming(e.target.checked))}
          />
          流式输出
        </label>
        <span className={`pill ${apiConnected ? 'connected' : 'disconnected'}`}>
          API: {apiConnected ? '已连接' : '未连接'}
        </span>
        <button className="btn" onClick={handleClearChat}>
          清空对话
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
