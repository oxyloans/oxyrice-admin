import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Space, Row, Col } from "antd";
import { Line } from "react-chartjs-2";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanelTest";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import BASE_URL from "./Config";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Content } = Layout;
const { Title, Text } = Typography;

const DashboardTest = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user-service/counts`
        );
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Chart Data with gradient
  const chartData = {
    labels: ["Yesterday", "Today", "This Week", "This Month"],
    datasets: [
      {
        label: "User Growth",
        data: [
          analyticsData.yesterdayUsers || 0,
          analyticsData.todayUsers || 0,
          analyticsData.thisWeekUsers || 0,
          analyticsData.thisMonthUsers || 0,
        ],
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(24, 144, 255, 0.2)");
          gradient.addColorStop(1, "rgba(24, 144, 255, 0)");
          return gradient;
        },
        borderColor: "#1890ff",
        tension: 0.4,
        pointBackgroundColor: "#1890ff",
        pointBorderColor: "#fff",
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, family: "Inter" } },
      },
      title: {
        display: true,
        text: "User Growth Analytics",
        font: { size: 18, family: "Inter", weight: "600" },
        color: "#1a3353",
      },
      tooltip: {
        backgroundColor: "#1a3353",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Number of Users" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const StatCard = ({ title, value, icon, color, description, growth }) => (
    <Card
      className="shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border-0"
      style={{ background: "#fff", borderLeft: `4px solid ${color}` }}
      bodyStyle={{ padding: "20px" }}
    >
      <Space direction="vertical" size={12} className="w-full">
        <div className="flex justify-between items-center">
          <div>
            <Text className="text-gray-500 uppercase text-xs font-medium">
              {title}
            </Text>
            <Title
              level={2}
              className="m-0"
              style={{ color, fontSize: "28px" }}
            >
              {new Intl.NumberFormat("en-US").format(value || 0)}
            </Title>
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${color}10` }}
          >
            {React.cloneElement(icon, { style: { fontSize: 24, color } })}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Text className="text-gray-600 text-sm">{description}</Text>
          {growth && (
            <Text
              className={`text-sm ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <RiseOutlined rotate={growth >= 0 ? 0 : 180} className="mr-1" />
              {growth >= 0 ? "+" : ""}
              {growth}%
            </Text>
          )}
        </div>
      </Space>
    </Card>
  );

  return (
    <AdminPanelLayoutTest>
      <Layout style={{ background: "#f5f7fa" }}>
        <Content className="p-6 md:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Row justify="space-between" align="middle" className="mb-8">
              <Col>
                <Title
                  level={2}
                  style={{
                    color: "#1a3353",
                    margin: 0,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Admin Dashboard
                </Title>
                {/* <Text style={{ color: "#64748b" }}>
                  Real-time analytics overview
                </Text> */}
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-12">
                <Text className="text-gray-500">Loading dashboard...</Text>
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]} className="mb-8">
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      title="Total Users"
                      value={analyticsData.totalUsers}
                      icon={<TeamOutlined />}
                      color="#1890ff"
                      description="All registered users"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      title="Today Users"
                      value={analyticsData.todayUsers}
                      icon={<ClockCircleOutlined />}
                      color="#52c41a"
                      description="New users today"
                      growth={calculateGrowth(
                        analyticsData.todayUsers,
                        analyticsData.yesterdayUsers
                      )}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      title="This Week Users"
                      value={analyticsData.thisWeekUsers}
                      icon={<CalendarOutlined />}
                      color="#fa8c16"
                      description="New users this week"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      title="This Month Users"
                      value={analyticsData.thisMonthUsers}
                      icon={<UserOutlined />}
                      color="#f5222d"
                      description="New users this month"
                    />
                  </Col>
                </Row>

                <Row gutter={[24, 24]}>
                  <Col xs={24}>
                    <Card
                      className="shadow-sm rounded-lg border-0"
                      bodyStyle={{ padding: "24px", height: "400px" }}
                    >
                      <Line data={chartData} options={chartOptions} />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Content>
      </Layout>
    </AdminPanelLayoutTest>
  );
};

export default DashboardTest;
