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
} from "antd";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

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

  const accessToken = localStorage.getItem("token") || "";

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
      setData(Array.isArray(json) ? json : []);
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

  const handleResumeClick = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else message.warning("No resume available");
  };

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

  // ✅ columns
  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",

      render: (_text, _record, index) => {
        const { current, pageSize } = pagination;
        return (current - 1) * pageSize + (index + 1);
      },
    },

    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      align: "center",

      render: (id) => (id ? `#${String(id).slice(-4)}` : "-"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",

      render: (v) => v || "-",
    },
    {
      title: "Rates",
      key: "rates",
      align: "center",

      render: (_, record) => (
        <div style={{ lineHeight: 1.6 }}>
          <div>
            <b>Per Hour:</b> ₹{record?.perHour ?? 0}
          </div>
          <div>
            <b>Per Day:</b> ₹{record?.perDay ?? 0}
          </div>
          <div>
            <b>Per Week:</b> ₹{record?.perWeek ?? 0}
          </div>
          <div>
            <b>Per Month:</b> ₹{record?.perMonth ?? 0}
          </div>
          <div>
            <b>Per Year:</b> ₹{record?.perYear ?? 0}
          </div>
        </div>
      ),
    },
    {
      title: "Open for Freelancing",
      dataIndex: "openForFreeLancing",
      key: "openForFreeLancing",
      align: "center",

      render: (status) => {
        const yes = String(status || "").toUpperCase() === "YES";
        return (
          <Tag
            style={{
              borderColor: yes ? PRIMARY : "#ff4d4f",
              color: yes ? PRIMARY : "#ff4d4f",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            {yes ? "YES" : "NO"}
          </Tag>
        );
      },
    },
    {
      title: "Amount Negotiable",
      dataIndex: "amountNegotiable",
      key: "amountNegotiable",
      align: "center",

      render: (status) => {
        const yes = String(status || "").toUpperCase() === "YES";
        return (
          <Tag
            style={{
              borderColor: yes ? PRIMARY : "#faad14",
              color: yes ? PRIMARY : "#faad14",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            {yes ? "YES" : "NO"}
          </Tag>
        );
      },
    },
    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      align: "center",

      render: (url) =>
        url ? (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleResumeClick(url)}
            style={{
              backgroundColor: PRIMARY,
              borderColor: PRIMARY,
              fontWeight: 600,
            }}
          >
            View
          </Button>
        ) : (
          <span style={{ color: "#999" }}>No Resume</span>
        ),
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 16 }}
        title={
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={10}>
              <h2 style={{ margin: 0, color: PRIMARY }}>Freelancers List</h2>
            </Col>

            <Col
              xs={24}
              md={14}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Space align="center">
                <Input
                  allowClear
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPagination((p) => ({ ...p, current: 1 }));
                  }}
                  prefix={<SearchOutlined />}
                  placeholder="Search by Email or User ID"
                  size="large"
                  style={{ width: 280 }}
                />

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchFreelancers}
                  size="large"
                  style={{
                    borderColor: PRIMARY,
                    color: PRIMARY,
                    fontWeight: 600,
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
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [10, 25, 50, 100, 200],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} freelancers`,
            onChange: (current, pageSize) => {
              setPagination({ current, pageSize });
            },
          }}
        />
      </Card>
    </AgentsAdminLayout>
  );
};

export default FreelancersList;
