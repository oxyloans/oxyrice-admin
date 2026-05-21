// /src/AdminTasks.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Image,
  Typography,
  Input,
  message,
  Button,
  Row,
  Col,
  Modal,
  Select,
  Empty,
  Badge,
  Tooltip,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import useAuth from "../../../shared/hooks/useAuth";

const { Text } = Typography;
const { Option } = Select;

const STATUS_COLORS = {
  assigned: { bg: "#e6f4ff", color: "#1677ff", border: "#91caff" },
  completed: { bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" },
  rejected: { bg: "#fff2f0", color: "#ff4d4f", border: "#ffccc7" },
  deleted: { bg: "#f5f5f5", color: "#8c8c8c", border: "#d9d9d9" },
  pending: { bg: "#fffbe6", color: "#faad14", border: "#ffe58f" },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase() || "pending";
  const style = STATUS_COLORS[key] || STATUS_COLORS.pending;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status || "Pending"}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    if (typeof dateString === "string" && dateString.includes("-") && dateString.includes(":")) {
      const date = new Date(dateString);
      if (!isNaN(date))
        return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    }
    if (typeof dateString === "string" && dateString.includes(" ")) {
      const parts = dateString.split(" ");
      const monthMap = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
      if (parts.length >= 2 && monthMap[parts[0]] !== undefined) {
        const day = parseInt(parts[1]);
        const taskMonth = monthMap[parts[0]];
        const currentYear = new Date().getFullYear();
        const year = taskMonth > new Date().getMonth() ? currentYear - 1 : currentYear;
        return new Date(year, taskMonth, day).toLocaleDateString("en-IN", {
          year: "numeric", month: "short", day: "numeric",
        });
      }
      return dateString;
    }
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
};

const AdminTasks = () => {
  const { accessToken } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [adminComment, setAdminComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchTasks = useCallback(
    async (page = 1, pageSize = 50) => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/ai-service/agent/getAllMessagesFromGroup`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page: page - 1, size: pageSize }, 
          },
        );

        const data = response.data;
        // Handle both paginated { content: [] } and plain array responses
        const content = Array.isArray(data) ? data : data.content || [];
        const total = data.totalElements ?? content.length;

        const validTasks = content.filter((task) => {
          const assigned = task.taskAssignTo;
          const hasValidAssignee = Array.isArray(assigned)
            ? assigned.some((a) => a?.trim())
            : typeof assigned === "string" && assigned.trim();
          const hasValidTaskName = typeof task.taskName === "string" && task.taskName.trim();
          return hasValidAssignee && hasValidTaskName;
        });

        setTasks(validTasks);
        setTotalElements(total);
      } catch (error) {
        message.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user-service/getAllEmployees`);
      setEmployees(response.data);
    } catch {
      message.error("Failed to load employee list");
    }
  }, []);

  useEffect(() => {
    fetchTasks(pagination.current, pagination.pageSize);
    fetchEmployees();
  }, []);

  const handleTableChange = (pag) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize });
    fetchTasks(pag.current, pag.pageSize);
  };

  const handleViewComments = async (task) => {
    setSelectedTask(task);
    setAdminComment("");
    setCommentsData([]);
    setViewModalVisible(true);
    setCommentsLoading(true);
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        { headers: { Authorization: `Bearer ${accessToken}` }, params: { taskId: task.id } },
      );
      setCommentsData(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("Failed to fetch comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitAdminComment = async () => {
    if (!selectedTask?.id) return message.warning("Task not selected");
    if (!adminComment.trim()) return message.warning("Please enter a comment");
    setSubmittingComment(true);
    try {
      await axiosInstance.post(`${BASE_URL}/ai-service/agent/userAndRadhaSirComments`, {
        taskId: selectedTask.id,
        comments: adminComment.trim(),
        commentsBy: "ADMIN",
      });
      message.success("Comment added!");
      setAdminComment("");
      const refreshed = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        { headers: { Authorization: `Bearer ${accessToken}` }, params: { taskId: selectedTask.id } },
      );
      setCommentsData(Array.isArray(refreshed.data) ? refreshed.data : []);
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignUpdate = async () => {
    if (!selectedTask || !selectedEmployee) return message.warning("Please select one employee.");
    const emp = employees.find((e) => e.userId === selectedEmployee);
    try {
      await axiosInstance.patch(
        `${BASE_URL}/ai-service/agent/taskAssignedToRadhaSir`,
        null,
        { params: { id: selectedTask.id, assignedTo: emp?.name || "", userId: selectedEmployee } },
      );
      message.success("Task reassigned successfully!");
      setEditModalVisible(false);
      fetchTasks(pagination.current, pagination.pageSize);
    } catch {
      message.error("Failed to update task");
    }
  };

  // Client-side filter on current page data
  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      statusFilter === "All" || task.status?.toLowerCase() === statusFilter.toLowerCase();
    const q = searchText.toLowerCase().trim();
    const matchSearch =
      !q ||
      task.taskAssignBy?.toLowerCase().includes(q) ||
      task.taskName?.toLowerCase().includes(q) ||
      task.status?.toLowerCase().includes(q) ||
      (Array.isArray(task.taskAssignTo)
        ? task.taskAssignTo.some((t) => t?.toLowerCase().includes(q))
        : task.taskAssignTo?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      width: 55,
      render: (_t, _r, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Task Info",
      key: "task_info",
      render: (_, record) => {
        const assignedTo = Array.isArray(record.taskAssignTo)
          ? record.taskAssignTo.join(", ")
          : record.taskAssignTo || "N/A";
        return (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              ID:{" "}
              <Text strong style={{ color: "#1677ff", fontSize: 12 }}>
                #{record.id?.slice(-6) || "N/A"}
              </Text>
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              By:{" "}
              <Text strong style={{ color: "#1ab394", fontSize: 12 }}>
                {record.taskAssignBy || "N/A"}
              </Text>
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              To:{" "}
              <Tooltip title={assignedTo}>
                <Text
                  strong
                  style={{
                    color: "#1677ff",
                    fontSize: 12,
                    maxWidth: 180,
                    display: "inline-block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    verticalAlign: "bottom",
                  }}
                >
                  {assignedTo}
                </Text>
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: "Task",
      dataIndex: "taskName",
      key: "taskName",
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            maxHeight: "8em",
            overflowY: "auto",
            fontSize: 13,
            lineHeight: 1.6,
            wordBreak: "break-word",
            color: "#262626",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Date & Status",
      key: "timeline",
      align: "center",
      render: (_, record) => (
        <div style={{ lineHeight: 2 }}>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            {formatDate(record.taskAssignedDate || record.tastCreatedDate)}
          </div>
          <StatusBadge status={record.status} />
        </div>
      ),
    },
    {
      title: "Attachment",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 100,
      render: (url) => {
        if (!url) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        const lower = url.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/.test(lower);
        const isPdf = lower.endsWith(".pdf");
        const isExcel = /\.xlsx?$/.test(lower);
        if (isImage)
          return (
            <Image
              width={60}
              height={60}
              src={url}
              preview
              style={{ borderRadius: 6, objectFit: "cover", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
            />
          );
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20 }}>
            {isPdf ? "📄" : isExcel ? "📊" : "🔗"}
          </a>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Button
            size="small"
            style={{ background: "#1677ff", color: "#fff", border: "none", fontWeight: 600, borderRadius: 6 }}
            onClick={() => { setSelectedTask(record); setSelectedEmployee(null); setEditModalVisible(true); }}
          >
            Reassign
          </Button>
          <Button
            size="small"
            style={{ background: "#351664", color: "#fff", border: "none", fontWeight: 600, borderRadius: 6 }}
            onClick={() => handleViewComments(record)}
          >
            Comments
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong style={{ fontSize: 17, color: "#000000" }}>
                WhatsApp Tasks Dashboard
              </Text>
              <Badge
                count={totalElements}
                style={{ backgroundColor: "#ffffff" }}
                overflowCount={9999}
              />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={12} md={12}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Search task, name, status..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col xs={12} sm={8} md={7}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                >
                  <Option value="All">All Status</Option>
                  <Option value="assigned">Assigned</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Col>
              <Col xs={12} sm={4} md={5}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchTasks(pagination.current, pagination.pageSize)}
                  loading={loading}
                  style={{ width: "100%", borderRadius: 8 }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey={(record, index) => record.id || index}
          loading={loading}
          bordered
          size="small"
          scroll={{ x: 700, y: 520 }}
          rowClassName={(_, index) => (index % 2 === 0 ? "" : "ant-table-row-alt")}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ["50", "100", "200"],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tasks`,
            position: ["bottomRight"],
          }}
          onChange={handleTableChange}
        />
      </div>

      {/* Reassign Modal */}
      <Modal
        title={
          <span>
            Reassign Task{" "}
            <Text type="secondary" style={{ fontSize: 13 }}>
              #{selectedTask?.id?.slice(-6)}
            </Text>
          </span>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleAssignUpdate}
        okText="Reassign"
        okButtonProps={{ style: { backgroundColor: "#1677ff", border: "none" } }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text strong>Current Assignee: </Text>
          <Text style={{ color: "#1ab394" }}>
            {Array.isArray(selectedTask?.taskAssignTo)
              ? selectedTask.taskAssignTo.join(", ")
              : selectedTask?.taskAssignTo || "N/A"}
          </Text>
        </div>
        <p style={{ marginBottom: 8, fontWeight: 500 }}>Select New Employee:</p>
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Search and select employee"
          value={selectedEmployee}
          onChange={setSelectedEmployee}
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

      {/* Comments Modal */}
      <Modal
        title={
          <span>
            Comments{" "}
            <Text type="secondary" style={{ fontSize: 13 }}>
              #{selectedTask?.id?.slice(-6)}
            </Text>
            {commentsData.length > 0 && (
              <Badge count={commentsData.length} style={{ marginLeft: 8, backgroundColor: "#1ab394" }} />
            )}
          </span>
        }
        open={viewModalVisible}
        onCancel={() => { setViewModalVisible(false); setAdminComment(""); }}
        footer={null}
        width="min(95vw, 580px)"
        style={{ top: 20 }}
      >
        {/* Task summary */}
        {selectedTask && (
          <div
            style={{
              background: "#f0f5ff",
              border: "1px solid #adc6ff",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            <Text strong style={{ color: "#1677ff" }}>Task: </Text>
            <Text style={{ color: "#262626" }}>{selectedTask.taskName}</Text>
          </div>
        )}

        {/* Comments list */}
        <div
          style={{
            maxHeight: 260,
            overflowY: "auto",
            marginBottom: 12,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
          }}
        >
          {commentsLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#8c8c8c" }}>Loading comments...</div>
          ) : commentsData.length === 0 ? (
            <Empty description="No comments yet" style={{ padding: 24 }} />
          ) : (
            commentsData.map((comment, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 14px",
                  borderBottom: index < commentsData.length - 1 ? "1px solid #f5f5f5" : "none",
                  background: comment.commentsBy === "ADMIN" ? "#f6ffed" : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text
                    strong
                    style={{
                      color: comment.commentsBy === "ADMIN" ? "#52c41a" : "#1677ff",
                      fontSize: 12,
                    }}
                  >
                    {comment.commentsBy}
                  </Text>
                  {comment.createdAt && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#262626", lineHeight: 1.6 }}>
                  {comment.comments}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add comment */}
        <div style={{ background: "#fafafa", padding: 12, borderRadius: 8, border: "1px solid #f0f0f0" }}>
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
            Add Comment
          </Text>
          <Input.TextArea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Type your comment here..."
            rows={3}
            maxLength={500}
            showCount
            style={{ borderRadius: 6 }}
          />
          <Button
            type="primary"
            loading={submittingComment}
            onClick={submitAdminComment}
            style={{ marginTop: 8, backgroundColor: "#1677ff", borderRadius: 6 }}
            size="small"
          >
            Submit Comment
          </Button>
        </div>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AdminTasks;
