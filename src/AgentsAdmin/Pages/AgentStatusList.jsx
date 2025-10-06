import React, { useEffect, useState } from "react";
import { Table, Card, Input, Row, Col, Select, message, Tag } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Search } = Input;
const { Option } = Select;

const AgentsList = () => {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("APPROVED"); // default status
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  // Fetch agents by status
  const fetchAgents = async (statusValue) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/get_agent_based_on_status?Status=${statusValue}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (res.data) {
        const result = Array.isArray(res.data) ? res.data : [res.data];
        setData(result);
      } else {
        setData([]);
      }
    } catch (err) {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents(status);
    setCurrentPage(1); // reset to first page when status changes
  }, [status]);

  // Search filter (userId, agentName, agentId)
  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    return (
      (item.userId && item.userId.toLowerCase().includes(search)) ||
      (item.agentName && item.agentName.toLowerCase().includes(search)) ||
      (item.agentId && item.agentId.toLowerCase().includes(search))
    );
  });

  // Pagination logic
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Status colors
  const statusColors = {
    APPROVED: "green",
    REQUESTED: "blue",
    REJECTED: "red",
    DELETED: "gray",
  };

  // Date formatting helper
  const formatDate = (value) => {
    if (!value) return "N/A";
    try {
      const timestamp = Number(value);
      const date = isNaN(timestamp)
        ? new Date(value)
        : timestamp < 1e12
          ? new Date(timestamp * 1000)
          : new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Agent ID (Last 4)",
      dataIndex: "agentId",
      key: "agentId",
      align: "center",
      render: (text) => (text ? text.slice(-4) : "N/A"),
    },
    {
      title: "User ID (Last 4)",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      render: (text) => (text ? text.slice(-4) : "N/A"),
    },
    {
      title: "Assistant ID",
      dataIndex: "assistanceId",
      key: "assistanceId",
      align: "center",
      render: (text) => (text ? text.slice(-4) : "N/A"),
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
      align: "center",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => (
        <Tag color={statusColors[text] || "default"}>{text}</Tag>
      ),
    },
    {
      title: "Agent Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text || "N/A"}
        </div>
      ),
    },
    {
      title: "Agent Status",
      dataIndex: "agentStatus",
      key: "agentStatus",
      align: "center",
    },
    {
      title: "Free Trials",
      dataIndex: "freeTrails",
      key: "freeTrails",
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (val) => formatDate(val),
    },
    {
      title: "Approved At",
      dataIndex: "approvedAt",
      key: "approvedAt",
      align: "center",
      render: (val) => formatDate(val),
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card title="Agents Status List" bordered={false}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={status}
              onChange={(val) => setStatus(val)}
              style={{ width: "100%" }}
            >
              <Option value="REQUESTED">REQUESTED</Option>
              <Option value="APPROVED">APPROVED</Option>
              <Option value="REJECTED">REJECTED</Option>
              <Option value="DELETED">DELETED</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} offset={8} style={{ textAlign: "right" }}>
            <Search
              placeholder="Search by User ID, Agent Name, Agent ID"
              allowClear
              onSearch={(val) => setSearchText(val)}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 300, width: "100%" }}
            />
          </Col>
        </Row>

        <Table
          dataSource={paginatedData}
          columns={columns}
          rowKey="agentId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ["bottomRight"], // ✅ Pagination now at bottom-right
          }}
          bordered
          scroll={{ x: true }}
        />
      </Card>
    </AgentsAdminLayout>
  );
};

export default AgentsList;
