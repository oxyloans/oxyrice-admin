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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import StudyAbroadAdminLayout from "../components/StudyAbroadAdminLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;

const parseContactText = (value = "") => {
  const text = String(value);
  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "-";
  const website =
    text.match(
      /(https?:\/\/)?(www\.)?[A-Z0-9.-]+\.[A-Z]{2,}(\/[A-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?/i,
    )?.[0] || "-";
  const phone =
    text
      .replace(email, "")
      .replace(website, "")
      .match(/\+?\d[\d\s-]{6,}\d/)?.[0]
      ?.trim() || "-";

  return { raw: text, email, website, phone };
};

const StudyAbroadCityDetails = () => {
  const navigate = useNavigate();
  const { city } = useParams();
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get("cityName") || city || "";
  const type = searchParams.get("type") || "totalEmails";

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchCityDetails = useCallback(
    async (page = currentPage, size = pageSize) => {
      if (!city) return;
      setLoading(true);
      try {
        const apiPage = page - 1;
        const { data } = await axiosInstance.get(
          `${BASE_URL}/ai-automation/reports/city-details/${city}?page=${apiPage}&size=${size}`,
        );
        setDataSource(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(data?.totalElements || 0);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch city details.";
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
    fetchCityDetails(currentPage, pageSize);
  }, [fetchCityDetails, currentPage, pageSize]);

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "serialNumber",

        align: "center",
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Email",
        align: "center",
        key: "email",
        render: (value) => (
          <Text
          // copyable
          >
            {parseContactText(value).email}
          </Text>
        ),
      },
      {
        title: "Phone",
        key: "phone",
        align: "center",
        render: (value) => <Text>{parseContactText(value).phone}</Text>,
      },
      {
        title: "Website",
        key: "website",
        align: "center",

        render: (value) => {
          const website = parseContactText(value).website;
          return website === "-" ? "-" : <Text>{website}</Text>;
        },
      },
      {
        title: "Raw Data",
        key: "raw",
        align: "center",
        render: (value) => (
          <Text type="secondary">{parseContactText(value).raw}</Text>
        ),
      },
    ],
    [currentPage, pageSize],
  );

  return (
    <StudyAbroadAdminLayout>
      <div className="p-4 sm:p-6">
        <div className="mb-5  p-4 shadow-sm border border-slate-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Space wrap>
                <Title level={3} className="!mb-1 !text-gray-800">
                  {cityName} -{" "}
                  {type === "sent" ? "Sent Emails" : "Total Emails"}
                </Title>
              </Space>
              <br />
              <Text type="secondary">City-wise contact/email details</Text>
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
                onClick={() => fetchCityDetails(currentPage, pageSize)}
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
            rowKey={(record, index) => `${record}-${index}`}
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
                  description="No city details found"
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
                `${range[0]}-${range[1]} of ${total} records`,
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

export default StudyAbroadCityDetails;
