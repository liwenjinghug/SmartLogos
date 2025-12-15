import React from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    await login(values);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <Title level={3}>欢迎回来</Title>
          <Text type="secondary">登录后即可管理你的文档与笔记</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="用户名或邮箱"
            name="username"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input size="large" placeholder="zhangsan" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            登录
          </Button>
        </Form>
        <div className="auth-footer">
          <Text>还没有账号？</Text> <Link to="/register">去注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
