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
import {
  SearchOutlined,
  EditOutlined,
  CommentOutlined,
  EyeOutlined,
} from "@ant-design/icons";
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
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // ✅ single select
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
  });
  const [commentsData, setCommentsData] = useState([]);
  const [comments, setComments] = useState("");
  const handleViewComments = async (task) => {
    try {
      setLoading(true);
      setSelectedTask(task);

      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { taskId: task.id },
        }
      );

      setCommentsData(response.data || []);
      setViewModalVisible(true);
    } catch (error) {
      console.error("View Comments Error:", error);
      message.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

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
      validTasks.sort((a, b) => {
        const dateA = new Date(a.tastCreatedDate || 0);
        const dateB = new Date(b.tastCreatedDate || 0);
        return dateB - dateA;
      });
      setTasks(validTasks);
      setFilteredTasks(validTasks);
      // ✅ Reset pagination to first page on initial load
      setPagination({ current: 1, pageSize: 100 });
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
    // ✅ Reset to first page on search
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyFilters(value, statusFilter);
  };

  // ✅ Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    // ✅ Reset to first page on filter change
    setPagination((prev) => ({ ...prev, current: 1 }));
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
          // ✅ Handle taskAssignTo as array or string
          (task.taskAssignTo &&
            (Array.isArray(task.taskAssignTo)
              ? task.taskAssignTo.some((t) =>
                  t?.toLowerCase().includes(searchValue.toLowerCase())
                )
              : typeof task.taskAssignTo === "string" &&
                task.taskAssignTo
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()))) ||
          task.taskName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          task.status?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    // ✅ Consistent field name for sorting (tastCreatedDate)
    filtered.sort((a, b) => {
      const dateA = new Date(a.tastCreatedDate || 0);
      const dateB = new Date(b.tastCreatedDate || 0);
      return dateB - dateA; // latest first
    });
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
  const handleCommentsAdd = (task) => {
    setSelectedTask(task);

    setCommentsModalVisible(true);
  };
  const handleCommentsUpdate = async () => {
    if (!comments.trim()) {
      message.warning("Please enter a comment before submitting.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/ai-service/agent/userAndRadhaSirComments`,
        {
          taskId: selectedTask.id,
          comments: comments,
          commentsBy: "ADMIN",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      message.success("Comments added successfully!");
      setCommentsModalVisible(false);
      setComments(""); // clear input
      fetchTasks();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to add comment");
    }
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

      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + (index + 1),
    },

    {
      title: "Task Information",
      key: "task_info",
      align: "center",
      render: (_, record) => {
        // Handle assignedTo array
        const hasValidAssignee =
          Array.isArray(record.taskAssignTo) &&
          record.taskAssignTo.length > 0 &&
          record.taskAssignTo.some((a) => a && a.trim() !== "");

        const assignedToText = hasValidAssignee
          ? Array.isArray(record.taskAssignTo)
            ? record.taskAssignTo.join(", ")
            : record.taskAssignTo
          : "N/A";

        return (
          <div
            style={{
              backgroundColor: "#f9f9f9",
              borderLeft: "4px solid #008cba",
              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "left",
              display: "inline-block",
              minWidth: 180,
            }}
          >
            <div style={{ fontWeight: 600, color: "#351664", fontSize: 15 }}>
              Task ID:{" "}
              <span style={{ color: "#008cba" }}>
                {record.id ? `#${record.id.slice(-4)}` : "N/A"}
              </span>
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              Assigned By:{" "}
              <span style={{ fontWeight: 500, color: "#1ab394" }}>
                {record.taskAssignBy || "N/A"}
              </span>
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              Assigned To:{" "}
              <span style={{ fontWeight: 500, color: "#008cba" }}>
                {assignedToText}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      title: "Task Name",
      dataIndex: "taskName",
      key: "taskName",
      align: "center",
      render: (text) => (
        <div
          style={{
            width: "320px", // enforce width
            maxWidth: "320px",

            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            textAlign: "center",
            margin: "0 auto",
            maxHeight: " 11em", // approx 3 lines
            overflowX: "auto", // horizontal scroll
          }}
          title={text} // show full text on hover
        >
          {text}
        </div>
      ),
    },
    {
      title: "Task Timeline",
      key: "task_timeline",
      align: "center",
      render: (_, record) => {
        const { tastCreatedDate, taskCompleteDate, status } = record;

        return (
          <div
            style={{
              backgroundColor: "#f9f9f9",

              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "left",
              display: "inline-block",
              minWidth: 170,
            }}
          >
            <div style={{ fontWeight: 600, color: "#351664", fontSize: 15 }}>
              Task Timeline
            </div>

            <div style={{ color: "#555", fontSize: 13 }}>
              Assigned Date:{" "}
              <span style={{ color: "#008cba", fontWeight: 500 }}>
                {tastCreatedDate ? formatDate(tastCreatedDate) : "N/A"}
              </span>
            </div>

            <div style={{ color: "#555", fontSize: 13 }}>
              Completed Date:{" "}
              <span
                style={{
                  color: taskCompleteDate ? "#1ab394" : "#faad14",
                  fontWeight: 500,
                }}
              >
                {taskCompleteDate ? formatDate(taskCompleteDate) : "Pending"}
              </span>
            </div>
            <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
              Status: {getStatusTag(status)}
            </div>
          </div>
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "3px",
            flexWrap: "wrap",
          }}
        >
          {/* Edit Button */}
          <Button
            icon={<EditOutlined />}
            style={{
              background: "#008cba",
              color: "white",
              borderColor: "#008cba",
            }}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Re Assign
          </Button>

          {/* Add Comments Button */}
          <Button
            icon={<CommentOutlined />}
            style={{
              background: "#1ab394",
              color: "white",
              borderColor: "#1ab394",
            }}
            size="small"
            onClick={() => handleCommentsAdd(record)}
          >
            Admin Comments
          </Button>

          {/* View Button */}
          <Button
            icon={<EyeOutlined />}
            style={{
              background: "#351664",
              color: "white",
              borderColor: "#351664",
            }}
            size="small"
            onClick={() => handleViewComments(record)}
          >
            View Commenst
          </Button>
        </div>
      ),
    },
  ];
<>
  <style>
    {`
      .task-mobile-meta {
        display: none;
      }

      @media (max-width: 768px) {
        .task-mobile-meta {
          display: block;
        }
      }
    `}
  </style>

 
</>;



  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: 20 }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
          style={{ marginBottom: 6 }}
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
        <Row justify="start" style={{ marginBottom: 10 }}>
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
            bordered
            scroll={{ x: true, y: 600 }}
            pagination={{
              ...pagination,
              pageSizeOptions: ["100", "200", "500", "1000"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tasks`,
              position: ["bottomRight"],
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize });
              },
              onShowSizeChange: (current, size) => {
                setPagination({ current: 1, pageSize: size });
              },
            }}
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
     <Modal
  title={`Task Comments - ${
    selectedTask ? `#${selectedTask.id.slice(-4)}` : ""
  }`}
  open={viewModalVisible}
  onCancel={() => setViewModalVisible(false)}
  footer={null}
  width={700}
>
  {commentsData.length > 0 ? (
    <Table
      dataSource={commentsData}
      pagination={false}
      bordered
      scroll={{x:"true"}}
      rowKey={(record, index) => index}
      columns={[
        {
          title: "S.No",
          key: "sno",
          align: "center",
          render: (_, __, index) => index + 1,
          width: 70,
         
        },
        {
          title: "Comment By",
          dataIndex: "commentsBy",
          key: "commentsBy",
          align: "center",
          render: (text) => (
            <span style={{ color: "#1ab394", fontWeight: 500 }}>{text}</span>
          ),
        },
        {
          title: "Comment",
          dataIndex: "comments",
          key: "comments",
          align: "center",
          render: (text) => (
            <span style={{ color: "#333" }}>{text}</span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          align: "center" ,
          render: (status) => {
            let color = "blue";
            if (status?.toLowerCase() === "completed") color = "green";
            else if (status?.toLowerCase() === "rejected") color = "red";

            return (
              <Tag color={color} style={{ fontWeight: 500 }}>
                {status || "N/A"}
              </Tag>
            );
          },
          width: 120,
        },
      ]}
      style={{
        marginTop: 10,
      }}
    />
  ) : (
    <Text type="secondary">No comments found for this task.</Text>
  )}
</Modal>
      <Modal
        title="Add Comments"
        open={commentsModalVisible}
        onCancel={() => setCommentsModalVisible(false)}
        onOk={handleCommentsUpdate}
        okText="Add Comments"
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
        <p style={{ marginBottom: 8, fontWeight: 500 }}>Enter Comments:</p>
        <Input.TextArea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter your comments"
          required
          rows={4}
        />
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
