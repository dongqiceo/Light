import React, { useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { history } from '@umijs/max';
import { changePassword } from '@/services';

const ChangePasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      const response = await changePassword(values);
      if (response.code === 100000) {
        localStorage.removeItem('token');
        localStorage.removeItem('mustChangePassword');
        message.success('密码修改成功，请使用新密码登录');
        history.replace('/login');
      }
    } catch (error: any) {
      message.error(error?.data?.message || error?.response?.data?.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="修改密码" style={{ maxWidth: 560 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="currentPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
          <Input.Password placeholder="请输入当前密码" />
        </Form.Item>
        <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 8, message: '密码至少需要 8 位' }]}>
          <Input.Password placeholder="请输入至少 8 位新密码" />
        </Form.Item>
        <Form.Item name="confirmPassword" label="确认新密码" dependencies={['newPassword']} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('两次输入的新密码不一致')); } })]}>
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>保存新密码</Button>
      </Form>
    </Card>
  );
};

export default ChangePasswordPage;