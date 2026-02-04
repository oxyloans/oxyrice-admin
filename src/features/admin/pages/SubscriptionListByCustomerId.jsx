import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {  Table, message, Row, Col, Select } from "antd";
import AdminPanelLayout from "../components/AdminPanel.jsx"; // Your Admin Panel Layout

const { Option } = Select;

const SubscriptionPlanListustomerId = () => {
  const { id } = useParams(); // Capture the customer ID from the URL
  const [orderData, setOrderData] = useState([]); // Store subscription details
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [errorMessage, setErrorMessage] = useState(""); // Error message
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
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      align: "center",
    },
    {
      title: "Customer Mobile",
      dataIndex: "customerMobile",
      key: "customerMobile",
      align: "center",
    },
    {
      title: "Transaction ID",
      dataIndex: "paymentId",
      key: "paymentId",
      align: "center",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      render: (amount) => (amount ? `$${amount}` : "-"),
    },
    {
      title: "Plan Status",
      dataIndex: "planStatus",
      key: "planStatus",
      align: "center",
      render: (status) =>
        status ? (
          <span className="text-green-600 font-semibold">Active</span>
        ) : (
          <span className="text-red-600 font-semibold">Inactive</span>
        ),
    },
    {
      title: "Transaction Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      align: "center",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
  ];

  // Fetch subscription data based on customerId
  const fetchSubscriptionData = async () => {
    if (!id) {
      message.error("Invalid customer ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://meta.oxyglobal.tech/api/order-service/getSubscriptionsDetailsForaCustomer",
        {
          customerId: id, // Passing customerId from params to the request body
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Add the Authorization header here
          },
        },
      );

      if (response.data && response.data.status === true) {
        setOrderData([response.data]); // Set order data
        setErrorMessage(""); // Clear error message
      } else {
        setOrderData([]); // Clear data
        setErrorMessage(response.data.message || "No subscription found.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrderData([]); // Clear data
      setErrorMessage("An error occurred while fetching subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData(); // Fetch data when component is mounted
  }, [id]); // Re-fetch data when the customer ID changes

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  return (
    <AdminPanelLayout>
      <div>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h2 className="text-xl font-bold mb-2">Subscription Plan List</h2>
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

        {error && <p className="text-red-600">{error}</p>}

        <Table
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="paymentId"
          pagination={{
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
          scroll={{ x: "max-content" }} // Ensure table is scrollable in small screens
          locale={{
            emptyText: errorMessage || "No data available.",
          }}
        />
      </div>
    </AdminPanelLayout>
  );
};

export default SubscriptionPlanListustomerId;
