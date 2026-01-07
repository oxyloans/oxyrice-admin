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
const [pageSize, setPageSize] = useState(50);


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

      let result = Array.isArray(res.data) ? res.data : [res.data];

      // ✅ Sort data based on status
      if (statusValue === "REQUESTED") {
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt );
          return dateB - dateA; // Descending (latest first)
        });
      } else {
        result.sort((a, b) => {
          const dateA = new Date(a.approvedAt );
          const dateB = new Date(b.approvedAt );
          return dateB - dateA; // Descending (latest first)
        });
      }

      setData(result);
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



  // Status colors
  const statusColors = {
    APPROVED: "green",
    REQUESTED: "blue",
    REJECTED: "red",
    DELETED: "gray",
  };

  // Date formatting helper
  const formatDate = (value) => {
    if (!value) return;
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
          {text}
        </div>
      ),
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
        <Row gutter={16} style={{ marginBottom: 16, alignItems: "center" }}>
          <Col xs={24} sm={24} md={8}>
            <Select
              value={status}
              onChange={(val) => setStatus(val)}
              style={{ width: "100%" }}
            >
              <Option value="REQUESTED">REQUESTED</Option>
              <Option value="APPROVED">APPROVED</Option>
              <Option value="PENDING">PENDING</Option>
              <Option value="REJECTED">REJECTED</Option>
              <Option value="DELETED">DELETED</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Show</span>
              <Select
                value={pageSize}
                onChange={(val) => {
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                style={{ width: 120 }}
              >
                {[50, 60, 70, 80, 90, 100].map((num) => (
                  <Option key={num} value={num}>
                    {num}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
            <Search
              placeholder="Search by User ID, Agent Name, Agent ID"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              style={{ maxWidth: 320, width: "100%" }}
            />
          </Col>
        </Row>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="agentId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            showSizeChanger: false, // ✅ because we use our own Select
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} agents`,
            onChange: (page) => setCurrentPage(page),
            position: ["bottomRight"],
          }}
          bordered
          scroll={{ x: true }}
        />
      </Card>
    </AgentsAdminLayout>
  );
};

export default AgentsList;
