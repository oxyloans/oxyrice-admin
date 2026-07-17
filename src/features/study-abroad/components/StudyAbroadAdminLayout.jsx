import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Row, Grid } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserAddOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { MdLogout } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const STUDY_ABROAD_BASE = "/studyabroad";

const sidebarItems = [
  {
    key: "studyAbroad",
    label: "Study Abroad",
    icon: <FaUserGraduate />,
    dropdownItems: [
      {
        key: "studentApplications",
        label: "Student Applications",
        icon: <FileTextOutlined />,
        link: `${STUDY_ABROAD_BASE}/studentapplications`,
      },
      {
        key: "studentRegistrations",
        label: "Student Registrations",
        icon: <UserAddOutlined />,
        link: `${STUDY_ABROAD_BASE}/student-registrations`,
      },
      {
        key: "allStudents",
        label: "Internship Applications",
        icon: <TeamOutlined />,
        link: `${STUDY_ABROAD_BASE}/all-students`,
      },
      {
        key: "sevenDaysOffersApplications",
        label: "7 Day Offer Applications",
        icon: <FileTextOutlined />,
        link: `${STUDY_ABROAD_BASE}/seven-days-offers-applications`,
      },
    ],
  },
  {
    key: "studyAbroadReports",
    label: "Study Abroad Reports",
    icon: <BarChartOutlined />,
    dropdownItems: [
      {
        key: "citySummary",
        label: "City Summary",
        icon: <BarChartOutlined />,
        link: `${STUDY_ABROAD_BASE}/city-summary`,
      },
    ],
  },
];

const StudyAbroadAdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(["studyAbroad"]);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (screens.xs) setCollapsed(true);
    else if (screens.md) setCollapsed(false);
  }, [screens]);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const handleOpenChange = (keys) =>
    setOpenKeys(keys.length ? [keys[keys.length - 1]] : []);

  const handleSignOut = () => {
    const currentPath = window.location.pathname + window.location.search;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redirectAfterLogin_studyabroad", currentPath);
    navigate("/admin/studyabroadlogin");
  };

  const fullYear = new Date().getFullYear();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        width={240}
        collapsedWidth={screens.xs ? 0 : 80}
        style={{
          backgroundColor: "#1A202C",
          zIndex: 1000,
          left: 0,
          top: 0,
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div className="demo-logo-vertical" style={{ padding: "10px 0" }}>
          <Row justify="center" align="middle">
            <div
              className="text-center font-bold my-0"
              style={{ fontSize: 24 }}
            >
              <Link
                to={`${STUDY_ABROAD_BASE}/studentapplications`}
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "#008cba", fontWeight: 700 }}>
                  {collapsed ? "S" : "Study "}
                </span>
                {!collapsed && (
                  <span style={{ color: "#1ab394", fontWeight: 700 }}>
                    Abroad
                  </span>
                )}
              </Link>
            </div>
          </Row>
        </div>

        <div
          style={{ textAlign: "center", marginTop: "0px" }}
          className="bg-gray-800 text-white my-5 h-6"
        >
          <Link
            to={`${STUDY_ABROAD_BASE}/studentapplications`}
            style={{ textDecoration: "none" }}
          >
            <strong
              className="my-6"
              style={{ fontSize: "14px", fontWeight: 700 }}
            >
              <GlobalOutlined
                style={{ color: "#008cba", marginRight: collapsed ? 0 : 6 }}
              />
              {!collapsed && <span style={{ color: "#595959" }}>Admin</span>}
            </strong>
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={sidebarItems
            .flatMap((g) => g.dropdownItems || [])
            .filter((d) => d.link === location.pathname)
            .map((d) => d.key)}
          style={{ color: "#A7B1C2" }}
        >
          {sidebarItems.map((item) =>
            item.dropdownItems ? (
              <Menu.SubMenu
                key={item.key}
                icon={item.icon}
                title={
                  <span className={collapsed ? "hidden" : "inline"}>
                    {item.label}
                  </span>
                }
              >
                {item.dropdownItems.map((dropdownItem) => (
                  <Menu.Item key={dropdownItem.key}>
                    <Link
                      to={dropdownItem.link}
                      className="flex items-center text-white no-underline"
                    >
                      <span className="mr-1">{dropdownItem.icon}</span>
                      <span>{dropdownItem.label}</span>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.key}>
                <Link to={item.link} className="text-white no-underline">
                  {item.icon}
                  <span className={`ml-2 ${collapsed ? "hidden" : "inline"}`}>
                    {item.label}
                  </span>
                </Link>
              </Menu.Item>
            ),
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
            height: 64,
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
            position: "relative",
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
            position: "relative",
          }}
        >
          ASKOXY.AI Study Abroad Admin ©{fullYear}
        </Footer>
      </Layout>
      <style>{`
        .ant-menu::-webkit-scrollbar { width: 5px; }
        .ant-menu::-webkit-scrollbar-track { background: #1a202c; }
        .ant-menu::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 10px; }
        .ant-menu { scrollbar-width: thin; scrollbar-color: #4a5568 #1a202c; }

        .ant-layout-sider::-webkit-scrollbar { width: 5px; }
        .ant-layout-sider::-webkit-scrollbar-track { background: #1a202c; }
        .ant-layout-sider::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 10px; }
        .ant-layout-sider { scrollbar-width: thin; scrollbar-color: #4a5568 #1a202c; }

        .ant-menu-dark,
        .ant-menu-dark .ant-menu-sub,
        .ant-layout-sider .ant-menu {
          background: #1a202c;
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item,
        .ant-layout-sider .ant-menu-submenu-title {
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item a,
        .ant-layout-sider .ant-menu-submenu-title span {
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item:hover,
        .ant-layout-sider .ant-menu-item-active,
        .ant-layout-sider .ant-menu-submenu-title:hover,
        .ant-layout-sider .ant-menu-submenu-open,
        .ant-layout-sider .ant-menu-item-selected {
          background-color: #2d3748 !important;
          color: #ffffff !important;
        }

        .ant-layout-sider .ant-menu-item:hover a,
        .ant-layout-sider .ant-menu-item-active a,
        .ant-layout-sider .ant-menu-item-selected a,
        .ant-layout-sider .ant-menu-submenu-title:hover span {
          color: #ffffff !important;
        }
      `}</style>
    </Layout>
  );
};

export default StudyAbroadAdminLayout;
