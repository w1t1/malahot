import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/auth';
import type { MenuProps } from 'antd';

const { Header, Content, Footer } = Layout;

export default function AppLayout() {
  const { isLoggedIn, nickname, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = role === 'ADMIN';

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">赛事大厅</Link> },
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TrophyOutlined style={{ fontSize: 24, color: '#fff' }} />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Malahot 电竞赛事</span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          style={{ flex: 1, marginLeft: 40, minWidth: 0 }}
        />
        <div>
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }}>
              <Space style={{ color: '#fff', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} size="small" />
                {nickname}
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Malahot 电竞赛事平台 ©2026
      </Footer>
    </Layout>
  );
}
