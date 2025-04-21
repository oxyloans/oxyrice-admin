import React, { useState, useEffect } from "react";
import { Layout, Menu, Row, Grid } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { MdLogout, MdSubscriptions, MdInventory } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";

import { FaUserEdit } from "react-icons/fa";
import {
  FaTachometerAlt,
  FaUsers,
  FaSlideshare,
  FaBoxOpen,
  FaStore,
  FaShoppingCart,
  FaHandsHelping,
} from "react-icons/fa";

import { BiSolidCategory, BiSolidCoupon } from "react-icons/bi";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const TaskAdminPanelLayout = ({ children }) => {
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
      key: "Employee Dashboard",
      label: "Employee Dashboard",

      icon: <FaTachometerAlt />,
      link: "/taskmanagement/dashboard",
    },
    {
      key: "Task Creation",
      label: "Task Creation",

      icon: <FaHandsHelping />,
      link: "/taskmanagement/taskcreation",
    },
    {
      key: "Task Management Employee Status",
      label: "Task Management Status",
      icon: <FaSlideshare />,

      link: "/taskmanagement/taskstatus",
    },

    {
      key: "Assigned Tasks List",
      label: "Assigned Tasks List",
      icon: <FaUsers />,
      link: "/taskmanagement/tasklists",
    },
    {
      key: "Employee Registered Users",
      label: "Employee Registered Users",
      icon: <FaUserCircle />,
      link: "/taskmanagement/employee_registered_users",
    },
  ];

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };
  const handleOpenChange = (keys) =>
    setOpenKeys(keys.length ? [keys.pop()] : []);

  const handleSignOut = () => {
    localStorage.clear(); // Clear all local storage items
    sessionStorage.clear(); // Clear all session storage items
    window.location.href = "/admin/taskmanagementlogin"; // Redirect to login
  };

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
          left: collapsed ? (isMobile ? "-200px" : "-80px") : 0,
          transition: "left 0.3s ease-in-out", // Smoother transition
          position: "fixed",
          height: "100vh",
        }}
      >
        <div className="demo-logo-vertical" style={{ padding: "10px 0" }}>
          <Row justify="center" align="middle">
            <div
              className=" text-center font-bold my-0"
              style={{ fontSize: 24 }}
            >
              <Link
                to="/taskmanagement/dashboard"
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none", // Add this if you want to remove underline
                }}
              >
                <span style={{ color: "#08EC32AB" }}>
                  {collapsed ? "T" : "TASK"}
                </span>{" "}
                <span style={{ color: "#FFBA02" }}>
                  {collapsed ? "" : "MANAGEMENT"}
                </span>
              </Link>
            </div>
          </Row>
        </div>
        <div
          style={{ textAlign: "center", marginTop: "0px" }}
          className="bg-gray-800 text-white my-5 h-6"
        >
          <Link
            to="/taskmanagement/dashboard"
            style={{ textDecoration: "none" }}
          >
            <strong className="my-6 " style={{ fontSize: "14px" }}>
              {collapsed ? "A" : "Admin"}
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
              : `calc(100% - ${collapsed ? "0px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "0px" : "240px",
            position: "relative", // Ensure it's positioned correctly
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
            margin: "16px",
            padding: screens.xs ? 12 : 24,
            background: "#fff",
            width: screens.xs
              ? "100%"
              : `calc(100% - ${collapsed ? "0px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "0px" : "240px",
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
              : `calc(100% - ${collapsed ? "0px" : "240px"})`,
            marginLeft: screens.xs ? "0px" : collapsed ? "0px" : "240px",
            position: "relative", // Ensure it's positioned correctly
            bottom: 0,
          }}
        >
          Task Management Admin ©2025 Created by ASKOXY.AI Company
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TaskAdminPanelLayout;
