import React from "react";
import { Layout, Typography } from "antd";
import AdminPanelLayout from "./AdminPanelLayout";

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  return (
    <AdminPanelLayout>
      <Layout style={{ padding: "24px" }}>
        <Content>
          <Title level={2}>OxyRice Dashboard</Title>
          <p>
            Welcome to the OxyRice admin panel. Here you can manage the
            application settings and view analytics.
          </p>
        </Content>
      </Layout>
    </AdminPanelLayout>
  );
};

export default Dashboard;
