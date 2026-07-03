import React, { useState } from "react";
import {
  Upload,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Tabs,
  Divider,
  Tag,
  message,
  Space,
  Alert,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Title, Text } = Typography;

const AI_BASE = `${BASE_URL}/ai-automation`;

const PLATFORMS = [
  { key: "oxyloans",  label: "OxyLoans" },
  { key: "oxybricks", label: "OxyBricks" },
  { key: "oxybfsai",  label: "OxyBFS AI" },
  { key: "askoxy",    label: "AskOxy" },
];

const PlatformUploadPanel = ({ platform }) => {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleUpload = async () => {
    if (!file) {
      message.error("Please select a PDF file first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await axiosInstance.post(`${AI_BASE}/pdf/upload/${platform.key}`, fd);
      const data = res.data;
      if (data.success) {
        setResult({ success: true, data });
        setFile(null);
      } else {
        setResult({ success: false, message: data.message || "Upload failed. Please try again." });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed. Please try again.";
      setResult({ success: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setFile(null); setResult(null); };

  return (
    <div>
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 0 }}
      >
        <Space align="center" style={{ marginBottom: 4 }}>
         
          <div>
            <Text strong style={{ fontSize: 15 }}>Upload PDF to {platform.label}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Only .pdf files are supported. Max size 20 MB.
              </Text>
            </div>
          </div>
        </Space>

        <Divider style={{ margin: "14px 0" }} />

        <Upload.Dragger
          accept=".pdf"
          maxCount={1}
          beforeUpload={(f) => {
            const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
            if (!isPdf) { message.error("Only PDF files are supported."); return Upload.LIST_IGNORE; }
            if (f.size > 20 * 1024 * 1024) { message.error("File size must be under 20 MB."); return Upload.LIST_IGNORE; }
            setFile(f);
            setResult(null);
            return false;
          }}
          onRemove={() => { setFile(null); setResult(null); }}
          fileList={file ? [{ uid: "-1", name: file.name, status: "done" }] : []}
          style={{ borderRadius: 8, marginBottom: 16 }}
        >
          <p style={{ margin: 0 }}>
            <UploadOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
          </p>
          <p style={{ margin: "8px 0 2px", fontWeight: 500 }}>Click or drag PDF here</p>
          <Text type="secondary" style={{ fontSize: 12 }}>Max 20 MB · .pdf only</Text>
        </Upload.Dragger>

        <Row gutter={12}>
          <Col xs={24} sm={10}>
            <Button
              block size="large" onClick={handleReset} disabled={loading}
              style={{ borderRadius: 8, height: 44 }}
            >
              Reset
            </Button>
          </Col>
          <Col xs={24} sm={14}>
            <Button
              type="primary" block size="large" loading={loading} onClick={handleUpload}
              icon={<UploadOutlined />}
              style={{ backgroundColor: "#008cba", borderColor: "#008cba", borderRadius: 8, height: 44, fontWeight: 600 }}
            >
              {loading ? "Uploading..." : `Upload to ${platform.label}`}
            </Button>
          </Col>
        </Row>
      </Card>

      {result && (
        <Alert
          type={result.success ? "success" : "error"}
          showIcon
          closable
          onClose={() => setResult(null)}
          style={{ marginTop: 16, borderRadius: 8 }}
          message={result.success ? "Upload Successful" : "Upload Failed"}
          description={
            result.success && result.data ? (
              <Row gutter={[12, 8]} style={{ marginTop: 6 }}>
                {[
                  { label: "Message",          value: result.data.message },
                  { label: "File ID",          value: result.data.fileId },
                  { label: "File Name",        value: result.data.fileName },
                  { label: "Chunks Stored",    value: result.data.chunksStored },
                  { label: "Total Chunks",     value: result.data.totalChunks },
                  { label: "Total Characters", value: result.data.totalCharacters },
                ]
                  .filter((r) => r.value !== null && r.value !== undefined)
                  .map((r) => (
                    <Col xs={24} sm={12} key={r.label}>
                      <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{r.label}</Text>
                      <Text strong style={{ fontSize: 13 }}>{r.value}</Text>
                    </Col>
                  ))}
              </Row>
            ) : result.message
          }
        />
      )}
    </div>
  );
};

const PdfUploadCampaign = () => {
  const tabItems = PLATFORMS.map((p) => ({
    key: p.key,
    label: <span className="font-semibold">{p.label}</span>,
    children: <PlatformUploadPanel platform={p} key={p.key} />,
  }));

  return (
    <AdminPanelLayout>
      <div style={{ padding: "8px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            PDF Upload Campaign
          </Title>
          <Text type="secondary">
            Upload PDF documents to generate AI-powered campaigns across platforms
          </Text>
        </div>

        <Tabs
          defaultActiveKey="oxyloans"
          type="card"
          size="middle"
          items={tabItems}
          tabBarStyle={{ marginBottom: 20 }}
        />
      </div>
    </AdminPanelLayout>
  );
};

export default PdfUploadCampaign;
