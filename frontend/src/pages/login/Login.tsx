import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { MobileOutlined, LockOutlined, TrophyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
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
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #e94560 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 装饰圆 */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(233,69,96,0.1)' }} />
      <div style={{ position: 'absolute', bottom: -120, left: -120, width: 350, height: 350, borderRadius: '50%', background: 'rgba(245,175,25,0.08)' }} />

      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: 'none', position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, color: '#999', fontSize: 13, transition: 'color 0.3s' }}>
          <ArrowLeftOutlined /> 返回主页
        </Link>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #e94560, #f5af19)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(233,69,96,0.3)',
          }}>
            <TrophyOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg, #e94560, #f5af19)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Malahot
          </h2>
          <p style={{ color: '#999', margin: 0, fontSize: 14 }}>电竞赛事平台 · 手机号登录</p>
        </div>
        <Form form={form} onFinish={onFinish} size="large">
          <Form.Item name="phone" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
            <Input prefix={<MobileOutlined style={{ color: '#bbb' }} />} placeholder="手机号" maxLength={11} style={{ borderRadius: 8, height: 44 }} />
          </Form.Item>
          <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Input prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder="验证码" maxLength={6} style={{ borderRadius: 8, height: 44 }} />
              <Button disabled={countdown > 0} onClick={sendCode} style={{ width: 130, borderRadius: 8, height: 44, fontWeight: 500 }}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{
              height: 46, borderRadius: 8, fontWeight: 600, fontSize: 16,
              background: 'linear-gradient(135deg, #e94560, #f5af19)',
              border: 'none', boxShadow: '0 4px 16px rgba(233,69,96,0.3)',
            }}>
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
