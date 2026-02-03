import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Modal,
  Button,
  Tag,
  Space,
  Alert,
  Spin,
  Pagination,
  Row,
  Col,
  Typography,
  Descriptions,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Badge,
  Statistic,
  Divider,
} from "antd";
import BASE_URL from "./Config";
import {
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import AdminPanelLayoutTest from "../components/AdminPanel";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredApplications, setFilteredApplications] = useState([]);

  // W3.CSS Color Scheme
  const w3Colors = {
    primary: "#2196F3", // W3-Blue
    secondary: "#607D8B", // W3-Blue-Grey
    success: "#4CAF50", // W3-Green
    warning: "#FF9800", // W3-Orange
    danger: "#F44336", // W3-Red
    info: "#00BCD4", // W3-Cyan
    light: "#FAFAFA", // W3-Light-Grey
    dark: "#212121", // W3-Dark-Grey
    purple: "#9C27B0", // W3-Purple
    indigo: "#3F51B5", // W3-Indigo
    teal: "#009688", // W3-Teal
    amber: "#FFC107", // W3-Amber
  };

  const fetchApplications = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL}/user-service/student/all-application-users?pageIndex=${page - 1}&pageSize=${size}`,
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.data) {
        setApplications(result.data);
        setFilteredApplications(result.data);
        setTotal(result.data.length);
        message.success("Applications loaded successfully");
      } else {
        setApplications([]);
        setFilteredApplications([]);
        setTotal(0);
      }
    } catch (err) {
      const errorMsg = `Failed to fetch applications: ${err.message}`;
      setError(errorMsg);
      setApplications([]);
      setFilteredApplications([]);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    let filtered = applications;

    if (searchText) {
      filtered = filtered.filter(
        (app) =>
          app.universityName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          app.courseName?.toLowerCase().includes(searchText.toLowerCase()) ||
          app.applicationId?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.applicationStatus === statusFilter,
      );
    }

    setFilteredApplications(filtered);
  }, [applications, searchText, statusFilter]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleRefresh = () => {
    fetchApplications(currentPage, pageSize);
  };

  const getStatusConfig = (status) => {
    const statusConfigs = {
      PENDING: {
        color: w3Colors.warning,
        icon: <ClockCircleOutlined />,
        bgColor: "#FFF3E0",
        borderColor: w3Colors.warning,
      },
      APPROVED: {
        color: w3Colors.success,
        icon: <CheckCircleOutlined />,
        bgColor: "#E8F5E8",
        borderColor: w3Colors.success,
      },
      REJECTED: {
        color: w3Colors.danger,
        icon: <CloseCircleOutlined />,
        bgColor: "#FFEBEE",
        borderColor: w3Colors.danger,
      },
      UNDER_REVIEW: {
        color: w3Colors.info,
        icon: <ExclamationCircleOutlined />,
        bgColor: "#E0F2F1",
        borderColor: w3Colors.info,
      },
    };
    return (
      statusConfigs[status] || {
        color: w3Colors.secondary,
        icon: <ClockCircleOutlined />,
        bgColor: w3Colors.light,
        borderColor: w3Colors.secondary,
      }
    );
  };

  const formatIntake = (month, year) => {
    if (!month || !year) return "N/A";
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const getStatistics = () => {
    const stats = {
      total: filteredApplications.length,
      pending: filteredApplications.filter(
        (app) => app.applicationStatus === "PENDING",
      ).length,
      approved: filteredApplications.filter(
        (app) => app.applicationStatus === "APPROVED",
      ).length,
      rejected: filteredApplications.filter(
        (app) => app.applicationStatus === "REJECTED",
      ).length,
      underReview: filteredApplications.filter(
        (app) => app.applicationStatus === "UNDER_REVIEW",
      ).length,
    };
    return stats;
  };

  const statistics = getStatistics();

  const columns = [
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>App ID</div>
      ),
      dataIndex: "applicationId",
      key: "applicationId",
      align: "center",
      render: (text) => (
        <Tooltip title={text}>
          <div>#{text?.slice(-4)}</div>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>
          University
        </div>
      ),
      dataIndex: "universityName",
      key: "universityName",
      align: "center",
      render: (text) => (
        <div className="flex items-center justify-center gap-2">
          <span style={{ color: w3Colors.dark, fontWeight: "500" }}>
            {text || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: (
        <div
          style={{
            color: w3Colors.dark,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Course
        </div>
      ),
      dataIndex: "courseName",
      key: "courseName",
      align: "center",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              whiteSpace: "normal", // allows text to wrap
              textAlign: "center", // center the text content
              color: w3Colors.dark,
              fontWeight: "500",
              margin: "0 auto",
            }}
          >
            {text || "N/A"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>Duration</div>
      ),
      dataIndex: "duration",
      key: "duration",
      align: "center",
      render: (text) => (
        <Badge
          count={text || "N/A"}
          style={{
            backgroundColor: w3Colors.indigo,
            color: "white",
            fontWeight: "500",
          }}
        />
      ),
    },
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>Intake</div>
      ),
      key: "intake",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <CalendarOutlined style={{ color: w3Colors.teal }} />
          <span style={{ color: w3Colors.dark, fontWeight: "500" }}>
            {formatIntake(record.intakeMonth, record.intakeYear)}
          </span>
        </div>
      ),
    },
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>Status</div>
      ),
      dataIndex: "applicationStatus",
      key: "applicationStatus",
      align: "center",
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              color: config.color,
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            {config.icon}
            {status}
          </div>
        );
      },
    },
    {
      title: (
        <div style={{ color: w3Colors.dark, fontWeight: "600" }}>Actions</div>
      ),
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          style={{
            backgroundColor: w3Colors.primary,
            borderColor: w3Colors.primary,
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleExport = () => {
    message.info("Export functionality would be implemented here");
  };

  return (
    <AdminPanelLayoutTest>
      <div
        style={{
          padding: "14px",

          minHeight: "100vh",
        }}
      >
        {/* Header Card */}

        <div style={{ color: "white" }}>
          <Title
            level={2}
            style={{
              color: "black",
              margin: "0 0 8px 0",
              marginBottom: "24px",
            }}
          >
            Student Applications Dashboard
          </Title>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card
              style={{
                borderRadius: "8px",
                backgroundColor: w3Colors.light,
                border: `1px solid ${w3Colors.secondary}`,
              }}
            >
              <Statistic
                title="Total Applications"
                value={statistics.total}
                valueStyle={{ color: w3Colors.dark, fontWeight: "600" }}
                prefix={<BookOutlined style={{ color: w3Colors.primary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card
              style={{
                borderRadius: "8px",
                backgroundColor: "#FFF3E0",
                border: `1px solid ${w3Colors.warning}`,
              }}
            >
              <Statistic
                title="Pending"
                value={statistics.pending}
                valueStyle={{ color: w3Colors.warning, fontWeight: "600" }}
                prefix={
                  <ClockCircleOutlined style={{ color: w3Colors.warning }} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card
              style={{
                borderRadius: "8px",
                backgroundColor: "#E8F5E8",
                border: `1px solid ${w3Colors.success}`,
              }}
            >
              <Statistic
                title="Approved"
                value={statistics.approved}
                valueStyle={{ color: w3Colors.success, fontWeight: "600" }}
                prefix={
                  <CheckCircleOutlined style={{ color: w3Colors.success }} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card
              style={{
                borderRadius: "8px",
                backgroundColor: "#E0F2F1",
                border: `1px solid ${w3Colors.info}`,
              }}
            >
              <Statistic
                title="Under Review"
                value={statistics.underReview}
                valueStyle={{ color: w3Colors.info, fontWeight: "600" }}
                prefix={
                  <ExclamationCircleOutlined style={{ color: w3Colors.info }} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card
              style={{
                borderRadius: "8px",
                backgroundColor: "#FFEBEE",
                border: `1px solid ${w3Colors.danger}`,
              }}
            >
              <Statistic
                title="Rejected"
                value={statistics.rejected}
                valueStyle={{ color: w3Colors.danger, fontWeight: "600" }}
                prefix={
                  <CloseCircleOutlined style={{ color: w3Colors.danger }} />
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Controls Section */}
          <div style={{ marginBottom: "24px" }}>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
              <div>
                <Title
                  level={3}
                  style={{ margin: "0 0 8px 0", color: w3Colors.dark }}
                >
                  Applications Management
                </Title>
                <Text style={{ color: w3Colors.secondary }}>
                  Search, filter, and manage student applications
                </Text>
              </div>
              <Space wrap>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  style={{
                    borderColor: w3Colors.teal,
                    color: w3Colors.teal,
                    borderRadius: "6px",
                  }}
                >
                  Export Data
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  style={{
                    backgroundColor: w3Colors.primary,
                    borderColor: w3Colors.primary,
                    borderRadius: "6px",
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={10}>
                <Search
                  placeholder="Search by university, course, or application ID..."
                  allowClear
                  enterButton={<SearchOutlined style={{ color: "white" }} />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    "& .ant-btn-primary": {
                      backgroundColor: w3Colors.primary,
                      borderColor: w3Colors.primary,
                    },
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Filter by status"
                  size="large"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  suffixIcon={
                    <FilterOutlined style={{ color: w3Colors.secondary }} />
                  }
                >
                  <Option value="all">All Status</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="REJECTED">Rejected</Option>
                  <Option value="UNDER_REVIEW">Under Review</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <div className="flex justify-end items-center gap-4">
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: w3Colors.light,
                      borderRadius: "6px",
                      border: `1px solid ${w3Colors.secondary}`,
                      color: w3Colors.dark,
                      fontWeight: "500",
                    }}
                  >
                    Showing:{" "}
                    <strong style={{ color: w3Colors.primary }}>
                      {filteredApplications.length}
                    </strong>{" "}
                    of{" "}
                    <strong style={{ color: w3Colors.primary }}>{total}</strong>{" "}
                    applications
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {error && (
            <Alert
              message="Error Loading Applications"
              description={error}
              type="error"
              showIcon
              closable
              style={{
                marginBottom: "24px",
                borderRadius: "8px",
                borderColor: w3Colors.danger,
              }}
            />
          )}

          <Spin spinning={loading} tip="Loading applications..." size="large">
            <Table
              columns={columns}
              dataSource={filteredApplications}
              rowKey="applicationId"
              scroll={{ x: 1400 }}
              size="middle"
              bordered
              style={{
                "& .ant-table": {
                  borderRadius: "8px",
                },
                "& .ant-table-thead > tr > th": {
                  backgroundColor: w3Colors.light,
                  borderColor: w3Colors.secondary,
                  fontWeight: "600",
                },
                "& .ant-table-tbody > tr:hover > td": {
                  backgroundColor: "#E3F2FD",
                },
              }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredApplications.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} applications`,
                onChange: handlePageChange,
                pageSizeOptions: ["10", "20", "50", "100"],
                style: {
                  padding: "16px 0",
                },
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "" : "bg-gray-25"
              }
            />
          </Spin>
        </Card>

        {/* Enhanced Modal */}
        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 0",
                color: w3Colors.dark,
              }}
            >
              <div
                style={{
                  padding: "8px",
                  borderRadius: "50%",
                  backgroundColor: w3Colors.primary,
                }}
              >
                <UserOutlined style={{ color: "white", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>
                  Application Details
                </div>
                <div style={{ fontSize: "12px", color: w3Colors.secondary }}>
                  Complete application information
                </div>
              </div>
            </div>
          }
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setShowModal(false)}
              style={{
                borderColor: w3Colors.secondary,
                color: w3Colors.secondary,
                borderRadius: "6px",
              }}
            >
              Close
            </Button>,
          ]}
          width={900}
          style={{
            "& .ant-modal-content": {
              borderRadius: "12px",
            },
          }}
        >
          {selectedApplication && (
            <div style={{ padding: "20px 0" }}>
              <Descriptions
                bordered
                column={2}
                size="middle"
                labelStyle={{
                  fontWeight: "600",
                  backgroundColor: w3Colors.light,
                  color: w3Colors.dark,
                  borderColor: w3Colors.secondary,
                }}
                contentStyle={{
                  backgroundColor: "white",
                  borderColor: w3Colors.secondary,
                }}
              >
                <Descriptions.Item label="Application ID" span={2}>
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: w3Colors.light,
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      border: `1px solid ${w3Colors.secondary}`,
                      color: w3Colors.dark,
                      display: "inline-block",
                    }}
                  >
                    #{selectedApplication.applicationId}
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="University">
                  <div className="flex items-center gap-2">
                    <BookOutlined style={{ color: w3Colors.primary }} />
                    <span style={{ fontWeight: "500" }}>
                      {selectedApplication.universityName || "N/A"}
                    </span>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                  {(() => {
                    const config = getStatusConfig(
                      selectedApplication.applicationStatus,
                    );
                    return (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          backgroundColor: config.bgColor,
                          border: `1px solid ${config.borderColor}`,
                          color: config.color,
                          fontWeight: "600",
                        }}
                      >
                        {config.icon}
                        {selectedApplication.applicationStatus}
                      </div>
                    );
                  })()}
                </Descriptions.Item>

                <Descriptions.Item label="Course Name" span={2}>
                  <span style={{ fontWeight: "500", color: w3Colors.dark }}>
                    {selectedApplication.courseName || "N/A"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Duration">
                  <Badge
                    count={selectedApplication.duration || "N/A"}
                    style={{
                      backgroundColor: w3Colors.indigo,
                      color: "white",
                      fontWeight: "500",
                    }}
                  />
                </Descriptions.Item>

                <Descriptions.Item label="Intake Period">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined style={{ color: w3Colors.teal }} />
                    <span style={{ fontWeight: "500" }}>
                      {formatIntake(
                        selectedApplication.intakeMonth,
                        selectedApplication.intakeYear,
                      )}
                    </span>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="User ID" span={2}>
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#F3E5F5",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      border: `1px solid ${w3Colors.purple}`,
                      color: w3Colors.purple,
                      display: "inline-block",
                      fontWeight: "500",
                    }}
                  >
                    {selectedApplication.userId}
                  </div>
                </Descriptions.Item>

                {selectedApplication.message && (
                  <Descriptions.Item label="Additional Message" span={2}>
                    <div
                      style={{
                        backgroundColor: "#E3F2FD",
                        padding: "16px",
                        borderRadius: "8px",
                        borderLeft: `4px solid ${w3Colors.primary}`,
                        fontStyle: "italic",
                        color: w3Colors.dark,
                        lineHeight: "1.6",
                      }}
                    >
                      "{selectedApplication.message}"
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default StudentApplications;
