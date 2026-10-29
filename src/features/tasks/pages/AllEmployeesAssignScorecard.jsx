import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import useAuth from "../../../shared/hooks/useAuth";

const { Title, Text } = Typography;
const { Option } = Select;

const PRIMARY = "#008cba";
const SUCCESS = "#1ab394";
const WARNING = "#d97706";
const DANGER = "#dc2626";

// Professional curated colors for rounded character avatars
const AVATAR_COLORS = [
  "#1ab394", // OxyLoans Green
  "#1c84c6", // Professional Blue
  "#008cba", // Ocean Teal
  "#2563eb", // Royal Blue
  "#7c3aed", // Indigo Slate
  "#0891b2", // Cyan Slate
  "#d97706", // Amber
  "#059669", // Emerald
  "#475569", // Slate
  "#6366f1", // Iris
];

const getAvatarColor = (name = "") => {
  if (!name) return "#1ab394";
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
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

const StatCard = ({ label, value, icon, tone, subtext }) => (
  <article className={`asc-stat asc-stat--${tone}`}>
    <div>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      {subtext && <small>{subtext}</small>}
    </div>
    <div className="asc-stat__icon">{icon}</div>
  </article>
);

const AllEmployeesAssignScorecard = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("total");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12 });

  const authConfig = useMemo(
    () => ({
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
    [accessToken],
  );

  // Fetch employees list, then fetch each employee's tasks automatically
  const fetchAllData = useCallback(async () => {
    setLoadingEmployees(true);
    setLoadingTasks(true);
    setEmployeeTasks({});
    setProgress({ loaded: 0, total: 0 });

    try {
      const empRes = await axiosInstance.get(
        `${BASE_URL}/user-service/getAllEmployees`,
        authConfig,
      );
      const empList = Array.isArray(empRes.data) ? empRes.data : [];
      setEmployees(empList);
      setLoadingEmployees(false);

      if (empList.length === 0) {
        setLoadingTasks(false);
        return;
      }

      setProgress({ loaded: 0, total: empList.length });

      // Fetch tasks for each employee in batches of 5 to avoid connection limits
      const taskMap = {};
      const batchSize = 5;

      for (let i = 0; i < empList.length; i += batchSize) {
        const batch = empList.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (emp) => {
            if (!emp.userId) {
              taskMap[emp.userId || `temp-${Math.random()}`] = [];
              return;
            }
            try {
              const taskRes = await axiosInstance.get(
                `${BASE_URL}/ai-service/agent/showingTaskBasedOnUserId`,
                {
                  ...authConfig,
                  params: { userId: emp.userId },
                },
              );
              const data = taskRes.data;
              const content = Array.isArray(data) ? data : data?.content || [];
              taskMap[emp.userId] = content.filter((t) => t && (t.id || t.taskName));
            } catch (err) {
              console.error(`Failed to fetch tasks for user ${emp.userId}:`, err);
              taskMap[emp.userId] = [];
            }
          }),
        );

        setEmployeeTasks((prev) => ({ ...prev, ...taskMap }));
        setProgress({
          loaded: Math.min(i + batchSize, empList.length),
          total: empList.length,
        });
      }
    } catch (err) {
      console.error("Failed to load employee list:", err);
      message.error("Failed to load employees.");
    } finally {
      setLoadingEmployees(false);
      setLoadingTasks(false);
    }
  }, [authConfig]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Compute scorecard metrics for each employee
  const employeeScorecards = useMemo(() => {
    return employees.map((emp) => {
      const tasks = employeeTasks[emp.userId] || [];
      const isLoaded = emp.userId in employeeTasks;

      let total = 0;
      let completed = 0;
      let assigned = 0;
      let accepted = 0;
      let hold = 0;
      let rejected = 0;

      tasks.forEach((t) => {
        total += 1;
        const key = normalizeStatusKey(t.status);
        if (key === "completed") completed += 1;
        else if (key === "assigned") assigned += 1;
        else if (key === "accepted") accepted += 1;
        else if (key === "hold" || key === "on_hold") hold += 1;
        else if (key === "rejected") rejected += 1;
      });

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...emp,
        tasks,
        isLoaded,
        total,
        completed,
        assigned,
        accepted,
        hold,
        rejected,
        rate,
      };
    });
  }, [employees, employeeTasks]);

  // Overall system-wide totals
  const overallSummary = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let assignedTasks = 0;
    let acceptedTasks = 0;
    let holdTasks = 0;
    let rejectedTasks = 0;
    let employeesWithTasks = 0;

    employeeScorecards.forEach((item) => {
      if (item.total > 0) employeesWithTasks += 1;
      totalTasks += item.total;
      completedTasks += item.completed;
      assignedTasks += item.assigned;
      acceptedTasks += item.accepted;
      holdTasks += item.hold;
      rejectedTasks += item.rejected;
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalEmployees: employees.length,
      employeesWithTasks,
      totalTasks,
      completedTasks,
      assignedTasks,
      acceptedTasks,
      holdTasks,
      rejectedTasks,
      completionRate,
    };
  }, [employees.length, employeeScorecards]);

  // Filter and sort scorecards
  const filteredScorecards = useMemo(() => {
    let list = employeeScorecards;

    // Filter by type
    if (filterType === "has_tasks") {
      list = list.filter((item) => item.total > 0);
    } else if (filterType === "no_tasks") {
      list = list.filter((item) => item.total === 0);
    } else if (filterType === "high_rate") {
      list = list.filter((item) => item.total > 0 && item.rate >= 80);
    } else if (filterType === "has_pending") {
      list = list.filter((item) => item.assigned > 0 || item.accepted > 0);
    }

    // Filter by search text
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const mail = (item.mail || "").toLowerCase();
        const num = (item.empNumber || "").toLowerCase();
        const id = (item.lastFourDigitsUserId || item.userId || "").toLowerCase();
        return (
          name.includes(q) ||
          mail.includes(q) ||
          num.includes(q) ||
          id.includes(q)
        );
      });
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === "total") return b.total - a.total;
      if (sortBy === "completed") return b.completed - a.completed;
      if (sortBy === "rate") return b.rate - a.rate || b.total - a.total;
      if (sortBy === "assigned") return b.assigned - a.assigned;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  }, [employeeScorecards, filterType, searchText, sortBy]);

  // Paginated scorecards for card view
  const paginatedScorecards = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredScorecards.slice(start, start + pagination.pageSize);
  }, [filteredScorecards, pagination]);

  const exportToExcel = () => {
    if (!employeeScorecards || employeeScorecards.length === 0) {
      message.warning("No employee data available to export.");
      return;
    }

    const formattedData = employeeScorecards.map((emp, index) => ({
      "S.No": index + 1,
      "Employee Name": emp.name || "—",
      "User ID": emp.lastFourDigitsUserId || emp.userId || "—",
      "Email": emp.mail || "—",
      "Mobile Number": emp.empNumber || "—",
      "Total Tasks": emp.total,
      "Completed Tasks": emp.completed,
      "Assigned Tasks": emp.assigned,
      "Accepted Tasks": emp.accepted,
      "On Hold Tasks": emp.hold,
      "Rejected Tasks": emp.rejected,
      "Completion Rate": `${emp.rate}%`,
    }));

    // Overall summary row
    formattedData.push({
      "S.No": "TOTAL",
      "Employee Name": `${overallSummary.totalEmployees} Employees`,
      "User ID": "",
      "Email": "",
      "Mobile Number": "",
      "Total Tasks": overallSummary.totalTasks,
      "Completed Tasks": overallSummary.completedTasks,
      "Assigned Tasks": overallSummary.assignedTasks,
      "Accepted Tasks": overallSummary.acceptedTasks,
      "On Hold Tasks": overallSummary.holdTasks,
      "Rejected Tasks": overallSummary.rejectedTasks,
      "Completion Rate": `${overallSummary.completionRate}%`,
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    worksheet["!cols"] = [
      { wch: 8 },  // S.No
      { wch: 25 }, // Employee Name
      { wch: 14 }, // User ID
      { wch: 28 }, // Email
      { wch: 16 }, // Mobile Number
      { wch: 14 }, // Total Tasks
      { wch: 16 }, // Completed Tasks
      { wch: 16 }, // Assigned Tasks
      { wch: 16 }, // Accepted Tasks
      { wch: 16 }, // On Hold Tasks
      { wch: 16 }, // Rejected Tasks
      { wch: 18 }, // Completion Rate
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Scorecard");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `All_Employees_Task_Scorecard_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    message.success("Employee scorecard exported successfully!");
  };

  const handleViewTasks = (emp) => {
    navigate(`/taskmanagement/employee-tasks/${emp.userId}`, {
      state: {
        userId: emp.userId,
        userName: emp.name,
        userEmail: emp.mail,
        employee: emp,
      },
    });
  };

  // Scorecard Table columns
  const tableColumns = [
    {
      title: "S.No",
      key: "sno",
      width: 65,
      align: "center",
      render: (_, __, idx) => (
        <Text strong style={{ color: "#64748b" }}>
          {idx + 1}
        </Text>
      ),
    },
    {
      title: "Employee",
      key: "employee",
      render: (_, item) => {
        const firstLetter = (item.name || "E").trim().charAt(0).toUpperCase();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              size={36}
              style={{
                backgroundColor: getAvatarColor(item.name),
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {firstLetter}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Text
                strong
                style={{
                  display: "block",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
                onClick={() => handleViewTasks(item)}
              >
                {item.name || "—"}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, item) => (
        <div>
          <Text style={{ display: "block", fontSize: 12, color: "#334155" }}>
            {item.mail || "—"}
          </Text>
          {item.empNumber && (
            <Text style={{ fontSize: 11, color: "#64748b" }}>
              {item.empNumber}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Total Tasks",
      dataIndex: "total",
      align: "center",
      sorter: (a, b) => a.total - b.total,
      render: (v) => (
        <Badge
          count={v}
          overflowCount={999}
          style={{
            backgroundColor: v > 0 ? "#1e293b" : "#cbd5e1",
            fontWeight: 700,
            fontSize: 12,
          }}
        />
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed",
      align: "center",
      sorter: (a, b) => a.completed - b.completed,
      render: (v) => (
        <Text strong style={{ color: "#1ab394", fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Assigned",
      dataIndex: "assigned",
      align: "center",
      sorter: (a, b) => a.assigned - b.assigned,
      render: (v) => (
        <Text strong style={{ color: "#0f172a", fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Accepted",
      dataIndex: "accepted",
      align: "center",
      sorter: (a, b) => a.accepted - b.accepted,
      render: (v) => (
        <Text strong style={{ color: "#0f172a", fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "On Hold",
      dataIndex: "hold",
      align: "center",
      sorter: (a, b) => a.hold - b.hold,
      render: (v) => (
        <Text strong style={{ color: "#0f172a", fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Rejected",
      dataIndex: "rejected",
      align: "center",
      sorter: (a, b) => a.rejected - b.rejected,
      render: (v) => (
        <Text strong style={{ color: "#0f172a", fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Completion %",
      key: "rate",
      width: 170,
      sorter: (a, b) => a.rate - b.rate,
      render: (_, item) => (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: item.rate === 100 ? "#1ab394" : "#0f172a" }}>
              {item.rate}%
            </Text>
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>
              {item.completed}/{item.total}
            </Text>
          </div>
          <Progress
            percent={item.rate}
            size="small"
            showInfo={false}
            strokeColor="#1ab394"
            trailColor="#f1f5f9"
          />
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120,
      render: (_, item) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewTasks(item)}
          style={{
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            background: "#008cba",
            borderColor: "#008cba",
          }}
        >
          View Tasks
        </Button>
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div className="asc-page">
        {/* Header Bar */}
        <header className="asc-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                All Employees Task Scorecard
              </Title>
             
            </div>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: "block" }}>
              Comprehensive performance & task assignment scorecard across all registered employees.
            </Text>
          </div>

          <div className="asc-header-actions">
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              disabled={loadingEmployees || employeeScorecards.length === 0}
              className="asc-download-btn"
            >
              Download Excel
            </Button>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "cards", icon: <AppstoreOutlined />, label: "Scorecards" },
                { value: "table", icon: <BarsOutlined />, label: "Table" },
              ]}
              style={{ fontWeight: 600 }}
            />
          </div>
        </header>

        {/* Loading Progress Bar when fetching per-user tasks */}
        {loadingTasks && progress.total > 0 && (
          <div className="asc-progress-bar-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>
                Fetching employee tasks...
              </Text>
              <Text style={{ fontSize: 12, color: "#64748b" }}>
                {progress.loaded} of {progress.total} loaded
              </Text>
            </div>
            <Progress
              percent={Math.round((progress.loaded / progress.total) * 100)}
              size="small"
              strokeColor={PRIMARY}
            />
          </div>
        )}

        {/* Top Summary KPI Cards */}
        <section className="asc-stats">
          <StatCard
            label="Total Employees"
            value={overallSummary.totalEmployees}
            subtext={`${overallSummary.employeesWithTasks} have tasks assigned`}
            tone="total"
            icon={<TeamOutlined />}
          />
          <StatCard
            label="Total Tasks"
            value={overallSummary.totalTasks}
            subtext="Across all employees"
            tone="assigned"
            icon={<UnorderedListOutlined />}
          />
          <StatCard
            label="Completed Tasks"
            value={overallSummary.completedTasks}
            subtext={`${overallSummary.completionRate}% completion rate`}
            tone="completed"
            icon={<CheckCircleOutlined />}
          />
          <StatCard
            label="In Progress / Assigned"
            value={overallSummary.assignedTasks + overallSummary.acceptedTasks}
            subtext={`${overallSummary.assignedTasks} assigned, ${overallSummary.acceptedTasks} accepted`}
            tone="accepted"
            icon={<ClockCircleOutlined />}
          />
          <StatCard
            label="On Hold"
            value={overallSummary.holdTasks}
            subtext="Pending action"
            tone="hold"
            icon={<ClockCircleOutlined />}
          />
          <StatCard
            label="Rejected"
            value={overallSummary.rejectedTasks}
            subtext="Declined tasks"
            tone="rejected"
            icon={<CloseCircleOutlined />}
          />
        </section>

        {/* Search, Filter & Sort Controls */}
        {/* <div className="asc-controls-bar">
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} sm={10} md={8}>
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search employee, email, ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 8 }}
              />
            </Col>

            <Col xs={24} sm={14} md={16}>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: 170 }}
                >
                  <Option value="all">All Employees ({employeeScorecards.length})</Option>
                  <Option value="has_tasks">With Tasks ({overallSummary.employeesWithTasks})</Option>
                  <Option value="high_rate">High Completion (≥80%)</Option>
                  <Option value="has_pending">Has Pending Tasks</Option>
                  <Option value="no_tasks">No Tasks (0)</Option>
                </Select>

                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 170 }}
                >
                  <Option value="total">Sort: Highest Tasks</Option>
                  <Option value="completed">Sort: Most Completed</Option>
                  <Option value="rate">Sort: Completion Rate</Option>
                  <Option value="assigned">Sort: Most Assigned</Option>
                  <Option value="name">Sort: Name (A-Z)</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </div> */}

        {/* Content Section: Cards View or Table View */}
        {loadingEmployees ? (
          <div className="asc-loading">
            <Spin size="large" />
            <span>Loading employees scorecard…</span>
          </div>
        ) : filteredScorecards.length === 0 ? (
          <div className="asc-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchText || filterType !== "all"
                  ? "No employee scorecards match your search or filter."
                  : "No registered employees found."
              }
            />
            {(searchText || filterType !== "all") && (
              <Button
                onClick={() => {
                  setSearchText("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === "cards" ? (
          /* ─── Scorecards Grid View ─── */
          <>
            <div className="asc-scorecard-grid">
              {paginatedScorecards.map((emp) => {
                const firstLetter = (emp.name || "E").trim().charAt(0).toUpperCase();

                return (
                  <Card
                    key={emp.userId || emp.mail}
                    className="asc-card"
                    hoverable
                  >
                    {/* Top Row: Avatar + Employee Name + Action */}
                    <div className="asc-card-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                       
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3
                            className="asc-card-name"
                            onClick={() => handleViewTasks(emp)}
                            title={emp.name || "—"}
                          >
                            {emp.name || "—"}
                          </h3>
                          {emp.mail && (
                            <div style={{ marginTop: 2 }}>
                              <span className="asc-email-text" title={emp.mail}>
                                {emp.mail}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="asc-total-badge">
                          <span className="asc-total-number">{emp.total}</span>
                          <span className="asc-total-label">TASKS</span>
                        </div>
                      </div>
                    </div>

                    {/* Completion Progress Bar */}
                    <div style={{ marginTop: 14, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                          COMPLETION RATE
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: emp.rate === 100 ? "#1ab394" : "#0f172a",
                          }}
                        >
                          {emp.rate}% ({emp.completed}/{emp.total})
                        </Text>
                      </div>
                      <Progress
                        percent={emp.rate}
                        size="small"
                        showInfo={false}
                        strokeColor="#1ab394"
                        trailColor="#f1f5f9"
                      />
                    </div>

                    {/* Breakdown Scorecard Metrics */}
                    <div className="asc-breakdown-grid">
                      <div className="asc-breakdown-item">
                        <small>Completed</small>
                        <strong style={{ color: "#1ab394" }}>{emp.completed}</strong>
                      </div>
                      <div className="asc-breakdown-item">
                        <small>Assigned</small>
                        <strong>{emp.assigned}</strong>
                      </div>
                      <div className="asc-breakdown-item">
                        <small>Accepted</small>
                        <strong>{emp.accepted}</strong>
                      </div>
                      <div className="asc-breakdown-item">
                        <small>On Hold</small>
                        <strong>{emp.hold}</strong>
                      </div>
                      <div className="asc-breakdown-item">
                        <small>Rejected</small>
                        <strong>{emp.rejected}</strong>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="asc-card-footer">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTasks(emp)}
                        className="asc-view-tasks-btn"
                        block
                      >
                        View Tasks ({emp.total})
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination for Card View */}
            {filteredScorecards.length > pagination.pageSize && (
              <div className="asc-pagination">
                <Table
                  dataSource={[]}
                  columns={[]}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredScorecards.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["12", "24", "48", "96"],
                    onChange: (page, pageSize) =>
                      setPagination({ current: page, pageSize }),
                    showTotal: (total, range) =>
                      `${range[0]}–${range[1]} of ${total} employees`,
                  }}
                />
              </div>
            )}
          </>
        ) : (
          /* ─── Scorecards Table View ─── */
          <div className="asc-table-wrap">
            <Table
              columns={tableColumns}
              dataSource={filteredScorecards}
              rowKey={(item) => item.userId || item.mail}
              size="middle"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total} employees`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .asc-page { min-height: 100%; padding: 22px 26px; background: white; color: #0f172a; }
        .asc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
        .asc-header-actions { display: flex; align-items: center; gap: 10px; }
        
        .asc-progress-bar-card { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 18px; }

        .asc-stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
        .asc-stat { min-height: 90px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; box-shadow: 0 2px 8px rgba(15,23,42,.02); transition: all .2s ease; }
        .asc-stat:hover { border-color: #cbd5e1; box-shadow: 0 6px 16px rgba(15,23,42,.05); }
        .asc-stat span { display: block; margin-bottom: 4px; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .asc-stat strong { font-size: 24px; line-height: 1; font-weight: 800; color: #0f172a; }
        .asc-stat small { display: block; font-size: 11px; color: #94a3b8; margin-top: 4px; }
        .asc-stat__icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border-radius: 12px; font-size: 19px; }
        .asc-stat--total .asc-stat__icon { color: #2563eb; background: #eff6ff; }
        .asc-stat--assigned .asc-stat__icon { color: #2563eb; background: #eff6ff; }
        .asc-stat--accepted .asc-stat__icon { color: #0d9488; background: #f0fdfa; }
        .asc-stat--hold .asc-stat__icon { color: #d97706; background: #fffbeb; }
        .asc-stat--completed .asc-stat__icon { color: #1ab394; background: #e6f9f5; }
        .asc-stat--rejected .asc-stat__icon { color: #dc2626; background: #fef2f2; }

        .asc-scorecard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .asc-card { border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 2px 8px rgba(15,23,42,.025); transition: all 0.2s ease; }
        .asc-card:hover { transform: translateY(-2px); border-color: #cbd5e1; box-shadow: 0 8px 20px rgba(15,23,42,.06); }
        .asc-card .ant-card-body { padding: 16px; }
        
        .asc-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .asc-card-name { margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
        .asc-card-name:hover { color: #008cba; }
        .asc-email-text { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block; }

        .asc-total-badge { text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px 10px; min-width: 60px; }
        .asc-total-number { display: block; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; }
        .asc-total-label { font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; }

        .asc-breakdown-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 10px 6px; text-align: center; }
        .asc-breakdown-item small { display: block; font-size: 9px; font-weight: 600; color: #64748b; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.2px; }
        .asc-breakdown-item strong { display: block; font-size: 14px; font-weight: 700; color: #0f172a; }

        .asc-card-footer { margin-top: 14px; }
        .asc-view-tasks-btn { background: #008cba !important; border-color: #008cba !important; border-radius: 8px !important; font-weight: 600 !important; font-size: 12px !important; height: 34px !important; }
        .asc-view-tasks-btn:hover { background: #007aa3 !important; border-color: #007aa3 !important; }

        .asc-download-btn { background: #1ab394 !important; border-color: #1ab394 !important; color: #fff !important; border-radius: 8px !important; font-weight: 600 !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 34px !important; padding: 4px 14px !important; }
        .asc-download-btn:hover:not(:disabled) { background: #18a689 !important; border-color: #18a689 !important; color: #fff !important; }
        .asc-download-btn:disabled { background: #f5f5f5 !important; border-color: #d9d9d9 !important; color: rgba(0, 0, 0, 0.25) !important; }

        .asc-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .asc-loading, .asc-empty { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; }
        .asc-pagination { margin-top: 18px; display: flex; justify-content: flex-end; }
        .asc-pagination .ant-table { display: none; }

        @media (max-width: 1280px) {
          .asc-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .asc-page { padding: 14px 12px; }
          .asc-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .asc-stat strong { font-size: 20px; }
          .asc-scorecard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default AllEmployeesAssignScorecard;
