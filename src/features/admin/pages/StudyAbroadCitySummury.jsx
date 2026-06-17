import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  TeamOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout";
import { FaBuildingColumns } from "react-icons/fa6";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
const { Title, Text } = Typography;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StudyAbroadCitySummury = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCitySummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get(
        `${BASE_URL}/ai-automation/reports/city-summary`,
      );

      const resultData = Array.isArray(data)
        ? data
        : data?.data
          ? data.data
          : [];
      setSummaryData(resultData);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch city summary.";
      setSummaryData([]);
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-automation/reports/city-summary/pdf`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = "city-summary-report.pdf";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("PDF downloaded successfully.");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to download PDF.";
      message.error(errorMessage);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    fetchCitySummary();
  }, [fetchCitySummary]);

  const aggregatedStats = useMemo(() => {
    return summaryData.reduce(
      (acc, item) => {
        acc.totalColleges += Number(item.colleges) || 0;
        acc.totalConsultancies += Number(item.consultancies) || 0;
        acc.totalEmails += Number(item.totalEmails) || 0;
        acc.totalSent += Number(item.sent) || 0;
        acc.totalResponses += Number(item.responses) || 0;
        acc.totalFailed += Number(item.failed) || 0;
        acc.totalFollowUp1 += Number(item.followUp1) || 0;
        acc.totalFollowUp2 += Number(item.followUp2) || 0;
        return acc;
      },
      {
        totalColleges: 0,
        totalConsultancies: 0,
        totalEmails: 0,
        totalSent: 0,
        totalResponses: 0,
        totalFailed: 0,
        totalFollowUp1: 0,
        totalFollowUp2: 0,
      },
    );
  }, [summaryData]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",
        width: 60,
        align: "center",

        render: (_, __, index) => index + 1,
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        align: "center",

        render: (value) => (
          <Tag color="blue" className="font-semibold text-sm px-3 py-1">
            {value || "-"}
          </Tag>
        ),
      },
      {
        title: "Colleges",
        dataIndex: "colleges",
        key: "colleges",
        align: "center",
        render: (value) => (
          <Space>
            {/* <FaBuildingColumns  style={{ color: "#1890ff" }} /> */}
            <Text strong>{Number(value) || 0}</Text>
          </Space>
        ),
      },
      {
        title: "Consultancies",
        dataIndex: "consultancies",
        key: "consultancies",
        align: "center",
        render: (value) => (
          <Space>
            {/* <TeamOutlined style={{ color: "#722ed1" }} /> */}
            <Text strong>{Number(value) || 0}</Text>
          </Space>
        ),
      },
      {
        title: "Total Emails",
        dataIndex: "totalEmails",
        key: "totalEmails",
        align: "center",
        render: (value) => (
          <Space>
            {/* <MailOutlined style={{ color: "#fa8c16" }} /> */}
            <Text strong>{Number(value) || 0}</Text>
          </Space>
        ),
      },
      {
        title: "Sent",
        dataIndex: "sent",
        key: "sent",
        align: "center",
        render: (value) => <Tag color="green">{Number(value) || 0}</Tag>,
      },
      {
        title: "Responses",
        dataIndex: "responses",
        key: "responses",
        align: "center",
        render: (value) => (
          <Space>
            {/* <CheckCircleOutlined style={{ color: "#52c41a" }} /> */}
            <Text strong>{Number(value) || 0}</Text>
          </Space>
        ),
      },
      {
        title: "Failed",
        dataIndex: "failed",
        key: "failed",
        align: "center",
        render: (value) => (
          <Space>
            {/* <CloseCircleOutlined style={{ color: "#ff4d4f" }} /> */}
            <Text type="danger" strong>
              {Number(value) || 0}
            </Text>
          </Space>
        ),
      },
      {
        title: "Follow Up 1",
        dataIndex: "followUp1",
        key: "followUp1",
        align: "center",
        render: (value) => <Tag color="purple">{Number(value) || 0}</Tag>,
      },
      {
        title: "Follow Up 2",
        dataIndex: "followUp2",
        key: "followUp2",
        align: "center",
        render: (value) => <Tag color="orange">{Number(value) || 0}</Tag>,
      },
      {
        title: "Last Sent",
        dataIndex: "lastSentDateTime",
        key: "lastSentDateTime",
        align: "center",

        render: (value) => (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {formatDateTime(value)}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <AdminPanelLayout>
      <div className="p-4 sm:p-6">
        <div className="shadow-sm rounded-xl">
          {/* Header */}
          <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Title level={3} className="!mb-1 !text-gray-800">
                  Study Abroad City Summary
                </Title>
                <Text type="secondary" className="!text-gray-500">
                  City-wise email campaign performance overview
                </Text>
              </div>

              <Space wrap className="w-full lg:w-auto">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPdf}
                  loading={pdfLoading}
                  type="primary"
                  size="large"
                  className="w-full sm:w-auto"
                  style={{
                    background: "#008cba",
                    borderColor: "#008cba",
                    fontWeight: 600,
                  }}
                >
                  Download PDF
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchCitySummary}
                  loading={loading}
                  size="large"
                  className="w-full sm:w-auto"
                >
                  Refresh
                </Button>
              </Space>
            </div>
          </div>

          {summaryData.length > 0 && (
            <Row gutter={[16, 16]} className="mb-5">
              {[
                {
                  title: "Total Colleges",
                  value: aggregatedStats.totalColleges,
                  color: "#1890ff",
                  bg: "#E6F4FF",
                },
                {
                  title: "Consultancies",
                  value: aggregatedStats.totalConsultancies,
                  color: "#722ed1",
                  bg: "#F9F0FF",
                },
                {
                  title: "Total Emails",
                  value: aggregatedStats.totalEmails,
                  color: "#fa8c16",
                  bg: "#FFF7E6",
                },
                {
                  title: "Sent",
                  value: aggregatedStats.totalSent,
                  color: "#52c41a",
                  bg: "#F6FFED",
                },
                {
                  title: "Responses",
                  value: aggregatedStats.totalResponses,
                  color: "#13c2c2",
                  bg: "#E6FFFB",
                },
                {
                  title: "Failed",
                  value: aggregatedStats.totalFailed,
                  color: "#ff4d4f",
                  bg: "#FFF1F0",
                },
              ].map((item) => (
                <Col xs={24} sm={12} md={8} lg={4} key={item.title}>
                  <Card
                    hoverable
                    bordered={false}
                    className="rounded-xl text-center shadow-sm"
                    style={{
                      background: item.bg,
                      borderTop: `4px solid ${item.color}`,
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "#374151", fontWeight: 600 }}>
                          {item.title}
                        </span>
                      }
                      value={item.value}
                      valueStyle={{
                        color: item.color,
                        fontSize: 30,
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Error */}
          {error && (
            <Alert
              message="Unable to load city summary"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          {/* Table */}
          <div className="bg-white shadow-sm overflow-hidden">
            <Table
              rowKey={(record, index) => record.city || `${index}`}
              loading={loading}
              dataSource={summaryData}
              columns={columns}
              bordered
              size="middle"
              sticky
              scroll={{ x: true }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }
              locale={{
                emptyText: (
                  <Empty
                    description="No City Summary Data Available"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                responsive: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Showing ${range[0]} - ${range[1]} of ${total} Cities`,
              }}
              onRow={() => ({
                style: {
                  cursor: "pointer",
                },
              })}
            />
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default StudyAbroadCitySummury;
