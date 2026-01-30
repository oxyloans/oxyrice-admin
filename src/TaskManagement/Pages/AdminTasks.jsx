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
  Empty,
  Divider,
  Card,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  CommentOutlined,
  EyeOutlined,
  SendOutlined,
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
  const [assignedToFilter, setAssignedToFilter] = useState("All");

  const getUniqueAssignees = () => {
    const assignees = new Set();
    tasks.forEach(task => {
      if (Array.isArray(task.taskAssignTo)) {
        task.taskAssignTo.forEach(name => {
          if (name && name.trim()) assignees.add(name.trim());
        });
      } else if (task.taskAssignTo && task.taskAssignTo.trim()) {
        assignees.add(task.taskAssignTo.trim());
      }
    });
    return Array.from(assignees).sort();
  };

  const handleAssignedToFilter = (value) => {
    setAssignedToFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    applyFilters(searchText, statusFilter, value);
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
  });
  const [commentsData, setCommentsData] = useState([]);
  const [comments, setComments] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [adminComment, setAdminComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleViewComments = async (task) => {
    try {
      setSelectedTask(task);
      setAdminComment("");
      setCommentsData([]);
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { taskId: task.id },
        },
      );

      setCommentsData(Array.isArray(res.data) ? res.data : []);
      setViewModalVisible(true);
    } catch (e) {
      message.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };
  const submitAdminComment = async () => {
    if (!selectedTask?.id) return message.warning("Task not selected");
    if (!adminComment.trim()) return message.warning("Please enter a comment");

    try {
      setSubmittingComment(true);

      await axios.post(
        `${BASE_URL}/ai-service/agent/userAndRadhaSirComments`,
        {
          taskId: selectedTask.id,
          comments: adminComment.trim(),
          commentsBy: "ADMIN",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      message.success("Admin comment added!");
      setAdminComment("");

      // refresh comments
      const refreshed = await axios.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { taskId: selectedTask.id },
        },
      );

      setCommentsData(Array.isArray(refreshed.data) ? refreshed.data : []);
      fetchTasks(); // optional: refresh main table
    } catch (e) {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
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
        },
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
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0);
          
          // Handle ISO format like "2025-10-25 07:35:47.956"
          if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.includes(':')) {
            return new Date(dateStr);
          }
          
          if (typeof dateStr === 'string' && dateStr.includes(' ')) {
            const parts = dateStr.split(' ');
            if (parts.length >= 2) {
              const month = parts[0];
              const day = parseInt(parts[1]);
              const currentYear = new Date().getFullYear();
              const currentMonth = new Date().getMonth();
              
              const monthMap = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
              };
              
              if (monthMap[month] !== undefined && !isNaN(day)) {
                const taskMonth = monthMap[month];
                let year = currentYear;
                
                if (taskMonth > currentMonth) {
                  year = currentYear - 1;
                }
                
                return new Date(year, taskMonth, day);
              }
            }
          }
          
          return new Date(dateStr);
        };
        
        const dateA = parseDate(a.taskAssignedDate || a.tastCreatedDate);
        const dateB = parseDate(b.taskAssignedDate || b.tastCreatedDate);
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
        `${BASE_URL}/user-service/getAllEmployees`,
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
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyFilters(value, statusFilter, assignedToFilter);
  };

  // ✅ Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyFilters(searchText, value, assignedToFilter);
  };

  // ✅ Apply combined filters (search + status + assignedTo)
  const applyFilters = (searchValue, statusValue, assignedToValue) => {
    let filtered = [...tasks];

    if (statusValue !== "All") {
      filtered = filtered.filter(
        (task) => task.status?.toLowerCase() === statusValue.toLowerCase(),
      );
    }

    if (assignedToValue !== "All") {
      filtered = filtered.filter(task => {
        if (Array.isArray(task.taskAssignTo)) {
          return task.taskAssignTo.some(name => name?.trim() === assignedToValue);
        }
        return task.taskAssignTo?.trim() === assignedToValue;
      });
    }

    if (searchValue.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.taskAssignBy
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          (task.taskAssignTo &&
            (Array.isArray(task.taskAssignTo)
              ? task.taskAssignTo.some((t) =>
                  t?.toLowerCase().includes(searchValue.toLowerCase()),
                )
              : typeof task.taskAssignTo === "string" &&
                task.taskAssignTo
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()))) ||
          task.taskName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          task.status?.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }
    // ✅ Consistent field name for sorting (tastCreatedDate)
    filtered.sort((a, b) => {
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        // Handle ISO format like "2025-10-25 07:35:47.956"
        if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.includes(':')) {
          return new Date(dateStr);
        }
        
        if (typeof dateStr === 'string' && dateStr.includes(' ')) {
          const parts = dateStr.split(' ');
          if (parts.length >= 2) {
            const month = parts[0];
            const day = parseInt(parts[1]);
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            
            if (monthMap[month] !== undefined && !isNaN(day)) {
              const taskMonth = monthMap[month];
              let year = currentYear;
              
              if (taskMonth > currentMonth) {
                year = currentYear - 1;
              }
              
              return new Date(year, taskMonth, day);
            }
          }
        }
        
        return new Date(dateStr);
      };
      
      const dateA = parseDate(a.taskAssignedDate || a.tastCreatedDate);
      const dateB = parseDate(b.taskAssignedDate || b.tastCreatedDate);
      return dateB - dateA;
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
        },
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
        },
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
      // Handle ISO format like "2025-10-25 07:35:47.956"
      if (typeof dateString === 'string' && dateString.includes('-') && dateString.includes(':')) {
        const date = new Date(dateString);
        if (!isNaN(date)) {
          return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "numeric", 
            day: "numeric"
          });
        }
      }
      
      // Handle "Jan 23 Friday" format
      if (typeof dateString === 'string' && dateString.includes(' ')) {
        const parts = dateString.split(' ');
        if (parts.length >= 2) {
          const month = parts[0];
          const day = parseInt(parts[1]);
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          
          const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          if (monthMap[month] !== undefined && !isNaN(day)) {
            const taskMonth = monthMap[month];
            let year = currentYear;
            
            if (taskMonth > currentMonth) {
              year = currentYear - 1;
            }
            
            const date = new Date(year, taskMonth, day);
            return date.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "numeric", 
              day: "numeric"
            });
          }
        }
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;

      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "numeric",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };

  // ✅ Table columns
  const columns = [
    {
      title: "S.NO",
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
            width: "300px", // enforce width
            maxWidth: "300px",

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
             
              padding: "8px 12px",
              textAlign: "left",
              display: "inline-block",
              minWidth: 170,
            }}
          >
         

            <div style={{ color: "#555", fontSize: 13, whiteSpace: "nowrap" }}>Assigned Date: <span style={{ color: "#008cba", fontWeight: 500 }}>{record.taskAssignedDate ? formatDate(record.taskAssignedDate) : (tastCreatedDate ? formatDate(tastCreatedDate) : "N/A")}</span></div>

            {/* <div style={{ color: "#555", fontSize: 13 }}>
              Completed Date:{" "}
              <span
                style={{
                  color: taskCompleteDate ? "#1ab394" : "#faad14",
                  fontWeight: 500,
                }}
              >
                {taskCompleteDate ? formatDate(taskCompleteDate) : "Pending"}
              </span>
            </div> */}
            <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
              Status: <span style={{ 
                color: status?.toLowerCase() === 'assigned' ? '#008CBA' : 
                       status?.toLowerCase() === 'completed' ? '#1AB394' : '#555',
                fontWeight: 'bold'
              }}>{status}</span>
            </div>
          </div>
        );
      },
    },

  {
  title: "Image & Files",
    dataIndex: "image",
  width: 150,
  key: "image",
  align: "center",
  render: (url) => {
    if (!url) return "-";

    const fileUrl = url.toLowerCase();

    // Image formats
    const isImage =
      fileUrl.endsWith(".jpg") ||
      fileUrl.endsWith(".jpeg") ||
      fileUrl.endsWith(".png") ||
      fileUrl.endsWith(".webp") ||
      fileUrl.endsWith(".gif");

    // PDF
    const isPdf = fileUrl.endsWith(".pdf");

    // Excel
    const isExcel =
      fileUrl.endsWith(".xls") || fileUrl.endsWith(".xlsx");

    if (isImage) {
      return (
        <Image
          width={80}
          height={80}
          src={url}
          preview
          style={{
            borderRadius: "6px",
            objectFit: "cover",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        />
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
          color: "#2563EB",
          textDecoration: "none",
        }}
      >
        {isPdf && "📄 PDF Document"}
        {isExcel && "📊 Excel File"}
        {!isPdf && !isExcel && "View Document"}
      </a>
    );
  },
}
,
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
            style={{
              background: "#008cba",
              color: "white",
              fontWeight: 600,
              borderColor: "#008cba",
            }}
            size="medium"
            onClick={() => handleEdit(record)}
          >
            Re Assigned Task
          </Button>

          {/* Add Comments Button */}
          {/* <Button
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
          </Button> */}

          {/* View Button */}
          <Button
            onClick={() => handleViewComments(record)}
            size="medium"
            style={{
              background: "#351664",
              color: "#fff",
              borderColor: "#351664",
              fontWeight: 600,
            }}
          >
            View / Add Comments
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
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={8}>
            <Text strong style={{ fontSize: 20, color: "#008cba" }}>
            Whatsapp Tasks Assigned Dashboard
            </Text>
          </Col>
          <Col xs={24} lg={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={12} md={8}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search by name, task..."
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Status"
                >
                  <Option value="All">ALL STATUS</Option>
                  <Option value="assigned">ASSIGNED</Option>
                  <Option value="completed">COMPLETED</Option>
                
                </Select>
              </Col>
             
            </Row>
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
      {/* <Modal
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
      </Modal> */}
      <Modal
        title={`Comments ${selectedTask?.id ? `- #${selectedTask.id.slice(-4)}` : ""}`}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setAdminComment("");
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 600, top: 20 }}
      >
        {/* Existing comments */}
        {commentsData.length === 0 ? (
          <Empty description="No comments" size="small" />
        ) : (
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
            {commentsData.map((comment, index) => (
              <div key={index} style={{ 
                padding: 8, 
                borderBottom: "1px solid #f0f0f0",
                fontSize: 13
              }}>
                <strong style={{ color: "#1ab394" }}>{comment.commentsBy}:</strong>
                <div style={{ marginTop: 4 }}>{comment.comments}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div style={{ background: "#f9f9f9", padding: 12, borderRadius: 6 }}>
          <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>Add Comment</div>
          <Input.TextArea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Type comment..."
            rows={2}
            maxLength={500}
            showCount
          />
          <Button
            type="primary"
            loading={submittingComment}
            onClick={submitAdminComment}
            style={{
              marginTop: 8,
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              fontSize: 12
            }}
            size="small"
          >
            Submit
          </Button>
        </div>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
