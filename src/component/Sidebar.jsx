import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaTags,
  FaShoppingCart,
  FaStore,
  FaFileAlt,
  FaKey,
  FaUser,
  FaSlideshare,
  FaBoxOpen,
  FaFolder,
  FaBox,
  FaShippingFast,   // New FontAwesome icons
  FaReply,
  FaExchangeAlt,
  FaChartBar,
} from "react-icons/fa"; // Import Font Awesome icons

import Header from "./Header"; // Import the Header component

// Reusable component for Sidebar items
const SidebarItem = ({
  icon,
  label,
  dropdownItems,
  openDropdown,
  toggleDropdown,
  dropdownName,
  link,
}) => (
  <li>
    {dropdownItems ? (
      <a
        href="#"
        className="flex items-center p-2 rounded-lg hover:bg-gray-700 group text-gray-300"
        onClick={() => toggleDropdown(dropdownName)}
      >
        <span className="w-5 h-5 text-gray-300">{icon}</span> {/* Icon styling */}
        <span className="ml-3">{label}</span> {/* Label styling */}
        <span
          className={`ml-auto transform transition-transform duration-200 ${
            openDropdown === dropdownName ? "rotate-90" : "rotate-0"
          }`}
        >
          &gt;
        </span>
      </a>
    ) : (
      <Link
        to={link} // Use Link instead of a tag
        className="flex items-center p-2 rounded-lg hover:bg-gray-700 group text-gray-300"
      >
        <span className="w-5 h-5 text-gray-300">{icon}</span> {/* Icon styling */}
        <span className="ml-3">{label}</span> {/* Label styling */}
      </Link>
    )}
    {dropdownItems && openDropdown === dropdownName && (
      <ul className="pl-6 space-y-2 text-gray-400">
        {dropdownItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.link || "#"}
              className="flex items-center p-2 rounded-lg hover:bg-gray-700"
            >
              <span className="mr-2">{item.icon}</span> {/* Dropdown icon */}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    )}
  </li>
);


const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Sidebar Items Data
  const sidebarItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, link: "#" },
    { label: "Settings", icon: <FaClipboardList />, link: "/settingsform" },
    { label: "Change Password", icon: <FaKey />, link: "/changepassword" },
    {
      label: "Categories",
      icon: <FaFolder className="inline mr-2" />,
      dropdownName: "categories",
      dropdownItems: [
        { label: "Category List", icon: <FaBox className="inline mr-2" />, link: '/categorylist' },
      ],
    },
    {
      label: "Subscription Plans",
      icon: <FaUsers />,
      dropdownName: "subscription",
      dropdownItems: [
        { label: "Subscription Plan List", icon: <FaUser />, link:'/subscriptionplanlist' },
        { label: "Subscribers List", icon: <FaUser />, link:'/subscriberdetails' },
      ],
    },
    {
      label: "Users",
      icon: <FaUsers />,
      dropdownName: "users",
      dropdownItems: [
        { label: "Customer List", icon: <FaUser />,link:'/' },
        { label: "Delivery Boy List", link: "/delivery-boys", icon: <FaUsers /> },
      ],
    },
    {
      label: "Slides",
      icon: <FaSlideshare />,
      dropdownName: "slides",
      dropdownItems: [
        { label: "Slides List", icon: <FaSlideshare />, link: "/slideslist" },
      ],
    },
    {
      label: "Items",
      icon: <FaBoxOpen />,
      dropdownName: "items",
      dropdownItems: [
        { label: "List Items", icon: <FaBoxOpen />, link: "/itemslist" },
      ],
    },
    {
      label: "Sellers",
      icon: <FaStore />,
      dropdownName: "sellers",
      dropdownItems: [
        { label: "Sellers List", icon: <FaStore />, link: "/sellerlist" },
        { label: "Seller Add", icon: <FaShoppingCart />, link: '/selleradd' },
      ],
    },
    {
      label: "Coupons",
      icon: <FaTags />,
      dropdownName: "coupons",
      dropdownItems: [
        { label: "List Coupons", icon: <FaTags />, link: '/couponlist' },
      ],
    },
    {
      label: "Orders",
      icon: <FaShoppingCart />,
      dropdownName: "orders",
      dropdownItems: [
        { label: "Orders List", icon: <FaBox />, link: "/orderslist" },
        { label: "Return Pending List", icon: <FaShippingFast />, link: '/pendingorders' },
        { label: "Return Replied List", icon: <FaReply />, link: '/repliedorders' },
      ],
    },
    {
      label: "Reports",
      icon: <FaFileAlt />,
      dropdownName: "reports",
      dropdownItems: [
        { label: "Item Requirement", icon: <FaChartBar />, link: '/itemrequirement' },
        { label: "Refund Orders", icon: <FaExchangeAlt />, link: '/refundorders' },
        { label: "Orders Report", icon: <FaChartBar />, link: '/ordersreport' },
      ],
    },
  ];

  return (
    <div className="flex">
      <Header /> {/* Adding the Header component */}
      <aside className="fixed top-14 left-0 z-40 w-64 h-screen p-1 bg-gray-800 text-white ">
        <div className="h-full px-2 py-1 overflow-y-auto">
          <h2 className="text-md font-bold text-center text-gray-200">E-Commerce Admin</h2>
          <h3 className="text-center text-gray-400">Admin Panel</h3>
          <ul className="space-y-1 font-medium">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                link={item.link}
                dropdownItems={item.dropdownItems}
                openDropdown={openDropdown}
                toggleDropdown={toggleDropdown}
                dropdownName={item.dropdownName}
              />
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
