import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Tooltip,
  Spin,
  Image,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  FilePdfOutlined,
  PlayCircleOutlined,
  FileOutlined,
} from "@ant-design/icons";
import axios from "axios";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import BASE_URL from "../../../core/config/Config";

const { Text, Title } = Typography;

const API_URL = `${BASE_URL}/ai-service/agent/getRadhasSirPostedImageInCorporateGroup`;

// ── Media type detection ──────────────────────────────────────────────────────
const extImage = (url) => /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(url);
const extVideo = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
const extPdf = (url) => /\.pdf(\?|$)/i.test(url);
const extDoc = (url) => /\.(doc|docx|xls|xlsx|ppt|pptx)(\?|$)/i.test(url);
const hasExt = (url) => /\.\w{2,5}(\?|$)/.test(url);

const detectTypeFromUrl = async (url) => {
  // Step 1: HEAD request for Content-Type
  try {
    const res = await fetch(url, { method: "HEAD" });
    const ct = res.headers.get("content-type") || "";
    if (ct.startsWith("image/")) return "image";
    if (ct.startsWith("video/")) return "video";
    if (ct.includes("pdf")) return "pdf";
    if (ct.includes("word") || ct.includes("document")) return "doc";
    if (ct.includes("sheet") || ct.includes("excel")) return "doc";
  } catch {
    /* HEAD failed, continue to magic bytes */
  }

  // Step 2: magic bytes
  try {
    const r2 = await fetch(url, { headers: { Range: "bytes=0-11" } });
    const buf = await r2.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const ascii = String.fromCharCode(...bytes);
    if (hex.startsWith("ffd8ff")) return "image"; // JPEG
    if (hex.startsWith("89504e47")) return "image"; // PNG
    if (hex.startsWith("47494638")) return "image"; // GIF
    if (hex.startsWith("52494646")) return "image"; // WEBP/RIFF
    if (
      hex.startsWith("000000") &&
      (hex.slice(8, 16) === "66747970" || hex.slice(8, 16) === "6d703432")
    )
      return "video"; // MP4
    if (hex.startsWith("1a45dfa3")) return "video"; // WebM/MKV
    if (ascii.startsWith("%PDF")) return "pdf";
  } catch {
    /* magic bytes failed */
  }

  // Step 3: S3 URLs with no extension are almost always images
  return "image";
};

// ── Media Cell ────────────────────────────────────────────────────────────────
const MediaCell = ({ url }) => {
  const [type, setType] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (!url) {
      setType("none");
      return;
    }
    if (extImage(url)) {
      setType("image");
      return;
    }
    if (extVideo(url)) {
      setType("video");
      return;
    }
    if (extPdf(url)) {
      setType("pdf");
      return;
    }
    if (extDoc(url)) {
      setType("doc");
      return;
    }
    if (!hasExt(url)) {
      detectTypeFromUrl(url).then(setType);
    } else {
      setType("file");
    }
  }, [url]);

  const center = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  if (!url || type === "none")
    return (
      <div style={center}>
        <Text type="secondary">—</Text>
      </div>
    );
  if (type === null)
    return (
      <div style={center}>
        <Spin size="small" />
      </div>
    );

  if (type === "image") {
    // if image fails to load → show View File link
    if (imgError) {
      return (
        <div style={center}>
          <Button
            type="link"
            onClick={() => window.open(url, "_blank")}
            style={{ padding: 0, color: "#008cba", fontWeight: 600 }}
          >
            View File
          </Button>
        </div>
      );
    }
    return (
      <div style={center}>
        <Image
          src={url}
          alt="media"
          width={72}
          height={72}
          onError={() => setImgError(true)}
          preview={{ mask: <span>Preview</span> }}
          style={{
            borderRadius: 6,
            objectFit: "cover",
            cursor: "pointer",
            border: "1px solid #e8e8e8",
          }}
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div style={center}>
        <Tooltip title="Play Video">
          <Button
            type="link"
            icon={
              <PlayCircleOutlined style={{ fontSize: 36, color: "#008cba" }} />
            }
            onClick={() => window.open(url, "_blank")}
            style={{ padding: 0 }}
          />
        </Tooltip>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div style={center}>
        <Tooltip title="Open PDF">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <FilePdfOutlined style={{ fontSize: 36, color: "#ff4d4f" }} />
          </a>
        </Tooltip>
      </div>
    );
  }

  if (type === "doc") {
    return (
      <div style={center}>
        <Tooltip title="Open Document">
          <a
            href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileOutlined style={{ fontSize: 36, color: "#1ab394" }} />
          </a>
        </Tooltip>
      </div>
    );
  }

  // "file" — truly unknown
  return (
    <div style={center}>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const RadhaSirCorporateImages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (page, size) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { params: { page, size } });
      if (Array.isArray(res.data)) {
        setData(res.data);
        setTotal(
          res.data.length < size
            ? page * size + res.data.length
            : (page + 2) * size,
        );
      } else {
        setData(res.data.content || []);
        setTotal(res.data.totalElements ?? 0);
      }
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(current - 1, pageSize);
  }, [fetchData, current, pageSize]);

  const filtered = data.filter(
    (row) =>
      !search || (row.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const cx = { align: "center" };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 55,
      ...cx,
      render: (_, __, i) => (current - 1) * pageSize + i + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width:200,
      ...cx,
      render: (v) => (
        <Text strong style={{ color: "#262626" }}>
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Media",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 220,
      ...cx,
      render: (url) => <MediaCell url={url} />,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 180, 
      ...cx,
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
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
            <Title level={5} style={{ margin: 0, color: "#000" }}>
              Radha Sir's Corporate Group Images
            </Title>
          </Col>
          <Col xs={24} md={14}>
            <Row gutter={[8, 8]} justify="end" align="middle">
              <Col xs={24} sm={10} md={8}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#008cba" }} />}
                  placeholder="Search name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrent(1);
                  }}
                  allowClear
                  style={{ borderRadius: 8, borderColor: "#008cba" }}
                />
              </Col>
              <Col xs={24} sm={6} md={5}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchData(current - 1, pageSize)}
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
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} records`,
            position: ["bottomRight"],
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
        />
      </div>
    </TaskAdminPanelLayout>
  );
};

export default RadhaSirCorporateImages;
