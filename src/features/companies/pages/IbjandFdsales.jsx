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
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const API_URLS = {
  ibjOfficial: `${BASE_URL}/ai-service/agent/ibjOffical`,
  iibsSummit: `${BASE_URL}/ai-service/agent/iibsSummit`,
  fdSalesImages: `${BASE_URL}/ai-service/agent/fdSalesImages`,
};

const TAB_ITEMS = [
  { key: "ibjOfficial", label: "IBJ Official" },
  { key: "iibsSummit", label: "IIBS Summit" },
  { key: "fdSalesImages", label: "FD Sales Images" },
];

// ✅ normalize emails/mobiles from string/array, and show in next line
const toLines = (value) => {
  if (!value) return [];
  if (Array.isArray(value))
    return value
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);

  return String(value)
    .split(/[,;\n]/g) // comma, semicolon, newline
    .map((s) => s.trim())
    .filter(Boolean);
};

const IbjandFdsales = () => {
  const [activeTab, setActiveTab] = useState("ibjOfficial");

  const [dataByTab, setDataByTab] = useState({
    ibjOfficial: [],
    iibsSummit: [],
    fdSalesImages: [],
  });

  const [loadingByTab, setLoadingByTab] = useState({
    ibjOfficial: false,
    iibsSummit: false,
    fdSalesImages: false,
  });

  // ✅ IMPORTANT: prevent API hitting again and again
  const fetchedTabsRef = useRef({
    ibjOfficial: false,
    iibsSummit: false,
    fdSalesImages: false,
  });

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  useEffect(() => {
    const tabKey = activeTab;

    // ✅ already fetched => don't call again
    if (fetchedTabsRef.current[tabKey]) return;

    const fetchData = async () => {
      try {
        setLoadingByTab((prev) => ({ ...prev, [tabKey]: true }));

        const accessToken = localStorage.getItem("token");

        const res = await axios.post(
          API_URLS[tabKey],
          {}, // 👈 empty body
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

        setDataByTab((prev) => ({ ...prev, [tabKey]: sorted }));

        // ✅ mark fetched ONLY after success
        fetchedTabsRef.current[tabKey] = true;
      } catch (err) {
        console.error(err);
        message.error(
          `Failed to load ${TAB_ITEMS.find((t) => t.key === tabKey)?.label}`,
        );
      } finally {
        setLoadingByTab((prev) => ({ ...prev, [tabKey]: false }));
      }
    };

    fetchData();
  }, [activeTab]);

  const currentRows = dataByTab[activeTab] || [];

  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return currentRows;

    return currentRows.filter((r) =>
      [r?.name, r?.emails, r?.mobileNumbers, r?.extractAiText || ""].some(
        (field) =>
          String(field || "")
            .toLowerCase()
            .includes(val),
      ),
    );
  }, [currentRows, search]);

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
    // {
    //   title: "Contact Details",
    //   key: "contactDetails",
    //   align: "center",
    //   render: (_, record) => {
    //     const emailLines = toLines(record?.emails);
    //     const mobileLines = toLines(record?.mobileNumbers);

    //     return (
    //       <div style={{ fontSize: "0.9em", lineHeight: "1.6" }}>
    //         {/* Emails Section */}
    //         {emailLines.length > 0 && (
    //           <div style={{ marginBottom: 6 }}>
    //             <strong>Email:</strong>
    //             {emailLines.map((email, index) => (
    //               <div key={`email-${index}`} style={{ marginLeft: 10 }}>
    //                 {email}
    //               </div>
    //             ))}
    //           </div>
    //         )}

    //         {/* Mobile Section */}
    //         {mobileLines.length > 0 && (
    //           <div>
    //             <strong>Phone:</strong>
    //             {mobileLines.map((mobile, index) => (
    //               <div key={`mobile-${index}`} style={{ marginLeft: 10 }}>
    //                 {mobile}
    //               </div>
    //             ))}
    //           </div>
    //         )}

    //         {/* If no data */}
    //         {emailLines.length === 0 && mobileLines.length === 0 && (
    //           <span style={{ color: "#aaa" }}>-</span>
    //         )}
    //       </div>
    //     );
    //   },
    // },

    // {
    //   title: "Email Sent",
    //   dataIndex: "emailSend",
    //   key: "emailSend",

    //   align: "center",
    //   render: (sent) =>
    //     sent ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    // },
    // {
    //   title: "WhatsApp Sent",
    //   dataIndex: "whatsappSend",
    //   key: "whatsappSend",

    //   align: "center",
    //   render: (sent) =>
    //     sent ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    // },

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
    // {
    //   title: "Extracted AI Text",
    //   dataIndex: "extractAiText",
    //   key: "extractAiText",

    //   align: "center",
    //   ellipsis: { showTitle: false },
    //   render: (text) =>
    //     text ? (
    //       <Tooltip placement="topLeft" title={text}>
    //         <div
    //           style={{
    //             whiteSpace: "pre-wrap",
    //             maxHeight: 120,
    //             overflow: "auto",
    //             fontSize: "0.9em",
    //           }}
    //         >
    //           {text}
    //         </div>
    //       </Tooltip>
    //     ) : (
    //       <span style={{ color: "#aaa" }}>-</span>
    //     ),
    // },
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto mb-6">
          <Title level={3} className="!m-0">
            IBJ, IIBS & FD Sales Dashboard
          </Title>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination((p) => ({ ...p, current: 1 }));
            setSearch("");
          }}
          size="large"
        >
          {TAB_ITEMS.map((tab) => (
            <TabPane tab={tab.label} key={tab.key}>
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
                  <input
                    placeholder="Search name, email, phone, extracted text..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    style={{
                      width: 320,
                      maxWidth: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                    }}
                  />
                </Col>
              </Row>

              {loadingByTab[activeTab] ? (
                <div className="flex justify-center items-center py-20">
                  <Spin size="large" tip={`Loading ${tab.label}...`} />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredRows}
                  // ✅ stable key (use id if available)
                  rowKey={(r, idx) => r?.id || `${activeTab}-${idx}`}
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
                  scroll={{ x: "max-content" }}
                  bordered
                  size="middle"
                  className="max-w-7xl mx-auto"
                />
              )}
            </TabPane>
          ))}
        </Tabs>
      </div>
    </CompaniesLayout>
  );
};

export default IbjandFdsales;
