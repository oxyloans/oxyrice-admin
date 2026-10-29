import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Button,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  Typography,
  message,
  Tooltip,
} from "antd";
import {
  FileOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";

import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import useAuth from "../../../shared/hooks/useAuth";

const { Text } = Typography;
const { Option } = Select;

const PRIMARY = "#2563eb";
const SUCCESS = "#16a34a";
const WARNING = "#d97706";
const DANGER = "#dc2626";
const PURPLE = "#7c3aed";
const CYAN = "#0891b2";

const EMPTY_COUNTS = {
  acceptCount: 0,
  assignedCount: 0,
  completedCount: 0,
  holdCount: 0,
  rejectCount: 0,
  totalCount: 0,
};

const STATUS_META = {
  assigned: {
    label: "Assigned",
    color: PRIMARY,
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  accepted: {
    label: "Accepted",
    color: CYAN,
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  completed: {
    label: "Completed",
    color: SUCCESS,
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  hold: { label: "On Hold", color: WARNING, bg: "#fffbeb", border: "#fde68a" },
  on_hold: {
    label: "On Hold",
    color: WARNING,
    bg: "#fffbeb",
    border: "#fde68a",
  },
  rejected: {
    label: "Rejected",
    color: DANGER,
    bg: "#fef2f2",
    border: "#fecaca",
  },
  pending: {
    label: "Pending",
    color: PURPLE,
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
};

const normalizeStatusKey = (status) => {
  const value = String(status || "pending")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (value === "accept") return "accepted";
  if (value === "reject") return "rejected";
  if (value === "complete") return "completed";
  if (value === "onhold") return "hold";
  return value;
};

const StatusBadge = ({ status }) => {
  const key = normalizeStatusKey(status);
  const meta = STATUS_META[key] || STATUS_META.pending;
  return (
    <span
      className="ats-status-badge"
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <span className="ats-status-dot" />
      {meta.label}
    </span>
  );
};

const parseApiDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{11,}$/.test(raw)) {
    const d = new Date(Number(raw));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const normalized = raw.replace(" ", "T").split(".")[0];
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Helper to convert task date (DD/MM/YYYY or ISO/timestamp) into epoch timestamp for sorting
const getTaskTimestamp = (task) => {
  if (!task) return 0;
  const raw =
    task.tastCreatedDate ||
    task.taskCreatedDate ||
    task.createdAt ||
    task.taskAssignedDate;

  if (!raw) return 0;
  if (typeof raw === "number") return raw;

  const str = String(raw).trim();
  if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined")
    return 0;

  // DD/MM/YYYY or DD-MM-YYYY (e.g. "05/08/2026")
  const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const dateObj = new Date(year, month, day);
    return !Number.isNaN(dateObj.getTime()) ? dateObj.getTime() : 0;
  }

  // Numeric epoch string
  if (/^\d{11,}$/.test(str)) {
    return Number(str);
  }

  // Standard parseable ISO string or date
  const parsed = Date.parse(str.replace(" ", "T"));
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return 0;
};

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === "null" || raw.toLowerCase() === "undefined")
    return "—";

  // If DD/MM/YYYY or DD-MM-YYYY (e.g. 05/08/2026 -> 05 Aug 2026)
  const ddmmyyyy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return raw;
  }

  const direct = parseApiDate(value);
  if (direct) {
    return direct.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return raw;
};

const formatDateTime = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const direct = parseApiDate(value);
  if (direct) {
    return direct.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return String(value);
};

const normalizeAssignee = (assigned) => {
  const cleanValue = (value) => {
    if (typeof value !== "string") return "";

    const cleaned = value.trim();
    const emptyValues = [
      "",
      "[]",
      "[ ]",
      "null",
      "undefined",
      "[null]",
      "[undefined]",
    ];

    if (emptyValues.includes(cleaned.toLowerCase())) return "";

    return cleaned;
  };

  if (Array.isArray(assigned)) {
    return assigned
      .map((item) => cleanValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return cleanValue(assigned);
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

const normalizeAttachmentUrl = (value) => {
  if (value === null || value === undefined) return "";

  const cleaned = String(value).trim();
  if (!cleaned) return "";

  const normalized = cleaned.toLowerCase();
  if (
    normalized === "null" ||
    normalized === "undefined" ||
    normalized === "[]" ||
    normalized === "[null]" ||
    normalized === "[undefined]"
  ) {
    return "";
  }

  return cleaned;
};

const AttachmentPreview = ({ url }) => {
  const [failed, setFailed] = useState(false);
  const attachmentUrl = normalizeAttachmentUrl(url);

  useEffect(() => {
    setFailed(false);
  }, [attachmentUrl]);

  if (!attachmentUrl) return null;

  const kind = getAttachmentKind(attachmentUrl);
  if ((kind === "image" || kind === "unknown") && !failed) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ats-attachment-image-wrap"
      >
        <img
          src={attachmentUrl}
          alt="Task attachment"
          onError={() => setFailed(true)}
        />
        <span>View attachment</span>
      </a>
    );
  }

  return (
    <a
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="ats-file-link"
    >
      <FileOutlined />
      <span>
        {kind === "pdf"
          ? "View PDF"
          : kind === "excel"
            ? "View Excel"
            : "View File"}
      </span>
    </a>
  );
};

const StatCard = ({ label, value, icon, tone }) => (
  <article className={`ats-stat ats-stat--${tone}`}>
    <div>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
    <div className="ats-stat__icon">{icon}</div>
  </article>
);

const EmployeeTasksStatusBased = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const routeParams = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Extract userId from route parameter :userId or ?userId= query param
  const userId =
    routeParams.userId ||
    searchParams.get("userId") ||
    location.state?.userId ||
    "";

  const stateEmployee = location.state?.employee;
  const stateUserName = location.state?.userName || stateEmployee?.name || "";

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [targetEmployee, setTargetEmployee] = useState(stateEmployee || null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reassigning, setReassigning] = useState(false);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [adminComment, setAdminComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const authConfig = useMemo(
    () => ({
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
    [accessToken],
  );

  // Fetch all tasks for this specific userId and sort newest (present date) first
  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/showingTaskBasedOnUserId`,
        {
          ...authConfig,
          params: { userId },
        },
      );
      const data = response.data;
      const content = Array.isArray(data) ? data : data?.content || [];
      // Clean, validate and order present/newest date first based on tastCreatedDate
      const valid = content.filter((t) => t && (t.id || t.taskName));
      valid.sort((a, b) => getTaskTimestamp(b) - getTaskTimestamp(a));
      setTasks(valid);
    } catch (err) {
      console.error("Failed to fetch user tasks:", err);
      message.error("Failed to fetch tasks for this user");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId, authConfig]);

  // Fetch employee list for reassign modal & user info lookup
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/user-service/getAllEmployees`,
        authConfig,
      );
      const list = Array.isArray(response.data) ? response.data : [];
      setEmployees(list);

      // If we don't have employee details from state, lookup from list
      if (!targetEmployee && userId) {
        const found = list.find(
          (emp) => String(emp.userId).trim() === String(userId).trim(),
        );
        if (found) {
          setTargetEmployee(found);
        }
      }
    } catch {
      // Non-blocking error
    }
  }, [authConfig, targetEmployee, userId]);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
    fetchEmployees();
  }, [userId, fetchTasks, fetchEmployees]);

  const getCommentAuthorName = useCallback(
    (commentsBy) => {
      const rawAuthor = String(commentsBy ?? "").trim();

      if (!rawAuthor) return "User";
      if (rawAuthor.toUpperCase() === "ADMIN") return "ADMIN";

      const employee = employees.find(
        (item) => String(item?.userId ?? "").trim() === rawAuthor,
      );

      return employee?.name?.trim() || rawAuthor;
    },
    [employees],
  );

  // Compute status summary counts directly from the user's tasks
  const statusCounts = useMemo(() => {
    const counts = { ...EMPTY_COUNTS, totalCount: tasks.length };
    tasks.forEach((task) => {
      const key = normalizeStatusKey(task.status);
      if (key === "assigned") counts.assignedCount += 1;
      else if (key === "accepted") counts.acceptCount += 1;
      else if (key === "completed") counts.completedCount += 1;
      else if (key === "hold" || key === "on_hold") counts.holdCount += 1;
      else if (key === "rejected") counts.rejectCount += 1;
    });
    return counts;
  }, [tasks]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleViewComments = async (task) => {
    setSelectedTask(task);
    setAdminComment("");
    setCommentsData([]);
    setViewModalVisible(true);
    setCommentsLoading(true);

    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        {
          ...authConfig,
          params: { taskId: task.id },
        },
      );

      const data = response?.data;
      setCommentsData(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to fetch comments");
      setCommentsData([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleViewTracking = async (task) => {
    setSelectedTask(task);
    setTrackingData([]);
    setTrackingModalVisible(true);
    setTrackingLoading(true);

    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/adminTaskTracking`,
        {
          ...authConfig,
          params: { taskId: task.id },
        },
      );

      const data = response?.data;
      setTrackingData(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to fetch task tracking");
      setTrackingData([]);
    } finally {
      setTrackingLoading(false);
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
      message.success("Comment added");
      setAdminComment("");
      const refreshed = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/taskedIdBasedOnComments`,
        {
          ...authConfig,
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
    if (!emp) return message.warning("Selected employee not found.");

    setReassigning(true);
    try {
      await axiosInstance.patch(
        `${BASE_URL}/ai-service/agent/taskAssignedToRadhaSir`,
        null,
        {
          ...authConfig,
          params: {
            id: selectedTask.id,
            assignedTo: emp.name || "",
            userId: selectedEmployee,
          },
        },
      );
      message.success(`Task reassigned to ${emp.name}`);
      setEditModalVisible(false);
      setSelectedEmployee(null);
      await fetchTasks();
    } catch {
      message.error("Failed to reassign task");
    } finally {
      setReassigning(false);
    }
  };

  // Filter tasks by status and sort present date first (descending)
  const filteredTasks = useMemo(() => {
    let list = tasks;

    if (statusFilter !== "all") {
      list = list.filter(
        (task) =>
          normalizeStatusKey(task.status) === normalizeStatusKey(statusFilter),
      );
    }

    return [...list].sort((a, b) => getTaskTimestamp(b) - getTaskTimestamp(a));
  }, [tasks, statusFilter]);

  const paginatedTasks = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredTasks.slice(start, start + pagination.pageSize);
  }, [filteredTasks, pagination]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTasks.length / pagination.pageSize),
    );

    if (pagination.current > totalPages) {
      setPagination((previous) => ({
        ...previous,
        current: totalPages,
      }));
    }
  }, [filteredTasks.length, pagination.current, pagination.pageSize]);

  const displayName = targetEmployee?.name || stateUserName;

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/taskmanagement/employee_registered_users");
    }
  };

  return (
    <TaskAdminPanelLayout>
      <div className="ats-page">
        {/* Navigation Button */}
        <div className="ats-top-nav">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="ats-back-btn"
          >
            Back to Employee Users
          </Button>
        </div>

        {/* Clean, compact Header */}
        <header className="ats-header">
          <div className="ats-header-title-box">
            <UserOutlined className="ats-header-icon" />
            <h1 className="ats-employee-title">
              {displayName ? `${displayName}'s Tasks` : "Employee Tasks"}
            </h1>
          </div>

          <div className="ats-header-actions">
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              className="ats-filter"
              size="middle"
            >
              <Option value="all">All</Option>
              <Option value="assigned">Assigned</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="hold">Hold</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>
        </header>

        {/* Status Stat Cards */}
        <section className="ats-stats" aria-label="Employee task summary">
          <StatCard
            label="Total Tasks"
            value={statusCounts.totalCount}
            tone="total"
            icon={<UnorderedListOutlined />}
          />
          <StatCard
            label="Assigned"
            value={statusCounts.assignedCount}
            tone="assigned"
            icon={<TeamOutlined />}
          />
          <StatCard
            label="Accepted"
            value={statusCounts.acceptCount}
            tone="accepted"
            icon={<CheckCircleOutlined />}
          />
          <StatCard
            label="On Hold"
            value={statusCounts.holdCount}
            tone="hold"
            icon={<ClockCircleOutlined />}
          />
          <StatCard
            label="Completed"
            value={statusCounts.completedCount}
            tone="completed"
            icon={<CheckCircleOutlined />}
          />
          <StatCard
            label="Rejected"
            value={statusCounts.rejectCount}
            tone="rejected"
            icon={<CloseCircleOutlined />}
          />
        </section>

        {/* Content Section */}
        <section className="ats-content">
          {loading ? (
            <div className="ats-loading">
              <Spin size="large" />
              <span>Loading tasks for this user…</span>
            </div>
          ) : paginatedTasks.length === 0 ? (
            <div className="ats-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  statusFilter !== "all"
                    ? "No tasks match your filter."
                    : "No tasks found for this employee."
                }
              />
              {statusFilter !== "all" && (
                <Button onClick={() => handleStatusChange("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="ats-grid">
              {paginatedTasks.map((task, idx) => {
                const assignedTo =
                  normalizeAssignee(task.taskAssignTo) ||
                  displayName ||
                  "Assigned Employee";
                const attachmentUrl = normalizeAttachmentUrl(task.image);
                const assignedDateStr =
                  task.taskAssignedDate ||
                  task.tastCreatedDate ||
                  task.taskCreatedDate;

                const firstCharBy =
                  (task.taskAssignBy || "A")
                    .trim()
                    .replace(/^[^\w]+/, "")
                    .charAt(0)
                    .toUpperCase() || "A";

                const firstCharTo =
                  (assignedTo || "U")
                    .trim()
                    .replace(/^[^\w]+/, "")
                    .charAt(0)
                    .toUpperCase() || "U";

                return (
                  <article
                    className={`ats-card ${!attachmentUrl ? "ats-card--no-media" : ""}`}
                    key={task.id || `task-${idx}`}
                  >
                    {attachmentUrl && (
                      <div className="ats-card__media">
                        <AttachmentPreview url={attachmentUrl} />
                      </div>
                    )}

                    <div className="ats-card__main">
                      <div className="ats-card__top">
                        <div className="ats-title-wrap">
                          <span className="ats-task-id">
                            TASK #{task.id?.slice(-4) || "—"}
                          </span>
                          <h2>{task.taskName?.trim() || "Untitled task"}</h2>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>

                      <div className="ats-people-row">
                        <div className="ats-person">
                          <span className="ats-avatar">
                            {firstCharBy}
                          </span>
                          <div>
                            <small>Assigned by</small>
                            <strong title={task.taskAssignBy || "Not available"}>
                              {task.taskAssignBy || "Not available"}
                            </strong>
                          </div>
                        </div>

                        <div className="ats-person">
                          <span className="ats-avatar ats-avatar--to">
                            {firstCharTo}
                          </span>
                          <div>
                            <small>Assigned to</small>
                            <strong title={assignedTo}>{assignedTo}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="ats-meta-row">
                        <div className="ats-meta-item">
                          <CalendarOutlined className="ats-meta-icon" />
                          <div className="ats-meta-body">
                            <small>Assigned Date</small>
                            <span className="ats-meta-text">
                              {formatDate(assignedDateStr)}
                            </span>
                          </div>
                        </div>
                        <div className="ats-meta-item">
                          <CalendarOutlined className="ats-meta-icon" />
                          <div className="ats-meta-body">
                            <small>Completed Date</small>
                            <span className="ats-meta-text">
                              {formatDate(task.taskCompleteDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ats-card__actions">
                        <Button
                          className="ats-primary-action"
                          icon={<UserSwitchOutlined />}
                          onClick={() => {
                            setSelectedTask(task);
                            setSelectedEmployee(null);
                            setEditModalVisible(true);
                          }}
                        >
                          Reassign
                        </Button>
                        <Button
                          className="ats-secondary-action"
                          icon={<MessageOutlined />}
                          onClick={() => handleViewComments(task)}
                        >
                          Comments
                        </Button>
                        <Button
                          className="ats-tracking-action"
                          icon={<ClockCircleOutlined />}
                          onClick={() => handleViewTracking(task)}
                        >
                          Task Tracking
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredTasks.length > pagination.pageSize && (
            <div className="ats-pagination">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={filteredTasks.length}
                showSizeChanger={false}
                onChange={(current) =>
                  setPagination((previous) => ({
                    ...previous,
                    current,
                  }))
                }
                showTotal={(total, range) =>
                  `${range[0]}–${range[1]} of ${total} tasks`
                }
              />
            </div>
          )}
        </section>
      </div>

      {/* ─── Reassign Modal ─── */}
      <Modal
        title={null}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedEmployee(null);
        }}
        footer={null}
        width={520}
        centered
      >
        <div className="ats-modal-head">
          <span className="ats-modal-icon ats-modal-icon--blue">
            <UserSwitchOutlined />
          </span>
          <div>
            <h3>Reassign Task</h3>
            <p>Select an employee to reassign this task to.</p>
          </div>
        </div>

        {selectedTask && (
          <div className="ats-comment-task-summary">
            <span>Task</span>
            <strong>{selectedTask.taskName?.trim() || "No description"}</strong>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label className="ats-field-label">Select Employee</label>
          <Select
            showSearch
            placeholder="Search employee by name..."
            optionFilterProp="children"
            style={{ width: "100%" }}
            value={selectedEmployee}
            onChange={(val) => setSelectedEmployee(val)}
            filterOption={(input, option) =>
              (option?.children || "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {employees.map((emp) => (
              <Option key={emp.userId} value={emp.userId}>
                {emp.name} {emp.empNumber ? `(${emp.empNumber})` : ""}
              </Option>
            ))}
          </Select>
        </div>

        <div className="ats-modal-actions">
          <Button
            onClick={() => {
              setEditModalVisible(false);
              setSelectedEmployee(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={reassigning}
            onClick={handleAssignUpdate}
            disabled={!selectedEmployee}
            style={{ background: "#008cba", borderColor: "#008cba" }}
          >
            Confirm Reassign
          </Button>
        </div>
      </Modal>

      {/* ─── Comments Modal ─── */}
      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setAdminComment("");
          setCommentsData([]);
        }}
        footer={null}
        width={560}
        centered
      >
        <div className="ats-modal-head">
          <span className="ats-modal-icon ats-modal-icon--blue">
            <MessageOutlined />
          </span>
          <div>
            <h3>Task Comments</h3>
            <p>Task #{selectedTask?.id?.slice(-4)}</p>
          </div>
        </div>

        {selectedTask && (
          <div className="ats-comment-task-summary">
            <span>Task</span>
            <strong>{selectedTask.taskName?.trim() || "No description"}</strong>
          </div>
        )}

        <div className="ats-comments-list">
          {commentsLoading ? (
            <div className="ats-comments-loading">
              <Spin />
              <span>Loading comments…</span>
            </div>
          ) : commentsData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No comments yet for this task."
            />
          ) : (
            commentsData.map((comment, index) => {
              const isAdmin =
                String(comment.commentsBy || "").trim().toUpperCase() === "ADMIN";
              return (
                <div
                  className={`ats-comment ${isAdmin ? "ats-comment--admin" : ""}`}
                  key={`${comment.createdAt || "comment"}-${index}`}
                >
                  <div className="ats-comment__head">
                    <strong>{getCommentAuthorName(comment.commentsBy)}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p>{comment.comments}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="ats-comment-compose">
          <label className="ats-field-label">Add comment</label>
          <Input.TextArea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Write a clear update or instruction..."
            rows={4}
            maxLength={500}
          />
          <div className="ats-comment-submit-row">
            <span>Comments are visible in this task conversation.</span>
            <Button
              type="primary"
              loading={submittingComment}
              onClick={submitAdminComment}
              disabled={!adminComment.trim()}
              style={{ background: "#008cba", borderColor: "#008cba" }}
            >
              Send Comment
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Task Tracking Modal ─── */}
      <Modal
        title={null}
        open={trackingModalVisible}
        onCancel={() => {
          setTrackingModalVisible(false);
          setTrackingData([]);
        }}
        footer={null}
        width={680}
        centered
      >
        <div className="ats-modal-head">
          <span className="ats-modal-icon ats-modal-icon--blue">
            <ClockCircleOutlined />
          </span>
          <div>
            <h3>Task Tracking</h3>
            <p>Tracking history for task #{selectedTask?.id?.slice(-4)}</p>
          </div>
        </div>

        {selectedTask && (
          <div className="ats-comment-task-summary">
            <span>Task</span>
            <strong>{selectedTask.taskName?.trim() || "No description"}</strong>
          </div>
        )}

        <div className="ats-tracking-modal-body">
          {trackingLoading ? (
            <div className="ats-comments-loading">
              <Spin />
              <span>Loading task tracking…</span>
            </div>
          ) : trackingData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No tracking details found for this task."
            />
          ) : (
            <div className="ats-tracking-list">
              {trackingData.map((tracking, index) => (
                <div
                  className="ats-tracking-entry"
                  key={
                    tracking.trackingId ||
                    `${tracking.taskStatus || "tracking"}-${index}`
                  }
                >
                  <div className="ats-tracking-entry__head">
                    <div>
                      <small>Status</small>
                      <StatusBadge status={tracking.taskStatus} />
                    </div>
                    <span className="ats-tracking-entry__number">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="ats-tracking-details">
                    <div>
                      <small>Started</small>
                      <strong>{formatDateTime(tracking.taskStartDate)}</strong>
                    </div>
                    <div>
                      <small>Ended</small>
                      <strong>{formatDateTime(tracking.taskEndDate)}</strong>
                    </div>
                    <div>
                      <small>Updated Status</small>
                      <strong>
                        {STATUS_META[normalizeStatusKey(tracking.taskStatus)]
                          ?.label ||
                          tracking.taskStatus ||
                          "—"}
                      </strong>
                    </div>
                    {tracking.comments && <p>{tracking.comments}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* ─── Styling ─── */}
      <style>{`
        * { box-sizing: border-box; }
        .ats-page { min-height: 100%; padding: 22px 26px 40px; background: white; color: #0f172a; width: 100%; max-width: 100%; overflow-x: hidden; }
        
        .ats-top-nav { margin-bottom: 16px; }
        .ats-back-btn {
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          border-color: #d9d9d9;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
        }

        .ats-header {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .ats-header-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1 1 auto;
        }
        .ats-header-icon {
          font-size: 18px;
          color: #2563eb;
          flex-shrink: 0;
        }
        .ats-employee-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: -.02em;
          color: #0f172a;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .ats-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .ats-filter {
          min-width: 145px;
        }

        .ats-stats {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
          width: 100%;
        }
        .ats-stat {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(15,23,42,.03);
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .ats-stat:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(15,23,42,.06);
        }
        .ats-stat span {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .ats-stat strong {
          font-size: 22px;
          line-height: 1;
          font-weight: 800;
          color: #0f172a;
        }
        .ats-stat__icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          font-size: 17px;
        }
        .ats-stat--total { border-color:#dbeafe; background:linear-gradient(135deg,#fff,#f3f7ff); } .ats-stat--total .ats-stat__icon { color:#2563eb;background:#dbeafe; }
        .ats-stat--assigned { border-color:#dbeafe; background:linear-gradient(135deg,#fff,#f5f8ff); } .ats-stat--assigned .ats-stat__icon { color:#2563eb;background:#e0ecff; }
        .ats-stat--accepted { border-color:#bae6fd; background:linear-gradient(135deg,#fff,#f0fdff); } .ats-stat--accepted .ats-stat__icon { color:#0891b2;background:#cffafe; }
        .ats-stat--hold { border-color:#fde68a; background:linear-gradient(135deg,#fff,#fffbeb); } .ats-stat--hold .ats-stat__icon { color:#d97706;background:#fef3c7; }
        .ats-stat--completed { border-color:#bbf7d0; background:linear-gradient(135deg,#fff,#f0fdf4); } .ats-stat--completed .ats-stat__icon { color:#16a34a;background:#dcfce7; }
        .ats-stat--rejected { border-color:#fecaca; background:linear-gradient(135deg,#fff,#fff5f5); } .ats-stat--rejected .ats-stat__icon { color:#dc2626;background:#fee2e2; }

        .ats-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 14px;
          width: 100%;
        }
        .ats-card {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: 160px minmax(0, 1fr);
          gap: 16px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 4px 14px rgba(15,23,42,.03);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .ats-card--no-media {
          grid-template-columns: minmax(0, 1fr);
        }
        .ats-card:hover {
          transform: translateY(-1px);
          border-color: #cbd5e1;
          box-shadow: 0 8px 22px rgba(15,23,42,.06);
        }
        .ats-card__media {
          min-height: 160px;
          overflow: hidden;
          border-radius: 10px;
          background: linear-gradient(145deg,#f1f5f9,#f8fafc);
          border: 1px solid #e2e8f0;
        }
        .ats-attachment-image-wrap {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          min-height: 160px;
          overflow: hidden;
          color: #fff;
        }
        .ats-attachment-image-wrap img {
          width: 100%;
          height: 100%;
          min-height: 160px;
          object-fit: cover;
          display: block;
        }
        .ats-attachment-image-wrap span {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 8px;
          padding: 5px 8px;
          border-radius: 6px;
          background: rgba(15,23,42,.72);
          backdrop-filter: blur(5px);
          text-align: center;
          font-size: 10px;
          font-weight: 700;
        }
        .ats-attachment-empty, .ats-file-link {
          width: 100%;
          min-height: 160px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 12px;
          text-decoration: none;
        }
        .ats-attachment-empty .anticon, .ats-file-link .anticon { font-size: 26px; }
        .ats-file-link { color: #2563eb; font-weight: 700; }

        .ats-card__main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .ats-card__top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ats-title-wrap {
          min-width: 0;
          flex: 1 1 200px;
        }
        .ats-task-id {
          display: block;
          margin-bottom: 4px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .07em;
        }
        .ats-card h2 {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 700;
          overflow-wrap: anywhere;
          word-break: break-word;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
        .ats-status-badge {
          flex: 0 0 auto;
          min-height: 24px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 10px;
          line-height: 1;
          font-weight: 800;
          white-space: nowrap;
        }
        .ats-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .ats-people-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .ats-person {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid #eef2f7;
          border-radius: 10px;
          background: #fafcff;
          overflow: hidden;
        }
        .ats-avatar {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #2563eb;
          background: #dbeafe;
          font-size: 11px;
          font-weight: 800;
        }
        .ats-avatar--to {
          color: #7c3aed;
          background: #ede9fe;
        }
        .ats-person div {
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }
        .ats-person small, .ats-meta-row small {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 600;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .ats-person strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }
        .ats-meta-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .ats-meta-item {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          background: #f8fafc;
        }
        .ats-meta-icon {
          color: #94a3b8;
          font-size: 13px;
          flex-shrink: 0;
        }
        .ats-meta-body {
          min-width: 0;
          flex: 1;
        }
        .ats-meta-body small {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 600;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }
        .ats-meta-text {
          display: block;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ats-card__actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 14px;
          flex-wrap: wrap;
        }
        .ats-card__actions .ant-btn {
          height: 34px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .ats-primary-action {
          color: #fff !important;
          background: #008cba !important;
          border-color: #008cba !important;
          box-shadow: 0 2px 6px rgba(0,140,186,.20);
        }
        .ats-primary-action:hover {
          background: #007aa3 !important;
          border-color: #007aa3 !important;
        }
        .ats-secondary-action {
          color: #0f766e !important;
          background: #f0fdfa !important;
          border-color: #99f6e4 !important;
        }
        .ats-secondary-action:hover {
          color: #115e59 !important;
          background: #ccfbf1 !important;
          border-color: #5eead4 !important;
        }
        .ats-tracking-action {
          color: #7c3aed !important;
          background: #faf5ff !important;
          border-color: #ddd6fe !important;
        }
        .ats-tracking-action:hover {
          color: #6d28d9 !important;
          background: #f3e8ff !important;
          border-color: #c4b5fd !important;
        }

        .ats-loading, .ats-empty {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          padding: 24px 16px;
          text-align: center;
        }
        .ats-loading span { color: #64748b; font-size: 13px; }
        .ats-pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
          padding: 12px 0 4px;
          width: 100%;
        }

        /* Modals */
        .ats-modal-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          padding-right: 24px;
        }
        .ats-modal-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          font-size: 18px;
        }
        .ats-modal-icon--blue { color: #2563eb; background: #dbeafe; }
        .ats-modal-head h3 { margin: 1px 0 3px; font-size: 17px; color: #0f172a; }
        .ats-modal-head p { margin: 0; color: #64748b; font-size: 12px; }
        .ats-comment-task-summary {
          display: block;
          padding: 10px 12px;
          margin-bottom: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          font-size: 12px;
        }
        .ats-comment-task-summary span { display: block; margin-bottom: 2px; color: #64748b; }
        .ats-comment-task-summary strong { display: block; color: #334155; line-height: 1.45; }
        
        .ats-field-label { display: block; margin-bottom: 6px; color: #334155; font-size: 12px; font-weight: 700; }
        .ats-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eef2f7; }
        .ats-comments-list { max-height: 280px; overflow-y: auto; padding: 4px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
        .ats-comments-loading { min-height: 140px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #64748b; font-size: 12px; }
        .ats-comment { margin: 6px; padding: 9px 11px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
        .ats-comment--admin { margin-left: 28px; border-color: #bfdbfe; background: #eff6ff; }
        .ats-comment__head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
        .ats-comment__head strong { color: #2563eb; font-size: 11px; }
        .ats-comment__head span { color: #94a3b8; font-size: 10px; }
        .ats-comment p { margin: 0; color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
        .ats-comment-compose { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
        .ats-comment-submit-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 8px; }
        .ats-comment-submit-row span { color: #94a3b8; font-size: 10px; }

        .ats-tracking-modal-body { max-height: 420px; overflow-y: auto; padding: 2px 2px 2px 0; }
        .ats-tracking-list { display: grid; gap: 10px; }
        .ats-tracking-entry { padding: 12px; border: 1px solid #dbeafe; border-radius: 11px; background: #f8fbff; }
        .ats-tracking-entry__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
        .ats-tracking-entry__head small { display: block; margin-bottom: 4px; color: #64748b; font-size: 10px; }
        .ats-tracking-entry__number { color: #94a3b8; font-size: 10px; font-weight: 800; }
        .ats-tracking-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .ats-tracking-details small { display: block; margin-bottom: 2px; color: #64748b; font-size: 10px; }
        .ats-tracking-details strong { color: #334155; font-size: 11px; }
        .ats-tracking-details .ats-status-badge { width: max-content; }
        .ats-tracking-details p { grid-column: 1 / -1; margin: 4px 0 0; padding-top: 8px; border-top: 1px solid #dbeafe; color: #334155; font-size: 11px; line-height: 1.45; }

        /* ─── Responsive Breakpoints ─── */
        /* Large Desktop / Laptop (1024px - 1280px) */
        @media (max-width: 1280px) {
          .ats-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .ats-card { grid-template-columns: 140px minmax(0, 1fr); gap: 14px; }
        }

        /* Medium Tablet (768px - 1023px) */
        @media (max-width: 1023px) {
          .ats-page { padding: 18px 16px 36px; }
          .ats-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
          .ats-card { grid-template-columns: 1fr; gap: 12px; padding: 14px; }
          .ats-card__media { min-height: 160px; height: 180px; max-height: 220px; }
          .ats-attachment-image-wrap, .ats-attachment-image-wrap img, .ats-attachment-empty, .ats-file-link {
            min-height: 160px; height: 180px; max-height: 220px;
          }
          .ats-card__actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .ats-card__actions .ant-btn { width: 100%; }
        }

        /* Small Tablet & Large Mobile (541px - 767px) */
        @media (max-width: 767px) {
          .ats-page { padding: 14px 12px 30px; }
          .ats-header { gap: 12px; }
          .ats-employee-title { font-size: 17px; }
          .ats-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .ats-card { padding: 12px; }
          .ats-card__media { min-height: 150px; height: 160px; max-height: 200px; }
          .ats-attachment-image-wrap, .ats-attachment-image-wrap img, .ats-attachment-empty, .ats-file-link {
            min-height: 150px; height: 160px; max-height: 200px;
          }
          .ats-people-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .ats-meta-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .ats-card__actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
          .ats-card__actions .ant-btn { width: 100%; }
          .ant-modal { max-width: calc(100vw - 24px) !important; margin: 12px auto !important; top: 12px !important; }
          .ant-modal-content { padding: 16px 14px !important; }
        }

        /* Mobile Devices (<= 540px) */
        @media (max-width: 540px) {
          .ats-page { padding: 12px 10px 24px; }
          .ats-top-nav { margin-bottom: 10px; }
          .ats-back-btn { display: inline-flex; height: 32px; font-size: 12px; padding: 4px 12px; }
          
          .ats-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 12px;
          }
          .ats-header-title-box { width: 100%; }
          .ats-employee-title { font-size: 16px; }
          .ats-header-actions { width: 100%; }
          .ats-filter { width: 100% !important; min-width: 0 !important; }

          .ats-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
            margin-bottom: 12px;
          }
          .ats-stat {
            min-height: 62px;
            padding: 8px 10px;
            border-radius: 10px;
          }
          .ats-stat span { font-size: 10px; margin-bottom: 2px; }
          .ats-stat strong { font-size: 17px; }
          .ats-stat__icon { width: 30px; height: 30px; flex: 0 0 30px; font-size: 14px; border-radius: 8px; }

          .ats-card {
            display: block;
            padding: 12px 10px;
            border-radius: 12px;
          }
          .ats-card__media {
            min-height: 140px;
            height: 150px;
            max-height: 180px;
            margin-bottom: 10px;
          }
          .ats-attachment-image-wrap, .ats-attachment-image-wrap img, .ats-attachment-empty, .ats-file-link {
            min-height: 140px; height: 150px; max-height: 180px;
          }
          .ats-card h2 { font-size: 13.5px; line-height: 1.4; }
          .ats-people-row { grid-template-columns: 1fr; gap: 6px; margin-top: 10px; }
          .ats-meta-row { grid-template-columns: 1fr; gap: 6px; margin-top: 8px; }

          .ats-card__actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 6px;
            padding-top: 10px;
          }
          .ats-card__actions .ant-btn { width: 100%; height: 36px; font-size: 12px; }

          .ats-pagination {
            justify-content: center;
            overflow-x: auto;
            padding: 8px 0;
          }
          .ats-pagination .ant-pagination {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2px;
          }

          .ant-modal { max-width: calc(100vw - 16px) !important; margin: 8px auto !important; top: 8px !important; }
          .ant-modal-content { padding: 14px 12px !important; border-radius: 12px !important; }
          .ats-modal-head { margin-bottom: 12px; padding-right: 18px; }
          .ats-modal-head h3 { font-size: 15px; }
          .ats-tracking-details { grid-template-columns: 1fr; gap: 6px; }
          .ats-comment--admin { margin-left: 10px; }
          .ats-comment-submit-row { flex-direction: column; align-items: stretch; gap: 6px; }
          .ats-comment-submit-row .ant-btn { width: 100%; }
        }

        /* Ultra Narrow Mobile Screens (<= 380px) */
        @media (max-width: 380px) {
          .ats-page { padding: 10px 6px 20px; }
          .ats-stats { grid-template-columns: 1fr 1fr; gap: 5px; }
          .ats-stat { padding: 6px 8px; min-height: 56px; }
          .ats-stat span { font-size: 9.5px; }
          .ats-stat strong { font-size: 15px; }
          .ats-stat__icon { width: 26px; height: 26px; flex: 0 0 26px; font-size: 12px; border-radius: 6px; }
          .ats-card { padding: 10px 8px; }
          .ats-card h2 { font-size: 13px; }
          .ats-card__actions .ant-btn { height: 34px; font-size: 11.5px; }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeTasksStatusBased;