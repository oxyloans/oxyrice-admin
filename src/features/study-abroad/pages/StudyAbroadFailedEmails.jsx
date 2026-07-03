import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Space, Table, Tag, Typography, message } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text, Paragraph } = Typography;

const normalizeCity = (city) => String(city || "").trim().toLowerCase();

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudyAbroadFailedEmails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "";

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchFailedEmails = useCallback(
    async (page = currentPage, size = pageSize) => {
      setLoading(true);
      try {
        const apiPage = page - 1;
        const params = new URLSearchParams({ page: String(apiPage), size: String(size) });
        if (city) params.append("city", city);

        const { data } = await axiosInstance.get(
          `${BASE_URL}/ai-automation/reports/failed-emails?${params.toString()}`,
        );

        const content = Array.isArray(data?.content) ? data.content : [];
        const filteredContent = city
          ? content.filter((item) => normalizeCity(item?.city) === normalizeCity(city))
          : content;

        setDataSource(filteredContent);
        setTotalElements(city ? filteredContent.length : data?.totalElements || filteredContent.length || 0);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch failed emails.";
        message.error(errorMessage);
        setDataSource([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    },
    [city, currentPage, pageSize],
  );

  useEffect(() => {
    fetchFailedEmails(currentPage, pageSize);
  }, [fetchFailedEmails, currentPage, pageSize]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",
        align: "center",
        width: 80,
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Email / College",
        key: "emailCollege",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong copyable>{record.email || "-"}</Text>
            <Text type="secondary">{record.collegeName || "-"}</Text>
          </Space>
        ),
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        align: "center",
        render: (value) => <Tag color="blue">{value || "-"}</Tag>,
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        align: "center",
        render: (value) => <Tag color="orange">{value || "-"}</Tag>,
      },
      {
        title: "Attempt",
        dataIndex: "attemptNumber",
        key: "attemptNumber",
        align: "center",
        render: (value) => <Tag color="red">{Number(value) || 0}</Tag>,
      },
      {
        title: "Failed At",
        dataIndex: "failedAt",
        key: "failedAt",
        render: (value) => <Text type="secondary">{formatDateTime(value)}</Text>,
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        render: (value) => (
          <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "more" }} className="!mb-0">
            {value || "-"}
          </Paragraph>
        ),
      },
    ],
    [currentPage, pageSize],
  );

  return (
    <StudyAbroadAdminLayout>
      <div className="p-4 sm:p-6">
        <div className="mb-5 p-4 border border-slate-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Title level={3} className="!mb-1 !text-gray-800">
                {city ? `${city} - Failed Emails` : "Failed Emails"}
              </Title>
              <Text type="secondary">
                Failed email records from campaign automation report
              </Text>
            </div>
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} size="large">
                Back
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchFailedEmails(currentPage, pageSize)} loading={loading} size="large">
                Refresh
              </Button>
            </Space>
          </div>
        </div>

        <Card bordered={false} className="overflow-hidden">
          <Table
            rowKey={(record, index) => `${record.email || "failed"}-${record.failedAt || index}`}
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            bordered
            size="middle"
            sticky
            scroll={{ x: true }}
            locale={{ emptyText: <Empty description="No failed emails found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalElements,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} failed emails`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </Card>
      </div>
    </StudyAbroadAdminLayout>
  );
};

export default StudyAbroadFailedEmails;
