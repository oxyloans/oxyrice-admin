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
} from "antd";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";
import "jspdf-autotable";
import { AiOutlineDownload } from "react-icons/ai";
import BASE_URL from "./Config.jsx";
const token = localStorage.getItem("token");
const { Option } = Select;
// Generate a unique order ID using UUID v4

const Ordersdetails = () => {
  const [dateRange, setDateRange] = useState([]);
  const [orderStatus, setOrderStatus] = useState("All");
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [toDate, setToDate] = useState(null); // Initialize with null
  const [fromDate, setFromDate] = useState(null); // Initialize with null
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const handleStatusChange = (value) => setOrderStatus(value);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };
  console.log(orderDetails);
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
        console.log("Fetched Order Details:", response.data);
        setOrderDetails(response.data[0]);
        console.log(response.data[0]); // Assuming the response is an array
      } else {
        message.warning("No order details found for the given Order ID.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);

      // Show different error messages based on the status code
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
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
    setSearchTerm(value);

    if (value) {
      // Filter items based on multiple search criteria
      const filtered = orderData.filter((item) => {
        // Check last 4 digits of order ID
        const lastFourDigits = item.orderId?.toString().slice(-4);

        // Additional search conditions
        const orderIdMatch = lastFourDigits?.includes(value);
        const usernameMatch = item.username?.toLowerCase().includes(value);
        const mobileNumberMatch = item.mobilenumber
          ?.toLowerCase()
          .includes(value);

        // Return true if any of the conditions match
        return orderIdMatch || usernameMatch || mobileNumberMatch;
      });

      setFilteredItems(filtered); // Update the filtered items
    } else {
      setFilteredItems(orderData); // Reset to all items when search term is empty
    }
  };
  // Handle "View" button click
  const handleViewClick = (orderId) => {
    fetchOrderDetailsModal(orderId); // Fetch order details
    setIsModalVisible(true); // Show modal
  };

  // Function to handle Print Button click
  const handleViewClick1 = async (orderId) => {
    await fetchOrderDetailsModal(orderId); // Fetch order details
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
    pdf.setTextColor("#4CAF50"); // Green color for the title
    safeText("BILL FROM OXYRICE", 14, 20); // Custom title

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
    safeText("Invoice To:", 105, 55); // Start from a different position
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
        0: { cellWidth: 70, fontStyle: "bold" }, // Item Description
        1: { cellWidth: 40 }, // Quantity
        2: { cellWidth: 40 }, // Unit Cost
        3: { cellWidth: 40 }, // Total
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

  // Define table columns
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
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
    // {
    //   title: 'Customer Id',
    //   dataIndex: 'customerId',
    //   key: 'customerId',
    //   render: (text) => text || 'N/A',align:'center'
    // },

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
    // {
    //   title: "P S",
    //   dataIndex: "paymentStatus",
    //   key: "paymentStatus",
    //   // render: (type) => (type === 1 ? 'COMPLEATED' : type === 2 ? 'PENDING' : 'Other'),
    //   align: "center",
    // },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
        const statusMap = {
          0: "Incomplete",
          1: "Order Placed",
          2: "Order Accepted", // Corrected typo
          3: "Order Assigned",
          PickedUp: "Order Picked Up", // Added space for readability
          4: "Order Delivered",
          5: "Order Rejected",
          6: "Order Canceled",
        };
        return statusMap[status] || status; // Return original status if not found in map
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (order) => (
        <>
          <Button
            type="link"
            style={{
              backgroundColor: "#23C6C8",
              color: "white",
              padding: "2px",
              margin: "2px",
            }}
            onClick={() => handleViewClick(order.orderId)} // Call handleViewClick with orderId
          >
            View
          </Button>

          <Button
            onClick={() => handleViewClick1(order.orderId)} // Pass orderId to fetch order details and print
            type="link"
            style={{
              backgroundColor: "#23C6C8",
              color: "white",
            }}
          >
            Print
          </Button>

          {orderDetails && (
            <Button
              onClick={handleDownloadPDF} // Download PDF button shown when orderDetails are available
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

  const handleDownloadExcel = (orderData) => {
    // Ensure orderData is an array
    const data = Array.isArray(orderData) ? orderData : [];

    // Check if data is empty
    if (data.length === 0) {
      console.error("No order data available for download.");
      return; // Exit the function
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
            const statusMap = {
              0: "Incomplete",
              1: "Order Placed",
              2: "Order Accepted",
              3: "Order Picked",
              4: "Order Delivered",
              5: "Order Rejected",
              6: "Order Canceled",
            };
            return statusMap[item.orderStatus] || "Pending";
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

  const fetchOrderDetails = async () => {
    if (!token) {
      message.error("User not authenticated. Please log in.");
      return;
    }

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
    const statusValue = orderStatus !== "All" ? orderStatus : undefined;

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/order-service/date-range`, {
        params: { startDate, endDate, status: statusValue },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data); // Confirm the structure of response data

      if (response.status === 200) {
        let orders = response.data;
        const uniqueOrderId = uuidv4();
        console.log("Generated Unique Order ID:", uniqueOrderId);

        // Filter out orders where testUser is true
        orders = orders.filter((order) => !order.testUser);
        // Format orderId to show only last 4 digits
        // orders = orders.map((order) => ({
        //   ...order,
        //   orderId: order.orderId ? order.orderId.slice(-4) : "", // Extract last 4 digits
        // }));
        // Filter results based on status if specified
        if (statusValue) {
          orders = orders.filter((order) => order.orderStatus === statusValue);
        }

        setOrderData(orders);
        setFilteredItems(orders);
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

  const orderStatusMap = {
    0: "Incomplete",
    1: "Order Placed",
    2: "Order Accepted",
    3: "Order Picked",
    4: "Order Delivered",
    5: "Order Rejected",
    6: "Order Canceled",
  };

  const paymentTypeMap = {
    1: "COD",
    2: "ONLINE",
  };

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
                style={{ backgroundColor: "#1AB394" }}
                onClick={fetchOrderDetails}
                loading={loading}
              >
                Get Data
              </Button>
              <Button
                className="text-white w-full sm:w-auto flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1c84c6" }}
                onClick={() => handleDownloadExcel(orderData)}
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
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
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
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          // pagination={false}
        />
        {/* Modal for Order Details */}

        <Modal
          title="Order Details"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={650}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin />
            </div>
          ) : orderDetails ? (
            <div>
              <table className="w-full border-collapse border border-gray-300 mb-4">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Order ID</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {orderDetails?.orderId}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Customer Mobile</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {(orderDetails?.customerMobile &&
                      orderDetails?.customerMobile.trim() !== ""
                        ? orderDetails.customerMobile
                        : orderDetails?.mobileNumber) +
                        " - " +
                        orderDetails?.customerName}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Customer Address</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <strong>Flat No:</strong>{" "}
                      {orderDetails?.orderAddress?.flatNo}, <br />
                      <strong>Land Mark:</strong>{" "}
                      {orderDetails?.orderAddress?.landMark}, <br />
                      <strong>Location:</strong>{" "}
                      {orderDetails?.orderAddress?.address},
                      <br />
                      <strong>Pincode:</strong>{" "}
                      {orderDetails?.orderAddress?.pincode}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Order Status</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {orderDetails?.orderStatus
                        ? orderStatusMap[orderDetails.orderStatus]
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Payment Type</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {orderDetails?.paymentType
                        ? paymentTypeMap[orderDetails.paymentType] || "Other"
                        : ""}
                    </td>
                  </tr>
                  <tr>
                    {/* <td className="border border-gray-300 px-2 py-1 text-center"><strong>Payment Status</strong></td>
            <td className="border border-gray-300 px-2 py-1 text-center">
  {paymentTypeStatus[orderDetails?.payment] || "N/A"}
</td> */}
                  </tr>
                </tbody>
              </table>

              <h2 className="font-semibold mb-2 text-center">
                Menu Item Details
              </h2>
              <Table
                columns={[
                  {
                    title: "Menu Item",
                    dataIndex: "itemName",
                    key: "itemName",
                    align: "center",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    align: "center",
                  },
                  {
                    title: "Weight",
                    dataIndex: "weight",
                    key: "weight",
                    align: "center",
                  },
                  {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                    align: "center",
                    render: (text) => `₹${text || "0.00"}`,
                  },
                ]}
                dataSource={orderDetails?.orderItems || []}
                rowKey={(record, index) => index}
                pagination={false}
                scroll={{ x: "100%" }}
              />

              <h2 className="font-semibold mt-4 ">
                <strong>Order Totals</strong>
              </h2>
              <table className="w-full border-collapse border border-gray-300 mb-4">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Sub Total</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.subTotal || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Delivery Fee</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.deliveryFee || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Coupon Amount Used</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.discountAmount || "0.00"}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Subscription Amount Used</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.subscriptionAmount || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Wallet Amount Used</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.walletAmount || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Referral Amount Used</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.referralAmountUsed || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Gst Amount</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.gstAmount || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <strong>Grand Total</strong>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      ₹{orderDetails?.grandTotal || "0.00"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* <Table
        dataSource={orderDetails?.orderHistory || []}
        columns={[
          { title: "Status", dataIndex: "status", key: "status", render: (text) => ({"1": "Order Placed", "2": "Processing", "3": "Shipped", "4": "Delivered"}[text] || "Unknown")) },
          { title: "Updated At", dataIndex: "createdAt", key: "createdAt", render: (text) => text ? new Date(text).toLocaleString() : "N/A" },
        ]}
        rowKey={(record, index) => index}
        pagination={false}
      /> */}
            </div>
          ) : (
            <p>No order details available.</p>
          )}
        </Modal>
      </div>
    </AdminPanelLayout>
  );
};

export default Ordersdetails;
