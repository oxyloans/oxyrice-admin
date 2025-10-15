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
      console.error(error);
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
      // If search is empty, reset filteredTasks
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

  // Table columns
  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Assigned By",
      dataIndex: "taskAssignBy",
      key: "taskAssignBy",
      align: "center",
      width: 150,
     
    },
    {
      title: "Assigned To",
      dataIndex: "taskAssignTo",
      key: "taskAssignTo",
      align: "center",
      width: 180,
        render: (assigned) => assigned?.join(", ") || "-",
    },
    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      align: "center",
      width: 250,
      
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
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
      width: 120,
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
                if (!e.target.value) handleSearch(""); // Reset on clear
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
      minHeight: "300px", // adjust as needed
    }}
  >
    <Spin tip="Loading tasks..." size="medium" />
  </div>
) : (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 100 }}
            bordered
            scroll={{ x: true }}
          />
        )}
      </div>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
