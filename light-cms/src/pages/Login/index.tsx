import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { request, useNavigate } from '@umijs/max';
import './index.less';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        message.success('登录成功');
        navigate('/welcome');
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
    </div>
  );
};

export default LoginPage;