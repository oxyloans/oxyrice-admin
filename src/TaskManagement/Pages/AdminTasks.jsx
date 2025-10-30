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
  Tag,
  Modal,
  Select,
} from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Text } = Typography;
const { Option } = Select;

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // ✅ single select
  const [statusFilter, setStatusFilter] = useState("All");

  const accessToken = localStorage.getItem("token");

 const fetchTasks = async () => {
   setLoading(true);
   try {
     const response = await axios.get(
       `${BASE_URL}/ai-service/agent/getAllMessagesFromGroup`,
       {
         headers: { Authorization: `Bearer ${accessToken}` },
       }
     );

     const reversedTasks = response.data.slice().reverse();

     // ✅ Filter out invalid rows
     const validTasks = reversedTasks.filter((task) => {
       const assigned = task.taskAssignTo;
       const taskName = task.taskName;

       // Check for valid taskAssignTo
       const hasValidAssignee = (() => {
         if (!assigned) return false;
         if (Array.isArray(assigned))
           return assigned.some((a) => a && a.trim() !== "");
         if (typeof assigned === "string") return assigned.trim() !== "";
         return false;
       })();

       // Check for valid taskName
       const hasValidTaskName =
         typeof taskName === "string" && taskName.trim() !== "";

       // ✅ Keep only rows that have both valid taskAssignTo AND valid taskName
       return hasValidAssignee && hasValidTaskName;
     });

     setTasks(validTasks);
     setFilteredTasks(validTasks);
   } catch (error) {
     message.error("Failed to fetch tasks");
     console.error("Task Fetch Error:", error);
   } finally {
     setLoading(false);
   }
 };



  // ✅ Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user-service/getAllEmployees`
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Employee Fetch Error:", error);
      message.error("Failed to load employee list");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // ✅ Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(value, statusFilter);
  };

  // ✅ Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFilters(searchText, value);
  };

  // ✅ Apply combined filters (search + status)
  const applyFilters = (searchValue, statusValue) => {
    let filtered = [...tasks];

    if (statusValue !== "All") {
      filtered = filtered.filter(
        (task) => task.status?.toLowerCase() === statusValue.toLowerCase()
      );
    }

    if (searchValue.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.taskAssignBy
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          task.taskAssignTo?.some?.((t) =>
            t.toLowerCase().includes(searchValue.toLowerCase())
          ) ||
          task.taskName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          task.status?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  // ✅ Status tag renderer
  const getStatusTag = (status) => {
    let color, text;
    switch (status?.toLowerCase()) {
      case "assigned":
        color = "blue";
        text = "Assigned";
        break;
      case "completed":
        color = "green";
        text = "Completed";
        break;
      case "rejected":
        color = "red";
        text = "Rejected";
        break;
      case "deleted":
        color = "gray";
        text = "Deleted";
        break;
      default:
        color = "gold";
        text = "Pending";
    }
    return (
      <Tag
        color={color}
        style={{
          fontSize: 13,
          fontWeight: 500,
          textTransform: "capitalize",
          borderRadius: 8,
          padding: "3px 10px",
        }}
      >
        {text}
      </Tag>
    );
  };

  // ✅ Edit modal open
  const handleEdit = (task) => {
    setSelectedTask(task);
    setSelectedEmployee(null);
    setEditModalVisible(true);
  };

  const handleAssignUpdate = async () => {
    if (!selectedTask || !selectedEmployee) {
      message.warning("Please select one employee.");
      return;
    }

    const emp = employees.find((e) => e.userId === selectedEmployee);
    const selectedName = emp ? emp.name : "";

    try {
      await axios.patch(
        `${BASE_URL}/ai-service/agent/taskAssignedToRadhaSir`,
        null, // no request body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            id: selectedTask.id,
            assignedTo: selectedName,
            userId: selectedEmployee,
          },
        }
      );

      message.success("Task updated successfully!");
      setEditModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to update task");
    }
  };
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // if not a valid date

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    };

    return date.toLocaleDateString("en-IN", options);
  } catch (error) {
    return dateString;
  }
};


  // ✅ Table columns
  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Task Id",
      key: "id",
      dataIndex: "id",
      align: "center",
      render: (text) => (text ? `#${text.slice(-4)}` : "-"),
    },
    {
      title: "Assigned By",
      dataIndex: "taskAssignBy",
      key: "taskAssignBy",
      align: "center",
      width: 120,
    },
    {
      title: "Assigned To",
      dataIndex: "taskAssignTo",
      key: "taskAssignTo",
      align: "center",
      render: (value) => {
        // Only display if there is a valid value
        const hasValidAssignee =
          Array.isArray(value) &&
          value.length > 0 &&
          value.some((a) => a && a.trim() !== "");

        if (!hasValidAssignee) return null; // Hide cell entirely

        // If valid, join and display
        const displayText = Array.isArray(value) ? value.join(", ") : value;

        return (
          <Text style={{ display: "block", textAlign: "center" }}>
            {displayText}
          </Text>
        );
      },
    },

    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      align: "center",
      render: (text) => (
        <Text style={{ display: "block", textAlign: "center" }}> {text} </Text>
      ),
    },
    {
      title: "Task Assigned Date",
      dataIndex: "tastCreatedDate",
      key: "tastCreatedDate",
      align: "center",
      render: (date) => {
        if (!date) return <Text type="secondary">N/A</Text>;
        return (
          <Text style={{ color: "#1677ff", fontWeight: 500 }}>
            {formatDate(date)}
          </Text>
        );
      },
    },
    {
      title: "Task Complete Date",
      dataIndex: "taskCompleteDate",
      key: "taskCompleteDate",
      align: "center",
      render: (date) => {
        if (!date) return <Text type="secondary">Pending</Text>;
        return (
          <Text style={{ color: "#52c41a", fontWeight: 500 }}>
            {formatDate(date)}
          </Text>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => getStatusTag(status),
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
            height={80}
            src={url}
            style={{
              borderRadius: "4px",
              objectFit: "cover",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <Text type="secondary">No Image</Text>
        ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          style={{
            background: "#008cba",
            color: "white",
            border: "#008cba",
          }}
          size="small"
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: 20 }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
          style={{ marginBottom: 10 }}
        >
          <Col xs={24} sm={12} md={8}>
            <Text strong style={{ fontSize: 18 }}>
              Assigned Tasks WhatsApp
            </Text>
          </Col>

          <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search tasks..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: "100%", maxWidth: 280 }}
            />
          </Col>
        </Row>

        {/* Status Filter */}
        <Row justify="start" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              style={{ width: "100%", maxWidth: 200 }}
              onChange={handleStatusFilter}
            >
              <Option value="All">All</Option>
              <Option value="assigned">Assigned</Option>
              <Option value="completed">Completed</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="deleted">Deleted</Option>
            </Select>
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
            rowKey={(record, index) => record.id || index}
            pagination={{ pageSize: 100 }}
            bordered
            scroll={{ x: true }}
          />
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Assigned User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleAssignUpdate}
        okText="Update"
       
        okButtonProps={{
          style: {
            backgroundColor: "#008cba",
            color: "white",
            border: "none",
            fontWeight: 500,
          },
        }}
        cancelButtonProps={{
          style: {
            fontWeight: 500,
          },
        }}
      >
        <p style={{ marginBottom: 8, fontWeight: 500 }}>Select Employee:</p>
        <Select
          showSearch
          required
          style={{ width: "100%" }}
          placeholder="Select employee"
          value={selectedEmployee}
          onChange={(value) => setSelectedEmployee(value)}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {employees.map((emp) => (
            <Option key={emp.userId} value={emp.userId}>
              {emp.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
