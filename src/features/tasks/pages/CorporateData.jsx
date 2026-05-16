import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  Button,
  Badge,
  Row,
  Col,
  Input,
  Tooltip,
  Space,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";

const { Text, Title } = Typography;

const API_URL = `${BASE_URL}/ai-service/agent/getCorporateData`;

// Extension-based detection
const extImage = (url) => /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(url);
const extVideo = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
const extPdf   = (url) => /\.pdf(\?|$)/i.test(url);
const hasExtension = (url) => /\.\w{2,5}(\?|$)/.test(url);

// Read first 12 bytes and match magic bytes to detect real file type
const detectTypeFromUrl = async (url) => {
  try {
    const res = await axiosInstance.get(url, { headers: { Range: "bytes=0-11" } });
    // Prefer Content-Type from response headers first
    const ct = res.headers.get("content-type") || "";
    if (ct.startsWith("image/")) return "image";
    if (ct.startsWith("video/")) return "video";
    if (ct.includes("pdf"))      return "pdf";

    // Fallback: read magic bytes
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const ascii = String.fromCharCode(...bytes);

    if (hex.startsWith("ffd8ff"))                         return "image"; // JPEG
    if (hex.startsWith("89504e47"))                       return "image"; // PNG
    if (hex.startsWith("47494638"))                       return "image"; // GIF
    if (hex.startsWith("52494646") && hex.slice(16,24) === "57415645") return "video"; // RIFF/WAVE → could be video
    if (hex.startsWith("000000") && (hex.slice(8,16) === "66747970" || hex.slice(8,16) === "6d703432")) return "video"; // MP4 ftyp
    if (hex.startsWith("1a45dfa3"))                       return "video"; // MKV/WebM
    if (ascii.startsWith("%PDF"))                         return "pdf";

    return "file";
  } catch {
    return "file";
  }
};

const DocumentCell = ({ url }) => {
  const [type, setType] = useState(null);

  useEffect(() => {
    if (!url) { setType("none"); return; }

    if (extImage(url)) { setType("image"); return; }
    if (extVideo(url)) { setType("video"); return; }
    if (extPdf(url))   { setType("pdf");   return; }

    // No recognizable extension → probe Content-Type
    if (!hasExtension(url)) {
      detectTypeFromUrl(url).then(setType);
    } else {
      setType("file");
    }
  }, [url]);

  if (!url || type === "none") return <Text type="secondary">—</Text>;
  if (type === null) return <Spin size="small" />;

  if (type === "image") {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={url}
          alt="document"
          width={64}
          height={64}
          onClick={() => window.open(url, "_blank")}
          style={{ borderRadius: 6, objectFit: "cover", cursor: "pointer", border: "1px solid #e8e8e8" }}
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title="Play Video">
          <Button
            type="link"
            icon={<PlayCircleOutlined style={{ fontSize: 32, color: "#008cba" }} />}
            onClick={() => window.open(url, "_blank")}
            style={{ padding: 0 }}
          />
        </Tooltip>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title="Open PDF">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <FilePdfOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
          </a>
        </Tooltip>
      </div>
    );
  }

  // fallback: open in new tab
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        type="link"
        onClick={() => window.open(url, "_blank")}
        style={{ padding: 0, color: "#008cba", fontWeight: 600 }}
      >
        View File
      </Button>
    </div>
  );
};

// Helper: center both header and cell
const cx = (extra = {}) => ({ align: "center", ...extra });

const CorporateData = () => {
  const [allData, setAllData]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [current, setCurrent]     = useState(1);
  const [pageSize, setPageSize]   = useState(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // First fetch to get totalElements
      const first = await axios.get(API_URL, { params: { page: 0, size: 1 } });
      const total = first.data.totalElements || 0;
      if (total === 0) { setAllData([]); return; }
      // Fetch all records in one request
      const res = await axios.get(API_URL, { params: { page: 0, size: total } });
      setAllData((res.data.content || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch {
      setAllData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = allData.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (row.name || "").toLowerCase().includes(q) ||
      (row.emails || "").toLowerCase().includes(q) ||
      (row.mobileNumbers || "").toLowerCase().includes(q)
    );
  });

  const handleTableChange = (pag) => {
    setCurrent(pag.current);
    setPageSize(pag.pageSize);
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 55,
      ...cx(),
      render: (_, __, i) => (current - 1) * pageSize + i + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...cx(),
      render: (v) => <Text strong style={{ color: "#262626" }}>{v || "—"}</Text>,
    },
   
    {
      title: "Document",
      key: "document",
      width: 120,
      ...cx(),
      render: (_, r) => <DocumentCell url={r.document || r.image} />,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      ...cx(),
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      defaultSortOrder: "ascend",
      render: (v) =>
        v ? (
          <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
            {String(v).slice(0, 16).replace("T", " ")}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: 16 }}>
        <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={10}>
            <Space align="center">
              <Title level={5} style={{ margin: 0, color: "#000" }}>
                POD & EOD Video Updates
              </Title>
            </Space>
          </Col>
          <Col xs={24} md={14}>
            <Row gutter={[8, 8]} justify="end" align="middle">
              <Col xs={24} sm={10} md={8}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#008cba" }} />}
                  placeholder="Search name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  style={{ borderRadius: 8, borderColor: "#008cba" }}
                />
              </Col>
              <Col xs={24} sm={6} md={5}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchData()}
                  loading={loading}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    borderColor: "#008cba",
                    color: "#008cba",
                  }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey={(r, i) => r.id ?? i}
          loading={loading}
          bordered
          size="small"
          scroll={{ x: true }}
          rowClassName={(_, i) => (i % 2 === 0 ? "" : "ant-table-row-alt")}
          pagination={{
            current,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: ["50", "70", "100", "200"],
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} records`,
            position: ["bottomRight"],
          }}
          onChange={handleTableChange}
        />
      </div>
    </TaskAdminPanelLayout>
  );
};

export default CorporateData;
