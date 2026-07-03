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
  MailOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
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

const getCitySlug = (city) =>
  encodeURIComponent(
    String(city || "")
      .trim()
      .toLowerCase(),
  );

const StudyAbroadCitySummury = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchCitySummary = useCallback(
    async (page = currentPage, size = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const apiPage = page - 1;
        const { data } = await axiosInstance.get(
          `${BASE_URL}/ai-automation/reports/city-summary?page=${apiPage}&size=${size}`,
        );
        setSummaryData(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(data?.totalElements || 0);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch city summary.";
        setError(errorMessage);
        setSummaryData([]);
        setTotalElements(0);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    fetchCitySummary(currentPage, pageSize);
  }, [fetchCitySummary, currentPage, pageSize]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/ai-automation/reports/city-summary/pdf`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "city-summary-report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("PDF downloaded successfully.");
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to download PDF.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const aggregatedStats = useMemo(() => {
    return summaryData.reduce(
      (acc, item) => {
        acc.totalColleges += Number(item.colleges) || 0;
        acc.totalConsultancies += Number(item.consultancies) || 0;
        acc.totalEmails += Number(item.totalEmails) || 0;
        acc.totalSent += Number(item.sent) || 0;
        acc.totalResponses += Number(item.responses) || 0;
        acc.totalFailed += Number(item.failed) || 0;
        return acc;
      },
      {
        totalColleges: 0,
        totalConsultancies: 0,
        totalEmails: 0,
        totalSent: 0,
        totalResponses: 0,
        totalFailed: 0,
      },
    );
  }, [summaryData]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",

        align: "center",
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
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
        render: (value) => <Text strong>{Number(value) || 0}</Text>,
      },
      {
        title: "Consultancies",
        dataIndex: "consultancies",
        key: "consultancies",
        align: "center",
        render: (value) => <Text strong>{Number(value) || 0}</Text>,
      },
      {
        title: "Total Emails",
        dataIndex: "totalEmails",
        key: "totalEmails",
        align: "center",
        render: (value, record) => (
          <Button
            type="primary"
            size="small"
            disabled={!Number(value)}
            style={{
              background: "#1677ff", // Ant Design Blue
              borderColor: "#1677ff",
              borderRadius: 6,
              fontWeight: 600,
              minWidth: 95,
            }}
            onClick={() =>
              navigate(
                `/studyabroad/city-details/${getCitySlug(record.city)}?type=totalEmails&cityName=${encodeURIComponent(record.city || "")}`,
              )
            }
          >
            {Number(value)} View
          </Button>
        ),
      },
      {
        title: "Sent",
        dataIndex: "sent",
        key: "sent",
        align: "center",
        render: (value, record) => (
          <Button
            type="primary"
            size="small"
            disabled={!Number(value)}
            style={{
              background: "#52c41a", // Ant Design Green
              borderColor: "#52c41a",
              borderRadius: 6,
              fontWeight: 600,
              minWidth: 95,
            }}
            onClick={() =>
              navigate(
                `/studyabroad/city-details/${getCitySlug(record.city)}?type=sent&cityName=${encodeURIComponent(record.city || "")}`,
              )
            }
          >
            {Number(value)} View
          </Button>
        ),
      },
      {
        title: "Responses",
        dataIndex: "responses",
        key: "responses",
        align: "center",
        render: (value, record) => (
          <Button
            type="primary"
            size="small"
            disabled={!Number(value)}
            style={{
              background: "#722ed1", // Ant Design Purple
              borderColor: "#722ed1",
              borderRadius: 6,
              fontWeight: 600,
              minWidth: 95,
            }}
            onClick={() =>
              navigate(
                `/studyabroad/responses?city=${encodeURIComponent(record.city || "")}`,
              )
            }
          >
            {Number(value)} View
          </Button>
        ),
      },
      {
        title: "Failed",
        dataIndex: "Failed",
        key: "Failed",
        align: "center",
        render: (value, record) => (
          <Button
            type="primary"
            size="small"
            disabled={!Number(value)}
            style={{
              background: "#1ab394", // Ant Design Green
              borderColor: "#1ab394",
              borderRadius: 6,
              fontWeight: 600,
              minWidth: 95,
              color:"white"
            }}
            onClick={() =>
              navigate(
                `/studyabroad/failed-emails?city=${encodeURIComponent(record.city || "")}`,
              )
            }
          >
            {Number(value)} View
          </Button>
        ),
      },
      {
        title: "Follow Up 1",
        dataIndex: "followUp1",
        key: "followUp1",
        align: "center",
        render: (value) => <Tag color="purple">{Number(value)}</Tag>,
      },
      {
        title: "Follow Up 2",
        dataIndex: "followUp2",
        key: "followUp2",
        align: "center",
        render: (value) => <Tag color="orange">{Number(value)}</Tag>,
      },
      {
        title: "Last Sent",
        dataIndex: "lastSentDateTime",
        key: "lastSentDateTime",
        align: "center",
        render: (value) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDateTime(value)}
          </Text>
        ),
      },
    ],
    [currentPage, pageSize, navigate],
  );

  return (
    <StudyAbroadAdminLayout>
      <div className="p-4 sm:p-6">
        <div className="shadow-sm rounded-xl">
          <div className="mb-5 p-4  border border-slate-50">
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
                  onClick={() => fetchCitySummary(currentPage, pageSize)}
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

          {error && (
            <Alert
              message="Unable to load city summary"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Card bordered={false} className="shadow-sm overflow-hidden">
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
                current: currentPage,
                pageSize,
                total: totalElements,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "50"],
                // showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} cities`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
            />
          </Card>
        </div>
      </div>
    </StudyAbroadAdminLayout>
  );
};

export default StudyAbroadCitySummury;
