import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Button,
  Statistic,
  Spin,
  Alert,
  Divider,
  Grid,
} from "antd";
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import CompaniesLayout from "../components/CompaniesLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const API = `${BASE_URL}/marketing-service/campgin/exam-flow/stats/summary`;

const ELIGIBILITY_COLORS = ["#1677ff", "#52c41a", "#f5222d"];
const EXAM_COLORS = ["#bfbfbf", "#1677ff", "#fa8c16", "#52c41a", "#f5222d"];

/* ── Stat Card ── */
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 14,
      background: bgColor || `${color}12`,
      height: "100%",
      border: `1.5px solid ${color}30`,
    }}
    bodyStyle={{ padding: "18px 20px" }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        height: "100%",
      }}
    >
      <Statistic
        value={value ?? 0}
        valueStyle={{ color, fontWeight: 800, fontSize: 28, lineHeight: 1 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: `${color}cc`,
          fontWeight: 600,
          marginTop: 4,
          display: "block",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </div>
  </Card>
);

/* ── Custom Pie Label ── */
const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── Section Header ── */
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon}
      <Title level={5} style={{ margin: 0, color: "#1a202c", fontWeight: 700 }}>
        {title}
      </Title>
    </div>
    <Text type="secondary" style={{ fontSize: 12, marginLeft: 28 }}>
      {subtitle}
    </Text>
  </div>
);

/* ── Main Page ── */
const ExamFlowDashboard = () => {
  const screens = useBreakpoint();
  const [fromDate, setFromDate] = useState(dayjs().subtract(4, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (from, to) => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(API, {
        params: {
          startDate: from.format("YYYY-MM-DD"),
          endDate: to.format("YYYY-MM-DD"),
        },
      });
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to fetch stats. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(fromDate, toDate);
  }, [fromDate, toDate, fetchStats]);

  const { eligibilityStats: eli, examStatusStats: exam } = data || {};

  const eligibilityBarData = data
    ? [
        { name: "Total Applied", value: eli?.totalApplied || 0 },
        { name: "Selected", value: eli?.selected || 0 },
        { name: "Not Selected", value: eli?.notSelected || 0 },
      ]
    : [];

  const eligibilityPieData = data
    ? [
        { name: "Selected", value: eli?.selected || 0 },
        { name: "Not Selected", value: eli?.notSelected || 0 },
      ]
    : [];

  const examBarData = data
    ? [
        { name: "Not Started", value: exam?.NOT_STARTED || 0 },
        { name: "Started", value: exam?.STARTED || 0 },
        { name: "Partial", value: exam?.PARTIAL_COMPLETED || 0 },
        { name: "Eligible", value: exam?.COMPLETED_ELIGIBLE || 0 },
        { name: "Not Eligible", value: exam?.COMPLETED_NOT_ELIGIBLE || 0 },
      ]
    : [];

  const examPieData = data
    ? [
        { name: "Not Started", value: exam?.NOT_STARTED || 0 },
        { name: "Started", value: exam?.STARTED || 0 },
        { name: "Partial", value: exam?.PARTIAL_COMPLETED || 0 },
        { name: "Eligible", value: exam?.COMPLETED_ELIGIBLE || 0 },
        { name: "Not Eligible", value: exam?.COMPLETED_NOT_ELIGIBLE || 0 },
      ]
    : [];

  const eligibilityStatCards = [
    {
      title: "Total Applicants",
      value: eli?.totalApplied,
      icon: <TeamOutlined />,
      color: "#008cab",
    },
    {
      title: "Selected",
      value: eli?.selected,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Not Selected",
      value: eli?.notSelected,
      icon: <CloseCircleOutlined />,
      color: "#ff4d4f",
    },
  ];

  const examStatCards = [
    {
      title: "Not Started",
      value: exam?.NOT_STARTED,
      icon: <ClockCircleOutlined />,
      color: "#595959",
      bgColor: "#f5f5f5",
    },
    {
      title: "In Progress",
      value: exam?.STARTED,
      icon: <PlayCircleOutlined />,
      color: "#1677ff",
      bgColor: "#e6f4ff",
    },
    {
      title: "Partially Completed",
      value: exam?.PARTIAL_COMPLETED,
      icon: <PauseCircleOutlined />,
      color: "#d46b08",
      bgColor: "#fff7e6",
    },
    {
      title: "Completed & Eligible",
      value: exam?.COMPLETED_ELIGIBLE,
      icon: <TrophyOutlined />,
      color: "#389e0d",
      bgColor: "#f6ffed",
    },
    {
      title: "Completed & Ineligible",
      value: exam?.COMPLETED_NOT_ELIGIBLE,
      icon: <CloseCircleOutlined />,
      color: "#cf1322",
      bgColor: "#fff1f0",
    },
  ];

  const isMobile = screens.xs;

  return (
    <CompaniesLayout>
      <div style={{ padding: "4px 0 32px" }}>
        {/* ── Page Header ── */}
        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
          style={{ marginBottom: 28 }}
        >
          <Col xs={24} md={12}>
            <Title
              level={3}
              style={{ margin: 0, fontWeight: 800, color: "#1a202c" }}
            >
              Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Monitor applicant eligibility &amp; exam progress
            </Text>
          </Col>

          <Col xs={24} md={12}>
            <Row
              gutter={[8, 8]}
              justify={isMobile ? "start" : "end"}
              align="middle"
            >
              <Col>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    From
                  </Text>
                  <DatePicker
                    value={fromDate}
                    onChange={(d) => setFromDate(d)}
                    format="DD MMM YYYY"
                    size="middle"
                    allowClear={false}
                    disabledDate={(d) =>
                      d && d.isAfter(toDate || dayjs(), "day")
                    }
                    suffixIcon={
                      <CalendarOutlined style={{ color: "#008cab" }} />
                    }
                    style={{ borderRadius: 8, width: isMobile ? "100%" : 150 }}
                  />
                </div>
              </Col>
              <Col>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    To
                  </Text>
                  <DatePicker
                    value={toDate}
                    onChange={(d) => setToDate(d)}
                    format="DD MMM YYYY"
                    size="middle"
                    allowClear={false}
                    disabledDate={(d) =>
                      d &&
                      (d.isBefore(fromDate, "day") || d.isAfter(dayjs(), "day"))
                    }
                    suffixIcon={
                      <CalendarOutlined style={{ color: "#008cab" }} />
                    }
                    style={{ borderRadius: 8, width: isMobile ? "100%" : 150 }}
                  />
                </div>
              </Col>
              <Col style={{ paddingTop: 18 }}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => fetchStats(fromDate, toDate)}
                  style={{
                    background: "#008cab",
                    borderColor: "#008cab",
                    borderRadius: 8,
                    height: 34,
                    fontWeight: 600,
                  }}
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* ── Error ── */}
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 14 }}>
              <Text type="secondary">Fetching exam flow statistics...</Text>
            </div>
          </div>
        )}

        {/* ── Data ── */}
        {!loading && data && (
          <>
            {/* ══ ELIGIBILITY SECTION ══ */}
            <SectionHeader title="Eligibility Overview" />
            <Divider style={{ margin: "10px 0 16px" }} />

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {eligibilityStatCards.map((c) => (
                <Col xs={24} sm={8} key={c.title}>
                  <StatCard {...c} />
                </Col>
              ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 36 }}>
              <Col xs={24} lg={14}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                  }}
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <BarChartOutlined style={{ color: "#008cab" }} />
                      <Text strong>Applicant Eligibility — Bar View</Text>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={eligibilityBarData}
                      barSize={40}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 13 }}
                        formatter={(v) => [v, "Count"]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {eligibilityBarData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={
                              ELIGIBILITY_COLORS[i % ELIGIBILITY_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                  }}
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <PieChartOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Selected vs. Not Selected</Text>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={eligibilityPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {eligibilityPieData.map((_, i) => (
                          <Cell key={i} fill={["#52c41a", "#ff4d4f"][i]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [v, "Count"]}
                        contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* ══ EXAM STATUS SECTION ══ */}
            <SectionHeader title="Exam Status Overview" />
            <Divider style={{ margin: "10px 0 16px" }} />

            {/* 5 cards — full width one row */}
            <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
              {examStatCards.map((c) => (
                <Col
                  xs={12}
                  sm={12}
                  md={8}
                  lg={8}
                  xl={24 / 5}
                  key={c.title}
                  style={{ flex: "1 1 0" }}
                >
                  <StatCard {...c} />
                </Col>
              ))}
            </Row>

            {/* Exam charts */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={14}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                  }}
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <BarChartOutlined style={{ color: "#1677ff" }} />
                      <Text strong>Exam Status — Bar View</Text>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={examBarData}
                      barSize={36}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 13 }}
                        formatter={(v) => [v, "Count"]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {examBarData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={EXAM_COLORS[i % EXAM_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                  }}
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <PieChartOutlined style={{ color: "#fa8c16" }} />
                      <Text strong>Exam Status — Distribution</Text>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={examPieData}
                        cx="50%"
                        cy="45%"
                        outerRadius={75}
                        dataKey="value"
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {examPieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={EXAM_COLORS[i % EXAM_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [v, "Count"]}
                        contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !data && !error && (
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
              textAlign: "center",
              padding: "60px 24px",
            }}
          >
            <CalendarOutlined style={{ fontSize: 52, color: "#d9d9d9" }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Select a date range and click <Text strong>Refresh</Text> to
                view exam flow statistics.
              </Text>
            </div>
          </Card>
        )}
      </div>
    </CompaniesLayout>
  );
};

export default ExamFlowDashboard;
