import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;

const StudySevenDaysApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `${BASE_URL}/user-service/applications/getAllApplications`,
      );

      const responseData = response?.data;

      setApplications(Array.isArray(responseData) ? responseData : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch applications:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load applications. Please try again.",
      );

      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    if (!searchValue) {
      return applications;
    }

    return applications.filter((application) =>
      [
        application.fullName,
        application.email,
        application.mobileNumber,
        application.courseLevel,
        application.preferredCourse,
        application.preferredIntake,
        application.englishTest,
        application.englishTestScore,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue),
      ),
    );
  }, [applications, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const columns = [
    {
      title: "S.No.",
      key: "serialNumber",
      width: 75,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Student Name",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",

      render: (name) => <Text strong>{name || "Not provided"}</Text>,
    },
    {
      title: "Contact Information",
      key: "contactInformation",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={1}>
          <Text>{record.email || "Not provided"}</Text>
          <Text type="secondary">{record.mobileNumber || "Not provided"}</Text>
        </Space>
      ),
    },
    {
      title: "Course Level",
      dataIndex: "courseLevel",
      key: "courseLevel",
      align: "center",

      render: (courseLevel) =>
        courseLevel ? <Tag color="blue">{courseLevel}</Tag> : "Not provided",
    },
    {
      title: "Preferred Course",
      dataIndex: "preferredCourse",
      key: "preferredCourse",
      align: "center",
      render: (course) => course || "Not provided",
    },
    {
      title: "Preferred Intake",
      dataIndex: "preferredIntake",
      key: "preferredIntake",
      align: "center",
      render: (intake) => intake || "Not provided",
    },
    {
      title: "12th Percentage",
      dataIndex: "twelfthPercentage",
      key: "twelfthPercentage",

      align: "center",
      render: (percentage) =>
        percentage !== null && percentage !== undefined
          ? `${percentage}%`
          : "N/A",
    },
    {
      title: "Graduation CGPA",
      dataIndex: "graduationCgpa",
      key: "graduationCgpa",

      align: "center",
      render: (cgpa) =>
        cgpa !== null && cgpa !== undefined ? cgpa : "N/A",
    },
    {
      title: "English Test",
      key: "englishTest",
      align: "center",
      render: (_, record) =>
        record.englishTest ? (
          <Space size={6}>
            <Tag color="purple">{record.englishTest}</Tag>
            <Text strong>{record.englishTestScore || ""}</Text>
          </Space>
        ) : (
          "Not provided"
        ),
    },
  ];

  return (
    <StudyAbroadAdminLayout>
      <div style={{ padding: "4px 0 24px" }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0, color: "#1a202c" }}>
              Study Abroad Applications
            </Title>
            <Text type="secondary">
              Review and manage all submitted student applications.
            </Text>
          </Col>

          <Col xs={24} md={12} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Space.Compact>
              <Input
                allowClear
                size="large"
                value={searchText}
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                placeholder="Search name, email, mobile.."
                onChange={(event) => setSearchText(event.target.value)}
                style={{ width: 280 }}
              />
              <Button
                size="large"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={fetchApplications}
              >
                Search
              </Button>
            </Space.Compact>
            {/* {lastUpdated && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Last updated: {lastUpdated.toLocaleString()}
              </Text>
            )} */}
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: "#f0f7ff" }}>
              <Space align="center" size={12}>
                <TeamOutlined style={{ fontSize: 28, color: "#1677ff" }} />
                <div>
                  <Text type="secondary">Total Applications</Text>
                  <Title level={3} style={{ margin: 0 }}>{applications.length}</Title>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: "#f6ffed" }}>
              <Text type="secondary">Showing Results</Text>
              <Title level={3} style={{ margin: 0, color: "#389e0d" }}>
                {filteredApplications.length}
              </Title>
            </Card>
          </Col>
        </Row>

      <div style={{ marginTop: 20 }}>
        {error && (
          <Alert
            showIcon
            closable
            type="error"
            message={error}
            style={{ marginBottom: 16 }}
            onClose={() => setError("")}
          />
        )}

        <Card
          title="Application Details"
          extra={searchText ? <Tag color="blue">Filtered results</Tag> : null}
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
        <Table
          rowKey={(record, index) => record.id || record.email || index}
          columns={columns}
          dataSource={filteredApplications}
          loading={loading}
          scroll={{ x: true }}
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} applications`,
            onChange: (page, size) => {
              setCurrentPage(size !== pageSize ? 1 : page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: searchText
              ? "No applications match your search. Try another search term."
              : "No applications have been submitted yet.",
          }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "study-application-row-even" : ""
          }
        />
        </Card>
      </div>
      <style>{`
        .study-application-row-even > td {
          background: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          font-weight: 700;
          background: #f5f7fa !important;
        }
      `}</style>
    </div>
    </StudyAbroadAdminLayout>
  );
};

export default StudySevenDaysApplications;
