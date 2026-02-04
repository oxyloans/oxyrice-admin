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
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/ai-service/agent/getNewsPapaerJobsPaoting`;

const NewsPapers = () => {
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

        const accessToken = localStorage.getItem("accessToken") || "";
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
      title: "Document/Media",
      dataIndex: "image",
      key: "document",
      align: "center",

      render: (url) => {
        if (!url) return <span>N/A</span>;

        const getFileType = (fileUrl) => {
          if (!fileUrl) return "unknown";
          const ext = fileUrl.split(".").pop().toLowerCase();
          if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
            return "image";
          if (["pdf"].includes(ext)) return "pdf";
          if (["mp4", "webm", "mov"].includes(ext)) return "video";
          if (["doc", "docx"].includes(ext)) return "document";
          return "file";
        };

        const handleClick = (fileUrl) => {
          // Open in new tab
          window.open(fileUrl, '_blank');
        };

        const fileType = getFileType(url);

        return (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {fileType === "image" && (
              <Image width={80} src={url} alt="document" />
            )}
            {fileType === "pdf" && (
              <button
                onClick={() => handleClick(url)}
                style={{
                  color: "#1890ff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                📄 PDF
              </button>
            )}
            {fileType === "video" && (
              <button
                onClick={() => handleClick(url)}
                style={{
                  color: "#1890ff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                🎥 Video
              </button>
            )}
            {fileType === "document" && (
              <button
                onClick={() => handleClick(url)}
                style={{
                  color: "#1890ff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                📋 Document
              </button>
            )}
            {fileType === "file" && (
              <button
                onClick={() => handleClick(url)}
                style={{
                  color: "#008cba",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View More
              </button>
            )}
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (createdAt) =>
        createdAt ? dayjs(createdAt).format("YYYY-MM-DD") : "N/A",
      sorter: (a, b) =>
        new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 ">
        {/* ✅ Heading */}
        <div className="flex justify-between items-center mb-2 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            News Paper Job Postings
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
            <Spin size="medium" tip="Loading NewsPapaer JobsPosting..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey={(record, idx) => `${idx}-${record?.name || "row"}`}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: false, // ✅ Select controls it
              showQuickJumper: true,
              showTotal: (t, range) =>
                `${range[0]}-${range[1]} of ${t} records`,
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

export default NewsPapers;
