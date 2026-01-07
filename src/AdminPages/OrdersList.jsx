import AdminPanelLayout from "./AdminPanel.jsx";
import React, { useState } from "react";
import {
  Table,
  DatePicker,
  Select,
  Row,
  Spin,
  Modal,
  Col,
  Button,
  message,
  Input,
  Tag,
} from "antd";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";
import "jspdf-autotable";
import {
  AiOutlineDownload,
  AiOutlinePrinter,
  AiOutlineEye,
} from "react-icons/ai";
import BASE_URL from "./Config.jsx";
const token = localStorage.getItem("token");
const { Option } = Select;

const Ordersdetails = () => {
  const [orderStatus, setOrderStatus] = useState("All");
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define order status mapping
  const orderStatusMap = {
    0: "Incomplete",
    1: "Order Placed",
    2: "Order Accepted",
    3: "Order Assigned",
    PickedUp: "Order Picked Up",
    4: "Order Delivered",
    5: "Order Rejected",
    6: "Order Canceled",
  };

  const paymentTypeMap = {
    1: "COD",
    2: "ONLINE",
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  // Handle status change - only update the state, don't filter yet
  const handleStatusChange = (value) => {
    setOrderStatus(value);
  };

  // Separate function to apply only search filter (status is already filtered by API)
  const applyFilters = (data, search) => {
    let filtered = [...data];

    // Apply search filter if there's a search term
    if (search && search.trim() !== "") {
      filtered = filtered.filter((item) => {
        // Check last 4 digits of order ID
        const lastFourDigits = item.orderId?.toString().slice(-4);

        // Additional search conditions
        const orderIdMatch =
          item.orderId?.toString().toLowerCase().includes(search) ||
          lastFourDigits?.includes(search);
        const usernameMatch = item.username?.toLowerCase().includes(search);
        const mobileNumberMatch = item.mobilenumber
          ?.toLowerCase()
          .includes(search);

        return orderIdMatch || usernameMatch || mobileNumberMatch;
      });
    }

    return filtered;
  };

  const fetchOrderDetailsModal = async (orderId) => {
    if (!orderId) {
      message.error("Invalid Order ID. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/getOrdersByOrderId/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.status === 200 && response?.data?.length > 0) {
        setOrderDetails(response.data[0]);
      } else {
        message.warning("No order details found for the given Order ID.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);

      if (error.response?.status === 500) {
        message.error("Internal server error");
      } else {
        message.error(
          error.response?.data?.message ||
            "An error occurred while fetching order details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchTerm(value);

    // Apply search filter when search changes
    setFilteredItems(applyFilters(orderData, value));
  };

  // Handle "View" button click
  const handleViewClick = (orderId) => {
    fetchOrderDetailsModal(orderId);
    setIsModalVisible(true);
  };

  // Function to handle Print Button click
  const handleViewClick1 = async (orderId) => {
    await fetchOrderDetailsModal(orderId);
  };

  const handleDownloadPDF = () => {
    if (!orderDetails) {
      console.error("Order details not found");
      return;
    }

    const {
      orderId,
      customerName,
      orderDate,
      customermobilenumber,
      address = [],
      orderItems = [],
      grandTotal,
      deliveryfee,
    } = orderDetails;

    const pdf = new jsPDF();

    // Ensure safe text rendering with error handling
    const safeText = (text, x, y, options = {}) => {
      try {
        // Ensure text is converted to string
        const safeTextString = text ? text.toString() : "";
        pdf.text(safeTextString, x, y, options);
      } catch (error) {
        console.error("Error rendering text:", error);
      }
    };

    // Set font and title
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor("#4CAF50");
    safeText("BILL FROM OXYRICE", 14, 20);

    // Add Order and Date Information
    pdf.setFontSize(16);
    pdf.setTextColor("#000000");
    safeText(`Invoice No: ${orderId}`, 14, 30);
    safeText(`Billing Date: ${orderDate}`, 14, 40);

    // Add separator line
    pdf.setDrawColor(150);
    pdf.line(14, 45, 200, 45);

    // Invoice From Details
    pdf.setFontSize(14);
    safeText("Invoice From:", 14, 55);
    pdf.setFontSize(12);
    safeText("ASKOXY COMPANY", 14, 65);
    safeText("GSTIN: 1234567890", 14, 75);

    // Invoice To Details
    pdf.setFontSize(14);
    safeText("Invoice To:", 105, 55);
    pdf.setFontSize(12);
    safeText(customerName, 105, 65);
    safeText(customermobilenumber, 105, 75);
    safeText(address || "N/A", 105, 85);

    // Add Item Details (Invoice Breakup)
    pdf.setFontSize(14);
    safeText("Invoice Breakup", 14, 105);
    pdf.setFontSize(12);

    // Add table for items
    const itemsRows = orderItems.map((item) => [
      item.itemName || "N/A",
      item.quantity || "N/A",
      `${item.price ? item.price.toFixed(2) : "N/A"}`,
      `${item.quantity && item.price ? (item.quantity * item.price).toFixed(2) : "N/A"}`,
    ]);

    pdf.autoTable({
      startY: 115,
      head: [["Item Description", "Quantity", "Unit Cost", "Total"]],
      body: itemsRows,
      theme: "striped",
      headStyles: { fillColor: "#4CAF50", textColor: "#ffffff", fontSize: 12 },
      bodyStyles: { fontSize: 10, textColor: "#333333" },
      alternateRowStyles: { fillColor: "#f9f9f9" },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold" },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
      },
    });

    // Add the subtotal, discount, delivery fee, and grand total at the bottom
    const summaryRows = [
      ["SUB TOTAL", `${grandTotal?.toFixed(2)}`],
      ["DELIVERY FEE", `${deliveryfee?.toFixed(2)}`],
      ["GRAND TOTAL", `${grandTotal?.toFixed(2)}`],
    ];

    pdf.autoTable({
      startY: pdf.autoTable.previous.finalY + 10,
      head: [["Field", "Amount"]],
      body: summaryRows,
      theme: "striped",
      headStyles: { fillColor: "#4CAF50", textColor: "#ffffff", fontSize: 12 },
      bodyStyles: { fontSize: 12, textColor: "#333333" },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: "bold" },
        1: { cellWidth: 80 },
      },
    });

    // Add footer with generation date
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setTextColor("#555555");
    safeText(
      `Generated on: ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 10
    );

    // Add footer note
    safeText("Thank you for shopping with ASKOXY.AI!", 14, pageHeight - 5);

    // Save the PDF
    pdf.save(`Order_${orderId}.pdf`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setOrderDetails(null);
  };

  // Handle print functionality
  const handlePrint = () => {
    if (!orderDetails) {
      message.error("No order details available to print.");
      return;
    }
    window.print();
  };

  // Improved fetchOrderDetails function
  const fetchOrderDetails = async () => {
    // Ensure both dates are selected
    if (!fromDate || !toDate) {
      message.error("Please select a valid date range.");
      return;
    }

    // Ensure the fromDate is before the toDate
    if (fromDate.isAfter(toDate)) {
      message.error("From date cannot be later than To date.");
      return;
    }

    const startDate = fromDate.format("YYYY-MM-DD");
    const endDate = toDate.format("YYYY-MM-DD");

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/order-service/date-range`, {
        params: {
          startDate,
          endDate,
          // Only include status in the API request if it's not "All"
          ...(orderStatus !== "All" && { status: orderStatus }),
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        let orders = response.data;

        // Filter out test users
        orders = orders.filter((order) => !order.testUser);

        // Store all orders in orderData
        setOrderData(orders);

        // Apply search filter to get updated filtered items (status already filtered by API)
        const filtered = applyFilters(orders, searchTerm);
        setFilteredItems(filtered);

        message.success("Data fetched successfully");
      } else {
        message.error("No data found");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      message.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleDownloadExcel = (orderData) => {
    // Ensure orderData is an array
    const data = Array.isArray(orderData) ? orderData : [];

    // Check if data is empty
    if (data.length === 0) {
      console.error("No order data available for download.");
      return;
    }

    // Prepare data for Excel sheet
    const rows = data.map((item) => ({
      "Order ID": item.orderId || "N/A",
      "Order Date": item.orderDate || "N/A",
      "Grand Total": item.grandTotal || "N/A",
      "Payment Type": item.paymentType
        ? item.paymentType === 1
          ? "COD"
          : item.paymentType === 2
            ? "ONLINE"
            : "Other"
        : "Other",
      "Order Status": item.orderStatus
        ? (() => {
            return orderStatusMap[item.orderStatus] || "Pending";
          })()
        : "N/A",
    }));

    // Create a new workbook and add data to a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Data");

    // Generate and download the Excel file
    XLSX.writeFile(workbook, "OrderData.xlsx");
  };

  // Define table columns
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        (currentPage - 1) * entriesPerPage + index + 1,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      render: (orderId) => (
        <span className="text-gray-500 font-mono text-xs">
          #{orderId?.substring(orderId.length - 4) || "N/A"}
        </span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "username",
      key: "username",
      align: "center",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobilenumber",
      key: "mobilenumber",
      align: "center",
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "center",
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
      align: "center",
      render: (type) => (type === 1 ? "COD" : type === 2 ? "ONLINE" : ""),
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
        return orderStatusMap[status] || status;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (order) => (
        <>
          <div className="flex justify-center space-x-2">
            <Button
              type="link"
              icon={<AiOutlineEye />}
              style={{
                backgroundColor: "#008CBA",
                borderColor: "#008CBA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
              size="small"
              onClick={() => handleViewClick(order.orderId)}
            >
              View
            </Button>

            <Button
              icon={<AiOutlinePrinter />}
              onClick={() => handleViewClick1(order.orderId)}
              type="link"
              style={{
                backgroundColor: "#04AA6D",
                borderColor: "#04AA6D",
                display: "flex",
                color: "white",
                alignItems: "center",
                justifyContent: "center",
              }}
              size="small"
            >
              Print
            </Button>
          </div>

          {orderDetails && (
            <Button
              onClick={handleDownloadPDF}
              type="link"
              style={{
                backgroundColor: "#23C6C8",
                color: "white",
                marginTop: "10px",
              }}
            >
              Download PDF
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div>
        <div>
          {/* Filters Row */}
          <Row gutter={[16, 16]} align="middle" className="mb-4">
            {/* Order Status Dropdown */}
            <Col xs={24} sm={12} md={6}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <Select
                className="w-full"
                value={orderStatus}
                onChange={handleStatusChange}
              >
                <Option value="All">All</Option>
                <Option value="0">Incomplete</Option>
                <Option value="1">Order Placed</Option>
                <Option value="2">Order Accepted</Option>
                <Option value="3">Order Assigned</Option>
                <Option value="PickedUp">Order Picked Up</Option>
                <Option value="4">Order Delivered</Option>
                <Option value="5">Order Rejected</Option>
                <Option value="6">Order Cancelled</Option>
              </Select>
            </Col>

            {/* From Date */}
            <Col xs={24} sm={12} md={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <DatePicker
                value={fromDate}
                onChange={handleFromDateChange}
                format="YYYY-MM-DD"
                className="w-full"
                placeholder="Select From Date"
              />
            </Col>

            {/* To Date */}
            <Col xs={24} sm={12} md={4}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <DatePicker
                value={toDate}
                onChange={handleToDateChange}
                format="YYYY-MM-DD"
                className="w-full"
                placeholder="Select To Date"
              />
            </Col>

            {/* Action Buttons */}
            <Col
              xs={24}
              sm={24}
              md={6}
              className="flex flex-col sm:flex-row gap-3 mt-6 sm:gap-4 items-center sm:items-end"
            >
              <Button
                className="text-white w-full sm:w-auto"
                style={{ backgroundColor: "#1AB394", color: "white" }}
                onClick={fetchOrderDetails}
                loading={loading}
              >
                Get Data
              </Button>
              <Button
                className="text-white w-full sm:w-auto flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1c84c6", color: "white" }}
                onClick={() => handleDownloadExcel(filteredItems)} // Use filteredItems for download
              >
                <AiOutlineDownload className="text-lg" />
                Download
              </Button>
            </Col>
            {/* Search Input */}
            <Col className="w-full sm:w-auto flex items-center gap-2">
              <span>Search:</span>
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-[150px]"
                placeholder="Search Order Id"
              />
            </Col>
          </Row>

          {/* Orders List and Entries Per Page */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className="text-xl font-bold mb-2 sm:mb-0">Orders List</h2>
            </Col>
            <Col className="flex items-center gap-2">
              <span>Show</span>
              <Select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                style={{ width: 70 }}
              >
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
                <Option value={150}>150</Option>
              </Select>
              <span>entries</span>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredItems}
          loading={loading}
          rowKey="orderId"
          bordered
          scroll={{ x: "100%" }}
          pagination={{
            current: currentPage,
            pageSize: entriesPerPage,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
            },
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />

        {/* Modal for Order Details */}
        <Modal
          title={
            <div className="text-lg font-bold text-gray-800">Order Details</div>
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button
              key="print"
              type="primary"
              onClick={handlePrint}
              icon={<AiOutlinePrinter />}
            >
              Print
            </Button>,
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>,
          ]}
          width={700}
        >
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spin size="large" />
            </div>
          ) : orderDetails ? (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  Order Information
                </h3>
                <table className="w-full border-collapse border border-gray-300 bg-white">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 w-1/3">
                        Order ID
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="font-mono">
                          {orderDetails?.orderId}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Order Date
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {orderDetails?.orderDate}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Order Status
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {orderDetails?.orderStatus
                          ? orderStatusMap[orderDetails.orderStatus]
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Payment Type
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Tag
                          color={
                            orderDetails?.paymentType === 1 ? "green" : "blue"
                          }
                        >
                          {orderDetails?.paymentType
                            ? paymentTypeMap[orderDetails.paymentType] ||
                              "Other"
                            : "N/A"}
                        </Tag>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  Customer Information
                </h3>
                <table className="w-full border-collapse border border-gray-300 bg-white">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 w-1/3">
                        Customer Name
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {orderDetails?.customerName || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Customer Mobile
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {(orderDetails?.customerMobile &&
                        orderDetails?.customerMobile.trim() !== ""
                          ? orderDetails.customerMobile
                          : orderDetails?.mobileNumber) || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Delivery Address
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div>
                          {orderDetails?.orderAddress?.flatNo && (
                            <span>
                              <strong>Flat No:</strong>{" "}
                              {orderDetails.orderAddress.flatNo}
                            </span>
                          )}
                          {orderDetails?.orderAddress?.landMark && (
                            <div>
                              <strong>Land Mark:</strong>{" "}
                              {orderDetails.orderAddress.landMark}
                            </div>
                          )}
                          {orderDetails?.orderAddress?.address && (
                            <div>
                              <strong>Location:</strong>{" "}
                              {orderDetails.orderAddress.address}
                            </div>
                          )}
                          {orderDetails?.orderAddress?.pincode && (
                            <div>
                              <strong>Pincode:</strong>{" "}
                              {orderDetails.orderAddress.pincode}
                            </div>
                          )}
                          {!orderDetails?.orderAddress && (
                            <span>No address available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  Order Items
                </h3>
                <Table
                  columns={[
                    {
                      title: "Item Name",
                      dataIndex: "itemName",
                      key: "itemName",
                      align: "left",
                    },
                    {
                      title: "Quantity",
                      dataIndex: "quantity",
                      key: "quantity",
                      align: "center",
                      width: 100,
                    },
                    {
                      title: "Weight",
                      dataIndex: "weight",
                      key: "weight",
                      align: "center",
                      width: 100,
                    },
                    {
                      title: "Price",
                      dataIndex: "price",
                      key: "price",
                      align: "right",
                      render: (text) => `₹${Number(text).toFixed(2) || "0.00"}`,
                      width: 100,
                    },
                  ]}
                  dataSource={orderDetails?.orderItems || []}
                  rowKey={(record, index) => index}
                  pagination={false}
                  scroll={{ x: 500 }}
                  size="small"
                  className="bg-white"
                />
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  Payment Details
                </h3>
                <table className="w-full border-collapse border border-gray-300 bg-white">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 w-2/3">
                        Sub Total
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹{Number(orderDetails?.subTotal).toFixed(2) || "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Delivery Fee
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹
                        {Number(orderDetails?.deliveryFee).toFixed(2) || "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Coupon Amount Used
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹
                        {Number(orderDetails?.discountAmount).toFixed(2) ||
                          "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Subscription Amount Used
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹
                        {Number(orderDetails?.subscriptionAmount).toFixed(2) ||
                          "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Wallet Amount Used
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹
                        {Number(orderDetails?.walletAmount).toFixed(2) ||
                          "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        Referral Amount Used
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹
                        {Number(orderDetails?.referralAmountUsed).toFixed(2) ||
                          "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                        GST Amount
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        ₹{Number(orderDetails?.gstAmount).toFixed(2) || "0.00"}
                      </td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">
                        Grand Total
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                        ₹{Number(orderDetails?.grandTotal).toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No order details available.</p>
            </div>
          )}
        </Modal>
      </div>
    </AdminPanelLayout>
  );
};

export default Ordersdetails;
