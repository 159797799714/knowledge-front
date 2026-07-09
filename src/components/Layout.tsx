import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Drawer } from 'antd';
import {
  MenuOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import './Layout.scss';

const { Content, Sider } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    {
      key: '/chat/new',
      icon: <PlusOutlined />,
      label: '新建对话',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <button className="mobile-menu-btn" onClick={toggleDrawer}>
        <MenuOutlined />
      </button>

      <Sider
        width={280}
        theme="light"
        className="sidebar"
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>智库</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/chat/') && location.pathname !== '/chat/new' ? '/chat/' + location.pathname.split('/')[2] : location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
        <Sidebar />
      </Sider>

      <AntLayout style={{ marginLeft: 280 }} className="main-content">
        <Content style={{ padding: '0', overflow: 'auto', height: '100vh' }}>
          <Outlet />
        </Content>
      </AntLayout>

      <Drawer
        title="智库"
        placement="left"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="mobile-drawer"
        extra={
          <button onClick={() => setDrawerOpen(false)} className="drawer-close-btn">
            关闭
          </button>
        }
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/chat/') && location.pathname !== '/chat/new' ? '/chat/' + location.pathname.split('/')[2] : location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
        <Sidebar />
      </Drawer>
    </AntLayout>
  );
};

export default Layout;