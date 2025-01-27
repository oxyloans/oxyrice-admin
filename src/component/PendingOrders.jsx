import AdminPanelLayout from "./AdminPanelLayout";
import React, { useState, useRef, useEffect } from "react";
import { Table, Button, message, Row, Col,Spin,Modal, Select } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { AiOutlineDownload } from "react-icons/ai";
const { Option } = Select;

const accessToken = localStorage.getItem("accessToken");

const PendingOrders = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
    const printContents = printRef.current.innerHTML; // Get the table's HTML
    const originalContents = document.body.innerHTML; // Save the current page content
    document.body.innerHTML = printContents; // Replace body with the table content
    window.print(); // Trigger the print dialog
    document.body.innerHTML = originalContents; // Restore original content after printing
    window.location.reload(); // Reload the page to restore functionality
  };

  const fetchOrderDetailsModal = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://meta.oxyloans.com/api/erice-service/order/getOrdersByOrderId/${orderId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response?.data) {
        console.log("Fetched Order Details:", response.data);
        setOrderDetails(response.data[0]); // Assuming it's an array and you need the first item
      } else {
        console.error("Empty response:", response);
      }
    } catch (error) {
      console.error(
        "Error fetching order details:",
        error.response || error.message
      );
    } finally {
      setLoading(false);
    }
  };
  // Handle "View" button click
  const handleViewClick = (orderId) => {
    fetchOrderDetailsModal(orderId); // Fetch order details
    setIsModalVisible(true); // Show modal
  };
  // Define table columns
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
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
      render: (type) => (type === 1 ? "ONLINE" : type === 2 ? "COD" : "NA"),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => status || "Pending",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
        const statusMap = {
          0: "Incomplete",
          4: "Order Delivered",
          6: "Order Cancelled",
        };
        return statusMap[status] || "Pending";
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
              margin: "4px",
            }}
            onClick={() => handleViewClick(order.orderId)}
          >
            View
          </Button>
          <Button
            onClick={handlePrint}
            type="link"
            style={{
              backgroundColor: "#23C6C8",
              color: "white",
             
             
            }}
          
          >
            Print
          </Button>
        </>
      ),
    },
  ];
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://meta.oxyloans.com/api/erice-service/order/cancelled-incomplete`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("API Response:", response.data); // Confirm the structure of response data

      if (response.status === 200) {
        setOrderData(response.data);
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
  }, []);

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
          ? "ONLINE"
          : item.paymentType === 2
            ? "COD"
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
  };
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
    1: "COD",
    2: "ONLINE",
  };
  return (
    <AdminPanelLayout>
      <div ref={printRef}>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h2 className="text-xl font-bold mb-2 sm:mb-0">
              Return Pending List
            </h2>
          </Col>
        </Row>

        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            Show{" "}
            <Select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              style={{ width: 70 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
            </Select>{" "}
            entries
          </Col>
          <Col>
            <Button
              onClick={() => handleDownloadExcel(orderData)}
              style={{
                backgroundColor: "#1c84c6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px", // Space between icon and text
              }}
            >
              <AiOutlineDownload style={{ fontSize: "1.2rem" }} />
              Generate Excel
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          scroll={{ x: "100%" }}
          bordered
          className="border"
          pagination={{
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </div>
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
                    {orderDetails?.orderId || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Customer Mobile</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {orderDetails?.customermobilenumber || "N/A"} -{" "}
                    {orderDetails?.customerName || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Customer Address</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <strong>Flat No:</strong> {orderDetails?.flatNo || "N/A"},{" "}
                    <br />
                    <strong>Land Mark:</strong>{" "}
                    {orderDetails?.landMark || "N/A"}, <br />
                    <strong>Location:</strong> {orderDetails?.address || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Order Status</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {orderDetails?.orderstatus
                      ? orderStatusMap[orderDetails.orderstatus]
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Payment Type</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {orderDetails?.payment
                      ? paymentTypeMap[orderDetails.payment] || "Other"
                      : "N/A"}
                  </td>
                </tr>
                <tr></tr>
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
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  align: "center",
                  render: (text) => `₹${text || "0.00"}`,
                },
                {
                  title: "Total Price",
                  dataIndex: "price",
                  key: "price",
                  align: "center",
                  render: (text) => `₹${text || "0.00"}`,
                },
              ]}
              dataSource={orderDetails?.orderItems || []}
              rowKey={(record, index) => index}
              pagination={false}
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
                    ₹{orderDetails?.subtotal || "0.00"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Delivery Fee</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    ₹{orderDetails?.deliveryfee || "0.00"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Grand Total</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    ₹{orderDetails?.granttotal || "0.00"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <strong>Subscription Amount Used</strong>
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    ₹{orderDetails?.subscriptionAmountUsed || "0.00"}
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
              </tbody>
            </table>
          </div>
        ) : (
          <p>No order details available.</p>
        )}
      </Modal>
    </AdminPanelLayout>
  );
};

export default PendingOrders;
