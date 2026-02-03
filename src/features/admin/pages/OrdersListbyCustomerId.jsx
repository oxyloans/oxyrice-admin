import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // For capturing params from the URL
import axios from "axios";
import { Button, Table, message, Row, Col, Spin, Select } from "antd";
import AdminPanelLayout from "../components/AdminPanel.jsx"; // Your Admin Panel Layout
import jsPDF from "jspdf";
import "jspdf-autotable";
const { Option } = Select;

const OrdersDetailsCustomerId = () => {
  const { id } = useParams(); // Capture the customer ID from the URL
  const [orderData, setOrderData] = useState(null); // Store order details
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = localStorage.getItem("accessToken");
  // Table columns
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "Order ID",
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
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "center",
    },

    {
      title: "P T",
      dataIndex: "paymentType",
      key: "paymentType",
      align: "center",
      render: (type) => (type === 1 ? "ONLINE" : type === 2 ? "COD" : "Other"),
    },
    {
      title: "D F",
      dataIndex: "deliveryFee",
      key: "deliveryFee",
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
          1: "Order Placed",
          2: "Order Accepetd",
          3: "Order Picked",
          4: "Order Delivered",
          5: "Order Rejected",
          6: "Order Canceled",
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
            onClick={() => handleDownloadPDF(order.orderId, orderData)}
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

  // Fetch orders data based on customerId (from URL params)
  const fetchOrderData = async () => {
    if (!id) {
      message.error("Invalid customer ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://meta.oxyglobal.tech/api/order-service/getAllOrders_customerId",
        {
          customerId: id, // Passing customerId from params to the request body
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Add the Authorization header here
          },
        },
      );

      if (response.data && response.data.length > 0) {
        setOrderData(response.data); // Set order data if response is successful
        setError(null); // Reset error state
      } else {
        setError("No orders found.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData(); // Fetch data when component is mounted
  }, [id]); // Re-fetch data when the customer ID changes
  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleDownloadPDF = (orderId, orderData) => {
    // Find the specific order by orderId
    const specificOrder = orderData.find((order) => order.orderId === orderId);

    if (!specificOrder) {
      message.error("Order not found.");
      return;
    }

    const pdf = new jsPDF();

    // Add title with better formatting
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor("#4CAF50"); // Green color for the title
    pdf.text(`Order Details`, 14, 20);
    pdf.setFontSize(16);
    pdf.setTextColor("#000000");
    pdf.text(`Order ID: ${specificOrder.orderId}`, 14, 30);

    // Add a separator line for better structure
    pdf.setDrawColor(150);
    pdf.line(14, 35, 200, 35);

    // Define row-wise data
    const rows = [
      ["Field", "Value"],
      ["Order ID", specificOrder.orderId || "N/A"],
      ["Order Date", specificOrder.orderDate || "N/A"],
      ["Grand Total", `$${specificOrder.grandTotal?.toFixed(2) || "N/A"}`],
      [
        "Payment Type",
        specificOrder.paymentType === 1
          ? "ONLINE"
          : specificOrder.paymentType === 2
            ? "COD"
            : "Other",
      ],
      [
        "Order Status",
        (() => {
          const statusMap = {
            0: "Incomplete",
            1: "Order Placed",
            2: "Order Accepted",
            3: "Order Picked",
            4: "Order Delivered",
            5: "Order Rejected",
            6: "Order Cancelled",
          };
          return statusMap[specificOrder.orderStatus] || "Pending";
        })(),
      ],
    ];

    // Add table with enhanced styles
    pdf.autoTable({
      body: rows,
      startY: 40,
      theme: "striped",
      headStyles: { fillColor: "#4CAF50", textColor: "#ffffff", fontSize: 12 },
      bodyStyles: { fontSize: 10, textColor: "#333333" },
      alternateRowStyles: { fillColor: "#f9f9f9" },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold" }, // First column for field names
        1: { cellWidth: 110 }, // Second column for values
      },
    });

    // Add footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setTextColor("#555555");
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 10,
    );

    // Save the PDF
    pdf.save(`Order_${specificOrder.orderId}.pdf`);
  };

  return (
    <AdminPanelLayout>
      <div>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h2
              className="text-xl font-bold mb-2 sm:mb-0"
              type="primary"
              onClick={fetchOrderData}
            >
              Orders List
            </h2>
          </Col>
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
        </Row>

        <Table
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          pagination={{
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
          scroll={{ x: "max-content" }} // Ensure table is scrollable in small screens
          responsive
        />
      </div>
    </AdminPanelLayout>
  );
};

export default OrdersDetailsCustomerId;
