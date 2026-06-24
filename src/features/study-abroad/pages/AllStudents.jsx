import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import useAuth from "../../../shared/hooks/useAuth";

const { Title } = Typography;

const PRIMARY = "#008cba";

const INTERNSHIP_COLORS = {
  DUBAI_INTERNSHIP: "geekblue",
  USA_INTERNSHIP: "purple",
  UK_INTERNSHIP: "cyan",
};

const formatInternshipType = (value) =>
  (value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatResumeUrl = (url) => {
  if (!url) {
    return null;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const cleaned = url.replace(/^S3:\/\//i, "").replace(/^askoxy\//i, "");
  return `https://oxybricksv1.s3.ap-south-1.amazonaws.com/${cleaned}`;
};

const AllStudents = () => {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchStudents = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(
        `${BASE_URL}/user-service/student/all-students`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch students.";
      setError(errorMessage);
      setStudents([]);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return students;
    }
    return students.filter((student) =>
      [
        student.studentName,
        student.email,
        student.phoneNo,
        student.internshipType,
        String(student.id),
      ].some((field) => String(field || "").toLowerCase().includes(query)),
    );
  }, [students, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const columns = [
    {
      title: "S.No.",
      key: "serial",
      width: 70,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      align: "center",
      render: (name) => name || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      ellipsis: true,
      render: (email) => email || "—",
    },
    {
      title: "Phone",
      dataIndex: "phoneNo",
      key: "phoneNo",
      
      align: "center",
      render: (phone) => phone || "—",
    },
    {
      title: "Internship Type",
      dataIndex: "internshipType",
      key: "internshipType",
     
      align: "center",
      render: (type) =>
        type ? (
          <Tag color={INTERNSHIP_COLORS[type] || "blue"}>
            {formatInternshipType(type)}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
    
      align: "center",
      render: (url) => {
        const link = formatResumeUrl(url);
        return link ? (
          <Button
            type="link"
            icon={<FileTextOutlined />}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff" }}
          >
            View
          </Button>
        ) : (
          "—"
        );
      },
    },
  ];

  return (
    <StudyAbroadAdminLayout>
      <div className="all-students-page">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
          
              Internship Applications - {students.length}{" "}Students
            </Title>
          </Col>
          <Col>
            <Space wrap>
              <Input
                allowClear
                placeholder="Search name, email, phone, type"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ width: 300 }}
              />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchStudents}
                loading={loading}
                style={{
                  backgroundColor: PRIMARY,
                  borderColor: PRIMARY,
                  color: "#ffffff",
                }}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {error ? (
          <Alert
            type="error"
            showIcon
            message="Could not load students"
            description={error}
            style={{ marginTop: 16 }}
          />
        ) : null}

        <Spin spinning={loading}>
          {filteredStudents.length ? (
            <Table
              className="all-students-table"
              style={{ marginTop: 16 }}
              rowKey={(row) => row.id}
              columns={columns}
              bordered
              dataSource={filteredStudents}
              scroll={{ x: true }}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredStudents.length,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "50"],
                showQuickJumper: true,
                showLessItems: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} students`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
            />
          ) : (
            <Empty
              style={{ marginTop: 32 }}
              description={loading ? "Loading students..." : "No students found"}
            />
          )}
        </Spin>

        <style>{`
          .all-students-page {
            padding: 16px;
          }

          .all-students-table .ant-table-thead > tr > th {
            text-align: center !important;
            background: #f8fafc !important;
          }

          .all-students-table .ant-table-tbody > tr > td {
            text-align: center !important;
          }
        `}</style>
      </div>
    </StudyAbroadAdminLayout>
  );
};

export default AllStudents;
