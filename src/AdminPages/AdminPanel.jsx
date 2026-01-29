import React, { useState, useEffect } from "react";
// ✅ correct
import { useNavigate } from "react-router-dom";

import { Layout, Menu, Row, Grid } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import { Link } from "react-router-dom";
import { MdLogout, MdSubscriptions, MdInventory } from "react-icons/md";
import { WalletOutlined } from "@ant-design/icons";
import {
  FaBoxes,
  FaUserGraduate,
  FaTachometerAlt,
  FaSlideshare,
  FaGasPump,
  FaBoxOpen,
  FaShoppingCart,
  
} from "react-icons/fa";
import { AppstoreOutlined } from "@ant-design/icons";

import { BiSolidCategory, BiSolidCoupon } from "react-icons/bi";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const AdminPanelLayoutTest = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const entryPoint = localStorage.getItem("entryPoint") || "direct";

  useEffect(() => {
    if (screens.xs) {
      setCollapsed(true); // Always collapse on extra small screens
    } else if (screens.md) {
      setCollapsed(false); // Expand on medium and larger screens
    }
  }, [screens]);
  // const sidebarItems = [
  //   {
  //     key: "dashboard",
  //     label: "Dashboard",
  //     icon: <FaTachometerAlt />,
  //     link: "/admin/dashboard",
  //   },

  //   {
  //     key: "Fuel Expenses",
  //     label: "Fuel Expenses",
  //     icon: <FaGasPump />,
  //     link: "/admin/fuel-expenses",
  //   },
  //   // {
  //   //   key: "PinCodes Data",
  //   //   label: "PinCodes Data",
  //   //   icon: <FaMapMarkerAlt />,
  //   //   link: "/admin/pincodesdata",
  //   // },

  //   // {
  //   //   key: "allreferrals",
  //   //   label: "All Referrals",
  //   //   icon: <FaExchangeAlt />,
  //   //   link: "/admin/all-referrals",
  //   // },
  //   {
  //     key: "allitemsofferLists",
  //     label: "Items Offer Lists",
  //     icon: <FaSlideshare />,
  //     link: "/admin/items-offerlists",
  //   },
  //   {
  //     key: "Category inventory",
  //     label: "Category Inventory",
  //     icon: <MdInventory />,
  //     link: "/admin/category-inventory",
  //   },

  //   {
  //     key: "Campaign Inventory",
  //     label: "Campaign Inventory",
  //     icon: <FaBoxes />,
  //     dropdownItems: [
  //       {
  //         key: "Campaign Upload",
  //         label: "Campaign Upload",
  //         link: "/admin/campaign-inventory",
  //       },
  //       {
  //         key: "Bulk Invites",
  //         label: "Bulk Invites",
  //         link: "/admin/bulkinvites",
  //       },
  //       {
  //         key: "Email Campaign",
  //         label: "Email Campaign",
  //         link:"/admin/emailcampaign"
  //       }
  //     ],
  //   },
  //   {
  //     key: "StudyAbroad Dashboard",
  //     label: "StudyAbroad Admin",
  //     icon: <FaUserGraduate />,
  //     dropdownItems: [
  //       {
  //         key: "Student Applications",
  //         label: "Student Applications",
  //         link: "/admin/studentapplications",
  //       },
  //       {
  //         key: "Student Registrations",
  //         label: "Student Registrations",
  //         link: "/admin/student-registrations",
  //       },
  //     ],
  //   },
  //   // {
  //   //   key: "Update User Details",
  //   //   label: "Update User Details",
  //   //   icon: <FaUserCircle />,
  //   //   link: "/admin/category-inventory",
  //   // },

  //   {
  //     key: "Customer Wallet",
  //     label: "Customer Wallet",
  //     icon: <WalletOutlined />,
  //     dropdownItems: [
  //       {
  //         key: "Withdrawal User List",
  //         label: "Withdrawal User List", // ✅ Correct
  //         link: "/admin/withdrawaluserlist",
  //       },
  //       {
  //         key: "Initiated Amounts",
  //         label: "Initiated Amounts", // ✅ Correct
  //         link: "/admin/initiatedamountlist",
  //       },

  //       {
  //         key: "Approved Amounts", // 🔹 Fix spelling + plural consistency
  //         label: "Approved Amounts",
  //         link: "/admin/approvedamountlist",
  //       },
  //     ],
  //   },

  //   {
  //     key: "categories",
  //     label: "Categories",
  //     icon: <BiSolidCategory />,
  //     dropdownItems: [
  //       {
  //         key: "categoryList",
  //         label: "Category List",
  //         link: "/admin/categories",
  //       },
  //     ],
  //   },

  //   {
  //     key: "subscriptionPlans",
  //     label: "Subscription Plans",
  //     icon: <MdSubscriptions />,
  //     dropdownItems: [
  //       {
  //         key: "plansList",
  //         label: "Subscription Plans List",
  //         link: "/admin/subscription-plans-list",
  //       },
  //     ],
  //   },

  //   {
  //     key: "items",
  //     label: "Items",
  //     icon: <FaBoxOpen />,
  //     dropdownItems: [
  //       { key: "listItems", label: "List Items", link: "/admin/items" },
  //     ],
  //   },

  //   {
  //     key: "coupons",
  //     label: "Coupons",
  //     icon: <BiSolidCoupon />,
  //     dropdownItems: [
  //       {
  //         key: "couponsList",
  //         label: "Coupons List",
  //         link: "/admin/coupons",
  //       },
  //       {
  //         key: "ordersByCoupon",
  //         label: "OrdersByCoupon",
  //         link: "/admin/ordersByCoupon",
  //       },
  //     ],
  //   },
  //   {
  //     key: "orders & locations ",
  //     label: "Orders & Locations",
  //     icon: <FaShoppingCart />,
  //     dropdownItems: [
  //       {
  //         key: "ordersList",
  //         label: "Orders List",
  //         link: "/admin/orders-details",
  //       },
  //       {
  //         key: "Pincode-wise Orders",
  //         label: "Pincode-wise Orders",

  //         link: "/admin/pincodesdata",
  //       },
  //       {
  //         key: "returnPendingList",
  //         label: "Return Pending List",
  //         link: "/admin/orders-pending",
  //       },
  //     ],
  //   },
  //   {
  //     key: "Services",
  //     label: "Services",
  //     icon: <AppstoreOutlined />,
  //     dropdownItems: [
  //       {
  //         key: "Category List",
  //         label: "Category List",
  //         link: "/admin/services",
  //       },
  //       {
  //         key: "Items List",
  //         label: "Items List",
  //         link: "/admin/serviceslist",
  //       },
  //     ],
  //   },
  //   {
  //     key: "Time Slots",
  //     label: "Time Slots",
  //     icon: <MdInventory />,
  //     link: "/admin/timeslots",
  //   },
  // ];


  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      link: "/admin/dashboard",
    },

    {
      key: "fuelExpenses",
      label: "Fuel Expenses",
      icon: <FaGasPump />,
      link: "/admin/fuel-expenses",
    },

    {
      key: "itemsOffers",
      label: "Item Offer Lists",
      icon: <FaSlideshare />,
      link: "/admin/items-offerlists",
    },

    {
      key: "categoryInventory",
      label: "Category Inventory",
      icon: <MdInventory />,
      link: "/admin/category-inventory",
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
      key: "studyAbroadAdmin",
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
      key: "items",
      label: "Items",
      icon: <FaBoxOpen />,
      dropdownItems: [
        {
          key: "itemsList",
          label: "Items List",
          link: "/admin/items",
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
          link: "/admin/coupons",
        },
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
      key: "services",
      label: "Services",
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

    {
      key: "timeSlots",
      label: "Time Slots",
      icon: <MdInventory />,
      link: "/admin/timeslots",
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
    navigate("/"); // Redirect to login using React Router
  };

  const date = new Date();
  const fullYear = date.getFullYear();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        width={screens.xs ? 220 : 240}
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
                to="/admin/dashboard"
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
          <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
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
            position: "relative", // Ensure it's positioned correctly
            bottom: 0,
          }}
        >
          ASKOXY.AI Admin ©{fullYear} Created by ASKOXY.AI Company
        </Footer>
      </Layout>
      
      <style>{`
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

        /* Menu hover + active colors to keep text visible */
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
