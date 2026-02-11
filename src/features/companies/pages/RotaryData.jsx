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
  Modal,
  Input,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

  // WhatsApp modal states
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [whatsappContent, setWhatsappContent] = useState("");
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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
        message.error("Failed to load Rotary Data");
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
    return rows.filter((r) => !r.emails && !r.mobileNumbers).length;
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
        },
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
        const da =
          new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
        const db =
          new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
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

  // Open WhatsApp modal for all numbers
  const openWhatsappModal = () => {
    const numbers = rows
      .filter((r) => r.mobileNumbers)
      .flatMap((r) =>
        r.mobileNumbers
          .split(",")
          .map((num) => num.trim())
          .filter(Boolean)
      );
    const uniqueNumbers = [...new Set(numbers)];
    setWhatsappNumbers(uniqueNumbers);
    setWhatsappContent("");
    setSelectedRecord(null);
    setWhatsappModalVisible(true);
  };

  // Open WhatsApp modal for single record
  const openWhatsappModalForRecord = (record) => {
    if (!record.mobileNumbers) {
      message.error("No mobile numbers available");
      return;
    }
    const numbers = record.mobileNumbers
      .split(",")
      .map((num) => num.trim())
      .filter(Boolean);
    setWhatsappNumbers(numbers);
    setWhatsappContent("");
    setSelectedRecord(record);
    setWhatsappModalVisible(true);
  };

  // Send WhatsApp message
  const sendWhatsappMessage = async () => {
    if (!whatsappContent.trim()) {
      message.error("Please enter message content");
      return;
    }
    if (whatsappNumbers.length === 0) {
      message.error("No mobile numbers available");
      return;
    }

    setSendingWhatsapp(true);
    try {
      const accessToken = localStorage.getItem("accessToken") || "";
      await axios.post(
        `${BASE_URL}/ai-service/agent/rotaryWhatsappSend`,
        {
          content: whatsappContent,
          mobileNumbers: whatsappNumbers,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      message.success("WhatsApp messages sent successfully");
      setWhatsappModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to send WhatsApp messages");
    } finally {
      setSendingWhatsapp(false);
    }
  };

  // Extract all missing data (limit 50)
  const extractAllMissing = async () => {
    const missingRows = rows
      .filter((r) => !r.emails && !r.mobileNumbers)
      .slice(0, 50);

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
          },
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
        const da =
          new Date(String(a?.date || "").replace(" ", "T")).getTime() || 0;
        const db =
          new Date(String(b?.date || "").replace(" ", "T")).getTime() || 0;
        return db - da;
      });

      setRows(sorted);
      message.success(
        `Extracted ${successCount} records successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
      );
    } catch (err) {
      message.error("Failed to refresh data");
    } finally {
      setExtracting(false);
    }
  };

  const columns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      width: "50px",
      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
   {
  title: "Uploaded By",
  dataIndex: "name",
  key: "name",
  align: "center",
  width: 150, // adjust as needed (120 / 140 / 160)
}
,

    {
      title: "Document / File",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (url) => {
        if (!url) {
          return <span style={{ color: "#9CA3AF" }}>No document</span>;
        }

        const fileExtension = url.split(".").pop()?.toLowerCase();

        const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
        const videoTypes = ["mp4", "webm", "ogg"];
        const pdfTypes = ["pdf"];
        const excelTypes = ["xls", "xlsx"];
        const pptTypes = ["ppt", "pptx"];

        // IMAGE
        if (imageTypes.includes(fileExtension || "")) {
          return <Image width={50} src={url} alt="file" preview />;
        }

        // VIDEO
        if (videoTypes.includes(fileExtension || "")) {
          return (
            <video width="80" height="50" controls>
              <source src={url} />
            </video>
          );
        }

        // PDF
        if (pdfTypes.includes(fileExtension || "")) {
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              📄 View PDF
            </a>
          );
        }

        // EXCEL
        if (excelTypes.includes(fileExtension || "")) {
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              📊 View Excel
            </a>
          );
        }

        // PPT
        if (pptTypes.includes(fileExtension || "")) {
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              📽 View PPT
            </a>
          );
        }

        // Default fallback (Treat as image)
        return <Image width={50} height={50} src={url} alt="file" preview />;
      },
    },

    {
      title: "Contact Details",
      key: "contactDetails",
      align: "left",

      render: (_, record) => {
        const hasEmail = record.emails;
        const hasMobile = record.mobileNumbers;

        if (hasEmail || hasMobile) {
          return (
            <div style={{ textAlign: "left" }}>
              {hasEmail && (
                <div>
                  <b>Email:</b>{" "}
                  <span>
                    {[...new Set(hasEmail.split(","))]
                      .map((email) => email.trim())
                      .join(", ")}
                  </span>
                </div>
              )}

              {hasMobile && (
                <div>
                  <b>Phone:</b>{" "}
                  <span>
                    {[...new Set(hasMobile.split(","))]
                      .map((mobile) => mobile.trim())
                      .join(", ")}
                  </span>
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
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "white",
            }}
          >
            Extract Data
          </Button>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      sorter: (a, b) =>
        new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => {
        if (!record.mobileNumbers) {
          return <span style={{ color: "#999" }}>-</span>;
        }
        return (
          <Button
            size="medium"
            style={{
              backgroundColor: "#1ab394",
              color: "white",
              borderColor: "#25D366",
            }}
            onClick={() => openWhatsappModalForRecord(record)}
          >
            WhatsApp Send
          </Button>
        );
      },
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        {/* ✅ Heading */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Title level={3} className="!m-0">
              Rotary Data
            </Title>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                style={{ backgroundColor: "#1ab394", color: "white", borderColor: "#1ab394" }}
                size="large"
                onClick={openWhatsappModal}
                block
                className="sm:block"
              >
                WhatsApp Send to All
              </Button>
              <div className="flex flex-col">
                <Button
                  style={{ backgroundColor: "#008cba", color: "white" }}
                  size="large"
                  loading={extracting}
                  onClick={extractAllMissing}
                  disabled={missingDataCount === 0}
                  block
                  className="sm:block"
                >
                  Extract All Data
                </Button>
                <div style={{ marginTop: 4, fontSize: 11, color: "#666", textAlign: "center" }}>
                  {missingDataCount} records (max 50)
                </div>
              </div>
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

        {/* WhatsApp Modal */}
        <Modal
          title="Send WhatsApp Message"
          open={whatsappModalVisible}
          onCancel={() => setWhatsappModalVisible(false)}
          onOk={sendWhatsappMessage}
          confirmLoading={sendingWhatsapp}
          okText="Send"
          okButtonProps={{ style: { backgroundColor: "#008cba", borderColor: "#008cba" } }}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Mobile Numbers ({whatsappNumbers.length}):
            </label>
            <div
              style={{
                maxHeight: 120,
                overflowY: "auto",
                padding: 8,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                backgroundColor: "#f5f5f5",
              }}
            >
              {whatsappNumbers.length > 0 ? (
                whatsappNumbers.join(", ")
              ) : (
                <span style={{ color: "#999" }}>No mobile numbers found</span>
              )}
            </div>
          </div>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
              Message Content:
            </label>
            <TextArea
              rows={6}
              placeholder="Enter your message here..."
              value={whatsappContent}
              onChange={(e) => setWhatsappContent(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

export default RotaryData;
