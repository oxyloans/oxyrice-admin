import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/AdminPanel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const EmployeeRegisteredUsers = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/user-service/getAllEmployees`,
      );
      const sorted = response.data.sort((a, b) =>
        a.name?.localeCompare(b.name),
      );
      setEmployees(sorted);
      setFilteredEmployees(sorted);
    } catch (err) {
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(value.toLowerCase()) ||
        emp.mail?.toLowerCase().includes(value.toLowerCase()) ||
        emp.lastFourDigitsUserId?.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setFilteredEmployees(employees);
  };

  const handleToggleStatus = async (record) => {
    const userId = record.userId;
    const testUser = !record.testUser; // toggle value to send

    try {
      await axios.patch(
        `${BASE_URL}/user-service/updateEmployeeInActive`,
        {},
        {
          params: {
            testUser,
            userId,
          },
        },
      );
      message.success(
        `User "${record.name}" is now ${testUser ? "Inactive" : "Active"}`,
      );
      fetchEmployees(); // refresh after toggle
    } catch (error) {
      console.error(error);
      message.error("Failed to update user status");
    }
  };

  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 70,
    },
    {
      title: "User ID",
      dataIndex: "lastFourDigitsUserId",
      align: "center",
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "mail",
      align: "center",
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: "Email Verified",
      dataIndex: "emailVerified",
      align: "center",
      width: 120,
      render: (verified) => (
        <Text type={verified === "true" ? "success" : "danger"}>
          {verified === "true" ? "Yes" : "No"}
        </Text>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "empNumber",
      align: "center",
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      align: "center",
      render: (date) =>
        dayjs.utc(date).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Status",
      dataIndex: "testUser",
      align: "center",
      width: 130,
      render: (testUser, record) => {
        const isInactive = testUser === true; // explicitly check for true
        return (
          <Button
            size="small"
            style={{
              backgroundColor: isInactive ? "#ff4d4f" : "#1c84c6",
              color: "#fff",
              border: "none",
            }}
            onClick={() => handleToggleStatus(record)}
          >
            {isInactive ? "Inactive" : "Active"}
          </Button>
        );
      },
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div className="p-4">
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <Title level={3} style={{ marginBottom: 0 }}>
                👥 Employee Users
              </Title>
            </Col>
            <Col>
              <Space>
                <Input
                  placeholder="Search by name, email, or ID"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                  style={{ width: 250 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    handleReset();
                    fetchEmployees();
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-20">
              <Spin size="medium" tip="Loading employee records..." />
            </div>
          ) : error ? (
            <Alert message="Error" description={error} type="error" showIcon />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey={(record) => record.userId || record.mail}
              bordered
              pagination={{
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} employees`,
                showSizeChanger: true,
                pageSizeOptions: ["100", "200", "300", "400"],
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeRegisteredUsers;
