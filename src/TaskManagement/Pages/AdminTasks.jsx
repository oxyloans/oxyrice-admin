// /src/AdminTasks.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Image,
  Typography,
  Input,
  message,
  Button,
  Row,
  Col,
  Tooltip,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Text } = Typography;
const { Search } = Input;

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const accessToken = localStorage.getItem("token");

  // Fetch API data
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllMessagesFromGroup`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const reversedTasks = response.data.slice().reverse();
      setTasks(reversedTasks);
      setFilteredTasks(reversedTasks);
    } catch (error) {
      message.error("Failed to fetch tasks");
      console.error(
        "Fetch error details:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Search function
  const handleSearch = (value) => {
    if (!value) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(
      (task) =>
        task.taskAssignBy?.toLowerCase().includes(value.toLowerCase()) ||
        task.taskAssignTo?.some((t) =>
          t.toLowerCase().includes(value.toLowerCase())
        ) ||
        task.taskName?.toLowerCase().includes(value.toLowerCase()) ||
        task.status?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTasks(filtered);
  };

  // Helper to render array as comma-separated string
  const renderAssignees = (assignees) => {
    if (!assignees || assignees.length === 0) return "-";
    return Array.isArray(assignees) ? assignees.join(", ") : assignees;
  };

  // Table columns
  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",

      render: (text, record, index) => index + 1,
    },
    {
      title: "Assigned By",
      dataIndex: "taskAssignBy",
      key: "taskAssignBy",
      align: "center",
      width: 160,
     
    },
    {
      title: "Assigned To",
      dataIndex: "taskAssignTo",
      key: "taskAssignTo",
      align: "center",
      width: 160,
      render: (text) => (
        <div
          style={{
            maxWidth: 160,
            maxHeight: 80, // limit height
            overflowX: "auto", // horizontal scroll
          }}
        >
          {text || "-"}
        </div>
      ),
    },
    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      align: "center",
      width: 300,
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            margin: "0 auto", // centers the box horizontally
            whiteSpace: "normal",
            wordBreak: "break-word",
            textAlign: "center",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflowX: "auto",
            maxHeight: 120, // limit height
          }}
        >
          {text || "-"}
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",

      render: (status) => {
        let color = "orange";
        if (status === "assigned") color = "#008cba";
        else if (status === "completed") color = "green";

        return (
          <Text style={{ color, fontWeight: 500, textTransform: "capitalize" }}>
            {status}
          </Text>
        );
      },
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",

      render: (url) =>
        url ? (
          <Image
            width={80}
            src={url}
            style={{ cursor: "pointer" }}
            preview={{
              mask: <Text style={{ color: "#fff" }}>Click to Preview</Text>,
            }}
          />
        ) : (
          "-"
        ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: 20 }}>
        {/* Header with left text and right search */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col xs={24} sm={12} md={12} lg={12}>
            <Text strong style={{ fontSize: 18 }}>
              Assigned Tasks WhatsApp
            </Text>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={12}
            style={{ textAlign: "right", marginTop: 10 }}
          >
            <Search
              placeholder="Search tasks or assignees..."
              allowClear
              enterButton={
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#008cba",
                    borderColor: "#008cba",
                    color: "#fff",
                  }}
                >
                  <SearchOutlined style={{ color: "#fff" }} /> Search
                </Button>
              }
              size="middle"
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) handleSearch("");
              }}
              style={{ maxWidth: 300 }}
            />
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <Spin tip="Loading tasks..." size="medium" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey={(record, index) => record.id || index} // Use ID if available, fallback to index
            pagination={{ pageSize: 100 }} // Lowered for better UX; adjust as needed
            bordered
            scroll={{ x: true }}
          />
        )}
      </div>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
