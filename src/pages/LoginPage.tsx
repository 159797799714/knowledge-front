import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../store/authSlice';
import { apiLogin, apiRegister } from '../services/api';
import './LoginPage.scss';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<AuthMode>('login');
  const [form] = Form.useForm();

  const redirectPath = (location.state as { from?: string })?.from || '/chat/new';

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = activeMode === 'login'
        ? await apiLogin(values.username, values.password)
        : await apiRegister(values.username, values.password);

      if (result.access_token) {
        dispatch(login({ token: result.access_token, username: values.username }));
        message.success(activeMode === 'login' ? '登录成功' : '注册成功');
        navigate(redirectPath, { replace: true });
      } else {
        message.error(activeMode === 'login' ? '登录失败，请重试' : '注册失败，请重试');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : (activeMode === 'login' ? '登录失败' : '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveMode(key as AuthMode);
    form.resetFields();
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h2 className="login-title">智库</h2>
          <p className="login-subtitle">智能问答系统</p>
        </div>

        <Tabs activeKey={activeMode} onChange={handleTabChange}>
          <Tabs.TabPane tab="登录" key="login" />
          <Tabs.TabPane tab="注册" key="register" />
        </Tabs>

        <Form
          form={form}
          name={activeMode}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-btn"
            >
              {activeMode === 'login' ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;