// import React, { useState, useEffect } from "react";
// // ✅ correct
// import { useNavigate } from "react-router-dom";



// import { Layout, Menu, Row, Grid } from "antd";
// import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
// import { Link } from "react-router-dom";
// import { MdLogout } from "react-icons/md";
// import { FaExchangeAlt, FaWhatsapp } from "react-icons/fa";
// import { FaUserCircle } from "react-icons/fa";
// import { FaClipboardList } from "react-icons/fa";
// import {
//   FaTachometerAlt,
//   FaUsers,
//   FaSlideshare,
  
//   FaHandsHelping,
// } from "react-icons/fa";
// // import { Link } from "react-router-dom";

// const { Header, Sider, Content, Footer } = Layout;
// const { useBreakpoint } = Grid;

// const TaskAdminPanelLayout = ({ children }) => {
//   const [collapsed, setCollapsed] = useState(false);
//   const [openKeys, setOpenKeys] = useState([]);
//   const [isMobile, setIsMobile] = useState(false);
//   const screens = useBreakpoint();
//   const entryPoint = localStorage.getItem("entryPoint") || "direct";
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (screens.xs) {
//       setCollapsed(true); // Always collapse on small screens
//     } else if (screens.md) {
//       setCollapsed(false); // Expand on larger screens
//     }
//   }, [screens]);
//   const sidebarItems = [
//     {
//       key: "Admin Dashboard",
//       label: "Admin Dashboard",

//       icon: <FaTachometerAlt />,
//       link: "/taskmanagement/dashboard",
//     },
//     {
//       key: "Assigned Tasks WhatsApp",
//       label: "Assigned Tasks WhatsApp",
//       icon: <FaWhatsapp />,
//       link: "/taskmanagement/tasklists",
//     },
//     {
//       key: "Employee Daily Plans",

//       label: " Employee Daily Plans",
//       icon: <FaClipboardList />,
//       link: "/employeeplanofday",
//     },
//     // {
//     //   key: "Radha Instructions",

//     //   label: "Radha Instructions",
//     //   icon: <FaClipboardList />,
//     //   link: "/taskmanagement/admininstructions",
//     // },
//     {
//       key: "Team Attendance",
//       label: "Team Attendance",
//       icon: <FaUsers />,
//       link: "/taskmanagement/teamattendance",
//     },

//     // {
//     //   key: "Task Creation",
//     //   label: "Create New Task",

//     //   icon: <FaHandsHelping />,
//     //   link: "/taskmanagement/taskcreation",
//     // },
//     {
//       key: "Daily Activity Status",
//       label: "Daily Activity Status",
//       icon: <FaExchangeAlt />,
//       dropdownItems: [
//         {
//           key: "Plan Of The Day",
//           label: "Plan Of The Day",
//           link: "/taskmanagement/planoftheday",
//         },
//         {
//           key: "End Of The Day",
//           label: "End Of The Day",
//           link: "/taskmanagement/endoftheday",
//         },
//       ],
//     },
//     {
//       key: "Leave Management",
//       label: "Leave Management",
//       icon: <FaSlideshare />,
//       link: "/taskmanagement/employeeleaves",
//     },

//     // {
//     //   key: "Registered Employees",
//     //   label: "Registered Employees",
//     //   icon: <FaUserCircle />,
//     //   link: "/taskmanagement/employee_registered_users",
//     // },
//   ];

//   const toggleCollapse = () => {
//     setCollapsed((prev) => !prev);
//   };
//   const handleOpenChange = (keys) =>
//     setOpenKeys(keys.length ? [keys.pop()] : []);
//  const navigate = useNavigate();
//   const handleSignOut = () => {
//     localStorage.clear(); // Clear all local storage items
//     sessionStorage.clear(); // Clear all session storage items
//     window.location.href = "/admin/taskmanagementlogin"; // Redirect to login
//      navigate(entryPoint);
//   };

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Sider
//         collapsed={collapsed}
//         onCollapse={setCollapsed}
//         breakpoint="md"
//         width={screens.xs ? 220 : 240}
//         collapsedWidth={screens.xs ? 0 : 80}
//         style={{
//           backgroundColor: "#1A202C", // Sidebar background color
//           zIndex: 1000,
//           // left: collapsed ? (isMobile ? "-200px" : "-80px") : 0,
//           left: 0,
//           top: 0,
//           transition: "left 0.3s ease-in-out", // Smoother transition
//           position: "fixed",
//           height: "100vh",
//           overflowY: "auto",
//         }}
//       >
        // <div className="demo-logo-vertical" style={{ padding: "10px 0" }}>
        //   <Row justify="center" align="middle">
        //     <div
        //       className=" text-center font-bold my-0"
        //       style={{ fontSize: 24 }}
        //     >
        //       <Link
        //         to="/taskmanagement/dashboard"
        //         style={{
        //           fontSize: "20px",
        //           color: "#fff",
        //           textAlign: "center",
        //           textDecoration: "none", // Add this if you want to remove underline
        //         }}
        //       >
        //         <span style={{ color: "#08EC32AB" }}>
        //           {collapsed ? "T" : "TASK"}
        //         </span>{" "}
        //         <span style={{ color: "#FFBA02" }}>
        //           {collapsed ? "" : "MANAGEMENT"}
        //         </span>
        //       </Link>
        //     </div>
        //   </Row>
        // </div>
        // <div
        //   style={{ textAlign: "center", marginTop: "0px" }}
        //   className="bg-gray-800 text-white my-5 h-6"
        // >
        //   <Link
        //     to="/taskmanagement/dashboard"
        //     style={{ textDecoration: "none" }}
        //   >
        //     <strong className="my-6 " style={{ fontSize: "14px" }}>
        //       {collapsed ? "A" : "Admin"}
        //     </strong>
        //   </Link>
        // </div>
//         <Menu
//           theme="" // or "" if you prefer default dark mode styles
//           mode="inline"
//           openKeys={openKeys}
//           onOpenChange={handleOpenChange}
//           style={{
//             color: "#A7B1C2",
//           }}
//         >
//           {sidebarItems.map((item) =>
//             item.dropdownItems ? (
//               <Menu.SubMenu
//                 key={item.key}
//                 icon={item.icon}
//                 title={
//                   <span className={` ${collapsed ? "hidden" : "inline"}`}>
//                     {item.label}
//                   </span>
//                 }
//                 className="text-white hover:bg-black hover:text-black"
//               >
//                 {item.dropdownItems.map((dropdownItem) => (
//                   <Menu.Item
//                     key={dropdownItem.key}
//                     className="bg-gray-800 text-white hover:bg-black hover:text-white" // Unified background and hover behavior
//                   >
//                     <Link
//                       to={dropdownItem.link}
//                       className="flex items-center text-white hover:text-black no-underline"
//                     >
//                       {/* Ensure icon is rendered correctly */}
//                       <span className="mr-1 text-white hover:text-black">
//                         {dropdownItem.icon}{" "}
//                         {/* icon should be a valid JSX element */}
//                       </span>
//                       <span className="hover:text-black">
//                         {dropdownItem.label}
//                       </span>
//                     </Link>
//                   </Menu.Item>
//                 ))}
//               </Menu.SubMenu>
//             ) : (
//               <Menu.Item
//                 key={item.key}
//                 className="text-white" // Remove background on hover
//               >
//                 <Link
//                   to={item.link}
//                   className="flex items-center text-white hover:text-black no-underline"
//                 >
//                   <span className=" hover:text-black">{item.icon}</span>
//                   <span
//                     className={`ml-2 ${collapsed ? "hidden" : "inline"} hover:text-black`}
//                   >
//                     {item.label}
//                   </span>
//                 </Link>
//               </Menu.Item>
//             )
//           )}
//         </Menu>
//       </Sider>

//       <Layout>
//         <Header
//           style={{
//             padding: screens.xs ? "0 12px" : "0 18px",
//             background: "#fff",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
//             width: screens.xs
//               ? "100%"
//               : `calc(100% - ${collapsed ? "80px" : "240px"})`,
//             marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
//             position: "fixed",
//             top: 0,
//             zIndex: 9,
//             height: 64, // Ensure it's positioned correctly
//           }}
//         >
//           <button
//             onClick={toggleCollapse}
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               fontSize: "18px",
//               color: "#1AB394",
//             }}
//           >
//             {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//           </button>

//           <div
//             onClick={handleSignOut}
//             style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
//           >
//             <MdLogout
//               style={{ marginRight: "8px", color: "#999C9E", fontSize: "14px" }}
//             />
//             <span style={{ color: "#999C9E", fontSize: "14px" }}>Log out</span>
//           </div>
//         </Header>
//         <Content
//           style={{
//             margin: screens.xs
//               ? "80px 16px 16px"
//               : `80px 16px 16px ${collapsed ? "80px" : "240px"}`,
//             padding: screens.xs ? 12 : 24,
//             background: "#fff",
//             width: screens.xs
//               ? "100%"
//               : `calc(100% - ${collapsed ? "80px" : "240px"})`,
//             marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
//             position: "relative", // Ensure it's positioned correctly
//           }}
//         >
//           {children}
//         </Content>
//         <Footer
//           style={{
//             textAlign: "center",
//             background: "#fff",
//             width: screens.xs
//               ? "100%"
//               : `calc(100% - ${collapsed ? "80px" : "240px"})`,
//             marginLeft: screens.xs ? "0px" : collapsed ? "80px" : "240px",
//             position: "relative", // Ensure it's positioned correctly
//             bottom: 0,
//           }}
//         >
//           Task Management Admin ©2025 Created by ASKOXY.AI Company
//         </Footer>
//       </Layout>
//       {/* Sidebar menu colors */}
//       <style>{`
//         .ant-menu-dark,
//         .ant-menu-dark .ant-menu-sub,
//         .ant-layout-sider .ant-menu {
//           background: #1a202c;
//           color: #e2e8f0;
//         }

//         .ant-layout-sider .ant-menu-item,
//         .ant-layout-sider .ant-menu-submenu-title {
//           color: #e2e8f0;
//         }

//         .ant-layout-sider .ant-menu-item a,
//         .ant-layout-sider .ant-menu-submenu-title span {
//           color: #e2e8f0;
//         }

//         .ant-layout-sider .ant-menu-item:hover,
//         .ant-layout-sider .ant-menu-item-active,
//         .ant-layout-sider .ant-menu-submenu-title:hover,
//         .ant-layout-sider .ant-menu-submenu-open,
//         .ant-layout-sider .ant-menu-item-selected {
//           background-color: #2d3748 !important;
//           color: #ffffff !important;
//         }

//         .ant-layout-sider .ant-menu-item:hover a,
//         .ant-layout-sider .ant-menu-item-active a,
//         .ant-layout-sider .ant-menu-item-selected a,
//         .ant-layout-sider .ant-menu-submenu-title:hover span {
//           color: #ffffff !important;
//         }
//       `}</style>
//     </Layout>
//   );
// };

// export default TaskAdminPanelLayout;


import React, { useState, useEffect } from "react";
import { Layout, Menu, Row, Grid } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  WhatsAppOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const TaskAdminPanelLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const entryPoint =
    localStorage.getItem("entryPoint") || "/admin/taskmanagementlogin";

  /* -------------------------
     Handle Responsive Collapse
  -------------------------- */
  useEffect(() => {
    if (screens.xs) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [screens]);

  /* -------------------------
     Sidebar Menu Items
  -------------------------- */
  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      link: "/taskmanagement/dashboard",
    },
    {
      key: "assignedTasks",
      label: "Assigned Tasks (WhatsApp)",
      icon: <WhatsAppOutlined />,
      link: "/taskmanagement/tasklists",
    },
    {
      key: "employeePlans",
      label: "Employee Daily Plans",
      icon: <FileTextOutlined />,
      link: "/employeeplanofday",
    },
    {
      key: "teamAttendance",
      label: "Team Attendance",
      icon: <TeamOutlined />,
      link: "/taskmanagement/teamattendance",
    },
    {
      key: "dailyStatus",
      label: "Daily Activity Status",
      icon: <BarChartOutlined />,
      dropdownItems: [
        {
          key: "planOfDay",
          label: "Plan of the Day",
          link: "/taskmanagement/planoftheday",
        },
        {
          key: "endOfDay",
          label: "End of the Day",
          link: "/taskmanagement/endoftheday",
        },
      ],
    },
    {
      key: "leaveManagement",
      label: "Leave Management",
      icon: <CalendarOutlined />,
      link: "/taskmanagement/employeeleaves",
    },
  ];

  /* -------------------------
     Toggle Sidebar
  -------------------------- */
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys.length ? [keys.pop()] : []);
  };

  /* -------------------------
     Logout Handler
  -------------------------- */
  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate(entryPoint);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ================= Sidebar ================= */}
      <Sider
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth={screens.xs ? 0 : 80}
        width={240}
        style={{
          background: "#1A202C",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 1000,
        }}
      >
        {/* Logo */}
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

        {/* Menu */}
        <Menu
          mode="inline"
          theme="dark"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          style={{ borderRight: 0 }}
        >
          {sidebarItems.map((item) =>
            item.dropdownItems ? (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.dropdownItems.map((sub) => (
                  <Menu.Item key={sub.key}>
                    <Link to={sub.link}>{sub.label}</Link>
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

      {/* ================= Main Layout ================= */}
      <Layout>
        {/* ================= Header ================= */}
        <Header
          style={{
            padding: "0 16px",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            position: "fixed",
            top: 0,
            right: 0,
            left: collapsed ? 80 : 240,
            zIndex: 9,
            height: 64,
          }}
        >
          {/* Toggle Button */}
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

          {/* Logout */}
          <div
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            <LogoutOutlined style={{ marginRight: 6 }} />
            Logout
          </div>
        </Header>

        {/* ================= Content ================= */}
        <Content
          style={{
            marginTop: 64,
            marginLeft: collapsed ? 80 : 240,
            padding: screens.xs ? 12 : 24,
            background: "#fff",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>

        {/* ================= Footer ================= */}
        <Footer
          style={{
            textAlign: "center",
            background: "#ffffff7c",
            marginLeft: collapsed ? 80 : 240,
            fontSize: "13px",
            color: "#6B7280",
          }}
        >
          Task Management Admin ©2025 • Powered by ASKOXY.AI
        </Footer>
      </Layout>

      {/* ================= Custom Styles ================= */}
      <style>{`
        .ant-menu-dark {
          background: #1a202c;
        }

        .ant-menu-dark .ant-menu-item-selected {
          background-color: #1ab394 !important;
        }

        .ant-menu-dark .ant-menu-item:hover {
          background-color: #2d3748 !important;
        }

        .ant-menu-dark .ant-menu-submenu-title:hover {
          background-color: #2d3748 !important;
        }
      `}</style>
    </Layout>
  );
};

export default TaskAdminPanelLayout;

