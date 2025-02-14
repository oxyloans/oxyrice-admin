import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  Switch,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelTest.jsx";
import MainLayout from "./Layout";

const SubscribersListDEtails = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSubscriberDetails, setfilterSubscriberDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { Option } = Select;

  const accessToken = localStorage.getItem("accessToken");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyloans.com/api/erice-service/subscription-plans/getAllSubscriptionForUser",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Data fetched successfully");
      setSubscribers(response.data);
      setfilterSubscriberDetails(response.data);
    } catch (error) {
      message.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
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
      title: "Transaction Id",
      dataIndex: "paymentId",
      key: "paymentId",
      align: "center",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
    },
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      align: "center",
    },
  ];

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Convert input to lowercase and trim spaces
    setSearchTerm(value);

    if (value) {
      // Filter subscribers based on search term
      const filtered = subscribers.filter((subscriber) =>
        [
          "customerName",
          "customerMobile",
          "paymentId",
          "amount",
          "paymentStatus",
        ].some((key) =>
          subscriber[key]?.toString().toLowerCase().includes(value)
        )
      );

      setfilterSubscriberDetails(filtered);
    } else {
      setfilterSubscriberDetails(subscribers); // Show all plans when search term is empty
    }
  };

  return (
    <AdminPanelLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Subscribers Details</h2>
      </div>

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
          Search:{" "}
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filterSubscriberDetails}
        loading={loading}
        rowKey="paymentId"
        bordered
        scroll={{ x: "100%" }}
        pagination={{
          pageSize: entriesPerPage,
          onChange: (page) => setCurrentPage(page),
        }}
        size="middle"
        className="border"
      />
    </AdminPanelLayout>
  );
};

export default SubscribersListDEtails;
