import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Button,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import {
  SearchOutlined,
  FileOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

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

const getStatusApiValue = (status) => {
  const normalized = normalizeStatusKey(status);

  if (normalized === "assigned") return "assigned";
  if (normalized === "accepted") return "accepted";
  if (normalized === "rejected") return "reject";
  if (normalized === "hold") return "hold";
  if (normalized === "completed") return "completed";

  return "all";
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

  // Support epoch milliseconds such as 1788746443000.
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // Numeric strings from the tracking API are also epoch milliseconds.
  if (/^\\d{11,}$/.test(raw)) {
    const d = new Date(Number(raw));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Existing API date strings, for example: 2026-09-07 07:30:43.000
  const normalized = raw.replace(" ", "T").split(".")[0];
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const direct = parseApiDate(value);
  if (direct) {
    return direct.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return String(value);
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

const StatCard = ({ label, value, icon, tone }) => (
  <article className={`ats-stat ats-stat--${tone}`}>
    <div>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
    <div className="ats-stat__icon">{icon}</div>
  </article>
);

const AssignedTasksStatusBased = () => {
  const { accessToken } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState(EMPTY_COUNTS);
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
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

  const fetchStatusCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-service/agent/adminTaskStatusCounts`,
        authConfig,
      );
      setStatusCounts({ ...EMPTY_COUNTS, ...(response?.data || {}) });
    } catch (error) {
      console.error("Failed to load admin task counts", error);
      setStatusCounts(EMPTY_COUNTS);
    } finally {
      setCountsLoading(false);
    }
  }, [authConfig]);

  const fetchTasks = useCallback(
    async (status = "all") => {
      setLoading(true);
      try {
        const apiStatus = getStatusApiValue(status);
        const config = {
          ...authConfig,
          ...(apiStatus !== "all" ? { params: { status: apiStatus } } : {}),
        };
        const response = await axiosInstance.get(
          `${BASE_URL}/ai-service/agent/messagesBasedOnStatus`,
          config,
        );
        const data = response.data;
        const content = Array.isArray(data) ? data : data?.content || [];
        setTasks(filterValidListTasks(content));
        setIsSearchMode(false);
        setActiveSearch("");
      } catch {
        message.error("Failed to fetch tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    [authConfig],
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
            ...authConfig,
            params: { search: trimmed },
          },
        );
        const content = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        const validTasks = filterValidListTasks(content).filter((task) => {
          if (statusFilter === "all") return true;
          return (
            normalizeStatusKey(task.status) === normalizeStatusKey(statusFilter)
          );
        });
        setTasks(validTasks);
        setIsSearchMode(true);
        setActiveSearch(trimmed);
        setPagination((p) => ({ ...p, current: 1 }));
      } catch {
        message.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [authConfig, fetchTasks, statusFilter],
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/user-service/getAllEmployees`,
        authConfig,
      );
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch {
      message.error("Failed to load employee list");
    }
  }, [authConfig]);

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

  useEffect(() => {
    fetchTasks("all");
    fetchEmployees();
    fetchStatusCounts();
  }, [fetchEmployees, fetchStatusCounts, fetchTasks]);

  const searchSkipInitial = useRef(true);
  useEffect(() => {
    if (searchSkipInitial.current) {
      searchSkipInitial.current = false;
      return;
    }
    const timer = setTimeout(() => searchTasks(searchText), 450);
    return () => clearTimeout(timer);
  }, [searchText, searchTasks]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setSearchText("");
    setActiveSearch("");
    setIsSearchMode(false);
    setPagination((p) => ({ ...p, current: 1 }));
    fetchTasks(value);
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
      if (isSearchMode && activeSearch) await searchTasks(activeSearch);
      else await fetchTasks(statusFilter);
      fetchStatusCounts();
    } catch {
      message.error("Failed to reassign task");
    } finally {
      setReassigning(false);
    }
  };

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter(
      (task) =>
        normalizeStatusKey(task.status) === normalizeStatusKey(statusFilter),
    );
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

  return (
    <TaskAdminPanelLayout>
      <div className="ats-page">
        <header className="ats-header">
          <div>
            <h1>Assigned Tasks</h1>
            <p>
              {isSearchMode && activeSearch
                ? `${filteredTasks.length} result${filteredTasks.length === 1 ? "" : "s"} for “${activeSearch}”`
                : "Review, reassign and follow up on tasks from one place."}
            </p>
          </div>

          <div className="ats-header-actions">
            <div className="ats-search">
              <SearchOutlined />
              <input
                type="search"
                placeholder="Search tasks, employee, month..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              className="ats-filter"
              size="large"
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

        <section className="ats-stats" aria-label="Admin task summary">
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

        {countsLoading && (
          <div className="ats-count-loading">Updating summary…</div>
        )}

        <section className="ats-content">
          {loading ? (
            <div className="ats-loading">
              <Spin size="large" />
              <span>Loading assigned tasks…</span>
            </div>
          ) : paginatedTasks.length === 0 ? (
            <div className="ats-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  isSearchMode
                    ? "No tasks match your search or filter."
                    : "No assigned tasks found."
                }
              />
              {(searchText || statusFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchText("");
                    handleStatusChange("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="ats-grid">
              {paginatedTasks.map((task) => {
                const assignedTo = normalizeAssignee(task.taskAssignTo);
                const attachmentUrl = normalizeAttachmentUrl(task.image);

                return (
                  <article
                    className={`ats-card ${!attachmentUrl ? "ats-card--no-media" : ""}`}
                    key={task.id}
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
                            {(task.taskAssignBy || "A")
                              .trim()
                              .charAt(1)
                              .toUpperCase()}
                          </span>
                          <div>
                            <small>Assigned by</small>
                            <strong>
                              {task.taskAssignBy || "Not available"}
                            </strong>
                          </div>
                        </div>
                        {assignedTo && (
                          <div className="ats-person">
                            <span className="ats-avatar ats-avatar--to">
                              {assignedTo.charAt(1).toUpperCase()}
                            </span>
                            <div>
                              <small>Assigned to</small>
                              <strong title={assignedTo}>{assignedTo}</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ats-meta-row">
                        <div>
                          <CalendarOutlined />
                          <span>
                            <small>Assigned</small>
                            {formatDate(task.taskAssignedDate)}
                          </span>
                        </div>
                        <div>
                          <CalendarOutlined />
                          <span>
                            <small>Completed</small>
                            {formatDate(task.taskCompleteDate)}
                          </span>
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
                pageSize={20}
                total={filteredTasks.length}
                showSizeChanger={false}
                onChange={(current) =>
                  setPagination((previous) => ({
                    ...previous,
                    current,
                    pageSize: 20,
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
            <p>Move task #{selectedTask?.id?.slice(-4)} to another employee.</p>
          </div>
        </div>

        <div className="ats-current-assignee">
          <span>Current assignee</span>
          <strong>
            {normalizeAssignee(selectedTask?.taskAssignTo) || "Unassigned"}
          </strong>
        </div>

        <label className="ats-field-label">Select new employee</label>
        <Select
          showSearch
          size="large"
          style={{ width: "100%" }}
          placeholder="Search and select employee"
          value={selectedEmployee}
          onChange={setSelectedEmployee}
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children || "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {employees.map((emp) => (
            <Option key={emp.userId} value={emp.userId}>
              {emp.name}
            </Option>
          ))}
        </Select>

        <div className="ats-modal-actions">
          <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
          <Button
            type="primary"
            className="ats-primary-action"
            loading={reassigning}
            onClick={handleAssignUpdate}
            disabled={!selectedEmployee}
          >
            Confirm Reassign
          </Button>
        </div>
      </Modal>

      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setAdminComment("");
        }}
        footer={null}
        width={620}
        centered
      >
        <div className="ats-modal-head">
          <span className="ats-modal-icon ats-modal-icon--green">
            <MessageOutlined />
          </span>
          <div>
            <h3>
              Task Comments{" "}
              {commentsData.length > 0 && <Badge count={commentsData.length} />}
            </h3>
            <p>Conversation for task #{selectedTask?.id?.slice(-4)}</p>
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
              description="No comments yet. Start the conversation below."
            />
          ) : (
            commentsData.map((comment, index) => {
              const isAdmin =
                String(comment.commentsBy || "").toUpperCase() === "ADMIN";
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
          <label className="ats-field-label">Add comments</label>
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
            >
              Send Comment
            </Button>
          </div>
        </div>
      </Modal>

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

      <style>{`
        * { box-sizing: border-box; }
        .ats-page { min-height: 100%; padding: 26px; background: white; color: #0f172a; }
        .ats-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-end; margin-bottom: 20px; }
        .ats-header h1 { margin: 0; font-size: clamp(25px, 2.3vw, 34px); line-height: 1.1; font-weight: 800; letter-spacing: -.035em; }
        .ats-header p { margin: 7px 0 0; color: #64748b; font-size: 14px; }
        .ats-header-actions { display: flex; align-items: center; gap: 10px; }
        .ats-search { width: min(360px, 34vw); height: 44px; display: flex; align-items: center; gap: 9px; padding: 0 13px; border: 1px solid #dbe3ee; border-radius: 11px; background: #fff; color: #94a3b8; transition: .2s ease; }
        .ats-search:focus-within { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(37,99,235,.08); }
        .ats-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #0f172a; font: inherit; font-size: 13px; }
        .ats-filter { min-width: 150px; }
        .ats-stats { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); gap: 12px; margin-bottom: 18px; }
        .ats-stat { min-height: 92px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border: 1px solid; border-radius: 15px; background: #fff; box-shadow: 0 3px 12px rgba(15,23,42,.025); }
        .ats-stat span { display: block; margin-bottom: 5px; color: #64748b; font-size: 12px; font-weight: 600; }
        .ats-stat strong { font-size: 24px; line-height: 1; font-weight: 800; color: #0f172a; }
        .ats-stat__icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border-radius: 13px; font-size: 19px; }
        .ats-stat--total { border-color:#dbeafe; background:linear-gradient(135deg,#fff,#f3f7ff); } .ats-stat--total .ats-stat__icon { color:#2563eb;background:#dbeafe; }
        .ats-stat--assigned { border-color:#dbeafe; background:linear-gradient(135deg,#fff,#f5f8ff); } .ats-stat--assigned .ats-stat__icon { color:#2563eb;background:#e0ecff; }
        .ats-stat--accepted { border-color:#bae6fd; background:linear-gradient(135deg,#fff,#f0fdff); } .ats-stat--accepted .ats-stat__icon { color:#0891b2;background:#cffafe; }
        .ats-stat--hold { border-color:#fde68a; background:linear-gradient(135deg,#fff,#fffbeb); } .ats-stat--hold .ats-stat__icon { color:#d97706;background:#fef3c7; }
        .ats-stat--completed { border-color:#bbf7d0; background:linear-gradient(135deg,#fff,#f0fdf4); } .ats-stat--completed .ats-stat__icon { color:#16a34a;background:#dcfce7; }
        .ats-stat--rejected { border-color:#fecaca; background:linear-gradient(135deg,#fff,#fff5f5); } .ats-stat--rejected .ats-stat__icon { color:#dc2626;background:#fee2e2; }
        .ats-count-loading { margin: -8px 0 12px; text-align: right; color: #94a3b8; font-size: 11px; }
        .ats-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:14px; width:100%; }
        .ats-card { width:100%; min-width:0; display:grid; grid-template-columns:170px minmax(0,1fr); gap:18px; padding:16px; border:1px solid #e2e8f0; border-radius:16px; background:#fff; box-shadow:0 5px 18px rgba(15,23,42,.04); transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .ats-card--no-media { grid-template-columns:minmax(0,1fr); }
        .ats-card:hover { transform:translateY(-1px); border-color:#cbd5e1; box-shadow:0 10px 26px rgba(15,23,42,.07); }
        .ats-card__media { min-height: 168px; overflow:hidden; border-radius:12px; background:linear-gradient(145deg,#f1f5f9,#f8fafc); border:1px solid #e2e8f0; }
        .ats-attachment-image-wrap { position:relative; display:block; width:100%; height:100%; min-height:168px; overflow:hidden; color:#fff; }
        .ats-attachment-image-wrap img { width:100%; height:100%; min-height:168px; object-fit:cover; display:block; }
        .ats-attachment-image-wrap span { position:absolute; left:9px; right:9px; bottom:9px; padding:6px 8px; border-radius:7px; background:rgba(15,23,42,.72); backdrop-filter:blur(5px); text-align:center; font-size:10px; font-weight:700; }
        .ats-attachment-empty,.ats-file-link { width:100%; min-height:168px; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; color:#94a3b8; font-size:12px; text-decoration:none; }
        .ats-attachment-empty .anticon,.ats-file-link .anticon { font-size:28px; }
        .ats-file-link { color:#2563eb; font-weight:700; }
        .ats-card__main { min-width:0; display:flex; flex-direction:column; }
        .ats-card__top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .ats-title-wrap { min-width:0; }
        .ats-task-id { display:block; margin-bottom:5px; color:#94a3b8; font-size:10px; font-weight:800; letter-spacing:.07em; }
        .ats-card h2 { margin:0; color:#0f172a; font-size:15px; line-height:1.45; font-weight:760; overflow-wrap:anywhere; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
        .ats-status-badge { flex:0 0 auto; min-height:26px; display:inline-flex; align-items:center; gap:6px; padding:5px 9px; border:1px solid; border-radius:999px; font-size:10px; line-height:1; font-weight:800; white-space:nowrap; }
        .ats-status-dot { width:6px;height:6px;border-radius:50%;background:currentColor; }
        .ats-people-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:14px; }
        .ats-person { min-width:0; display:flex; align-items:center; gap:8px; padding:9px; border:1px solid #eef2f7; border-radius:10px; background:#fafcff; }
        .ats-avatar { width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:50%;color:#2563eb;background:#dbeafe;font-size:11px;font-weight:800; }
        .ats-avatar--to { color:#7c3aed;background:#ede9fe; }
        .ats-person div { min-width:0; }
        .ats-person small,.ats-meta-row small { display:block;color:#94a3b8;font-size:9px;font-weight:600;margin-bottom:2px; }
        .ats-person strong { display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#334155;font-size:11px;font-weight:700; }
        .ats-meta-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:10px; }
        .ats-meta-row > div { display:flex;align-items:center;gap:7px;color:#64748b;font-size:12px; }
        .ats-meta-row .anticon { color:#94a3b8; }
        .ats-meta-row span { color:#334155;font-size:11px;font-weight:650; }
        .ats-card__actions { display:flex;gap:8px;margin-top:auto;padding-top:14px; }
        .ats-card__actions .ant-btn { height:34px;border-radius:8px;font-size:11px;font-weight:700; }
        .ats-primary-action { color:#fff!important;background:#008cba!important;border-color:#008cba!important;box-shadow:0 3px 8px rgba(0,140,186,.20); }
        .ats-primary-action:hover { background:#007aa3!important;border-color:#007aa3!important; }
        .ats-secondary-action { color:#0f766e!important;background:#f0fdfa!important;border-color:#99f6e4!important; }
        .ats-secondary-action:hover { color:#115e59!important;background:#ccfbf1!important;border-color:#5eead4!important; }
        .ats-tracking-action { color:#7c3aed!important;background:#faf5ff!important;border-color:#ddd6fe!important; }
        .ats-tracking-action:hover { color:#6d28d9!important;background:#f3e8ff!important;border-color:#c4b5fd!important; }
        .ats-card__actions .ant-btn:only-child { flex:1; width:100%; }
        .ats-loading,.ats-empty { min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border:1px solid #e2e8f0;border-radius:16px;background:#fff; }
        .ats-loading span { color:#64748b;font-size:13px; }
        .ats-pagination { display:flex;justify-content:flex-end;margin-top:18px;padding:12px 0 4px; }
        .ats-modal-head { display:flex;align-items:flex-start;gap:12px;margin-bottom:18px;padding-right:28px; }
        .ats-modal-icon { width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:12px;font-size:18px; }
        .ats-modal-icon--blue { color:#2563eb;background:#dbeafe; } .ats-modal-icon--green { color:#16a34a;background:#dcfce7; }
        .ats-modal-head h3 { margin:1px 0 4px;font-size:18px;color:#0f172a; }
        .ats-modal-head p { margin:0;color:#64748b;font-size:12px; }
        .ats-current-assignee,.ats-comment-task-summary { display:flex;justify-content:space-between;gap:14px;padding:12px 14px;margin-bottom:15px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;font-size:12px; }
        .ats-current-assignee span,.ats-comment-task-summary span { color:#64748b; }
        .ats-current-assignee strong { color:#2563eb; }
        .ats-comment-task-summary { display:block; } .ats-comment-task-summary span { display:block;margin-bottom:4px; } .ats-comment-task-summary strong { display:block;color:#334155;line-height:1.5; }
        .ats-tracking-summary { margin-bottom:14px;padding:12px 14px;border:1px solid #bae6fd;border-radius:10px;background:#f0f9ff; }
        .ats-tracking-heading { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;color:#0c4a6e;font-size:12px; }
        .ats-tracking-details { display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px; }
        .ats-tracking-details small { display:block;margin-bottom:4px;color:#64748b;font-size:10px; }
        .ats-tracking-details strong { color:#334155;font-size:11px; }
        .ats-tracking-details .ats-status-badge { width:max-content; }
        .ats-tracking-details p { grid-column:1 / -1;margin:2px 0 0;padding-top:9px;border-top:1px solid #bae6fd;color:#334155;font-size:11px;line-height:1.5; }
        .ats-tracking-empty { color:#64748b;font-size:11px; }
        .ats-tracking-modal-body { max-height:460px;overflow:auto;padding:2px 3px 2px 0; }
        .ats-tracking-list { display:grid;gap:10px; }
        .ats-tracking-entry { padding:13px 14px;border:1px solid #dbeafe;border-radius:11px;background:#f8fbff; }
        .ats-tracking-entry__head { display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px; }
        .ats-tracking-entry__head small { display:block;margin-bottom:5px;color:#64748b;font-size:10px; }
        .ats-tracking-entry__number { color:#94a3b8;font-size:10px;font-weight:800; }
        .ats-field-label { display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700; }
        .ats-modal-actions { display:flex;justify-content:flex-end;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid #eef2f7; }
        .ats-comments-list { max-height:300px;overflow:auto;padding:4px;margin-bottom:14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc; }
        .ats-comments-loading { min-height:160px;display:flex;align-items:center;justify-content:center;gap:9px;color:#64748b;font-size:12px; }
        .ats-comment { margin:7px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;background:#fff; }
        .ats-comment--admin { margin-left:34px;border-color:#bfdbfe;background:#eff6ff; }
        .ats-comment__head { display:flex;justify-content:space-between;gap:12px;margin-bottom:5px; }
        .ats-comment__head strong { color:#2563eb;font-size:11px; } .ats-comment__head span { color:#94a3b8;font-size:10px; }
        .ats-comment p { margin:0;color:#334155;font-size:12px;line-height:1.55;white-space:pre-wrap; }
        .ats-comment-compose { padding:13px;border:1px solid #e2e8f0;border-radius:10px;background:#fff; }
        .ats-comment-submit-row { display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px; }
        .ats-comment-submit-row span { color:#94a3b8;font-size:10px; }

        @media (max-width: 1280px) { .ats-stats{grid-template-columns:repeat(3,minmax(0,1fr));}.ats-card{grid-template-columns:150px minmax(0,1fr);} }
        @media (max-width: 900px) { .ats-page{padding:20px 16px;}.ats-header{display:block;}.ats-header-actions{margin-top:14px;}.ats-search{width:100%;flex:1;}.ats-filter{min-width:145px;}.ats-card{grid-template-columns:132px minmax(0,1fr);gap:14px;padding:13px;}.ats-card__media,.ats-attachment-image-wrap,.ats-attachment-image-wrap img,.ats-attachment-empty,.ats-file-link{min-height:150px;}.ats-people-row{grid-template-columns:repeat(2,minmax(0,1fr));}.ats-card__actions{flex-wrap:wrap;} }
        @media (max-width: 640px) { .ats-page{padding:16px 12px 88px;}.ats-header h1{text-align:center;font-size:23px;}.ats-header p{text-align:center;}.ats-header-actions{display:grid;grid-template-columns:1fr 132px;}.ats-search{min-width:0;}.ats-filter{width:100%;min-width:0;}.ats-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}.ats-stat{min-height:72px;padding:11px;border-radius:11px;}.ats-stat strong{font-size:19px;}.ats-stat__icon{width:32px;height:32px;flex-basis:32px;border-radius:9px;font-size:15px;}.ats-card{display:block;padding:10px;border-radius:13px;}.ats-card__media{min-height:150px;height:150px;margin-bottom:11px;}.ats-attachment-image-wrap,.ats-attachment-image-wrap img,.ats-attachment-empty,.ats-file-link{min-height:150px;height:150px;}.ats-card__top{gap:8px;}.ats-card h2{font-size:14px;}.ats-people-row{grid-template-columns:1fr;margin-top:11px;}.ats-meta-row{gap:8px;}.ats-card__actions{display:grid;grid-template-columns:1fr;}.ats-card__actions .ant-btn{width:100%;}.ats-card__actions .ant-btn:only-child{grid-column:1 / -1;}.ats-pagination{justify-content:center;overflow:auto;}.ats-comment--admin{margin-left:18px;}.ats-comment-submit-row{display:block;}.ats-comment-submit-row .ant-btn{width:100%;margin-top:9px;}.ats-tracking-details{grid-template-columns:1fr 1fr;}.ats-tracking-details p{grid-column:1 / -1;} }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default AssignedTasksStatusBased;
