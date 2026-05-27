import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/auth';
import type { MenuProps } from 'antd';

const { Header, Content, Footer } = Layout;

export default function AppLayout() {
  const { isLoggedIn, nickname, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = role === 'ADMIN';

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/players', icon: <TeamOutlined />, label: <Link to="/players">选手名单</Link> },
    { key: '/champions', icon: <CrownOutlined />, label: <Link to="/champions">历届冠军</Link> },
    { key: '/rules', icon: <FileTextOutlined />, label: <Link to="/rules">积分规则</Link> },
    ...(isLoggedIn
      ? [{ key: '/my-teams', icon: <TeamOutlined />, label: <Link to="/my-teams">我的战队</Link> }]
      : []),
    ...(isAdmin
      ? [{ key: '/admin/competitions', icon: <SettingOutlined />, label: <Link to="/admin/competitions">赛事管理</Link> }]
      : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64 }}>
        <div className="app-logo" onClick={() => navigate('/')}>
          <TrophyOutlined className="app-logo-icon" />
          <span className="app-logo-text">Malahot</span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, marginLeft: 40, minWidth: 0, background: 'transparent', borderBottom: 'none' }}
        />
        <div>
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }}>
              <Space style={{ color: '#fff', cursor: 'pointer', padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }}>
                <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#e94560' }} />
                <span style={{ fontSize: 14 }}>{nickname}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')} style={{ borderRadius: 20, padding: '0 24px', fontWeight: 600 }}>
              登录
            </Button>
          )}
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
      <Footer className="app-footer">
        Malahot 电竞赛事平台 ©2026 · 让竞技更精彩
      </Footer>
    </Layout>
  );
}
