import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text, Paragraph } = Typography;

const normalizeCity = (city) =>
  String(city || "")
    .trim()
    .toLowerCase();

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

const StudyAbroadResponses = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "";

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchResponses = useCallback(
    async (page = currentPage, size = pageSize) => {
      setLoading(true);
      try {
        const apiPage = page - 1;
        const params = new URLSearchParams({
          page: String(apiPage),
          size: String(size),
        });

        // Keep city param for backend support. If backend ignores it, below client filter still works for current page.
        if (city) params.append("city", city);

        const { data } = await axiosInstance.get(
          `${BASE_URL}/ai-automation/reports/responses?${params.toString()}`,
        );

        const content = Array.isArray(data?.content) ? data.content : [];
        const filteredContent = city
          ? content.filter(
              (item) => normalizeCity(item?.city) === normalizeCity(city),
            )
          : content;

        setDataSource(filteredContent);
        setTotalElements(data?.totalElements || filteredContent.length || 0);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch responses.";
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
    fetchResponses(currentPage, pageSize);
  }, [fetchResponses, currentPage, pageSize]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",

        align: "center",
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Email / College",
        key: "emailCollege",

        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{record.email}</Text>
            <Text type="secondary" bold>
              {record.collegeName}
            </Text>
          </Space>
        ),
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        align: "center",
        render: (value) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        align: "center",
        render: (value) => <Tag color="green">{value}</Tag>,
      },
      {
        title: "Replied At",
        dataIndex: "repliedAt",
        key: "repliedAt",

        render: (value) => (
          <Text type="secondary">{formatDateTime(value)}</Text>
        ),
      },
      {
        title: "Reply Content",
        dataIndex: "replyContent",
        key: "replyContent",
        render: (value) => (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "more" }}
            className="!mb-0"
          >
            {value}
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
                {city ? `${city} - User Responses` : "User Responses"}
              </Title>
              <Text type="secondary">
                Campaign replies displayed in a user-friendly table
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                size="large"
              >
                Back
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchResponses(currentPage, pageSize)}
                loading={loading}
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>
        </div>

        <Card bordered={false} className="overflow-hidden">
          <Table
            rowKey={(record, index) => `${record.email || "response"}-${index}`}
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            bordered
            size="middle"
            sticky
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <Empty
                  description="No responses found"
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
                `${range[0]}-${range[1]} of ${total} responses`,
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

export default StudyAbroadResponses;
