import React, { useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { history } from '@umijs/max';
import { setupInitialPassword } from '@/services';

const PasswordSetupPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      const response = await setupInitialPassword(values);
      if (response.code === 100000) {
        localStorage.removeItem('token');
        localStorage.removeItem('mustChangePassword');
        message.success('密码设置成功，请使用新密码登录');
        history.replace('/login');
      }
    } catch (error: any) {
      message.error(error?.data?.message || error?.response?.data?.message || '密码设置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card title="首次设置密码" style={{ width: '100%', maxWidth: 440 }}>
        <p>为了保护账号安全，请先设置新的登录密码。</p>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 8, message: '密码至少需要 8 位' }]}>
            <Input.Password placeholder="请输入至少 8 位新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" dependencies={['newPassword']} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('两次输入的新密码不一致')); } })]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>设置密码并重新登录</Button>
        </Form>
      </Card>
    </div>
  );
};

export default PasswordSetupPage;