import React, { useState } from 'react';
import { Button, Form, Input, Modal, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { request, useNavigate } from '@umijs/max';
import { setupInitialPassword } from '@/services';
import './index.less';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const response = await request('/api/v1/login', {
        method: 'POST',
        data: { username, password },
      });

      if (response.code === 100000) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('mustChangePassword', String(user?.mustChangePassword === true));
        if (user?.mustChangePassword) {
          setPasswordModalOpen(true);
          message.info('首次登录请先修改密码');
        } else {
          message.success('登录成功');
          navigate('/welcome');
        }
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      const apiMessage = error?.data?.message ?? error?.response?.data?.message;
      message.error(apiMessage || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      const response = await setupInitialPassword(values);
      if (response.code === 100000) {
        localStorage.removeItem('token');
        localStorage.removeItem('mustChangePassword');
        setPasswordModalOpen(false);
        passwordForm.resetFields();
        message.success('密码设置成功，请使用新密码登录');
        navigate('/login');
      }
    } catch (error: any) {
      message.error(error?.data?.message || error?.response?.data?.message || '密码设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo">
          <img src={require('@/assets/logo.png')} alt="YELLEN LIGHTING" className="logo-image" />
        </div>
        <h1 className="login-title">Log in to your Account</h1>
        <p className="login-subtitle">Welcome back! Please, enter your information</p>
        <div className="login-form">
          <div className="form-item">
            <label className="form-label">Account</label>
            <Input
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
              onKeyPress={handleKeyPress}
              className="form-input"
            />
          </div>
          <div className="form-item">
            <label className="form-label">Password</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
              onKeyPress={handleKeyPress}
              className="form-input"
              suffix={
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeTwoTone />}
                </div>
              }
            />
          </div>
          <Button
            block
            loading={loading}
            onClick={handleLogin}
            className="login-button"
          >
            Log in
          </Button>
        </div>
      </div>
      <Modal
        title="首次登录，请修改密码"
        open={passwordModalOpen}
        closable={false}
        maskClosable={false}
        footer={null}
      >
        <p>为了保护账号安全，请先设置新的登录密码。</p>
        <Form form={passwordForm} layout="vertical" onFinish={handleInitialPassword}>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 8, message: '密码至少需要 8 位' }]}>
            <Input.Password placeholder="请输入至少 8 位新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" dependencies={['newPassword']} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('两次输入的新密码不一致')); } })]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>设置密码并重新登录</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginPage;