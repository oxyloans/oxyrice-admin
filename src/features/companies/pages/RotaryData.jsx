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
  Button,
  Tag,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/ai-service/agent/rotaryData`;

const RotaryData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [extractingRow, setExtractingRow] = useState(null);

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

  // Count records without email and mobile
  const missingDataCount = useMemo(() => {
    return rows.filter(r => !r.emails && !r.mobileNumbers).length;
  }, [rows]);

  // Extract data for single row
  const extractSingleRow = async (record) => {
    if (!record.image) {
      message.error("No image URL found");
      return;
    }

    setExtractingRow(record.image);
    try {
      const accessToken = localStorage.getItem("accessToken") || "";
      const res = await axios.post(
        `${BASE_URL}/ai-service/agent/extractFileUrl1`,
        [record.image],
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh data
      const updatedRes = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = Array.isArray(updatedRes.data) ? updatedRes.data : [];
      const sorted = [...data].sort((a, b) => {
        const da = new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
        const db = new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
        return db - da;
      });

      setRows(sorted);
      message.success("Data extracted successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to extract data");
    } finally {
      setExtractingRow(null);
    }
  };

  // Extract all missing data (limit 50)
  const extractAllMissing = async () => {
    const missingRows = rows.filter(r => !r.emails && !r.mobileNumbers).slice(0, 50);
    
    if (missingRows.length === 0) {
      message.info("No records to extract");
      return;
    }

    setExtracting(true);
    const accessToken = localStorage.getItem("accessToken") || "";
    let successCount = 0;
    let failCount = 0;

    for (const row of missingRows) {
      if (!row.image) continue;

      try {
        await axios.post(
          `${BASE_URL}/ai-service/agent/extractFileUrl1`,
          [row.image],
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        successCount++;
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    // Refresh data
    try {
      const updatedRes = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = Array.isArray(updatedRes.data) ? updatedRes.data : [];
      const sorted = [...data].sort((a, b) => {
        const da = new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
        const db = new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
        return db - da;
      });

      setRows(sorted);
      message.success(`Extracted ${successCount} records successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
    } catch (err) {
      message.error("Failed to refresh data");
    } finally {
      setExtracting(false);
    }
  };

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
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (url) => {
        if (!url) {
          return <span style={{ color: "#9CA3AF" }}>No document</span>;
        }

        const getFileType = (fileUrl) => {
          const ext = fileUrl.split(".").pop().toLowerCase();
          if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
            return "image";
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
          file: "📄",
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
              {icons[fileType]} View{" "}
              {fileType === "file"
                ? "Document"
                : fileType.charAt(0).toUpperCase() + fileType.slice(1)}
            </a>
          </div>
        );
      },
    },

    {
      title: "Action / Contact",
      key: "action",
      align: "center",
      render: (_, record) => {
        const hasEmail = record.emails;
        const hasMobile = record.mobileNumbers;

        if (hasEmail || hasMobile) {
          return (
            <div style={{ textAlign: "center" }}>
              {hasEmail && (
                <div>
                  <b>Email:</b>
                  <span>{hasEmail}</span>
                </div>
              )}
              {hasMobile && (
                <div>
                  <b>Mobile Number:</b>
                  <span>{hasMobile}</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <Button
            size="small"
            loading={extractingRow === record.image}
            onClick={() => extractSingleRow(record)}
            style={{
              backgroundColor: "#1ab394",
              borderColor: "#1ab394",
              color: "white",
            }}
          >
            Extract Data
          </Button>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) =>
        new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* ✅ Heading */}
        <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
          <Title level={3} className="!m-0">
            Rotary Data
          </Title>
          <div style={{ textAlign: "right" }}>
            <Button
            style={{backgroundColor:"#008cba",color:"white"}}
              size="large"
              loading={extracting}
              onClick={extractAllMissing}
              disabled={missingDataCount === 0}
            >
              Extract All Data
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              {missingDataCount} records without email/mobile (max 50)
            </div>
          </div>
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
            <Spin size="medium" tip="Loading Rotary Data..." />
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
              showSizeChanger: false, 
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

export default RotaryData;
