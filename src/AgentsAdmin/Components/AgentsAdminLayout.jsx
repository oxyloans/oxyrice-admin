import React, { useState, useEffect } from "react";
import { Layout, Menu, Row, Grid } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import { UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { MdLogout} from "react-icons/md";
import { FaStore } from "react-icons/fa";
import { MessageOutlined } from "@ant-design/icons";
import {
  DashboardOutlined,
  FileTextOutlined,
  FileDoneOutlined,

} from "@ant-design/icons";


const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const AgentsAdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screens.xs) {
      setCollapsed(true); // Always collapse on small screens
    } else if (screens.md) {
      setCollapsed(false); // Expand on larger screens
    }
  }, [screens]);

const sidebarItems = [
  {
    key: "agents-dashboard",
    label: "Agents Dashboard",
    icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
    link: "/admin/assistantslist",
    style: { fontSize: "20px" }, // Custom font size for label
  },
  {
    key: "agent-status",
    label: "Agents Status List",
    icon: <FileTextOutlined style={{ fontSize: "18px" }} />,
    link: "/admin/agentsstatuslist",
    style: { fontSize: "20px" },
  },
  {
    key: "agent-users",
    label: "Agents  Users",
    icon: <UserOutlined style={{ fontSize: "18px" }} />,

    style: { fontSize: "20px" },
    dropdownItems: [
      {
        key: "Agents Registered Users",
        label: "Agents Registered Users",
        link: "/admin/agentsregisteredusers",
      },
      {
        key: "Agents Creation Users",
        label: "Agents Creation Users",
        link: "/admin/agents-creation-users",
      },
    ],
  },
  {
    key: "agent-user-history",
    label: "User Chat History",
    icon: <FileTextOutlined style={{ fontSize: "18px" }} />,
    link: "/admin/userhistory",
    style: { fontSize: "20px" },
  },
  {
    key: "gpt-store",
    label: "GPT Agent Store",
    icon: <FaStore style={{ fontSize: "18px" }} />,
    link: "/admin/agent-gptstore",
    style: { fontSize: "20px" },
  },

  {
    key: "agent-plans",
    label: "Agent Plans",
    icon: <FileDoneOutlined style={{ fontSize: "18px" }} />,
    link: "/admin/agentsplanslist",
    style: { fontSize: "20px" },
  },
  {
    key: "agent-conversations",
    label: "Agent Conversations",
    icon: <MessageOutlined style={{ fontSize: "18px" }} />,
    link: "/admin/conversationlist",
    style: { fontSize: "20px" },
  },

  // {
  //   key: "Authorized-Users",
  //   label: "Authorized-Users",
  //   icon: <UserOutlined style={{ fontSize: "18px" }} />,
  //   link: "/admin/authorizedusers",
  //   style: { fontSize: "20px" },
  // },
  // {
  //   key: "useragent-login",
  //   label: "OG Registered Users",
  //   icon: <TeamOutlined style={{ fontSize: "18px" }} />,
  //   link: "/admin/agents-registered-users",
  //   style: { fontSize: "20px" },
  // },
];
    
  

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };
  const handleOpenChange = (keys) =>
    setOpenKeys(keys.length ? [keys.pop()] : []);
const entryPoint = localStorage.getItem("entryPoint") || "direct";
  const handleSignOut = () => {
    localStorage.clear(); // Clear all local storage items
    sessionStorage.clear(); // Clear all session storage items
    window.location.href = "/admin/agentslogin"; // Redirect to login
    navigate(entryPoint);
  };

  const date = new Date();
  const fullYear = date.getFullYear();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        width={screens.xs ? 200 : 240}
        collapsedWidth={screens.xs ? 0 : 80}
        style={{
          backgroundColor: "#1A202C", // Sidebar background color
          zIndex: 1000,
          // left: collapsed ? (isMobile ? "-200px" : "-80px") : 0,
          left: 0,
          top: 0,
          transition: "left 0.3s ease-in-out", // Smoother transition
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div className="demo-logo-vertical" style={{ padding: "10px 0" }}>
          <Row justify="center" align="middle">
            <div
              className=" text-center font-bold my-0"
              style={{ fontSize: 24 }}
            >
              <Link
                to="/admin/assistantslist"
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none", // Add this if you want to remove underline
                }}
              >
                <span style={{ color: "#08EC32AB" }}>
                  {collapsed ? "A" : "ASKOXY"}
                </span>
                <span style={{ color: "#FFBA02" }}>
                  {collapsed ? "" : ".AI"}
                </span>
              </Link>
            </div>
          </Row>
        </div>
        <div
          style={{ textAlign: "center", marginTop: "0px" }}
          className="bg-gray-800 text-white my-5 h-6"
        >
          <Link to="/admin/assistantslist" style={{ textDecoration: "none" }}>
            <strong className="my-6 " style={{ fontSize: "14px" }}>
              {collapsed ? "A" : "Agents Admin"}
            </strong>
          </Link>
        </div>
        <Menu
          theme="" // or "" if you prefer default dark mode styles
          mode="inline"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          style={{
            color: "#A7B1C2",
          }}
        >
          {sidebarItems.map((item) =>
            item.dropdownItems ? (
              <Menu.SubMenu
                key={item.key}
                icon={item.icon}
                title={
                  <span className={` ${collapsed ? "hidden" : "inline"}`}>
                    {item.label}
                  </span>
                }
                className="text-white hover:bg-black hover:text-black"
              >
                {item.dropdownItems.map((dropdownItem) => (
                  <Menu.Item
                    key={dropdownItem.key}
                    className="bg-gray-800 text-white hover:bg-black hover:text-white" // Unified background and hover behavior
                  >
                    <Link
                      to={dropdownItem.link}
                      className="flex items-center text-white hover:text-black no-underline"
                    >
                      {/* Ensure icon is rendered correctly */}
                      <span className="mr-1 text-white hover:text-black">
                        {dropdownItem.icon}{" "}
                        {/* icon should be a valid JSX element */}
                      </span>
                      <span className="hover:text-black">
                        {dropdownItem.label}
                      </span>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item
                key={item.key}
                className="text-white" // Remove background on hover
              >
                <Link
                  to={item.link}
                  className="flex items-center text-white hover:text-black no-underline"
                >
                  <span className=" hover:text-black">{item.icon}</span>
                  <span
                    className={`ml-2 ${collapsed ? "hidden" : "inline"} hover:text-black`}
                  >
                    {item.label}
                  </span>
                </Link>
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: screens.xs ? "0 12px" : "0 18px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
            width: screens.xs
              ? "100%"
              : `calc(100% - ${collapsed ? "80px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
            position: "fixed",
            top: 0,
            zIndex: 9,
            height: 64, // Ensure it's positioned correctly
          }}
        >
          <button
            onClick={toggleCollapse}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#1AB394",
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <div
            onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <MdLogout
              style={{ marginRight: "8px", color: "#999C9E", fontSize: "14px" }}
            />
            <span style={{ color: "#999C9E", fontSize: "14px" }}>Log out</span>
          </div>
        </Header>
        <Content
          style={{
            margin: screens.xs
              ? "80px 16px 16px"
              : `80px 16px 16px ${collapsed ? "80px" : "240px"}`,
            padding: screens.xs ? 12 : 24,
            background: "#fff",
            width: screens.xs
              ? "100%"
              : `calc(100% - ${collapsed ? "80px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
            position: "relative", // Ensure it's positioned correctly
          }}
        >
          {children}
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            width: screens.xs
              ? "100%"
              : `calc(100% - ${collapsed ? "80px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
            position: "relative", // Ensure it's positioned correctly
            bottom: 0,
          }}
        >
          ASKOXY.AI Admin ©{fullYear} Created by ASKOXY.AI Company
        </Footer>
      </Layout>
      {/* Custom scrollbar styling */}
      <style jsx>{`
        /* Customize scrollbar for the menu */
        .ant-menu::-webkit-scrollbar {
          width: 5px;
        }

        .ant-menu::-webkit-scrollbar-track {
          background: #1a202c;
        }

        .ant-menu::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 10px;
        }

        /* For Firefox */
        .ant-menu {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #1a202c;
        }

        /* Custom scrollbar for the entire Sider */
        .ant-layout-sider::-webkit-scrollbar {
          width: 5px;
        }

        .ant-layout-sider::-webkit-scrollbar-track {
          background: #1a202c;
        }

        .ant-layout-sider::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 10px;
        }

        /* For Firefox */
        .ant-layout-sider {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #1a202c;
        }
      `}</style>
    </Layout>
  );
};

export default AgentsAdminLayout;
