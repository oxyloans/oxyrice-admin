import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Row, Col } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  FaTachometerAlt, FaClipboardList, FaKey, FaFolder, FaBox, FaUsers,
  FaSlideshare, FaBoxOpen, FaStore, FaShoppingCart, FaTags, FaFileAlt,
  FaChartBar, FaExchangeAlt, FaShippingFast, FaReply
} from 'react-icons/fa';
import '../AdminPanel.css'; // Import your CSS file here

const { Header, Sider, Content, Footer } = Layout;

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, link: "/dashboard" },
  { key: "settings", label: "Settings", icon: <FaClipboardList />, link: "/settingsform" },
  { key: "changePassword", label: "Change Password", icon: <FaKey />, link: "/changepassword" },
  {
    key: "categories",
    label: "Categories",
    icon: <FaFolder />,
    dropdownItems: [{ key: "categoryList", label: "Category List", icon: <FaBox />, link: '/categories' }]
  },
  {
    key: "subscriptionPlans",
    label: "Subscription Plans",
    icon: <FaUsers />,
    dropdownItems: [
      { key: "subscriptionPlanList", label: "Subscription Plan List", icon: <FaUsers />, link: '/subscriptionplans' },
      { key: "subscribersList", label: "Subscribers List", icon: <FaUsers />, link: '/subscriberdetails' }
    ]
  },
  {
    key: "users",
    label: "Users",
    icon: <FaUsers />,
    dropdownItems: [
      { key: "customerList", label: "Customer List", icon: <FaUsers />, link: '/customers' },
      { key: "deliveryBoys", label: "Delivery Boy List", icon: <FaUsers />, link: "/delivery-boys" }
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
      { key: "sellerAdd", label: "Seller Add", icon: <FaShoppingCart />, link: '/seller/add' }
    ]
  },
  {
    key: "coupons",
    label: "Coupons",
    icon: <FaTags />,
    dropdownItems: [{ key: "listCoupons", label: "List Coupons", icon: <FaTags />, link: '/coupons' }]
  },
  {
    key: "orders",
    label: "Orders",
    icon: <FaShoppingCart />,
    dropdownItems: [
      { key: "ordersList", label: "Orders List", icon: <FaBox />, link: "/orders" },
      { key: "returnPendingList", label: "Return Pending List", icon: <FaShippingFast />, link: '/pending-orders' },
      { key: "returnRepliedList", label: "Return Replied List", icon: <FaReply />, link: '/repliedorders' }
    ]
  },
  {
    key: "reports",
    label: "Reports",
    icon: <FaFileAlt />,
    dropdownItems: [
      { key: "itemRequirement", label: "Item Requirement", icon: <FaChartBar />, link: '/itemrequirement' },
      { key: "refundOrders", label: "Refund Orders", icon: <FaExchangeAlt />, link: '/refundorders' },
      { key: "ordersReport", label: "Orders Report", icon: <FaChartBar />, link: '/ordersreport' }
    ]
  }
];

const ProfileMenu = ({ onSignOut }) => (
  <Menu>
    <Menu.Item key="profile">
      <Link to="/profile">Profile</Link>
    </Menu.Item>
    <Menu.Item key="signout" onClick={onSignOut}>
      Sign Out
    </Menu.Item>
  </Menu>
);

const AdminPanelLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleOpenChange = (keys) => setOpenKeys(keys.length ? [keys.pop()] : []);
  const handleSignOut = () => console.log("User signed out");

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} width={250}>
        <div className="logo" style={{ padding: '10px 0' }}>
          <Row justify="center" align="middle">
            <Col>
              {collapsed ? (
                <span style={{ color: '#f1c40f', fontSize: '35px', fontFamily: 'Arial' }}>O</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="60" viewBox="0 0 200 80">
                  <text x="10" y="50" fontFamily="Arial" fontSize="35" fill="#27ae60">OXY</text>
                  <text x="80" y="50" fontFamily="Arial" fontSize="35" fill="#f1c40f">RICE</text>
                </svg>
              )}
            </Col>
          </Row>
        </div>
        <Menu theme="dark" mode="inline" openKeys={openKeys} onOpenChange={handleOpenChange}>
          {sidebarItems.map(item => (
            item.dropdownItems ? (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label} style={{ color: 'white' }}>
                {item.dropdownItems.map(dropdownItem => (
                  <Menu.Item key={dropdownItem.key} style={{ color: 'white' }}>
                    <Link to={dropdownItem.link}>{dropdownItem.label}</Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon} >
                <Link to={item.link}>{item.label}</Link>
              </Menu.Item>
            )
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button type="primary" onClick={toggleCollapse} style={{ marginLeft: '16px' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <Dropdown overlay={<ProfileMenu onSignOut={handleSignOut} />} trigger={['click']}>
            <Avatar style={{ marginRight: '16px' }} icon={<FaUsers />} />
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 400 }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center', padding: '10px 0px', color: 'black', backgroundColor: 'white', fontSize: '16px' }}>
  OxyRice Admin ©2024 Created by Oxyrice Company
</Footer>

      </Layout>
    </Layout>
  );
};

export default AdminPanelLayout;
