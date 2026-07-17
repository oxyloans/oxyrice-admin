import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CompaniesLayout from "../components/CompaniesLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;
const API = `${BASE_URL}/marketing-service/campgin/daily-notifications-count`;

const DailyNotifications = () => {
  const [dates, setDates] = useState([
    dayjs().subtract(1, "month"),
    dayjs(),
  ]);
  const [organizationType, setOrganizationType] = useState("RBI");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchNotifications = useCallback(async () => {
    if (!dates?.[0] || !dates?.[1]) return;

    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(API, {
        params: {
          startDate: dates[0].format("YYYY-MM-DD"),
          endDate: dates[1].format("YYYY-MM-DD"),
          organizationType,
        },
      });

      if (response.data?.status === false) {
        throw new Error(response.data?.message || "Unable to load notifications.");
      }
      setData(response.data);
    } catch (requestError) {
      setData(null);
      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "Unable to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [dates, organizationType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const dailyData = useMemo(() => {
    const rows = [];
    Object.entries(data?.yearWiseCount || {}).forEach(([year, months]) => {
      Object.entries(months || {}).forEach(([month, entries]) => {
        (entries || []).forEach((entry) =>
          rows.push({ ...entry, year, month, key: entry.date }),
        );
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const chartData = useMemo(() => [...dailyData].reverse(), [dailyData]);

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      align: "center",
      render: (value) => dayjs(value).format("DD MMM YYYY"),
    },
    { title: "Month", dataIndex: "month", align: "center" },
    { title: "Year", dataIndex: "year", align: "center" },
    {
      title: "Notifications",
      dataIndex: "count",
      align: "center",
      sorter: (a, b) => a.count - b.count,
      render: (value) => <Text strong>{value}</Text>,
    },
  ];

  return (
    <CompaniesLayout>
      <div style={{ padding: "4px 0 32px" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ margin: 0, color: "#1a202c" }}>
              Daily RBI Document Updates
            </Title>
            <Text type="secondary">
              Track RBI notifications by organization and publication date.
            </Text>
          </Col>
          <Col>
            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} sm={6}>
                <Select
                  value={organizationType}
                  onChange={setOrganizationType}
                  options={[{ value: "RBI", label: "RBI" }]}
                  style={{ width: "100%", minWidth: 100 }}
                  aria-label="Organization type"
                />
              </Col>
              <Col xs={24} sm={9}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <DatePicker
                    value={dates[0]}
                    onChange={(date) => date && setDates([date, dates[1]])}
                    allowClear={false}
                    format="DD MMM YYYY"
                    disabledDate={(date) =>
                      date &&
                      (date.isAfter(dayjs(), "day") ||
                        date.isAfter(dates[1], "day"))
                    }
                    style={{ width: "100%", minWidth: 175 }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={9}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <DatePicker
                    value={dates[1]}
                    onChange={(date) => date && setDates([dates[0], date])}
                    allowClear={false}
                    format="DD MMM YYYY"
                    disabledDate={(date) =>
                      date &&
                      (date.isAfter(dayjs(), "day") ||
                        date.isBefore(dates[0], "day"))
                    }
                    style={{ width: "100%", minWidth: 175 }}
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError("")}
            style={{ marginTop: 20 }}
          />
        )}

        <Spin spinning={loading}>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card style={{ height: "100%", borderRadius: 12 }}>
                <Statistic
                  title="Total Notifications"
                  value={data?.totalNotifications || 0}
                  prefix={<BellOutlined style={{ color: "#008cab" }} />}
                  valueStyle={{ color: "#008cab", fontWeight: 700 }}
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Notification Trend" style={{ borderRadius: 12 }}>
                {dailyData.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData} margin={{ left: 0, right: 20 }}>
                      <defs>
                        <linearGradient
                          id="notificationFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#008cab"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#008cab"
                            stopOpacity={0.03}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => dayjs(value).format("DD MMM")}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(value) =>
                          dayjs(value).format("DD MMM YYYY")
                        }
                        formatter={(value) => [value, "Notifications"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#008cab"
                        strokeWidth={3}
                        fill="url(#notificationFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No notifications found for this period" />
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                title="Daily Breakdown"
                extra={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Latest date shown first
                  </Text>
                }
                style={{ borderRadius: 12 }}
              >
                <Table
                  columns={columns}
                  dataSource={dailyData}
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (total, range) =>
                      `${range[0]}–${range[1]} of ${total} records`,
                    showQuickJumper: dailyData.length > 20,
                    onChange: (page, size) => {
                      setCurrentPage(size !== pageSize ? 1 : page);
                      setPageSize(size);
                    },
                  }}
                  scroll={{ x: true }}
                  rowClassName={(_, index) =>
                    index % 2 === 0 ? "daily-notification-row-even" : ""
                  }
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
      <style>{`
        .daily-notification-row-even > td {
          background: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          text-align: center !important;
          font-weight: 700;
          background: #f0f7f8 !important;
        }
      `}</style>
    </CompaniesLayout>
  );
};

export default DailyNotifications;
