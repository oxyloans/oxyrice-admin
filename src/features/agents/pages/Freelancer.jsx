import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Button,
  message,
  Tag,
  Input,
  Row,
  Col,
  Space,
  Statistic,
  Tooltip,
  Typography,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import AgentsAdminLayout from "../components/AgentsAdminLayout";
import BASE_URL,{uploadurlwithId} from "../../../core/config/Config";
import useAuth from '../../../shared/hooks/useAuth';
const { Text } = Typography;


const PRIMARY = "#008cba";


const FreelancersList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search + pagination state
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
  });

  const { accessToken } = useAuth();
  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/ai-service/agent/getAllFreeLancers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch freelancers");

      const json = await res.json();
      setData(Array.isArray(json) ? json.reverse() : []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 

  // ✅ filter data by search
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) => {
      const email = (item?.email || "").toLowerCase();
      const userId = String(item?.userId || "").toLowerCase();
      return email.includes(q) || userId.includes(q);
    });
  }, [data, searchText]);

  // ✅ statistics
  const stats = useMemo(() => {
    const openForWork = filteredData.filter(
      (f) => String(f?.openForFreeLancing || "").toUpperCase() === "YES"
    ).length;
    const negotiable = filteredData.filter(
      (f) => String(f?.amountNegotiable || "").toUpperCase() === "YES"
    ).length;
    return { total: filteredData.length, openForWork, negotiable };
  }, [filteredData]);

  // ✅ columns
  const columns = [
    {
      title: "#",
      key: "sno",

      align: "center",
      render: (_text, _record, index) => {
        const { current, pageSize } = pagination;
        return (
          <Text strong style={{ color: PRIMARY }}>
            {(current - 1) * pageSize + (index + 1)}
          </Text>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align:"center",

      render: (v) => (
        <Tooltip title={v}>
          <Text style={{ color: "#262626" }}>{v || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Rates",
      key: "rates",
align: "center",
      render: (_, record) => (
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div>
            <Text type="secondary">Hour:</Text>{" "}
            <Text strong>₹{record?.perHour?.toLocaleString() ?? 0}</Text>
          </div>
          <div>
            <Text type="secondary">Day:</Text>{" "}
            <Text strong>₹{record?.perDay?.toLocaleString() ?? 0}</Text>
          </div>
          <div>
            <Text type="secondary">Month:</Text>{" "}
            <Text strong>₹{record?.perMonth?.toLocaleString() ?? 0}</Text>
          </div>
          <div>
            <Text type="secondary">PerYear:</Text>{" "}
            <Text strong>₹{record?.perYear?.toLocaleString() ?? 0}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Availability",
      dataIndex: "openForFreeLancing",
      key: "openForFreeLancing",

      align: "center",
      filters: [
        { text: "Available", value: "YES" },
        { text: "Not Available", value: "NO" },
      ],
      onFilter: (value, record) =>
        String(record?.openForFreeLancing || "").toUpperCase() === value,
      render: (status) => {
        const yes = String(status || "").toUpperCase() === "YES";
        return (
          <Tag
            icon={yes ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={yes ? "success" : "error"}
            style={{ fontWeight: 600, fontSize: 13 }}
          >
            {yes ? "Available" : "Unavailable"}
          </Tag>
        );
      },
    },
    {
      title: "Negotiable",
      dataIndex: "amountNegotiable",
      key: "amountNegotiable",

      align: "center",
      filters: [
        { text: "Yes", value: "YES" },
        { text: "No", value: "NO" },
      ],
      onFilter: (value, record) =>
        String(record?.amountNegotiable || "").toUpperCase() === value,
      render: (status) => {
        const yes = String(status || "").toUpperCase() === "YES";
        return (
          <Tag
            color={yes ? "processing" : "warning"}
            style={{ fontWeight: 600, fontSize: 13 }}
          >
            {yes ? "Yes" : "No"}
          </Tag>
        );
      },
    },
    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      align: "center",
   render: (url) => {
  if (!url) {
    return <span style={{ color: "#9CA3AF" }}>No document</span>;
  }

  const fullUrl = `${uploadurlwithId}${url}`;

  return (
    <div style={{ textAlign: "center" }}>
      <a
        href={fullUrl}
        download
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
          color: "#1677ff"
        }}
      >
        Download Resume
      </a>
    </div>
  );
}
    },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: "0 8px" }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#fff", fontSize: 14 }}>
                    Total Freelancers
                  </span>
                }
                value={stats.total}
                valueStyle={{ color: "#fff", fontWeight: 700 }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                boxShadow: "0 4px 12px rgba(245, 87, 108, 0.3)",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#fff", fontSize: 14 }}>
                    Available Now
                  </span>
                }
                value={stats.openForWork}
                valueStyle={{ color: "#fff", fontWeight: 700 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                boxShadow: "0 4px 12px rgba(79, 172, 254, 0.3)",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#fff", fontSize: 14 }}>
                    Negotiable Rates
                  </span>
                }
                value={stats.negotiable}
                valueStyle={{ color: "#fff", fontWeight: 700 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: "20px" }}
          title={
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={8}>
                <h2
                  style={{
                    margin: 0,
                    color: PRIMARY,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  Freelancers Details
                </h2>
              </Col>

              <Col xs={24} lg={16}>
                <Space
                  size="middle"
                  wrap
                  style={{
                    width: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <Input
                    allowClear
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    prefix={<SearchOutlined style={{ color: PRIMARY }} />}
                    placeholder="Search by Email or User ID"
                    size="large"
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      borderRadius: 8,
                    }}
                  />

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchFreelancers}
                    size="large"
                    loading={loading}
                    style={{
                      borderColor: PRIMARY,
                      color: PRIMARY,
                      fontWeight: 600,
                      borderRadius: 8,
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          }
        >
          <Table
            rowKey={(r) => r?.id || `${r?.userId || ""}-${r?.email || ""}`}
            loading={loading}
            columns={columns}
            dataSource={filteredData}
            bordered
            scroll={{ x: "100%" }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: [10, 25, 50, 100],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} freelancers`,
              onChange: (current, pageSize) => {
                setPagination({ current, pageSize });
              },
              responsive: true,
            }}
          />
        </Card>
      </div>

      <style jsx>{`
        .table-row-light {
          background-color: #ffffff;
        }
        .table-row-dark {
          background-color: #fafafa;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </AgentsAdminLayout>
  );
};

export default FreelancersList;
