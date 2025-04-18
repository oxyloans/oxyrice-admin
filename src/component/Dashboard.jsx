import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Row, Col, Spin } from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://meta.oxyloans.com/api/erice-service/order/totalordersDeliveredCount",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminPanelLayout>
        <Layout style={{ padding: "24px" }}>
          <Content className="flex justify-center items-center h-screen">
            <Spin size="medium" />
          </Content>
        </Layout>
      </AdminPanelLayout>
    );
  }

  if (error) {
    return (
      <AdminPanelLayout>
        <Layout style={{ padding: "24px" }}>
          <Content className="flex justify-center items-center h-screen">
            <div className="text-red-500 text-lg font-bold">{error}</div>
          </Content>
        </Layout>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout>
     
        <Content>
          <Title level={2} className="text-gray-800">
            OxyRice Dashboard
          </Title>
          <p className="text-gray-600 mb-6">
            Welcome to the OxyRice admin panel. Here you can manage the
            application settings and view analytics.
          </p>

          {/* First Row */}
          <Row gutter={16} className="mt-6">
            <Col xs={24} sm={12} md={8}>
              <Card
                title="Total Orders Placed"
                className="shadow-md rounded-md"
              >
                <p className="text-2xl font-bold text-blue-600">
                  {data.placedCount}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                title="Total Accepted Orders"
                className="shadow-md rounded-md"
              >
                <p className="text-2xl font-bold text-green-600">
                  {data.totalAcceptedCount ? data.totalAcceptedCount : 0} 
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                title="Total Assigned Orders"
                className="shadow-md rounded-md"
              >
                <p className="text-2xl font-bold text-yellow-600">
                  {data.totalAssignedCount}
                </p>
              </Card>
            </Col>
          </Row>

          {/* Second Row */}
          <Row gutter={16} className="mt-6">
            <Col xs={24} sm={12} md={8}>
              <Card title="Total Deliveries" className="shadow-md rounded-md">
                <p className="text-2xl font-bold text-indigo-600">
                  {data.totalDeliveryCount}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                title="Total Pending Orders"
                className="shadow-md rounded-md"
              >
                <p className="text-2xl font-bold text-red-600">
                  {data.totalPendingCount}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card title="Today's Deliveries" className="shadow-md rounded-md">
                <p className="text-2xl font-bold text-teal-600">
                  {data.todayDeliveryCount}
                </p>
              </Card>
            </Col>
          </Row>
        </Content>
      
    </AdminPanelLayout>
  );
};

export default Dashboard;
