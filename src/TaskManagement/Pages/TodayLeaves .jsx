import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Spin,
  Empty,
  Alert,
  DatePicker,
  Button,
  Tooltip,
  Typography,
  Row,
  Col,
  Space,
  Modal,
  Input,
  message,
  Tabs,
  Badge,
} from "antd";
import {
  ReloadOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [actionModal, setActionModal] = useState({
    visible: false,
    leaveId: null,
    userId: null,
    action: null,
    comments: "",
    processing: false,
  });

  const formatDateForApi = (date) => {
    return date.format("YYYY-MM-DD");
  };

  const fetchLeaves = async (date = dayjs()) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (activeTab === "byDate") {
        const formattedDate = formatDateForApi(date);
        response = await axios.get(
          `${BASE_URL}/user-service/write/leaves/today?specificDate=${formattedDate}`
        );
      } else {
        response = await axios.get(`${BASE_URL}/user-service/write/leaves/all`);
      }

      setLeaves(response.data.leaves || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError("Failed to load leave data. Please try again later.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTabChange = (activeKey) => {
    setActiveTab(activeKey);
  };

  useEffect(() => {
    fetchLeaves(selectedDate);
  }, [selectedDate, refreshKey, activeTab]);

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const formatTime = (dateTimeString) => {
    return dayjs(dateTimeString).format("hh:mm A");
  };

  const showActionModal = (leaveId, userId, action) => {
    setActionModal({
      visible: true,
      leaveId,
      userId,
      action,
      comments: "",
      processing: false,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      visible: false,
      leaveId: null,
      userId: null,
      action: null,
      comments: "",
      processing: false,
    });
  };

  const handleCommentsChange = (e) => {
    setActionModal({
      ...actionModal,
      comments: e.target.value,
    });
  };

  const handleLeaveAction = async () => {
    setActionModal({ ...actionModal, processing: true });

    try {
      const adminId = "28bde0dd-541e-48ea-ac79-007b510ef42a";
      const requestData = {
        adminComments: actionModal.comments,
        adminId: adminId,
        adminStatus: actionModal.action === "approve" ? "APPROVED" : "REJECTED",
        id: actionModal.leaveId,
        userId: actionModal.userId,
      };

      await axios.patch(
        `${BASE_URL}/user-service/write/adminApproval`,
        requestData
      );

      setActionModal({
        visible: false,
        leaveId: null,
        userId: null,
        action: null,
        comments: "",
        processing: false,
      });

      message.success(
        `Leave request ${actionModal.action === "approve" ? "approved" : "rejected"} successfully`
      );
      handleRefresh();
    } catch (err) {
      console.error("Error processing leave action:", err);
      message.error("Failed to process action. Please try again later.");
      setActionModal({ ...actionModal, processing: false });
    }
  };

  const getPendingCount = () => {
    return leaves.filter(
      (leave) => !leave.adminStatus || leave.adminStatus === "PENDING"
    ).length;
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 60,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      width: 100,
      render: (userId) => (
        <span className="font-mono text-xs text-gray-600">
          #{userId?.substring(userId.length - 4) || "N/A"}
        </span>
      ),
    },
    {
      title: "Employee Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 150,
      render: (text) => (
        <Text strong className="text-gray-800">
          {text}
        </Text>
      ),
    },
    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 130,
      render: (text) => (
        <Tooltip title={formatTime(text)}>
          <span className="text-gray-600">{formatDate(text)}</span>
        </Tooltip>
      ),
    },
    {
      title: "Leave Period",
      key: "leavePeriod",
      align: "center",
      width: 230,
      render: (_, record) => (
        <Space>
          <span className="text-gray-600">{formatDate(record.fromDate)}</span>
          {record.fromDate !== record.endDate && (
            <>
              <span className="text-gray-400">to</span>
              <span className="text-gray-600">
                {formatDate(record.endDate)}
              </span>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Employee Reason",
      dataIndex: "requestSummary",
      key: "requestSummary",
      width: 290,
      render: (text) => (
        <Tooltip title={text}>
          <Paragraph
            ellipsis={{ rows: 2, expandable: false }}
            className="text-xs m-0 max-w-[200px] sm:max-w-[250px] text-gray-600"
          >
            {text}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 110,
      render: (status, record) => {
        let color = "green";
        if (status === "PENDING" || !record.adminStatus) color = "orange";
        if (status === "REJECTED" || record.adminStatus === "REJECTED")
          color = "red";

        return (
          <Tag color={color} className="font-medium">
            {record.adminStatus || status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 180,
      render: (_, record) => (
        <Space size="small" wrap className="flex justify-center">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => showActionModal(record.id, record.userId, "approve")}
            disabled={record.adminStatus === "APPROVED"}
            className="bg-[#008CBA] hover:bg-[#008CBA] transition-colors duration-200"
            aria-label={`Approve leave request for ${record.name}`}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => showActionModal(record.id, record.userId, "reject")}
            disabled={record.adminStatus === "REJECTED"}
            className="bg-[#f44336] hover:[#f44336] transition-colors duration-200"
            aria-label={`Reject leave request for ${record.name}`}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const renderLeaveData = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Spin size="large" tip="Loading leave data..." />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-4 rounded-lg shadow-sm"
        />
      );
    }

    if (leaves.length === 0) {
      return (
        <Empty
          description={
            <span className="text-gray-600">
              No leave requests found
              {activeTab === "byDate"
                ? selectedDate.isSame(dayjs(), "day")
                  ? " for today"
                  : ` for ${formatDate(selectedDate.format("YYYY-MM-DD"))}`
                : ""}
            </span>
          }
          className="my-10"
        />
      );
    }

    return (
      <Table
        dataSource={leaves}
        columns={columns}
        rowKey="id"
        pagination={{
          responsive: true,
          size: "small",
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        className="mt-4 rounded-lg shadow-sm"
        scroll={{ x: 1000 }}
        bordered
        rowClassName={(record, index) =>
          index % 2 === 0
            ? "bg-gray-50 hover:bg-gray-100"
            : "bg-white hover:bg-gray-100"
        }
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={8}>
                <Text type="secondary" className="text-gray-600">
                  Total: {leaves.length} leave request
                  {leaves.length !== 1 ? "s" : ""}
                  {activeTab === "byDate"
                    ? selectedDate.isSame(dayjs(), "day")
                      ? " for today"
                      : ` for ${formatDate(selectedDate.format("YYYY-MM-DD"))}`
                    : " across all dates"}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    );
  };

  const renderDatePicker = () => {
    if (activeTab === "byDate") {
      return (
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          allowClear={false}
          className="w-full sm:w-auto border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
          aria-label="Select date for leave requests"
        />
      );
    }
    return null;
  };

  return (
    <TaskAdminPanelLayout>
      <Card
        className="shadow-md rounded-xl bg-white"
        title={
          <Row
            justify="space-between"
            align="middle"
            gutter={[8, 16]}
            className="w-full"
          >
            <Col xs={24} sm={12}>
              <Title
                level={4}
                className="mb-0 text-lg sm:text-xl md:text-2xl text-gray-800 font-bold"
              >
                <CalendarOutlined className="mr-2 text-blue-600" />
                Leave Management
              </Title>
            </Col>
            <Col xs={24} sm={12}>
              <Row justify="end" gutter={[8, 8]} wrap>
                <Col xs={12} sm={6}>
                  {renderDatePicker()}
                </Col>
                <Col xs={12} sm={6}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    type="primary"
                    className="w-full bg-[#008CBA] hover:bg-[#008CBA] transition-colors duration-200 rounded-lg"
                    aria-label="Refresh leave data"
                  >
                    Refresh
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        }
        bodyStyle={{ padding: "16px", overflow: "auto" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          className="leave-tabs"
          tabBarStyle={{ marginBottom: "16px" }}
        >
          <TabPane
            tab={
              <span className="flex items-center">
                <FileTextOutlined />
                <span className="ml-1">All Leaves</span>
                {getPendingCount() > 0 && (
                  <Badge
                    count={getPendingCount()}
                    offset={[10, -5]}
                    size="small"
                  />
                )}
              </span>
            }
            key="all"
          >
            {renderLeaveData()}
          </TabPane>
          <TabPane
            tab={
              <span className="flex items-center">
                <CalendarOutlined />
                <span className="ml-1">By Date</span>
                {getPendingCount() > 0 && (
                  <Badge
                    count={getPendingCount()}
                    offset={[10, -5]}
                    size="small"
                  />
                )}
              </span>
            }
            key="byDate"
          >
            {renderLeaveData()}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <span className="text-lg font-semibold text-gray-800">
            {actionModal.action === "approve" ? "Approve" : "Reject"} Leave
            Request
          </span>
        }
        open={actionModal.visible}
        onCancel={closeActionModal}
        footer={[
          <Button
            key="cancel"
            onClick={closeActionModal}
            disabled={actionModal.processing}
            className="border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg"
            aria-label="Cancel action"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type={actionModal.action === "approve" ? "primary" : "danger"}
            onClick={handleLeaveAction}
            loading={actionModal.processing}
            icon={
              actionModal.action === "approve" ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
            className={
              actionModal.action === "approve"
                ? "bg-green-600 hover:bg-green-700 rounded-lg"
                : "bg-red-600 hover:bg-red-700 rounded-lg"
            }
            aria-label={`${actionModal.action === "approve" ? "Approve" : "Reject"} leave request`}
          >
            {actionModal.action === "approve" ? "Approve" : "Reject"}
          </Button>,
        ]}
        className="rounded-lg"
      >
        <div className="mb-4">
          <Text strong className="text-gray-700">
            Comments:
          </Text>
          <TextArea
            rows={4}
            value={actionModal.comments}
            onChange={handleCommentsChange}
            placeholder={`Enter comments for ${actionModal.action} (optional)`}
            className="mt-2 border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
            aria-label="Enter comments for leave action"
          />
        </div>
      </Modal>

      <style jsx global>{`
        .leave-tabs .ant-tabs-nav {
          margin-bottom: 16px;
          background: #ffffff;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .leave-tabs .ant-tabs-tab {
          padding: 8px 16px;
          font-weight: 500;
          border-radius: 6px;
        }
        .leave-tabs .ant-tabs-tab-active {
          background: #e6f4ff;
        }
        .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #1f2937;
        }
        .ant-table-row {
          transition: background-color 0.2s ease;
        }
        .ant-table-row:hover {
          background-color: #f1f5f9 !important;
        }
        .ant-card {
          border: 1px solid #e5e7eb;
        }
        .ant-modal {
          max-width: 90%;
        }
        @media (max-width: 768px) {
          .leave-tabs .ant-tabs-tab {
            padding: 6px 12px;
            font-size: 14px;
          }
          .ant-table {
            font-size: 12px;
          }
          .ant-table-tbody > tr > td {
            padding: 8px;
          }
          .ant-card-body {
            padding: 12px;
          }
          .ant-btn {
            padding: 4px 8px;
            font-size: 12px;
          }
          .ant-modal {
            padding: 16px;
          }
        }
        @media (max-width: 480px) {
          .leave-tabs .ant-tabs-tab {
            padding: 4px 8px;
            font-size: 12px;
          }
          .ant-table {
            font-size: 10px;
          }
          .ant-table-tbody > tr > td {
            padding: 6px;
          }
          .ant-card-title {
            font-size: 16px;
          }
          .ant-btn {
            padding: 4px 6px;
            font-size: 10px;
          }
          .ant-modal {
            padding: 12px;
          }
          .ant-row {
            flex-direction: column;
            align-items: stretch;
          }
          .ant-col {
            width: 100%;
          }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default LeaveManagement;
