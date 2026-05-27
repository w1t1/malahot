import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { MobileOutlined, LockOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { setAuth, isLoggedIn } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendCode = useCallback(async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }
      await authApi.sendCode(phone);
      message.success('验证码已发送（开发模式验证码为 8888）');
      setCountdown(60);
    } catch (e: any) {
      message.error(e.message || '发送失败');
    }
  }, [form]);

  const onFinish = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.phone, values.code);
      setAuth(res.data);
      message.success('登录成功');
      navigate('/');
    } catch (e: any) {
      message.error(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <TrophyOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <h2>Malahot 电竞赛事</h2>
          <p style={{ color: '#999' }}>手机号验证码登录</p>
        </div>
        <Form form={form} onFinish={onFinish} size="large">
          <Form.Item name="phone" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
            <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} />
          </Form.Item>
          <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input prefix={<LockOutlined />} placeholder="验证码" maxLength={6} />
              <Button disabled={countdown > 0} onClick={sendCode} style={{ width: 130 }}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
