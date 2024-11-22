





import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Row, Col } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { FaUser } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import { ConfigProvider } from 'antd';
import {
  FaTachometerAlt, FaClipboardList, FaKey, FaFolder, FaBox, FaUsers,
  FaSlideshare, FaBoxOpen, FaStore, FaShoppingCart, FaTags, FaFileAlt,
  FaChartBar, FaExchangeAlt, FaShippingFast, FaReply
} from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive'; // Import useMediaQuery
import '../AdminPanel.css'; // Import your CSS file here

const { Header, Sider, Content, Footer } = Layout;

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, link: "/dashboard" },
  { key: "settings", label: "Settings", icon: <FaClipboardList />, link: "/settings" },
  {
    key: "categories",
    label: "Categories",
    icon: <FaFolder />,
    dropdownItems: [{ key: "categoryList", label: "Category List", icon: <FaBox />, link: '/categories' }]
  },
  {
    key: "users",
    label: "Users",
    icon: <FaUsers />,
    dropdownItems: [
      { key: "customerList", label: "Customer List", icon: <FaUsers />, link: '/customerslist' },
      { key: "deliveryBoys", label: "Delivery Boy List", icon: <FaUsers />, link: "/deliveryboys" }
    ]
  },
  {
    key: "slides",
    label: "Slides",
    icon: <FaSlideshare />,
    dropdownItems: [{ key: "slidesList", label: "Slides List", icon: <FaSlideshare />, link: "/slides" }]
  },
  {
    key: "items",
    label: "Items",
    icon: <FaBoxOpen />,
    dropdownItems: [{ key: "listItems", label: "List Items", icon: <FaBoxOpen />, link: "/items" }]
  },
  {
    key: "sellers",
    label: "Sellers",
    icon: <FaStore />,
    dropdownItems: [
      { key: "sellersList", label: "Sellers List", icon: <FaStore />, link: "/sellerslist" },
    ]
  },
  {
    key: "orders",
    label: "Orders",
    icon: <FaShoppingCart />,
    dropdownItems: [
      { key: "ordersList", label: "Orders List", icon: <FaBox />, link: "/orderslist" },
      { key: "returnPendingList", label: "Return Pending List", icon: <FaShippingFast />, link: '/pendingorders' },
      { key: "returnRepliedList", label: "Return Replied List", icon: <FaReply />, link: '/repliedorders' }
    ]
  },
];

const ProfileMenu = ({ onSignOut }) => (
  <Menu>
    <Menu.Item key="signout" onClick={onSignOut}>
      Sign Out
    </Menu.Item>
  </Menu>
);

const AdminPanelLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // Check for mobile
  const navigate = useNavigate();
 
  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleOpenChange = (keys) => setOpenKeys(keys.length ? [keys.pop()] : []);
  
  
  // Sign-out functionality
  const handleSignOut = () => {
    // Clear user authentication tokens or session data
    localStorage.removeItem('authToken'); // Example of clearing a token
    sessionStorage.removeItem('userSession'); // Clear session data if used

    // Redirect to login page
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
        width={240} 
        className="fixed-sidebar"
      >
        <div className="logo" style={{ padding: '10px 0' }}>
          <Row justify="center" align="middle">
            <div className="text-white text-center font-bold my-4" style={{ fontSize: 24 }}>
              <span style={{ color: '#32CD32' }}>{collapsed ? 'O' : 'OXY'}</span>
              <span style={{ color: '#FFD700' }}>{collapsed ? '' : 'RICE'}</span>
            </div>
          </Row>
        </div>
       
  <Menu theme='dark' mode="inline" openKeys={openKeys} onOpenChange={handleOpenChange}>
  {sidebarItems.map(item => (
    item.dropdownItems ? (
      <Menu.SubMenu 
        key={item.key} 
        icon={item.icon} 
        title={item.label} 
        className="custom-sidebar-submenu"
      >
        {item.dropdownItems.map(dropdownItem => (
          <Menu.Item key={dropdownItem.key} className="custom-sidebar-item">
            <Link to={dropdownItem.link}>{dropdownItem.label}</Link>
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    ) : (
      <Menu.Item key={item.key} icon={item.icon} className="custom-sidebar-item">
        <Link to={item.link}>{item.label}</Link>
      </Menu.Item>
    )
  ))}
</Menu>










      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240 }}>
        <Header style={{
          padding: '0 16px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        }}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              marginRight: '16px',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          {/* Profile Dropdown */}
          <div onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
             <MdLogout style={{ marginRight: 8 }} />  
             <span>Logout</span>
          </div>


        </Header>

        <Content style={{ margin: '16px' }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center', background: '#fff', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}>
          OxyRice Admin ©2024 Created by Oxyrice Company
        </Footer>
      </Layout>
    </Layout>
  );
};


export default AdminPanelLayout;

