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
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const { Search } = Input;

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
        `${BASE_URL}/user-service/getAllEmployees`
      );
      setEmployees(response.data);
      setFilteredEmployees(response.data);
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
        emp.lastFourDigitsUserId?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setFilteredEmployees(employees);
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 80,
    },
    {
      title: "User ID",
      dataIndex: "lastFourDigitsUserId",
      key: "lastFourDigitsUserId",
      align: "center",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "mail",
      key: "mail",
      align: "center",
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: "Email Verified",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (verified) => (
        <Text type={verified === "true" ? "success" : "danger"}>
          {verified === "true" ? "✅ Yes" : "❌ No"}
        </Text>
      ),
      align: "center",
      width: 120,
    },
    {
      title: "Mobile Number",
      dataIndex: "empNumber",
      key: "empNumber",
      align: "center",
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date) =>
        dayjs.utc(date).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div
        style={{ minHeight: "100vh" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 24 }}
              >
                <Col>
                  <Title level={3} style={{ margin: 0, color: "#1a3c34" }}>
                    Employee Management
                  </Title>
                </Col>
                <Col>
                  <Space>
                    <Search
                      placeholder="Search by name, email, or user ID"
                      value={searchText}
                      onChange={(e) => handleSearch(e.target.value)}
                      enterButton={<SearchOutlined />}
                      style={{ width: 300 }}
                      allowClear
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
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" tip="Loading employees data..." />
                </div>
              ) : error ? (
                <Alert
                  message="Error"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredEmployees}
                  rowKey={(record) => record.id || record.mail}
                  bordered
                  pagination={{
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} employees`,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    position: ["bottomRight"],
                    responsive: true,
                  }}
                  scroll={{ x: 1000 }}
                  style={{ background: "#fff", borderRadius: 8 }}
                  rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                  }
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeRegisteredUsers;
