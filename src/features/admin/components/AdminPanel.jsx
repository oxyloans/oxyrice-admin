import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Row, Grid } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  WalletOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

import { MdLogout, MdSubscriptions, MdInventory } from "react-icons/md";
import {
  FaBoxes,
  FaUserGraduate,
  FaTachometerAlt,
  FaGasPump,
  FaBoxOpen,
  FaShoppingCart,
  FaTags,
} from "react-icons/fa";
import { BiSolidCategory, BiSolidCoupon } from "react-icons/bi";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const AdminPanelLayoutTest = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (screens.xs) setCollapsed(true);
    else if (screens.md) setCollapsed(false);
  }, [screens]);

  // ---- Your sidebar structure (same as you wrote) ----
  const sidebarItems = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <FaTachometerAlt />,
        dropdownItems: [
          {
            key: "dashboardHome",
            label: "Dashboard Home",
            link: "/admin/dashboard",
          },
        ],
      },
      {
        key: "fuelExpenses",
        label: "Fuel Expenses",
        icon: <FaGasPump />,
        dropdownItems: [
          {
            key: "fuelExpensesList",
            label: "Fuel Expenses List",
            link: "/admin/fuel-expenses",
          },
        ],
      },
      {
        key: "itemOffers",
        label: "Item Offers",
        icon: <FaTags />,
        dropdownItems: [
          {
            key: "itemOffersList",
            label: "Item Offers List",
            link: "/admin/items-offerlists",
          },
        ],
      },
      {
        key: "categoryInventory",
        label: "Category Inventory",
        icon: <MdInventory />,
        dropdownItems: [
          {
            key: "categoryInventoryList",
            label: "Category Inventory List",
            link: "/admin/category-inventory",
          },
        ],
      },
      {
        key: "campaignInventory",
        label: "Campaign Inventory",
        icon: <FaBoxes />,
        dropdownItems: [
          {
            key: "campaignUpload",
            label: "Campaign Upload",
            link: "/admin/campaign-inventory",
          },
          {
            key: "bulkInvites",
            label: "Bulk Invites",
            link: "/admin/bulkinvites",
          },
          {
            key: "emailCampaign",
            label: "Email Campaign",
            link: "/admin/emailcampaign",
          },
        ],
      },

      {
        key: "customerWallet",
        label: "Customer Wallet",
        icon: <WalletOutlined />,
        dropdownItems: [
          {
            key: "withdrawalUsers",
            label: "Withdrawal Users",
            link: "/admin/withdrawaluserlist",
          },
          {
            key: "initiatedAmounts",
            label: "Initiated Amounts",
            link: "/admin/initiatedamountlist",
          },
          {
            key: "approvedAmounts",
            label: "Approved Amounts",
            link: "/admin/approvedamountlist",
          },
        ],
      },
      {
        key: "categories",
        label: "Categories",
        icon: <BiSolidCategory />,
        dropdownItems: [
          {
            key: "categoryList",
            label: "Category List",
            link: "/admin/categories",
          },
        ],
      },
      {
        key: "items",
        label: "Items",
        icon: <FaBoxOpen />,
        dropdownItems: [
          { key: "itemsList", label: "Items List", link: "/admin/items" },
        ],
      },
      {
        key: "subscriptionPlans",
        label: "Subscription Plans",
        icon: <MdSubscriptions />,
        dropdownItems: [
          {
            key: "subscriptionPlansList",
            label: "Subscription Plans List",
            link: "/admin/subscription-plans-list",
          },
        ],
      },

      {
        key: "coupons",
        label: "Coupons",
        icon: <BiSolidCoupon />,
        dropdownItems: [
          { key: "couponsList", label: "Coupons List", link: "/admin/coupons" },
          {
            key: "ordersByCoupon",
            label: "Orders by Coupon",
            link: "/admin/ordersByCoupon",
          },
        ],
      },
      {
        key: "ordersAndLocations",
        label: "Orders & Locations",
        icon: <FaShoppingCart />,
        dropdownItems: [
          {
            key: "ordersList",
            label: "Orders List",
            link: "/admin/orders-details",
          },
          {
            key: "pincodeOrders",
            label: "Pincode-wise Orders",
            link: "/admin/pincodesdata",
          },
          {
            key: "returnPending",
            label: "Return Pending",
            link: "/admin/orders-pending",
          },
        ],
      },
      {
        key: "timeSlots",
        label: "Time Slots",
        icon: <MdInventory />,
        dropdownItems: [
          {
            key: "timeSlotsList",
            label: "Time Slots List",
            link: "/admin/timeslots",
          },
        ],
      },
      {
        key: "studyAbroad",
        label: "Study Abroad Admin",
        icon: <FaUserGraduate />,
        dropdownItems: [
          {
            key: "studentApplications",
            label: "Student Applications",
            link: "/admin/studentapplications",
          },
          {
            key: "studentRegistrations",
            label: "Student Registrations",
            link: "/admin/student-registrations",
          },
        ],
      },
      {
        key: "services",
        label: "CA & CS Services",
        icon: <AppstoreOutlined />,
        dropdownItems: [
          {
            key: "serviceCategories",
            label: "Service Categories",
            link: "/admin/services",
          },
          {
            key: "serviceItems",
            label: "Service Items",
            link: "/admin/serviceslist",
          },
        ],
      },
    ],
    [],
  );

  // ---- Convert sidebarItems -> antd Menu `items` ----
  const menuItems = useMemo(() => {
    return sidebarItems.map((item) => {
      if (item.dropdownItems?.length) {
        return {
          key: item.key,
          icon: item.icon,
          label: collapsed ? null : item.label,
          children: item.dropdownItems.map((d) => ({
            key: d.key,
            label: <Link to={d.link}>{d.label}</Link>,
          })),
        };
      }

      // If you later add direct link items, support them too:
      return {
        key: item.key,
        icon: item.icon,
        label: <Link to={item.link}>{item.label}</Link>,
      };
    });
  }, [sidebarItems, collapsed]);

  // ---- Selected/open keys from route ----
  const { selectedKeys, defaultOpenKey } = useMemo(() => {
    const path = location.pathname;

    for (const group of sidebarItems) {
      if (group.dropdownItems?.length) {
        const found = group.dropdownItems.find((d) => d.link === path);
        if (found)
          return { selectedKeys: [found.key], defaultOpenKey: group.key };
      } else if (group.link === path) {
        return { selectedKeys: [group.key], defaultOpenKey: null };
      }
    }
    return { selectedKeys: [], defaultOpenKey: null };
  }, [location.pathname, sidebarItems]);

  useEffect(() => {
    // Auto open correct submenu based on route (desktop only)
    if (!collapsed && defaultOpenKey) setOpenKeys([defaultOpenKey]);
  }, [defaultOpenKey, collapsed]);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const handleOpenChange = (keys) => {
    // keep only one submenu open at a time (your old behavior)
    setOpenKeys(keys.length ? [keys[keys.length - 1]] : []);
  };

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const fullYear = new Date().getFullYear();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        width={screens.xs ? 240 : 240}
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
                to="/admin/dashboard"
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  textAlign: "center",
                  textDecoration: "none",
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
          <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
            <strong className="my-6" style={{ fontSize: "14px" }}>
              {collapsed ? "A" : "Admin"}
            </strong>
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={selectedKeys}
          style={{ color: "#A7B1C2" }}
        />
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
            background: "#ffffff",
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
            bottom: 0,
          }}
        >
          ASKOXY.AI Admin ©{fullYear} Created by ASKOXY.AI Company
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

export default AdminPanelLayoutTest;
