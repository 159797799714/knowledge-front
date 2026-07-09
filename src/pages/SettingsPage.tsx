import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Switch, Button, Divider, message, Space } from 'antd';
import { RootState } from '../store/store';
import { setIsStreaming, clearMessages } from '../store/chatSlice';
import { clearHistory } from '../services/api';

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { isStreaming, sessionId } = useSelector((state: RootState) => state.chat);

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空当前会话的历史记录吗?')) {
      return;
    }

    try {
      await clearHistory(sessionId);
      dispatch(clearMessages());
      message.success('历史记录已清空');
    } catch (error) {
      console.error('清空历史失败:', error);
      message.error('清空失败,请重试');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="⚙️ 设置">
        <Form layout="vertical">
          <Form.Item
            label="流式输出"
            help="开启后将以流式方式逐字显示回答,关闭后将一次性显示完整回答"
          >
            <Switch
              checked={isStreaming}
              onChange={(checked) => dispatch(setIsStreaming(checked))}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </Form.Item>

          <Divider />

          <Form.Item label="数据管理">
            <Space>
              <Button danger onClick={handleClearHistory}>
                清空当前会话历史
              </Button>
            </Space>
          </Form.Item>

          <Divider />

          <Form.Item label="关于">
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <p><strong>掌柜智库知识库</strong></p>
              <p>版本: v0.2.0</p>
              <p>技术栈: React 18 + TypeScript + Ant Design + Redux Toolkit</p>
              <p>功能特点:</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>支持流式/非流式对话模式</li>
                <li>SSE实时流式响应</li>
                <li>多会话管理</li>
                <li>历史记录查询</li>
                <li>图片展示支持</li>
                <li>进度状态追踪</li>
              </ul>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
