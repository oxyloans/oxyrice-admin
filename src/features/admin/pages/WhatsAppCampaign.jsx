import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  Upload,
  Table,
  Tag,
  Typography,
  message,
  Spin,
  Alert,
  Row,
  Col,
  Tabs,
  Card,
  Space,
  Statistic,
  Select,
  Divider,
} from "antd";
import {
  UploadOutlined,
  SendOutlined,
  ReloadOutlined,
  TeamOutlined,
  SearchOutlined,
  FileExcelOutlined,
  UserOutlined,
  PhoneOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminPanelLayout from "../components/AdminPanelLayout";
import BASE_URL from "../../../core/config/Config";
import axiosInstance from "../../../core/config/axiosInstance";
const { Title, Text } = Typography;
const AI_BASE = `${BASE_URL}/ai-automation`;

// "29-06-2026 16:23:42" → "29 Jun 2026, 04:23 PM"
const formatDate = (str) => {
  if (!str) return "—";
  try {
    const [datePart, timePart] = str.split(" ");
    const [dd, mm, yyyy] = datePart.split("-");
    return new Date(`${yyyy}-${mm}-${dd}T${timePart}`).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    
    });
  } catch {
    return str;
  }
};

const STATUS_COLOR = {
  COMPLETED: "green",
  PENDING: "orange",
  FAILED: "red",
  PROCESSING: "blue",
};

const PLATFORM_OPTIONS = [
  { label: "OxyLoans",  value: "oxyloans" },
  { label: "OxyBricks", value: "oxybricks" },
  { label: "OxyBFS AI", value: "oxybfsai" },
  { label: "AskOxy",    value: "askoxy" },
];

// ── Bulk Send Tab ──────────────────────────────────────────────────────────────
const BulkSendTab = ({ onSuccess }) => {
  const [bulkForm] = Form.useForm();
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const handleBulkSend = async () => {
    try {
      await bulkForm.validateFields(["platform"]);
    } catch {
      return;
    }
    if (!bulkFile) {
      message.error("Please select a .csv or .xlsx file");
      return;
    }
    const platform = bulkForm.getFieldValue("platform");
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const fd = new FormData();
      fd.append("file", bulkFile);
      const res = await axiosInstance.post(
        `${AI_BASE}/whatsapp/send-campaign/bulk?platform=${platform}`,
        fd
      );
      const data = res.data;
      setBulkResult(data);
      if (data.success) {
        message.success(data.message || "Campaign sent successfully");
        bulkForm.resetFields();
        setBulkFile(null);
        onSuccess?.();
      }
    } catch {
      message.error("Error sending bulk campaign");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      <Space align="center" style={{ marginBottom: 4 }}>
       
        <div>
          <Title level={5} style={{ margin: 0 }}>Bulk Send Campaign</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Upload a .csv or .xlsx file to send WhatsApp messages in bulk.
          </Text>
        </div>
      </Space>

      <Divider style={{ margin: "14px 0" }} />

      <Form form={bulkForm} layout="vertical">
        <Form.Item
          label={<Text strong>Platform</Text>}
          name="platform"
          rules={[{ required: true, message: "Please select a platform" }]}
        >
          <Select
            placeholder="Select a platform"
            size="large"
            options={PLATFORM_OPTIONS}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label={<Text strong>Upload File (.csv or .xlsx)</Text>} required>
          <Upload.Dragger
            beforeUpload={(file) => {
              const ext = file.name.split(".").pop().toLowerCase();
              if (!["csv", "xlsx"].includes(ext)) {
                message.error("Unsupported file type. Upload a .csv or .xlsx file.");
                return Upload.LIST_IGNORE;
              }
              setBulkFile(file);
              setBulkResult(null);
              return false;
            }}
            onRemove={() => { setBulkFile(null); setBulkResult(null); }}
            maxCount={1}
            accept=".csv,.xlsx"
            fileList={bulkFile ? [{ uid: "-1", name: bulkFile.name, status: "done" }] : []}
            style={{ borderRadius: 8 }}
          >
            <p style={{ margin: 0 }}>
              <UploadOutlined style={{ fontSize: 24, color: "#008cab" }} />
            </p>
            <p style={{ margin: "6px 0 2px", fontWeight: 500 }}>Click or drag file here</p>
            <Text type="secondary" style={{ fontSize: 12 }}>Supports .csv and .xlsx</Text>
          </Upload.Dragger>
        </Form.Item>

        {bulkResult && !bulkResult.success && (
          <Alert
            type="error"
            message="Send Failed"
            description={bulkResult.message}
            style={{ marginBottom: 16, borderRadius: 8 }}
            showIcon closable onClose={() => setBulkResult(null)}
          />
        )}
        {bulkResult && bulkResult.success && (
          <Alert
            type="success"
            message="Campaign Sent Successfully"
            description={bulkResult.message}
            style={{ marginBottom: 16, borderRadius: 8 }}
            showIcon closable onClose={() => setBulkResult(null)}
          />
        )}

        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={bulkLoading}
          onClick={handleBulkSend}
          size="large"
          block
          style={{ background: "#008cab", borderColor: "#008cab", borderRadius: 8, height: 46, fontWeight: 600 }}
        >
          {bulkLoading ? "Sending..." : "Send Bulk Campaign"}
        </Button>
      </Form>
    </Card>
  );
};

// ── Test Single Tab ────────────────────────────────────────────────────────────
const TestSingleTab = () => {
  const [testForm] = Form.useForm();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestSingle = async (values) => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await axiosInstance.post(`${AI_BASE}/whatsapp/test-single`, {
        platform: values.platform,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
      });
      const data = res.data;
      if (res.ok) {
        setTestResult({ success: true });
        message.success("Test message sent successfully");
        testForm.resetFields();
        testForm.setFieldsValue({ platform: "oxyloans" });
      } else {
        setTestResult({ success: false, msg: data?.message || "Test send failed" });
      }
    } catch {
      setTestResult({ success: false, msg: "Error sending test message" });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      <Space align="center" style={{ marginBottom: 4 }}>
        
        <div>
          <Title level={5} style={{ margin: 0 }}>Test Single Message</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Send a test message to verify the WhatsApp template.
          </Text>
        </div>
      </Space>

      <Divider style={{ margin: "14px 0" }} />

      {testResult && (
        <Alert
          type={testResult.success ? "success" : "error"}
          message={testResult.success ? "Message sent successfully!" : testResult.msg}
          style={{ marginBottom: 16, borderRadius: 8 }}
          showIcon closable onClose={() => setTestResult(null)}
        />
      )}

      <Form
        form={testForm}
        layout="vertical"
        onFinish={handleTestSingle}
        initialValues={{ platform: "oxyloans" }}
      >
        <Form.Item
          label={<Text strong>Platform</Text>}
          name="platform"
          rules={[{ required: true, message: "Platform is required" }]}
        >
          <Select
            placeholder="Select a platform"
            size="large"
            options={PLATFORM_OPTIONS}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item
          label={<Text strong>Client Name</Text>}
          name="clientName"
          rules={[{ required: true, message: "Client name is required" }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="e.g. Mani"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item
          label={<Text strong>Client Phone</Text>}
          name="clientPhone"
          rules={[
            { required: true, message: "Phone number is required" },
            { pattern: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="e.g. 7093485208"
            size="large"
            maxLength={10}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SendOutlined />}
          loading={testLoading}
          size="large"
          block
          style={{ background: "#1ab394", borderColor: "#1ab394", borderRadius: 8, height: 46, fontWeight: 600 }}
        >
          {testLoading ? "Sending..." : "Send Test Message"}
        </Button>
      </Form>
    </Card>
  );
};

// ── Scorecards Tab ─────────────────────────────────────────────────────────────
const ScorecardsTab = ({ navigate }) => {
  const [scorecards, setScorecards] = useState([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchScorecards = useCallback(async () => {
    setScoreLoading(true);
    try {
      const res = await axiosInstance.get(`${AI_BASE}/admin/whatsapp/campaigns/scorecards`);
      const data = res.data.reverse();
      if (Array.isArray(data)) setScorecards(data);
      else message.error("Failed to load scorecards");
    } catch {
      message.error("Error fetching scorecards");
    } finally {
      setScoreLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScorecards();
  }, [fetchScorecards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scorecards;
    return scorecards.filter(
      (r) =>
        r.campaignId?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.createdAt?.toLowerCase().includes(q)
    );
  }, [scorecards, search]);

  // summary stats
  const total = scorecards.length;
  const completed = scorecards.filter((r) => r.status === "COMPLETED").length;
  const totalSent = scorecards.reduce((s, r) => s + (r.sent || 0), 0);
  const totalFailed = scorecards.reduce((s, r) => s + (r.failed || 0), 0);

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 60,
      align: "center",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Campaign ID",
      dataIndex: "campaignId",
      key: "campaignId",
      align: "center",
      render: (v) => (
        <Text strong style={{ color: "#008cab" }}>
          {v}
        </Text>
      ),
    },

    {
      title: "Total",
      dataIndex: "totalRecipients",
      key: "totalRecipients",
      align: "center",
    },
    {
      title: "Sent",
      dataIndex: "sent",
      key: "sent",
      align: "center",
      render: (v) => (
        <Text style={{ color: "#52c41a", fontWeight: 600 }}>{v}</Text>
      ),
    },
    {
      title: "Failed",
      dataIndex: "failed",
      key: "failed",
      align: "center",
      render: (v) => (
        <Text
          style={{
            color: v > 0 ? "#ff4d4f" : "#8c8c8c",
            fontWeight: v > 0 ? 600 : 400,
          }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Pending",
      dataIndex: "pending",
      key: "pending",
      align: "center",
      render: (v) => (
        <Text style={{ color: v > 0 ? "#fa8c16" : "#8c8c8c" }}>{v}</Text>
      ),
    },
    {
      title: "Success Rate",
      dataIndex: "successRate",
      key: "successRate",
      align: "center",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (v) => <Tag color={STATUS_COLOR[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (v) => <Text >{formatDate(v)}</Text>,
    },
    {
      title: "Completed At",
      dataIndex: "completedAt",
      key: "completedAt",
      align: "center",
      render: (v) => <Text >{formatDate(v)}</Text>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
    
   
      render: (_, record) => (
        <Button
          icon={<TeamOutlined />}
          size="small"
          style={{
            background: "#008cab",
            borderColor: "#008cab",
            color: "#fff",
          }}
          onClick={() =>
            navigate(`/admin/whatsapp-campaign-recipients/${record.campaignId}`)
          }
        >
          Recipients
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { title: "Total Campaigns", value: total, color: "#008cab" },
          { title: "Completed", value: completed, color: "#52c41a" },
          { title: "Total Sent", value: totalSent, color: "#1ab394" },
          { title: "Total Failed", value: totalFailed, color: "#ff4d4f" },
        ].map((s) => (
          <Col xs={12} sm={6} key={s.title}>
            <Card
              size="small"
              bordered
              style={{ borderRadius: 8, textAlign: "center" }}
            >
              <Statistic
                title={<Text style={{ fontSize: 12 }}>{s.title}</Text>}
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 22, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Header row: title left, search + reload right */}
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
            Campaign Scorecards
          </Title>
          
        </div>
        <Space wrap>
          <Input
            placeholder="Search campaign ID, status..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchScorecards}
            loading={scoreLoading}
            style={{ borderColor: "#008cba", color: "#008cba" }}
          >
            Reload
          </Button>
        </Space>
      </div>

      <Spin spinning={scoreLoading}>
        <Table
          rowKey="campaignId"
          columns={columns}
          dataSource={filtered}
          bordered
          size="middle"
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} of ${t} campaigns`,
          }}
          locale={{ emptyText: search ? "No campaigns match your search" : "No campaigns found" }}
        />
      </Spin>
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const WhatsAppCampaign = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scorecards");
  const [refreshKey, setRefreshKey] = useState(0);

  const tabItems = [
    {
      key: "scorecards",
      label: (
        <span>
         
          Scorecards
        </span>
      ),
      children: <ScorecardsTab navigate={navigate} key={refreshKey} />,
    },
    {
      key: "bulk",
      label: (
        <span>
          
          Bulk Send
        </span>
      ),
      children: (
        <BulkSendTab onSuccess={() => { setActiveTab("scorecards"); setRefreshKey((k) => k + 1); }} />
      ),
    },
    {
      key: "test",
      label: (
        <span>
        
          Test Single
        </span>
      ),
      children: <TestSingleTab />,
    },
  ];

  return (
    <AdminPanelLayout>
      <div style={{ padding: "8px 0" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <Space align="center">
       
            <div>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                WhatsApp Campaign
              </Title>
              <Text type="secondary">
                Manage bulk campaigns, test messages and track delivery
              </Text>
            </div>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="middle"
          style={{ background: "#fff" }}
          tabBarStyle={{ marginBottom: 20 }}
        />
      </div>
    </AdminPanelLayout>
  );
};

export default WhatsAppCampaign;
