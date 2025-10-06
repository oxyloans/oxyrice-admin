import React, { useEffect, useState } from "react";
import { Table, Card, Input, Row, Col, message } from "antd";
import axios from "axios";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import BASE_URL from "../../AdminPages/Config";

const { Search } = Input;

const AgentsRegisteredUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Authorization token
      const response = await axios.get(
        `${BASE_URL}/user-service/getUserDataBasedOnType`,
        {
          params: {
            primaryType: "AGENT",
            registerFrom: "WEB",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      message.error("Failed to fetch agent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Filter data based on mobileNumber or whatsappNumber
  const filteredData = data.filter(
    (item) =>
      (item.mobileNumber && item.mobileNumber.includes(searchText)) ||
      (item.whatsappNumber && item.whatsappNumber.includes(searchText))
  );

  const columns = [
    {
      title: <div style={{ textAlign: "center" }}>S.No</div>,
      key: "sno",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: 70,
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>Last 4 Digits of User ID</div>
      ),
      dataIndex: "userId",
      key: "userId",
      render: (text) => (text ? text.slice(-4) : ""),
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>Mobile Number</div>,
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>WhatsApp Number</div>,
      dataIndex: "whatsappNumber",
      key: "whatsappNumber",
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>Registered Date</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center" }}>Register From</div>,
      dataIndex: "registerFrom",
      key: "registerFrom",
      align: "center",
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card style={{ margin: "20px" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <h1 style={{ textAlign: "center" }}>Registered Agents</h1>
          </Col>
          <Col>
            <Search
              placeholder="Search by mobile or WhatsApp"
              allowClear
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="userId"
          loading={loading}
          bordered
          scroll={{ x: true }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ["50", "100", "200", "300"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>
    </AgentsAdminLayout>
  );
};

export default AgentsRegisteredUsers;
