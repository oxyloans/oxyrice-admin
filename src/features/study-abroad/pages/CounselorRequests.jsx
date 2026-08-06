import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import axiosInstance from "../../../core/config/axiosInstance";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";

const { Paragraph, Text, Title } = Typography;
const COUNSELOR_REQUESTS_PATH = "/user-service/counselor/all";

const CounselorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get(COUNSELOR_REQUESTS_PATH);
      setRequests(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setRequests([]);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load counselor requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const value = searchText.trim().toLowerCase();
    if (!value) return requests;

    return requests.filter((request) =>
      [
        request.fullName,
        request.email,
        request.phone,
        request.preferredCountry,
        request.preferredIntake,
        request.studyLevel,
        request.currentQualification,
        request.preferredDate,
        request.preferredTime,
        request.message,
      ].some((field) => String(field || "").toLowerCase().includes(value)),
    );
  }, [requests, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const columns = [
    {
      title: "S.No.",
      width: 75,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Student",
      dataIndex: "fullName",
      // align: "center",
      render: (name) => <Text strong>{name || "Not provided"}</Text>,
    },
    {
      title: "Contact",
      // align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.email || "Not provided"}</Text>
          <Text type="secondary">{record.phone || "Not provided"}</Text>
        </Space>
      ),
    },
    {
      title: "Study Preference",
      // align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color="blue">{record.preferredCountry || "Not provided"}</Tag>
          <Text>{record.studyLevel || "Not provided"}</Text>
          <Text type="secondary">
            Intake: {record.preferredIntake || "Not provided"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Current Qualification",
      dataIndex: "currentQualification",
      align: "center",
      render: (qualification) => qualification || "Not provided",
    },
    {
      title: "Preferred Appointment",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.preferredDate || "Not provided"}</Text>
          <Text type="secondary">{record.preferredTime || "Not provided"}</Text>
        </Space>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      align: "center",
      render: (value) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true }} className="!mb-0">
          {value || "No message"}
        </Paragraph>
      ),
    },
  ];

  return (
    <StudyAbroadAdminLayout>
      <Space
        align="start"
        size={16}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Counselor Requests
          </Title>
          <Text type="secondary">
            Review students who requested study-abroad counseling.
          </Text>
        </div>
        <Space wrap>
          <Input
            allowClear
            value={searchText}
            prefix={<SearchOutlined />}
            placeholder="Search counselor requests"
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 280 }}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchRequests}
          >
            Refresh
          </Button>
        </Space>
      </Space>

      {error && (
        <Alert
          showIcon
          closable
          type="error"
          message={error}
          onClose={() => setError("")}
          style={{ marginBottom: 16 }}
        />
      )}

      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            fontWeight: 600,
          }}
        >
          {filteredRequests.length} counselor{" "}
          {filteredRequests.length === 1 ? "request" : "requests"}
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredRequests}
          loading={loading}
          scroll={{ x: true }}
          bordered
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} requests`,
            onChange: (page, size) => {
              setCurrentPage(size !== pageSize ? 1 : page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: searchText
              ? "No counselor requests match your search."
              : "No counselor requests found.",
          }}
        />
      </div>
    </StudyAbroadAdminLayout>
  );
};

export default CounselorRequests;
