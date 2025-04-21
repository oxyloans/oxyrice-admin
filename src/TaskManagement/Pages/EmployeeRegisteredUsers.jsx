import React, { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const EmployeeRegisteredUsers = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user-service/getAllEmployees`
      );
      setEmployees(response.data);
    } catch (err) {
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "User ID",
      dataIndex: "lastFourDigitsUserId",
      key: "lastFourDigitsUserId",
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "mail",
      key: "mail",
      align: "center",
    },
    {
      title: "Email Verified",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (verified) => (verified === "true" ? "✅ Yes" : "❌ No"),
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) =>
        dayjs.utc(date).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
    },
  ];

  if (loading) {
    return (
      <TaskAdminPanelLayout>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Spin size="large" tip="Loading employees data..." />
        </div>
      </TaskAdminPanelLayout>
    );
  }

  if (error) {
    return (
      <TaskAdminPanelLayout>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: "20px" }}
        />
      </TaskAdminPanelLayout>
    );
  }

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Employee Management</h2>
        <Table
          columns={columns}
          dataSource={employees}
          rowKey={(record) => record.id || record.mail}
          bordered
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} employees`,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            position: ["bottomRight"],
          }}
        />
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeRegisteredUsers;
