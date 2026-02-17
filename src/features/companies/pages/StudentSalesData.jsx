import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Spin,
  
  Typography,
  message,
  Row,
  Col,
  Select,
  Input,
 
  Image,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";
import CompaniesLayout from "../components/CompaniesLayout";

const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/ai-service/agent/studentSdSales`;

const StudentSalesData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // toolbar
  const [search, setSearch] = useState("");

  // pagination (antd is 1-based)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const accessToken = localStorage.getItem("token") || "";
        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        // Sort by date (latest first)
        const sorted = [...data].sort((a, b) => {
          const da = new Date(a?.date || "").getTime() || 0;
          const db = new Date(b?.date || "").getTime() || 0;
          return db - da;
        });

        setRows(sorted);
        console.log("Student sales data loaded:", sorted);
      } catch (err) {
        console.error("Error fetching student sales data:", err);
        message.error("Failed to load student sales data");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // client-side filter
  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) =>
      String(r?.name || "")
        .toLowerCase()
        .includes(val)
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
      render: (name) => (
        <span style={{ fontWeight: 500 }}>{name || "N/A"}</span>
      ),
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

      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "N/A"),
      sorter: (a, b) =>
        new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      sortDirections: ["descend", "ascend"],
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <div style={{ padding: 16, minHeight: "100vh" }}>
        {/* Heading */}
        <div style={{ maxWidth: 1200, margin: "0 auto 10px auto" }}>
          <Title level={3} style={{ margin: 0 }}>
            Student Sales Data
          </Title>
        </div>

        {/* Toolbar: Left Show entries | Right Search */}
        <div style={{ maxWidth: 1200, margin: "0 auto 12px auto" }}>
          <Row gutter={[12, 12]} align="middle" justify="space-between">
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
                  {[50, 70, 80, 100].map((num) => (
                    <Option key={num} value={num}>
                      {num}
                    </Option>
                  ))}
                </Select>
                <span>entries</span>
              </div>
            </Col>

            {/* RIGHT */}
            <Col xs={24} sm={12}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Input
                  placeholder="Search by name..."
                  value={search}
                  prefix={<SearchOutlined />}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination((p) => ({ ...p, current: 1 })); // reset page on search
                  }}
                  allowClear
                  style={{ width: 280, maxWidth: "100%" }}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Data */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <Spin size="medium" tip="Loading student sales data..." />
          </div>
        ) : (
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Table
              columns={columns}
              dataSource={filteredRows}
              rowKey={(record, idx) => record?.name + idx || idx}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total,
                showSizeChanger: false, // Select controls it
                showQuickJumper: true,
                showTotal: (t, range) =>
                  `${range[0]}-${range[1]} of ${t} records`,
                onChange: (page) =>
                  setPagination((p) => ({ ...p, current: page })),
              }}
              scroll={{ x: true }} // responsive table
              bordered
              className="max-w-7xl mx-auto"
            />
          </div>
        )}
      </div>
    </CompaniesLayout>
  );
};

export default StudentSalesData;
