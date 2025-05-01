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
  Space,
} from "antd";
import { ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
const { Title, Text } = Typography;

const TodayLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);

  // Format date for API call
  const formatDateForApi = (date) => {
    return date.format("YYYY-MM-DD");
  };

  // Fetch leaves data
  const fetchLeaves = async (date = dayjs()) => {
    setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDateForApi(date);
      const response = await axios.get(
        `${BASE_URL}/user-service/write/leaves/today?specificDate=${formattedDate}`
      );

      setLeaves(response.data.leaves || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError("Failed to load leave data. Please try again later.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle date change
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Initial data fetch and refresh when date changes
  useEffect(() => {
    fetchLeaves(selectedDate);
  }, [selectedDate, refreshKey]);

  // Format the date display
  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  // Format the time display
  const formatTime = (dateTimeString) => {
    return dayjs(dateTimeString).format("hh:mm A");
  };

  // Table columns configuration
    const columns = [
      {
        title: "S.No",
        key: "serialNumber",

        render: (_, __, index) => index + 1,
        align: "center",
      },
      {
        title: "User Id",
        dataIndex: "userId",
        key: "userId",
        align: "center",
        render: (userId) => (
          <span className="text-gray-500 font-mono text-xs">
            #{userId?.substring(userId.length - 4) || "N/A"}
          </span>
        ),
      },
      {
        title: "Employee Name",
        dataIndex: "name",
        key: "name",
        align: "center",
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: "Request Date",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        render: (text) => (
          <Tooltip title={formatTime(text)}>
            <span>{formatDate(text)}</span>
          </Tooltip>
        ),
      },
      {
        title: "Leave Period",
        key: "leavePeriod",
        align: "center",
        render: (_, record) => (
          <Space>
            <span>{formatDate(record.fromDate)}</span>
            {record.fromDate !== record.endDate && (
              <>
                <span>to</span>
                <span>{formatDate(record.endDate)}</span>
              </>
            )}
          </Space>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => {
          let color = "green";
          if (status === "PENDING") color = "gold";
          if (status === "REJECTED") color = "red";

          return <Tag color={color}>{status}</Tag>;
        },
      },
      {
        title: "Reason",
        align: "center",
        dataIndex: "requestSummary",
        key: "requestSummary",
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip title={text}>
            <span>
              {text.length > 30 ? `${text.substring(0, 30)}...` : text}
            </span>
          </Tooltip>
        ),
      },
    ];

    return (
      <TaskAdminPanelLayout>
    <Card
      className="shadow-sm"
      title={
        <div className="flex justify-between items-center">
          <Title level={4} className="mb-0">
            <CalendarOutlined className="mr-2 text-blue-500" />
            Today's Leave Requests
          </Title>
          <Space>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              allowClear={false}
              className="w-40"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              type="primary"
              ghost
            >
              Refresh
            </Button>
          </Space>
        </div>
      }
    >
      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <Spin size="large" tip="Loading leave data..." />
        </div>
      ) : leaves.length > 0 ? (
        <Table
          dataSource={leaves}
          columns={columns}
          rowKey="id"
          pagination={false}
                            className="mt-4"
                            bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <Text type="secondary">
                    Total: {leaves.length} employee
                    {leaves.length !== 1 ? "s" : ""} on leave
                    {selectedDate.isSame(dayjs(), "day")
                      ? " today"
                      : ` on ${formatDate(selectedDate.format("YYYY-MM-DD"))}`}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      ) : (
        <Empty
          description={
            <span>
              No leave requests found for{" "}
              {selectedDate.isSame(dayjs(), "day")
                ? "today"
                : formatDate(selectedDate.format("YYYY-MM-DD"))}
            </span>
          }
          className="my-10"
        />
      )}
            </Card>
    </TaskAdminPanelLayout>
  );
};

export default TodayLeaves;
