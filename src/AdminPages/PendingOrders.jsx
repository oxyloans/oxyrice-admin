import AdminPanelLayout from "./AdminPanel.jsx";
import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Row,
  Col,
  Spin,
  Modal,
  Select,
  Tag,
  Input,
} from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  AiOutlineDownload,
  AiOutlinePrinter,
  AiOutlineEye,
} from "react-icons/ai";
import BASE_URL from "./Config.jsx";
const { Option } = Select;

const OrdersPending = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]); // Define filteredItems state

  // Access token from localStorage
  const accessToken = localStorage.getItem("accessToken");

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setOrderDetails(null);
  };

  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const fetchOrderDetailsModal = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/getOrdersByOrderId/${orderId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response?.data) {
        console.log("Fetched Order Details:", response.data);
        setOrderDetails(response.data[0]);
      } else {
        console.error("Empty response:", response);
        message.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error(
        "Error fetching order details:",
        error.response || error.message
      );
      message.error("Error fetching order details");
    } finally {
      setLoading(false);
    }
  };

  // Handle "View" button click
  const handleViewClick = (orderId) => {
    fetchOrderDetailsModal(orderId);
    setIsModalVisible(true);
  };

  // Define table columns
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
      width: 80,
    },
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      render: (orderId) => (
        <span className="text-gray-600 font-mono text-xs font-semibold">
          #{orderId?.substring(orderId.length - 4) || "N/A"}
        </span>
      ),
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
      width: 130,
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      align: "center",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      width: 150,
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "center",
      render: (amount) => `₹${amount?.toFixed(2) || "0.00"}`,
      sorter: (a, b) => a.grandTotal - b.grandTotal,
      width: 120,
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
      align: "center",
      render: (type) => {
        if (type === 1) return <Tag color="green">ONLINE</Tag>;
        if (type === 2) return <Tag color="blue">COD</Tag>;
        return <Tag color="default">N/A</Tag>;
      },
      filters: [
        { text: "Online", value: 1 },
        { text: "COD", value: 2 },
      ],
      onFilter: (value, record) => record.paymentType === value,
      width: 120,
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        if (!status) return <Tag color="default">N/A</Tag>;
        if (status.toLowerCase() === "paid")
          return <Tag color="green">PAID</Tag>;
        if (status.toLowerCase() === "pending")
          return <Tag color="orange">PENDING</Tag>;
        return <Tag>{status}</Tag>;
      },
      align: "center",
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value, record) =>
        record.paymentStatus?.toLowerCase() === value,
      width: 140,
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
        const statusMap = {
          0: { text: "Incomplete", color: "orange" },
          4: { text: "Order Delivered", color: "green" },
          6: { text: "Order Cancelled", color: "red" },
        };

        const statusInfo = statusMap[status] || {
          text: "Pending",
          color: "blue",
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: "Incomplete", value: 0 },
        { text: "Delivered", value: 4 },
        { text: "Cancelled", value: 6 },
      ],
      onFilter: (value, record) => record.orderStatus === value,
      width: 150,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (order) => (
        <div className="flex justify-center space-x-2">
          <Button
            type="primary"
            icon={<AiOutlineEye />}
            onClick={() => handleViewClick(order.orderId)}
            style={{
              backgroundColor: "#008CBA",
              borderColor: "#008CBA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size="small"
          >
            View
          </Button>
          <Button
            onClick={handlePrint}
            type="primary"
            icon={<AiOutlinePrinter />}
            style={{
              backgroundColor: "#04AA6D",
              borderColor: "#04AA6D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size="small"
          >
            Print
          </Button>
        </div>
      ),
      width: 120,
    },
  ];

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/order-service/cancelled-incomplete`,
        {
          params: {
            page: currentPage - 1, // API uses 0-based indexing
            size: entriesPerPage,
            search: searchTerm, // Add search parameter
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("API Response:", response.data);

      if (response.status === 200) {
        // Check if response.data has a content property (paginated response)
        if (response.data.content) {
          setOrderData(response.data.content);
          setTotalElements(response.data.totalElements || 0);
        } else {
          // If it's a direct array
          setOrderData(response.data);
          setTotalElements(response.data.length);
        }
        message.success("Data fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      message.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleDownloadExcel = (orderData) => {
    // Ensure orderData is an array
    const data = Array.isArray(orderData) ? orderData : [];

    // Check if data is empty
    if (data.length === 0) {
      message.warning("No order data available for download.");
      return;
    }

    // Prepare data for Excel sheet
    const rows = data.map((item, index) => ({
      "S.No": index + 1,
      "Order ID": item.orderId || "N/A",
      "Order Date": item.orderDate || "N/A",
      "Grand Total": `₹${item.grandTotal?.toFixed(2) || "0.00"}`,
      "Payment Type": item.paymentType
        ? item.paymentType === 1
          ? "ONLINE"
          : item.paymentType === 2
            ? "COD"
            : "Other"
        : "Other",
      "Payment Status": item.paymentStatus || "N/A",
      "Order Status": item.orderStatus
        ? (() => {
            const statusMap = {
              0: "Incomplete",
              1: "Order Placed",
              2: "Order Accepted",
              3: "Order Picked",
              4: "Order Delivered",
              5: "Order Rejected",
              6: "Order Cancelled",
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
    message.success("Excel file downloaded successfully");
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
  // Map constants for display
  const orderStatusMap = {
    0: "Incomplete",
    1: "Order Placed",
    2: "Order Accepted",
    3: "Order Picked",
    4: "Order Delivered",
    5: "Order Rejected",
    6: "Order Cancelled",
  };

  const paymentTypeMap = {
    1: "ONLINE",
    2: "COD",
  };

  return (
    <AdminPanelLayout>
      <div className="p-4 bg-white rounded-lg shadow">
        <div ref={printRef}>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className="text-xl font-bold text-gray-800">
                Return Pending List
              </h2>
              <p className="text-gray-500 text-sm">
                Manage all cancelled and incomplete orders
              </p>
            </Col>
            <Col>
              <div className="flex space-x-2">
                {/* <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-[150px]"
                  placeholder="Search Order Id"
                /> */}
                <Button
                  onClick={() => handleDownloadExcel(orderData)}
                  type="primary"
                  icon={<AiOutlineDownload />}
                  style={{
                    backgroundColor: "#1c84c6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Export Excel
                </Button>
              </div>
            </Col>
          </Row>

          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              Show{" "}
              <Select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                style={{ width: 80 }}
              >
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
              </Select>{" "}
              entries
            </Col>
            <Col>
              <span className="text-gray-600">
                Total: <strong>{totalElements}</strong> orders
              </span>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={orderData}
            loading={loading}
            rowKey="orderId"
            scroll={{ x: 1000 }}
            bordered
            className="border"
            pagination={{
              pageSize: entriesPerPage,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              total: totalElements,
              showSizeChanger: true,
              onShowSizeChange: (current, size) => {
                setCurrentPage(1);
                setEntriesPerPage(size);
              },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </div>

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
                        <Tag
                          color={
                            orderDetails?.orderStatus === 4
                              ? "green"
                              : orderDetails?.orderStatus === 6
                                ? "red"
                                : "orange"
                          }
                        >
                          {orderDetails?.orderStatus
                            ? orderStatusMap[orderDetails.orderStatus]
                            : "N/A"}
                        </Tag>
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

export default OrdersPending;
