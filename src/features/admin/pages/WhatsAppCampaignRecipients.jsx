import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Table,
  Tag,
  Typography,
  Spin,
  message,
  Input,
  Space,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  
  SearchOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../core/config/axiosInstance";
import AdminPanelLayout from "../components/AdminPanelLayout";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;
const AI_BASE = `${BASE_URL}/ai-automation`;

const STATUS_COLOR = { SENT: "green", FAILED: "red", PENDING: "orange" };

const WhatsAppCampaignRecipients = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${AI_BASE}/admin/whatsapp/campaigns/${campaignId}/recipients`
      );
      const data = res.data;
      if (Array.isArray(data)) setRecipients(data);
      else message.error("Failed to load recipients");
    } catch {
      message.error("Error fetching recipients");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      (r) =>
        r.clientName?.toLowerCase().includes(q) ||
        r.clientPhone?.toLowerCase().includes(q) ||
        r.sendStatus?.toLowerCase().includes(q)
    );
  }, [recipients, search]);

  // summary stats
  const sent = recipients.filter((r) => r.sendStatus === "SENT").length;
  const failed = recipients.filter((r) => r.sendStatus === "FAILED").length;
  const pending = recipients.filter((r) => r.sendStatus === "PENDING").length;

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 60,
      align: "center",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      align: "center",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "clientPhone",
      key: "clientPhone",
      align: "center",
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "sendStatus",
      key: "sendStatus",
      align: "center",
      filters: [
        { text: "Sent", value: "SENT" },
        { text: "Failed", value: "FAILED" },
        { text: "Pending", value: "PENDING" },
      ],
      onFilter: (value, record) => record.sendStatus === value,
      render: (v) => <Tag color={STATUS_COLOR[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Sent At",
      dataIndex: "sentAt",
      key: "sentAt",
      align: "center",
      render: (v) => {
        if (!v) return <Text type="secondary">—</Text>;
        try {
          const [datePart, timePart] = v.split(" ");
          const [dd, mm, yyyy] = datePart.split("-");
          return (
            <Text style={{ fontSize: 12, whiteSpace: "nowrap" }}>
              {new Date(`${yyyy}-${mm}-${dd}T${timePart}`).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              
              })}
            </Text>
          );
        } catch {
          return <Text style={{ fontSize: 12 }}>{v}</Text>;
        }
      },
    },
    {
      title: "Failure Reason",
      dataIndex: "failureReason",
      key: "failureReason",
      align: "center",
      render: (v) =>
        v ? <Text type="danger">{v}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <AdminPanelLayout>
      <div style={{ padding: "8px 0" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/whatsapp-campaign")}
              style={{ marginBottom: 8 }}
            >
              Back to Campaigns
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                  Campaign Recipients
                </Title>
                
              </div>
            </div>
          </div>

          {/* <Button
            icon={<ReloadOutlined />}
            onClick={fetchRecipients}
            loading={loading}
            style={{ borderColor: "#008cba", color: "#008cba" }}
          >
            Reload
          </Button> */}
        </div>

        {/* Summary stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            {
              title: "Total Recipients",
              value: recipients.length,
              color: "#008cab",
              icon: <WhatsAppOutlined />,
            },
            {
              title: "Sent",
              value: sent,
              color: "#52c41a",
              icon: <CheckCircleOutlined />,
            },
            {
              title: "Failed",
              value: failed,
              color: "#ff4d4f",
              icon: <CloseCircleOutlined />,
            },
            {
              title: "Pending",
              value: pending,
              color: "#fa8c16",
              icon: <ClockCircleOutlined />,
            },
          ].map((s) => (
            <Col xs={12} sm={6} key={s.title}>
              <Card
                size="small"
                bordered
                style={{ borderRadius: 8, textAlign: "center" }}
              >
                <Statistic
                  title={
                    <Space size={4}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <Text style={{ fontSize: 12 }}>{s.title}</Text>
                    </Space>
                  }
                  value={s.value}
                  valueStyle={{ color: s.color, fontSize: 22, fontWeight: 700 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Table header: title left, search right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Recipients List
            </Title>
            {/* <Text type="secondary" style={{ fontSize: 12 }}>
              {filtered.length} of {recipients.length} recipients
            </Text> */}
          </div>
          <Input
            placeholder="Search name, phone, status..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
        </div>

        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            bordered
            size="middle"
            scroll={{ x: true }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (t, r) => `${r[0]}-${r[1]} of ${t} recipients`,
            }}
            locale={{
              emptyText: search
                ? "No recipients match your search"
                : "No recipients found",
            }}
            rowClassName={(record) =>
              record.sendStatus === "FAILED" ? "row-failed" : ""
            }
          />
        </Spin>
      </div>

      <style>{`
        .row-failed td { background: #fff2f0 !important; }
      `}</style>
    </AdminPanelLayout>
  );
};

export default WhatsAppCampaignRecipients;
