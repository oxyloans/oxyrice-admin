import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaFolder,
  FaBox,
  
  FaBoxOpen,

  FaShoppingCart,
  
  FaShippingFast,
  FaReply,
  FaUser,
} from "react-icons/fa";
import { Menu, Layout, Dropdown, Avatar } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../AdminPanel.css";

const { Header, Content, Footer, Sider } = Layout;

const sidebarItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    link: "/dashboard",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <FaClipboardList />,
    link: "/settings",
  },
  {
    key: "categories",
    label: "Categories",
    icon: <FaFolder />,
    dropdownItems: [
      {
        key: "categoryList",
        label: "Category List",
        icon: <FaBox />,
        link: "/categories",
      },
    ],
  },
  {
    key: "users",
    label: "Users",
    icon: <FaUsers />,
    dropdownItems: [
      {
        key: "customerList",
        label: "Customer List",
        icon: <FaUsers />,
        link: "/customerslist",
      },
      {
        key: "deliveryBoys",
        label: "Delivery Boy List",
        icon: <FaUsers />,
        link: "/deliveryboys",
      },
    ],
  },
  {
    key: "items",
    label: "Items",
    icon: <FaBoxOpen />,
    dropdownItems: [
      {
        key: "listItems",
        label: "List Items",
        icon: <FaBoxOpen />,
        link: "/items",
      },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    icon: <FaShoppingCart />,
    dropdownItems: [
      {
        key: "ordersList",
        label: "Orders List",
        icon: <FaBox />,
        link: "/orderslist",
      },
      {
        key: "returnPendingList",
        label: "Return Pending List",
        icon: <FaShippingFast />,
        link: "/pendingorders",
      },
      {
        key: "returnRepliedList",
        label: "Return Replied List",
        icon: <FaReply />,
        link: "/repliedorders",
      },
    ],
  },
];

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();

  const handleOpenChange = (keys) =>
    setOpenKeys(keys.length ? [keys.pop()] : []);
  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userSession");
    navigate("/");
  };

  const ProfileMenu = ({ onSignOut }) => (
    <Menu>
      <Menu.Item key="signout" onClick={onSignOut}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={230}
        className="fixed-sidebar"
      >
        <div
          className="text-white text-center font-bold my-4"
          style={{ fontSize: 24 }}
        >
          <span style={{ color: "#32CD32" }}>{collapsed ? "O" : "OXY"}</span>
          <span style={{ color: "#FFD700" }}>{collapsed ? "" : "RICE"}</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
        >
          {sidebarItems.map((item) =>
            item.dropdownItems ? (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.dropdownItems.map((dropdownItem) => (
                  <Menu.Item key={dropdownItem.key}>
                    <Link to={dropdownItem.link}>{dropdownItem.label}</Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon}>
                <Link to={item.link}>{item.label}</Link>
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>

      {/* Main Layout Content */}
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              marginRight: "16px",
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          {/* Profile Dropdown */}
          <Dropdown
            overlay={<ProfileMenu onSignOut={handleSignOut} />}
            trigger={["click"]}
          >
            <Avatar style={{ cursor: "pointer" }} icon={<FaUser />} />
          </Dropdown>
        </Header>

        {/* Content Section */}
        <Content style={{ padding: "24px", margin: 0, minHeight: 280 }}>
          {children}
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: "center", background: "#fff" }}>
          OxyRice Admin ©2024 Created by Oxyrice Company
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
