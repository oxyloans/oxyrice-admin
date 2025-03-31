import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Space,Badge,Button,Tooltip, Row, Col } from "antd";
import { Line } from "react-chartjs-2";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import BASE_URL from "./Config";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  Legend
);

const { Content } = Layout;
const { Title, Text } = Typography;

const DashboardTest = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/user-service/counts`
  //       );
  //       setAnalyticsData(response.data);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);


   const fetchData = async () => {
     try {
       setRefreshing(true);
       const response = await axios.get(`${BASE_URL}/user-service/counts`);
       setAnalyticsData(response.data);
       setLoading(false);
       setRefreshing(false);
     } catch (error) {
       console.error("Error fetching data:", error);
       setLoading(false);
       setRefreshing(false);
     }
   };

   useEffect(() => {
     fetchData();
     // Set up auto-refresh every 5 minutes
     const refreshInterval = setInterval(() => {
       fetchData();
     }, 300000);

     return () => clearInterval(refreshInterval);
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
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, "rgba(66, 133, 244, 0.25)");
          gradient.addColorStop(1, "rgba(66, 133, 244, 0.02)");
          return gradient;
        },
        borderColor: "#4285F4",
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#4285F4",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#4285F4",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
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
            <Text className="text-gray-500 uppercase text-xs font-medium mr-1">
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
      <Layout style={{ background: "#f8fafc" }}>
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
              <Col>
                <Tooltip title="Refresh data">
                  <Badge dot={refreshing}>
                    <Button
                      type="default"
                      icon={<ReloadOutlined spin={refreshing} />}
                      onClick={fetchData}
                      disabled={refreshing}
                      style={{
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        padding: 0,
                      }}
                    />
                  </Badge>
                </Tooltip>
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
