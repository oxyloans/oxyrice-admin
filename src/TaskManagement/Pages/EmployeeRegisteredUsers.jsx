import React, { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

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
    },
  ];

  if (loading)
      return (
    <TaskAdminPanelLayout>
        
      <Spin
        tip="Loading employees..."
        style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
              />
        </TaskAdminPanelLayout>
    );
  if (error)
        return
    <Alert message={error} type="error" style={{ marginTop: 50 }} />;

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: 20 }}>
        
        <Table
          dataSource={employees}
          columns={columns}
          rowKey="userId"
          pagination={{
            pageSize: 10,
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
