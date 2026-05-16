import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Alert,
  Input,
  Button,
  Typography,
  Row,
  Col,
  message,
  Grid,
  Empty,
  Spin,
  Tooltip,
  Space,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/* ─── Mobile Card ─── */
const MobileCard = ({ record, index, onToggleStatus }) => {
  const isInactive = record.testUser === true;
  const isVerified = record.emailVerified === "true";
  const createdDate = record.createdAt
    ? dayjs.utc(record.createdAt).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A")
    : "—";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "14px 16px",
        marginBottom: 10,
        border: "1px solid #e8e8e8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 12, color: "#8c8c8c", minWidth: 24, textAlign: "right" }}>
            {index}.
          </Text>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 14, color: "#1a1a1a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {record.name || "—"}
            </Text>
            {record.lastFourDigitsUserId && (
              <Text style={{ fontSize: 11, color: "#8c8c8c" }}>ID: {record.lastFourDigitsUserId}</Text>
            )}
          </div>
        </div>
        <Button
          size="small"
          onClick={() => onToggleStatus(record)}
          style={{
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: isInactive ? "#ff4d4f" : "#52c41a",
            borderColor: isInactive ? "#ffccc7" : "#b7eb8f",
            background: isInactive ? "#fff2f0" : "#f6ffed",
            minWidth: 72,
          }}
        >
          {isInactive ? "Inactive" : "Active"}
        </Button>
      </div>

      <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Text style={{ color: "#8c8c8c", minWidth: 60, fontSize: 12 }}>Email</Text>
          <Text copyable={{ tooltips: ["Copy", "Copied!"] }} style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {record.mail || "—"}
          </Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Text style={{ color: "#8c8c8c", minWidth: 60, fontSize: 12 }}>Mobile</Text>
          <Text copyable={{ tooltips: ["Copy", "Copied!"] }} style={{ fontSize: 12 }}>{record.empNumber || "—"}</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Text style={{ color: "#8c8c8c", minWidth: 60, fontSize: 12 }}>Verified</Text>
          <Text style={{ fontSize: 12, color: isVerified ? "#52c41a" : "#ff4d4f" }}>{isVerified ? "Yes" : "No"}</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Text style={{ color: "#8c8c8c", minWidth: 60, fontSize: 12 }}>Joined</Text>
          <Text style={{ fontSize: 12, color: "#595959" }}>{createdDate}</Text>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ Main Component ═══════════════ */
const EmployeeRegisteredUsers = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/user-service/getAllEmployees`);
      const sorted = (response.data || []).sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
      setEmployees(sorted);
      setFilteredEmployees(sorted);
    } catch {
      setError("Failed to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrent(1);
    const q = value.toLowerCase();
    setFilteredEmployees(
      employees.filter(
        (emp) =>
          (emp.name || "").toLowerCase().includes(q) ||
          (emp.mail || "").toLowerCase().includes(q) ||
          (emp.lastFourDigitsUserId || "").toLowerCase().includes(q) ||
          (emp.empNumber || "").toLowerCase().includes(q),
      ),
    );
  };

  const handleReset = () => {
    setSearchText("");
    setCurrent(1);
    setFilteredEmployees(employees);
  };

  const handleToggleStatus = async (record) => {
    const testUser = !record.testUser;
    try {
      await axiosInstance.patch(
        `${BASE_URL}/user-service/updateEmployeeInActive`,
        {},
        { params: { testUser, userId: record.userId } },
      );
      message.success(`"${record.name}" marked as ${testUser ? "Inactive" : "Active"}`);
      fetchEmployees();
    } catch {
      message.error("Failed to update status. Please try again.");
    }
  };

  const handleTableChange = (pag) => {
    setCurrent(pag.current);
    setPageSize(pag.pageSize);
  };

  /* ─── Table Columns ─── */
  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
     
      render: (_, __, index) => (
        <Text style={{ fontSize: 13, color: "#595959", fontWeight: 600 }}>
          {(current - 1) * pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "User ID",
      dataIndex: "lastFourDigitsUserId",
      align: "center",
     
      render: (v) => (
        <Text style={{ fontSize: 12, color: "#595959", fontFamily: "monospace" }}>
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
      
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (text) => (
        <Text strong style={{ color: "#1a1a1a", fontSize: 13 }}>
          {text || "—"}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "mail",
      align: "left",
    
      render: (text) => (
        <Text copyable={{ tooltips: ["Copy", "Copied!"] }} style={{ fontSize: 13, color: "#595959" }}>
          {text || "—"}
        </Text>
      ),
    },
    {
      title: "Verified",
      dataIndex: "emailVerified",
      align: "center",
    
      render: (verified) => {
        const yes = verified === "true";
        return (
          <Text style={{ fontSize: 12, fontWeight: 600, color: yes ? "#52c41a" : "#ff4d4f" }}>
            {yes ? "Yes" : "No"}
          </Text>
        );
      },
    },
    {
      title: "Mobile",
      dataIndex: "empNumber",
      align: "center",
  
      render: (text) => (
        <Text copyable={{ tooltips: ["Copy", "Copied!"] }} style={{ fontSize: 13, color: "#595959" }}>
          {text || "—"}
        </Text>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      align: "center",
   
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date) => (
        <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
          {date ? dayjs.utc(date).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A") : "—"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "testUser",
      align: "center",
     
      filters: [
        { text: "Active", value: false },
        { text: "Inactive", value: true },
      ],
      onFilter: (value, record) => (record.testUser === true) === value,
      render: (testUser, record) => {
        const isInactive = testUser === true;
        return (
          <Tooltip title={`Click to set ${isInactive ? "Active" : "Inactive"}`}>
            <Button
              size="small"
              onClick={() => handleToggleStatus(record)}
              style={{
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: isInactive ? "#ff4d4f" : "#52c41a",
                borderColor: isInactive ? "#ffccc7" : "#b7eb8f",
                background: isInactive ? "#fff2f0" : "#f6ffed",
                minWidth: 80,
                transition: "all 0.2s ease",
              }}
            >
              {isInactive ? "Inactive" : "Active"}
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  /* ─── Mobile helpers ─── */
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const mobileData = filteredEmployees.slice((current - 1) * pageSize, current * pageSize);

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: isMobile ? 10 : 20 }}>

        {/* ══ Header card: Title LEFT | Search RIGHT — same row ══ */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 10,
            padding: isMobile ? "14px 12px" : "14px 20px",
            marginBottom: 16,
          }}
        >
          <Row gutter={[16, 12]} align="middle">
            {/* LEFT — Title + subtitle */}
            <Col xs={24} sm={12} md={10}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <UserOutlined style={{ fontSize: 16, color: "#595959" }} />
                <Title level={5} style={{ margin: 0, color: "#1a1a1a", fontWeight: 700, fontSize: 15 }}>
                  Employee Users
                </Title>
                <span
                  style={{
                    background: "#f5f5f5",
                    border: "1px solid #e8e8e8",
                    borderRadius: 20,
                    padding: "0px 10px",
                    fontSize: 11,
                    color: "#595959",
                    fontWeight: 600,
                  }}
                >
                  {employees.length} total
                </span>
              </div>
              <Text style={{ fontSize: 12, color: "#8c8c8c", marginTop: 3, display: "block" }}>
                Manage registered employee accounts and access status.
              </Text>
            </Col>

            {/* RIGHT — Search + Refresh */}
            <Col xs={24} sm={12} md={14}>
              <Row gutter={[8, 0]} justify={isMobile ? "start" : "end"} align="middle" wrap={false}>
                <Col flex="1" style={{ maxWidth: 340 }}>
                  <Input
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    placeholder="Search name, email, ID, mobile..."
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    style={{ borderRadius: 8, fontSize: 13, width: "100%" }}
                  />
                </Col>
                <Col flex="none">
                  <Tooltip title="Refresh">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => { handleReset(); fetchEmployees(); }}
                      loading={loading}
                      style={{ borderRadius: 8, marginLeft: 8 }}
                    >
                      {screens.lg ? "Refresh" : ""}
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
              {searchText && (
                <div style={{ textAlign: isMobile ? "left" : "right", marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {filteredEmployees.length} result{filteredEmployees.length !== 1 ? "s" : ""} for{" "}
                    <Text strong style={{ color: "#1a1a1a" }}>"{searchText}"</Text>
                  </Text>
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* ── Error ── */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ borderRadius: 8, marginBottom: 16 }}
            action={
              <Button size="small" onClick={fetchEmployees}>
                Retry
              </Button>
            }
          />
        )}

        {/* ── Content ── */}
        {isMobile ? (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin size="large" />
                <div style={{ marginTop: 12, color: "#8c8c8c", fontSize: 13 }}>Loading employees...</div>
              </div>
            ) : mobileData.length === 0 ? (
              <Empty
                description="No employees found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 40, background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8" }}
              />
            ) : (
              <>
                {mobileData.map((record, i) => (
                  <MobileCard
                    key={record.userId || record.mail || i}
                    record={record}
                    index={(current - 1) * pageSize + i + 1}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filteredEmployees.length)} of {filteredEmployees.length}
                  </Text>
                  <Space size={6}>
                    <Button size="small" disabled={current <= 1} onClick={() => setCurrent((p) => p - 1)} style={{ borderRadius: 6 }}>
                      Previous
                    </Button>
                    <Text style={{ fontSize: 12, color: "#595959" }}>Page {current} of {totalPages}</Text>
                    <Button size="small" disabled={current >= totalPages} onClick={() => setCurrent((p) => p + 1)} style={{ borderRadius: 6 }}>
                      Next
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Desktop Table */
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e8e8e8",
              overflow: "hidden",
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey={(record) => record.userId || record.mail}
              loading={loading}
              size="middle"
              scroll={{ x: true }}
              rowClassName={(_, i) => (i % 2 === 0 ? "emp-row-even" : "emp-row-odd")}
              pagination={{
                current,
                pageSize,
                total: filteredEmployees.length,
                showSizeChanger: true,
                pageSizeOptions: ["25", "50", "100", "200"],
                showTotal: (total, range) => (
                  <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {range[0]}–{range[1]} of {total} employees
                  </Text>
                ),
                position: ["bottomRight"],
                style: { padding: "10px 16px" },
              }}
              bordered
              onChange={handleTableChange}
              locale={{
                emptyText: (
                  <Empty description="No employees found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ),
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .emp-row-even td { background: #ffffff !important; }
        .emp-row-odd td  { background: #fafafa !important; }
        .emp-row-even:hover td,
        .emp-row-odd:hover td  { background: #f0f5ff !important; }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          color: #595959 !important;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          border-bottom: 1px solid #e8e8e8 !important;
          padding: 10px 16px !important;
        }
        .ant-table-tbody > tr > td { padding: 10px 16px !important; }
        .ant-pagination-item-active { border-color: #1677ff !important; }
        .ant-pagination-item-active a { color: #1677ff !important; }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeRegisteredUsers;
