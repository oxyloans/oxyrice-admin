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
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TextArea, Search: AntSearch } = Input;

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
  // Email modal states
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedEmailRecord, setSelectedEmailRecord] = useState(null);

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

  // Replace your current filteredRows with this:
  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) => {
      const emails = (r.emails || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const mobiles = (r.mobileNumbers || "")
        .split(",")
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean);

      return (
        emails.some((email) => email.includes(val)) ||
        mobiles.some((mobile) => mobile.includes(val))
      );
    });
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
          .filter(Boolean),
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
    if (whatsappContent.trim().length < 5) {
      message.error("Message must be at least 5 characters");
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
        },
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

  // Open Email modal for all emails
  const openEmailModal = () => {
    const emails = rows
      .filter((r) => r.emails)
      .flatMap((r) =>
        r.emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      );

    const uniqueEmails = [...new Set(emails)];
    setEmailList(uniqueEmails);
    setEmailContent("");
    setSelectedEmailRecord(null);
    setEmailModalVisible(true);
  };

  const openEmailModalForRecord = (record) => {
    if (!record.emails) {
      message.error("No emails available");
      return;
    }

    const emails = record.emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const uniqueEmails = [...new Set(emails)];
    setEmailList(uniqueEmails);
    setEmailContent("");
    setSelectedEmailRecord(record);
    setEmailModalVisible(true);
  };

  const sendEmailMessage = async () => {
    // if (!emailContent.trim()) {
    //   message.error("Please enter email content");
    //   return;
    // }
    // if (emailContent.trim().length < 5) {
    //   message.error("Email content must be at least 5 characters");
    //   return;
    // }
    if (emailList.length === 0) {
      message.error("No emails available");
      return;
    }

    setSendingEmail(true);
    try {
      const accessToken = localStorage.getItem("accessToken") || "";

      await axios.post(
        `${BASE_URL}/ai-service/agent/rotaryEmailSend`,
        {
          // content: emailContent,
          emails: emailList,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      message.success("Emails sent successfully");
      setEmailModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to send emails");
    } finally {
      setSendingEmail(false);
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
      title: "S.No.",
      key: "serial",
      align: "center",
      width: 30,
      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Uploaded By",
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
      title: "Text",
      dataIndex: "text",
      key: "text",
      align: "center",
    },
    {
      title: "Contact Details",
      key: "contactDetails",
      align: "center",

      render: (_, record) => {
        const hasEmail = record.emails;
        const hasMobile = record.mobileNumbers;

        if (hasEmail || hasMobile) {
          const emailList = hasEmail
            ? [...new Set(hasEmail.split(","))]
                .map((email) => email.trim())
                .filter(Boolean)
            : [];

          const mobileList = hasMobile
            ? [...new Set(hasMobile.split(","))]
                .map((mobile) => mobile.trim())
                .filter(Boolean)
            : [];

          return (
            <div style={{ textAlign: "left" }}>
              {emailList.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                  <b>Email:</b>
                  {emailList.map((email, index) => (
                    <div key={index}>{email}</div>
                  ))}
                </div>
              )}

              {mobileList.length > 0 && (
                <div>
                  <b>Phone:</b>
                  {mobileList.map((mobile, index) => (
                    <div key={index}>{mobile}</div>
                  ))}
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

      render: (date) =>
        date
          ? dayjs(date, "YYYY-MM-DD HH:mm:ss.SSS").format("DD-MM-YYYY hh:mm A")
          : "N/A",

      sorter: (a, b) =>
        dayjs(a?.date, "YYYY-MM-DD HH:mm:ss.SSS").valueOf() -
        dayjs(b?.date, "YYYY-MM-DD HH:mm:ss.SSS").valueOf(),

      defaultSortOrder: "descend",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 220,
      render: (_, record) => {
        const hasWhatsapp = !!record.mobileNumbers;
        const hasEmail = !!record.emails;

        return (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {/* WhatsApp */}
            {hasWhatsapp ? (
              <Button
                size="middle"
                style={{
                  backgroundColor: "#1ab394",
                  color: "white",
                  borderColor: "#1ab394",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => openWhatsappModalForRecord(record)}
              >
                <FaWhatsapp size={16} />
                WhatsApp
              </Button>
            ) : (
              <span style={{ color: "#999" }}>-</span>
            )}

            {/* Email */}
            {hasEmail ? (
              <Button
                size="middle"
                style={{
                  backgroundColor: "#008cba",
                  color: "white",
                  borderColor: "#008cba",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => openEmailModalForRecord(record)}
              >
                <MdEmail size={16} />
                Email
              </Button>
            ) : (
              <span style={{ color: "#999" }}>-</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Title level={3} className="!m-0">
              Rotary Data
            </Title>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                style={{
                  backgroundColor: "#1ab394",
                  color: "white",
                  borderColor: "#1ab394",
                }}
                size="large"
                onClick={openWhatsappModal}
                icon={<FaWhatsapp />}
              >
                Bulk WhatsApp
              </Button>

              <Button
                style={{
                  backgroundColor: "#008cba",
                  color: "white",
                  borderColor: "#008cba",
                }}
                size="large"
                onClick={openEmailModal}
                icon={<MdEmail />}
              >
                Bulk Email
              </Button>

              <div>
                <Button
                  style={{
                    backgroundColor: "#845956",
                    borderColor: "#845956",
                    color: "white",
                  }}
                  size="large"
                  loading={extracting}
                  onClick={extractAllMissing}
                  disabled={missingDataCount === 0}
                >
                  Extract All Data
                </Button>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {missingDataCount} records (max 50)
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
        .custom-search-wrapper .ant-input-group-addon .ant-btn {
          background-color: #008cba !important;
          border-color: #008cba !important;
          color: white !important;
        }
        
        .custom-search-wrapper .ant-input-group-addon .ant-btn:hover,
        .custom-search-wrapper .ant-input-group-addon .ant-btn:focus {
          background-color: #006d98 !important;   /* darker hover shade */
          border-color: #006d98 !important;
        }

        /* Optional: better spacing on very small screens */
        @media (max-width: 575px) {
          .entries-control {
            justify-content: center !important;
            margin-bottom: 12px !important;
          }
          .search-col {
            text-align: center !important;
          }
        }
      `}</style>
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
                style={{ width: 100 }}
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
            <div className="custom-search-wrapper">
              <AntSearch
                placeholder="Search by email or phone..."
                allowClear
                enterButton
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                style={{ width: 280, maxWidth: "100%" }}
              />
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" tip="Loading Rotary Data..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRows}
            rowKey={(record, idx) => `${idx}-${record?.image || "row"}`}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
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
          okButtonProps={{
            style: { backgroundColor: "#1ab394", borderColor: "#1ab394" },
          }}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
            >
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
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
            >
              Message Content:
            </label>
            <TextArea
              rows={6}
              maxLength={5000}
              placeholder="Enter your message here..."
              value={whatsappContent}
              onChange={(e) => setWhatsappContent(e.target.value)}
            />
            <div
              style={{
                textAlign: "right",
                marginTop: 5,
                color: whatsappContent.length > 4500 ? "red" : "#888",
                fontSize: "12px",
              }}
            >
              {whatsappContent.length} / 5000 characters
            </div>
          </div>
        </Modal>
        {/* Email Modal */}
        <Modal
          title="Send Email"
          open={emailModalVisible}
          onCancel={() => setEmailModalVisible(false)}
          onOk={sendEmailMessage}
          confirmLoading={sendingEmail}
          okText="Send"
          okButtonProps={{
            style: { backgroundColor: "#008cba", borderColor: "#008cba" },
          }}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
            >
              Emails ({emailList.length}):
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
              {emailList.length > 0 ? (
                emailList.join(", ")
              ) : (
                <span style={{ color: "#999" }}>No emails found</span>
              )}
            </div>
          </div>

          {/* <div>
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
            >
              Email Content:
            </label>
            <TextArea
              rows={6}
              maxLength={5000}
              placeholder="Enter your email message here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
            <div
              style={{
                textAlign: "right",
                marginTop: 5,
                color: emailContent.length > 4500 ? "red" : "#888",
                fontSize: "12px",
              }}
            >
              {emailContent.length} / 5000 characters
            </div>
          </div> */}
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

export default RotaryData;
