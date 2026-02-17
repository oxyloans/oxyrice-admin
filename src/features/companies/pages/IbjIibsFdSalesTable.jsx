import React, { useEffect, useMemo, useRef, useState } from "react";
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
import dayjs from "dayjs";
import { Input } from "antd";

const { Title } = Typography;
const { Option } = Select;

const IbjIibsFdSalesTable = ({ title, apiUrl }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchedOnceRef = useRef(false);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  useEffect(() => {
    if (fetchedOnceRef.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("token");

        const res = await axios.post(
          apiUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort((a, b) => {
          const da =
            new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
          const db =
            new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
          return db - da;
        });

        setRows(sorted);
        fetchedOnceRef.current = true;
      } catch (err) {
        console.error(err);
        message.error(`Failed to load ${title}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, title]);

  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) =>
      [r?.name, r?.emails, r?.mobileNumbers, r?.extractAiText || ""].some(
        (field) =>
          String(field || "")
            .toLowerCase()
            .includes(val),
      ),
    );
  }, [rows, search]);

  const total = filteredRows.length;

  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Uploaded By",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (name) =>
        name ? name : <span style={{ color: "#aaa" }}>-</span>,
    },
    {
        title: "Document / Image",
        dataIndex: "image",
        key: "image",
        align: "center",
        render: (url) => {
          if (!url) {
            return <span style={{ color: "#9CA3AF" }}>No document</span>;
          }
  
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
                <Image width={80} src={url} alt="document" />
              )}
              <a
                href={url}
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
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (date) =>
        date
          ? dayjs(String(date).replace(" ", "T")).format("DD-MM-YYYY hh:mm A")
          : "-",
      sorter: (a, b) =>
        (new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0) -
        (new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto mb-6">
        <Title level={3} className="!m-0">
          {title}
        </Title>
      </div>

      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: 16 }}
        className="max-w-7xl mx-auto"
      >
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

        <Col xs={24} sm={12} style={{ textAlign: "right" }}>
          <Input.Search
            placeholder="Search name..."
            value={search}
            allowClear
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            style={{ width: 320, maxWidth: "100%" }}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip={`Loading ${title}...`} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredRows}
          rowKey={(r, idx) => r?.id || `${title}-${idx}`}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showQuickJumper: true,
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} records`,
            onChange: (page) => setPagination((p) => ({ ...p, current: page })),
          }}
          scroll={{ x: "max-content" }}
          bordered
          size="middle"
          className="max-w-7xl mx-auto"
        />
      )}
    </div>
  );
};

export default IbjIibsFdSalesTable;
