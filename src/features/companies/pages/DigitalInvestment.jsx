import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Spin,
  
  Image,
  Typography,
  message,
  Row,
  Col,
  Select,
  
} from "antd";
import axiosInstance from "../../../core/config/axiosInstance";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";
import useAuth from '../../../shared/hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/ai-service/agent/DigitalInvestment`;

const DigitalInvestment = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ toolbar states
  const [search, setSearch] = useState("");

  // ✅ table pagination states (antd is 1-based)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

     
        const res = await axiosInstance.get(API_URL, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        // ✅ sort by date (latest first)
        const sorted = [...data].sort((a, b) => {
          const da =
            new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
          const db =
            new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
          return db - da;
        });

        setRows(sorted);
      } catch (err) {
        console.error(err);
        message.error("Failed to load News Paper Job Postings");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // ✅ filter (client-side)
  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) =>
      String(r?.name || "")
        .toLowerCase()
        .includes(val),
    );
  }, [rows, search]);

  const total = filteredRows.length;

  const columns = [
    {
      title: "S.NO",
      key: "serial",
      align: "center",

      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Document / Image",
      dataIndex: "document",
      key: "document",
      align: "center",
      render: (url) => {
        if (!url) {
          return <span style={{ color: "#9CA3AF" }}>No document</span>;
        }

        const sanitizeUrl = (rawUrl) => {
          try {
            const parsed = new URL(rawUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
            return parsed.href;
          } catch {
            return '#';
          }
        };

        const safeUrl = sanitizeUrl(url);

        const getFileType = (fileUrl) => {
          const ext = fileUrl.split(".").pop().toLowerCase();
          if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
          if (["pdf"].includes(ext)) return "pdf";
          if (["mp4", "webm", "mov"].includes(ext)) return "video";
          if (["xls", "xlsx"].includes(ext)) return "excel";
          if (["ppt", "pptx"].includes(ext)) return "ppt";
          if (["doc", "docx"].includes(ext)) return "document";
          return "file";
        };

        const fileType = getFileType(url);
        const icons = {
          image: "🖼️",
          pdf: "📄",
          video: "🎥",
          excel: "📊",
          ppt: "📋",
          document: "📝",
          file: "📄"
        };

        return (
          <div style={{ textAlign: "center" }}>
            {fileType === "image" && (
              <Image width={80} src={safeUrl} alt="document" />
            )}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              {icons[fileType]} View {fileType === "file" ? "Document" : fileType.charAt(0).toUpperCase() + fileType.slice(1)}
            </a>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "cratedAt",
      key: "cratedAt",
      align: "center",
      render: (createdAt) =>
        createdAt ? dayjs(createdAt).format("YYYY-MM-DD") : "N/A",
      sorter: (a, b) =>
        new Date(a?.cratedAt || 0).getTime() -
        new Date(b?.cratedAt || 0).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* ✅ Heading */}
        <div className="flex justify-between items-center mb-2 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            Digital Investment
          </Title>
        </div>

        {/* ✅ ONE ROW: Show entries (left) + Search (right) */}
        <Row
          align="middle"
          justify="space-between"
          style={{
            marginBottom: 12,
            gap: 12,
            flexWrap: "wrap",
          }}
          className="max-w-7xl mx-auto"
        >
          {/* LEFT */}
          <Col xs={24} sm={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>Show</span>
              <Select
                value={pagination.pageSize}
                onChange={(value) =>
                  setPagination({ current: 1, pageSize: value })
                }
                style={{ width: 120 }}
              >
                {[50, 70, 80, 90, 100].map((num) => (
                  <Option key={num} value={num}>
                    {num}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="medium" tip="Loading Digital Investment Data..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey={(record, idx) => `${idx}-${String(record?.name || "row").replace(/[^a-zA-Z0-9-_]/g, '')}`}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: false, 
              showQuickJumper: true,
              showTotal: (t, range) =>
                `${Math.max(0, parseInt(range[0]) || 0)}-${Math.max(0, parseInt(range[1]) || 0)} of ${Math.max(0, parseInt(t) || 0)} records`,
              onChange: (page) =>
                setPagination((p) => ({ ...p, current: page })),
            }}
            scroll={{ x: true }}
            bordered
            className="max-w-7xl mx-auto"
          />
        )}
      </div>
    </CompaniesLayout>
  );
};

export default DigitalInvestment;
