import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Space,
} from "antd";

import { SearchOutlined, FileOutlined } from "@ant-design/icons";

import axiosInstance from "../../../core/config/axiosInstance";

import BASE_URL from "../../../core/config/Config";

import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";

import useAuth from "../../../shared/hooks/useAuth";

const { Text } = Typography;

const { Option } = Select;

const PRIMARY = "#008cba";

const SUCCESS = "#1ab394";

const btnPrimary = {
  background: PRIMARY,

  borderColor: PRIMARY,

  color: "#fff",

  fontWeight: 600,

  borderRadius: 8,

  height: 40,

  paddingInline: 20,
};

const btnSuccess = {
  background: SUCCESS,

  borderColor: SUCCESS,

  color: "#fff",

  fontWeight: 600,

  borderRadius: 8,

  height: 40,

  paddingInline: 20,
};

const STATUS_COLORS = {
  assigned: { bg: "#e6f7ff", color: PRIMARY, border: "#91d5ff" },

  completed: { bg: "#f6ffed", color: SUCCESS, border: "#b7eb8f" },

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

        padding: "4px 12px",

        fontSize: 13,

        fontWeight: 600,

        textTransform: "capitalize",

        whiteSpace: "nowrap",
      }}
    >
      {status || "Pending"}
    </span>
  );
};

const parseApiDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;
  const normalized = dateString.trim().replace(" ", "T").split(".")[0];
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (dateString) => {
  const d = parseApiDate(dateString);
  if (!d) return formatDate(dateString);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateOnly = (dateString) => {
  const d = parseApiDate(dateString);
  if (!d) return formatDate(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    if (
      typeof dateString === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(dateString)
    ) {
      const d = parseApiDate(dateString);
      if (d) return formatDateOnly(dateString);
    }

    if (
      typeof dateString === "string" &&
      dateString.includes("-") &&
      dateString.includes(":")
    ) {
      const date = new Date(dateString);

      if (!isNaN(date))
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
    }

    if (typeof dateString === "string" && dateString.includes(" ")) {
      const parts = dateString.split(" ");

      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      if (parts.length >= 2 && monthMap[parts[0]] !== undefined) {
        const day = parseInt(parts[1]);

        const taskMonth = monthMap[parts[0]];

        const currentYear = new Date().getFullYear();

        const year =
          taskMonth > new Date().getMonth() ? currentYear - 1 : currentYear;

        return new Date(year, taskMonth, day).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      return dateString;
    }

    const date = new Date(dateString);

    return isNaN(date)
      ? dateString
      : date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  } catch {
    return dateString;
  }
};

const normalizeAssignee = (assigned) => {
  if (Array.isArray(assigned)) {
    const names = assigned
      .map((a) => (typeof a === "string" ? a.trim() : ""))
      .filter(Boolean);

    return names.length ? names.join(", ") : "";
  }

  return typeof assigned === "string" ? assigned.trim() : "";
};

const VIDEO_PATTERN = /\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp)(\?|#|$)/i;
const IMAGE_PATTERN = /\.(jpg|jpeg|png|webp|gif|bmp)(\?|#|$)/i;
const PDF_PATTERN = /\.pdf(\?|#|$)/i;

const getAttachmentKind = (url) => {
  if (!url) return "none";
  const lower = url.toLowerCase();
  if (
    VIDEO_PATTERN.test(lower) ||
    lower.includes("/video") ||
    lower.includes("video%")
  )
    return "video";
  if (PDF_PATTERN.test(lower)) return "pdf";
  if (/\.xlsx?(\?|#|$)/i.test(lower)) return "excel";
  if (IMAGE_PATTERN.test(lower)) return "image";
  return "unknown";
};

const ViewFileLink = ({ url, label = "View File" }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      color: PRIMARY,
      fontWeight: 600,
    }}
  >
    <FileOutlined />
    {label}
  </a>
);

const AttachmentCell = ({ url }) => {
  const [imgFailed, setImgFailed] = useState(false);
  if (!url) {
    return (
      <Text type="secondary" style={{ fontSize: 13 }}>
        —
      </Text>
    );
  }

  const kind = getAttachmentKind(url);

  if (kind === "video") return <ViewFileLink url={url} label="View File" />;
  if (kind === "pdf") return <ViewFileLink url={url} label="View PDF" />;
  if (kind === "excel") return <ViewFileLink url={url} label="View Excel" />;

  if (kind === "image" || (kind === "unknown" && !imgFailed)) {
    return (
      <Image
        width={64}
        height={64}
        src={url}
        preview
        onError={() => setImgFailed(true)}
        style={{
          borderRadius: 8,
          objectFit: "cover",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      />
    );
  }

  return <ViewFileLink url={url} label="View File" />;
};

const filterValidListTasks = (content) =>
  content.filter((task) => {
    const assigned = task.taskAssignTo;

    const hasValidAssignee = Array.isArray(assigned)
      ? assigned.some((a) => a?.trim())
      : typeof assigned === "string" && assigned.trim();

    const hasValidTaskName =
      typeof task.taskName === "string" && task.taskName.trim();

    return hasValidAssignee && hasValidTaskName;
  });

const AssignedTasksStatusBased = () => {
  const { accessToken } = useAuth();

  const [tasks, setTasks] = useState([]);

  const [totalElements, setTotalElements] = useState(0);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [activeSearch, setActiveSearch] = useState("");

  const [isSearchMode, setIsSearchMode] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

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
    async (status = "all") => {
      setLoading(true);

      try {
        const config = {
          headers: { Authorization: `Bearer ${accessToken}` },
          ...(status !== "all" ? { params: { status } } : {}),
        };

        const response = await axiosInstance.get(
          `${BASE_URL}/ai-service/agent/messagesBasedOnStatus`,
          config,
        );
        const data = response.data;
        const content = Array.isArray(data) ? data : data.content || [];
        const validTasks = filterValidListTasks(content);

        setTasks(validTasks);
        setTotalElements(data.totalElements ?? validTasks.length);
        setIsSearchMode(false);
        setActiveSearch("");
      } catch {
        message.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    },

    [accessToken],
  );

  const searchTasks = useCallback(
    async (query) => {
      const trimmed = query.trim();

      if (!trimmed) {
        setPagination((p) => ({ ...p, current: 1 }));
        fetchTasks(statusFilter);
        return;
      }

      setLoading(true);

      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/ai-service/agent/messages`,

          {
            headers: { Authorization: `Bearer ${accessToken}` },

            params: { search: trimmed },
          },
        );

        const content = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        const validTasks = filterValidListTasks(content).filter((task) => {
          if (statusFilter === "all") return true;
          return task.status?.toLowerCase() === statusFilter.toLowerCase();
        });

        setTasks(validTasks);
        setTotalElements(validTasks.length);

        setIsSearchMode(true);

        setActiveSearch(trimmed);

        setPagination((p) => ({ ...p, current: 1 }));
      } catch {
        message.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },

    [accessToken, fetchTasks, statusFilter],
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/user-service/getAllEmployees`,
      );

      setEmployees(response.data);
    } catch {
      message.error("Failed to load employee list");
    }
  }, []);

  const searchSkipInitial = useRef(true);

  useEffect(() => {
    fetchTasks(statusFilter);
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchSkipInitial.current) {
      searchSkipInitial.current = false;
      return;
    }
    const timer = setTimeout(() => {
      searchTasks(searchText);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchText, searchTasks]);

  const handleTableChange = (pag) => {
    if (isSearchMode) {
      setPagination({ current: pag.current, pageSize: pag.pageSize });

      return;
    }

    setPagination({ current: pag.current, pageSize: pag.pageSize });

    fetchTasks(statusFilter);
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

        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { taskId: task.id },
        },
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
      await axiosInstance.post(
        `${BASE_URL}/ai-service/agent/userAndRadhaSirComments`,
        {
          taskId: selectedTask.id,

          comments: adminComment.trim(),

          commentsBy: "ADMIN",
        },
      );

      message.success("Comment added!");

      setAdminComment("");

      const refreshed = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,

        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { taskId: selectedTask.id },
        },
      );

      setCommentsData(Array.isArray(refreshed.data) ? refreshed.data : []);
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignUpdate = async () => {
    if (!selectedTask || !selectedEmployee)
      return message.warning("Please select one employee.");

    const emp = employees.find((e) => e.userId === selectedEmployee);

    try {
      await axiosInstance.patch(
        `${BASE_URL}/ai-service/agent/taskAssignedToRadhaSir`,

        null,

        {
          params: {
            id: selectedTask.id,
            assignedTo: emp?.name || "",
            userId: selectedEmployee,
          },
        },
      );

      message.success("Task reassigned successfully!");

      setEditModalVisible(false);

      if (isSearchMode && activeSearch) {
        searchTasks(activeSearch);
      } else {
        fetchTasks(statusFilter);
      }
    } catch {
      message.error("Failed to update task");
    }
  };

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter(
          (task) => task.status?.toLowerCase() === statusFilter.toLowerCase(),
        );

  const paginatedTasks = filteredTasks.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize,
  );

  const displayTotal = filteredTasks.length;

  const columns = [
    {
      title: "#",

      key: "serial",

      align: "center",

      width: 45,

      render: (_t, _r, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    {
      title: "Task Info",

      key: "task_info",

      render: (_, record) => {
        const assignedTo =
          normalizeAssignee(record.taskAssignTo) || "Unassigned";

        return (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ fontSize: 13, color: "#8c8c8c" }}>
              ID:{" "}
              <Text strong style={{ color: PRIMARY, fontSize: 13 }}>
                #{record.id?.slice(-4)}
              </Text>
            </div>

            <div style={{ fontSize: 13, color: "#8c8c8c" }}>
              By:{" "}
              <Text strong style={{ color: SUCCESS, fontSize: 13 }}>
                {record.taskAssignBy}
              </Text>
            </div>

            <div style={{ fontSize: 13, color: "#8c8c8c" }}>
              To:{" "}
              <Tooltip title={assignedTo}>
                <Text
                  strong
                  style={{
                    color: PRIMARY,

                    fontSize: 13,

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

            fontSize: 14,

            lineHeight: 1.6,

            wordBreak: "break-word",

            color: text?.trim() ? "#262626" : "#bfbfbf",

            fontStyle: text?.trim() ? "normal" : "italic",
          }}
        >
          {text?.trim() ? text : "No description (see attachment)"}
        </div>
      ),
    },

    {
      title: "Date & Status",

      key: "timeline",

      align: "center",

      render: (_, record) => {
        const assignedAt = record.taskAssignedDate;
        const completedAt = record.taskCompleteDate;
        return (
          <div style={{ lineHeight: 1.9 }}>
            {assignedAt ? (
              <div style={{ fontSize: 13, color: "#262626" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Assigned:{" "}
                </Text>
                <Text strong style={{ fontSize: 13, color: PRIMARY }}>
                  {formatDateTime(assignedAt)}
                </Text>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#8c8c8c" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Assigned:{" "}
                </Text>
                —
              </div>
            )}
            {completedAt && (
              <div style={{ fontSize: 13, color: "#262626", marginTop: 2 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Completed:{" "}
                </Text>
                <Text strong style={{ fontSize: 13, color: SUCCESS }}>
                  {formatDateTime(completedAt)}
                </Text>
              </div>
            )}
            <StatusBadge status={record.status} />
          </div>
        );
      },
    },

    {
      title: "Attachment",

      dataIndex: "image",

      key: "image",

      align: "center",

      width: 100,

      render: (url) => <AttachmentCell url={url} />,
    },

    {
      title: "Actions",

      key: "action",

      align: "center",

      width: 180,

      render: (_, record) => (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Button
            size="middle"
            block
            style={btnPrimary}
            onClick={() => {
              setSelectedTask(record);
              setSelectedEmployee(null);
              setEditModalVisible(true);
            }}
          >
            Reassign
          </Button>

          <Button
            size="middle"
            block
            style={btnSuccess}
            onClick={() => handleViewComments(record)}
          >
            Comments
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "16px 20px" }}>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} lg={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Text strong style={{ fontSize: 20, color: "#262626" }}>
                WhatsApp Assigned Tasks
              </Text>

              {/* <Badge
                count={displayTotal}
                showZero
                style={{ backgroundColor: PRIMARY }}
                overflowCount={99999}
              /> */}
            </div>

            <Text
              type="secondary"
              style={{ fontSize: 13, display: "block", marginTop: 4 }}
            >
              {isSearchMode && activeSearch
                ? `${filteredTasks.length} result${filteredTasks.length !== 1 ? "s" : ""} for "${activeSearch}"`
                : "Manage, search, and track assigned tasks efficiently."}
            </Text>
          </Col>

          <Col xs={24} lg={16}>
            <Row gutter={[10, 10]} justify="end" align="middle">
              <Col xs={24} sm={16} md={14} lg={12}>
                <Input
                  size="large"
                  prefix={<SearchOutlined style={{ color: PRIMARY }} />}
                  placeholder="Search name, task, month, year..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{ borderRadius: 8, borderColor: PRIMARY }}
                />
              </Col>

              <Col xs={24} sm={8} md={10} lg={8}>
                <Select
                  size="large"
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setSearchText("");
                    setActiveSearch("");
                    setIsSearchMode(false);
                    setPagination((p) => ({ ...p, current: 1 }));
                    fetchTasks(value);
                  }}
                  style={{ width: "100%" }}
                >
                  <Option value="all">ALL</Option>
                  <Option value="assigned">ASSIGNED</Option>
                  <Option value="COMPLETED">COMPLETED</Option>
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={paginatedTasks}
          rowKey={(record) => record.id}
          loading={loading}
          bordered
          size="middle"
          scroll={{ x: 760, y: 520 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  isSearchMode
                    ? `No tasks match your filters for "${activeSearch}"`
                    : "No tasks found"
                }
              />
            ),
          }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "" : "ant-table-row-alt"
          }
          pagination={{
            current: pagination.current,

            pageSize: pagination.pageSize,

            total: displayTotal,

            showSizeChanger: true,

            pageSizeOptions: ["25", "50", "100", "200"],

            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} tasks`,

            position: ["bottomRight"],
          }}
          onChange={handleTableChange}
        />
      </div>

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
        okButtonProps={{ size: "middle", style: btnPrimary }}
        cancelButtonProps={{ size: "middle" }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text strong>Current Assignee: </Text>

          <Text style={{ color: SUCCESS }}>
            {normalizeAssignee(selectedTask?.taskAssignTo) || "Unassigned"}
          </Text>
        </div>

        <p style={{ marginBottom: 8, fontWeight: 500 }}>Select New Employee:</p>

        <Select
          showSearch
          size="large"
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

      <Modal
        title={
          <span>
            Comments{" "}
            <Text type="secondary" style={{ fontSize: 13 }}>
              #{selectedTask?.id?.slice(-6)}
            </Text>
            {commentsData.length > 0 && (
              <Badge
                count={commentsData.length}
                style={{ marginLeft: 8, backgroundColor: SUCCESS }}
              />
            )}
          </span>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setAdminComment("");
        }}
        footer={null}
        width="min(95vw, 580px)"
        style={{ top: 20 }}
      >
        {selectedTask && (
          <div
            style={{
              background: "#e6f7ff",

              border: `1px solid ${PRIMARY}`,

              borderRadius: 8,

              padding: "10px 14px",

              marginBottom: 12,

              fontSize: 14,
            }}
          >
            <Text strong style={{ color: PRIMARY }}>
              Task:{" "}
            </Text>

            <Text style={{ color: "#262626" }}>
              {selectedTask.taskName?.trim() || "No description"}
            </Text>
          </div>
        )}

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
            <div style={{ padding: 24, textAlign: "center", color: "#8c8c8c" }}>
              Loading comments...
            </div>
          ) : commentsData.length === 0 ? (
            <Empty description="No comments yet" style={{ padding: 24 }} />
          ) : (
            commentsData.map((comment, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 14px",

                  borderBottom:
                    index < commentsData.length - 1
                      ? "1px solid #f5f5f5"
                      : "none",

                  background:
                    comment.commentsBy === "ADMIN" ? "#f6ffed" : "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: comment.commentsBy === "ADMIN" ? SUCCESS : PRIMARY,

                      fontSize: 13,
                    }}
                  >
                    {comment.commentsBy}
                  </Text>

                  {comment.createdAt && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  )}
                </div>

                <div
                  style={{ fontSize: 14, color: "#262626", lineHeight: 1.6 }}
                >
                  {comment.comments}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            background: "#fafafa",
            padding: 14,
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        >
          <Text
            strong
            style={{ fontSize: 14, display: "block", marginBottom: 8 }}
          >
            Add Comment
          </Text>

          <Input.TextArea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Type your comment here..."
            rows={3}
            maxLength={500}
            showCount
            style={{ borderRadius: 8 }}
          />

          <Button
            type="primary"
            size="middle"
            loading={submittingComment}
            onClick={submitAdminComment}
            style={{ marginTop: 10, ...btnPrimary }}
          >
            Submit Comment
          </Button>
        </div>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AssignedTasksStatusBased;
