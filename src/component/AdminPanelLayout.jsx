import React, { useState, useEffect } from "react";
import { Layout, Menu, Row } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { MdLogout, MdSubscriptions } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
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
import { IoBarChart } from "react-icons/io5";
import { BiSolidCategory, BiSolidCoupon } from "react-icons/bi";
import { IoSettings } from "react-icons/io5";
// import './AdminPanel.css';

const { Header, Sider, Content, Footer } = Layout;

const AdminPanelLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

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
      icon: <IoSettings />,
      link: "/settings",
    },
    {
      key: "alluserqueries",
      label: "All Queries",
      icon: <FaHandsHelping />,
      link: "/user_queries",
    },
    {
      key: "ExchangeOrderList",
      label: "Exchange Orders List",
      icon: <FaExchangeAlt />,
      link: "/exchange_orderslist",
    },

    {
      key: "Update User Mobile Number",
      label: "User Details Updation",
      icon: <FaUserEdit />,
      link: "/user/mobilenumber_updated",
    },

    {
      key: "categories",
      label: "Categories",
      icon: <BiSolidCategory />,
      dropdownItems: [
        {
          key: "categoryList",
          label: "Category List",
          link: "/category/category_list",
        },
      ],
    },
    {
      key: "subscriptionPlans",
      label: "Subscription Plans",
      icon: <MdSubscriptions />,
      dropdownItems: [
        {
          key: "plansList",
          label: "Subscription Plans List",
          link: "/subscription_plans/plans_list",
        },
        {
          key: "subscribersList",
          label: "Subscribers List",
          link: "/subscription_plans/user_subscriptions_list",
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
          link: "/customer/customers_list",
        },
        {
          key: "deliveryBoys",
          label: "Delivery Boy List",
          link: "/deliveryboy/deliveryboys_list",
        },
      ],
    },
    {
      key: "slides",
      label: "Slides",
      icon: <FaSlideshare />,
      dropdownItems: [
        {
          key: "slidesList",
          label: "Slides List",
          link: "/slides/slides_list",
        },
      ],
    },
    {
      key: "items",
      label: "Items",
      icon: <FaBoxOpen />,
      dropdownItems: [
        { key: "listItems", label: "List Items", link: "/item/items_list" },
      ],
    },
    {
      key: "sellers",
      label: "Sellers",
      icon: <FaStore />,
      dropdownItems: [
        {
          key: "sellersList",
          label: "Sellers List",
          link: "/seller/seller_list",
        },
      ],
    },
    {
      key: "coupons",
      label: "Coupons",
      icon: <BiSolidCoupon />,
      dropdownItems: [
        {
          key: "couponsList",
          label: "Coupons List",
          link: "/coupons/coupons_list",
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
          link: "/orders/orders_list",
        },
        {
          key: "returnPendingList",
          label: "Return Pending List",
          link: "/orders/return_pending_list",
        },
        {
          key: "returnRepliedList",
          label: "Return Replied List",
          link: "/orders/return_replied_list",
        },
      ],
    },
    {
      key: "reports",
      label: "Reports",
      icon: <IoBarChart />,
      dropdownItems: [
        {
          key: "item requirements",
          label: "Item Requiremnts",
          link: "/reports/item_requirements",
        },
      ],
    },
  ];

  useEffect(() => {
    if (isMobile) setCollapsed(true); // Auto collapse on mobile
  }, [isMobile]);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleOpenChange = (keys) =>
    setOpenKeys(keys.length ? [keys.pop()] : []);
  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userSession");
    window.location.href = "/";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        width={220}
        collapsedWidth={80}
        style={{
          backgroundColor: "#1A202C", // Sidebar background color
        }}
      >
        <div className="demo-logo-vertical" style={{ padding: "10px 0" }}>
          <Row justify="center" align="middle">
            <div
              className=" text-center font-bold my-0"
              style={{ fontSize: 24 }}
            >
              <a
                href="/dashboard"
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none", // Add this if you want to remove underline
                }}
              >
                <span style={{ color: "#08EC32AB" }}>
                  {collapsed ? "O" : "OXY"}
                </span>
                <span style={{ color: "#FFBA02" }}>
                  {collapsed ? "" : "RICE"}
                </span>
              </a>
            </div>
          </Row>
        </div>
        <div
          style={{ textAlign: "center", marginTop: "0px" }}
          className="bg-gray-800 text-white my-5 h-6"
        >
          <a href="/dashboard" style={{ textDecoration: "none" }}>
            <strong className="my-6 " style={{ fontSize: "14px" }}>
              {collapsed ? "A" : "Admin"}
            </strong>
          </a>
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
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
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
        <Content style={{ margin: "16px", padding: 24, background: "#fff" }}>
          {children}
        </Content>
        <Footer style={{ textAlign: "center", background: "#fff" }}>
          OxyRice Admin ©2024 Created by OxyRice Company
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminPanelLayout;
