import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Typography,
  Empty,
  Spin,
  Tooltip,
  Image,
  Alert,
} from "antd";
import {
  IdcardOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";

const { Title, Text } = Typography;

const ALL_EMPLOYEES_URL = `${BASE_URL}/user-service/getAllEmployees`;
const EMPLOYEE_INFO_BASE =
  `${BASE_URL}/user-service/write/employee-info`;

// Brand theme colors
const COLOR_BLUE = "#008cba";
const COLOR_TEAL = "#1ab394";

/* ─── Helpers ─────────────────────────────────────────────────── */
const val = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (
    !s ||
    s.toLowerCase() === "null" ||
    s.toLowerCase() === "undefined" ||
    s === "-"
  ) {
    return null;
  }
  return s;
};

const workingStatusConfig = {
  FULLTIME: { label: "Full Time", bg: "#eafaf5", color: "#1ab394", border: "#a3e5d8" },
  PARTTIME: { label: "Part Time", bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
  INTERN: { label: "Intern", bg: "#e6f4f8", color: "#008cba", border: "#bfe2ee" },
  CONTRACT: { label: "Contract", bg: "#f9f0ff", color: "#722ed1", border: "#d3adf7" },
  FREELANCER: { label: "Freelancer", bg: "#e6fffb", color: "#13c2c2", border: "#87e8de" },
};

const WorkingStatusTag = ({ status }) => {
  if (!status) return null;
  const normalized = String(status).toUpperCase().replace(/[\s_-]/g, "");
  const matchedKey = Object.keys(workingStatusConfig).find(
    (k) => k === normalized || normalized.includes(k)
  );
  const cfg = matchedKey
    ? workingStatusConfig[matchedKey]
    : { label: status, bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" };

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 12,
        padding: "1px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
};

/* ─── Main Page Component ─────────────────────────────────────── */
const EmployeeInfoDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEmployees([]);
    try {
      const listRes = await axiosInstance.get(ALL_EMPLOYEES_URL);
      const list = Array.isArray(listRes.data) ? listRes.data : [];

      const enriched = await Promise.all(
        list.map(async (emp, idx) => {
          try {
            const infoRes = await axiosInstance.get(
              `${EMPLOYEE_INFO_BASE}/${emp.userId}`
            );
            const data = infoRes.data || {};
            // Supports both formats: { employeeInfo: {...}, aadharUrl: "...", panUrl: "...", imageUrl: "..." } and direct object
            const empInfo = data.employeeInfo || data || {};
            const aadharUrl = val(data.aadharUrl) || val(empInfo.aadharUrl) || null;
            const panUrl = val(data.panUrl) || val(empInfo.panUrl) || null;
            const imgUrl =
              val(data.imageUrl) ||
              val(empInfo.imageUrl) ||
              val(empInfo.profileUrl) ||
              val(empInfo.userProfileUrl) ||
              null;

            return {
              ...emp,
              info: {
                ...empInfo,
                aadharUrl,
                panUrl,
              },
              aadharUrl,
              panUrl,
              imageUrl: imgUrl,
              _key: idx,
            };
          } catch {
            return {
              ...emp,
              info: {},
              aadharUrl: null,
              panUrl: null,
              imageUrl: null,
              _key: idx,
            };
          }
        })
      );

      // Sort alphabetically by employee name (A to Z)
      const sorted = [...enriched].sort((a, b) => {
        const nameA = String(a.name || a.info?.name || "").trim().toLowerCase();
        const nameB = String(b.name || b.info?.name || "").trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setEmployees(sorted);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Table Columns
  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#64748b" }}>
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Profile Image",
      key: "profileImage",
      width: 100,
      align: "center",
      render: (_, record) => {
        const info = record.info || {};
        const profileUrl =
          val(record.imageUrl) ||
          val(info.imageUrl) ||
          val(info.profileUrl) ||
          val(info.userProfileUrl) ||
          val(info.profilePicUrl) ||
          val(info.photoUrl);

        if (!profileUrl) {
          return <span style={{ color: "#94a3b8" }}>—</span>;
        }

        return (
          <Image
            src={profileUrl}
            width={50}
            height={60}
            style={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              objectFit: "cover",
              cursor: "pointer",
            }}
            preview={{ mask: null }}
          />
        );
      },
    },
    {
      title: "Personal Details",
      key: "personalDetails",
      sorter: (a, b) => {
        const nameA = String(a.name || a.info?.name || "").trim().toLowerCase();
        const nameB = String(b.name || b.info?.name || "").trim().toLowerCase();
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => {
        const info = record.info || {};
        const name = val(record.name) || val(info.name) || "Employee";
        const email = val(info.email) || val(record.mail);
        const mobile = val(info.contactNumber) || val(record.empNumber);
        const aadharNum = val(info.aadharNumber);
        const panNum = val(info.panNumber);
        const bloodGroup = val(info.bloodGroup);
        const status = info.employeeWorkingStatus;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                {name}
              </span>
              {status && <WorkingStatusTag status={status} />}
            </div>

              <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
                {val(info.employeeIdNumber) && (
                  <div>
                    <strong style={{ color: "#64748b" }}>Employee ID: </strong>
                    <span style={{ color: COLOR_BLUE, fontWeight: 600 }}>{info.employeeIdNumber}</span>
                  </div>
                )}
                {mobile && (
                  <div>
                    <strong style={{ color: "#64748b" }}>Mobile Number: </strong>
                    <a href={`tel:${mobile}`} style={{ color: COLOR_TEAL, textDecoration: "none", fontWeight: 500 }}>
                      {mobile}
                    </a>
                  </div>
                )}
                {email && (
                  <div>
                    <strong style={{ color: "#64748b" }}>Email: </strong>
                    <a href={`mailto:${email}`} style={{ color: "#334155", textDecoration: "none" }}>
                      {email}
                    </a>
                  </div>
                )}
                {aadharNum && (
                  <div>
                    <strong style={{ color: "#64748b" }}>Aadhaar: </strong>
                    <span style={{ color: COLOR_BLUE, fontWeight: 600 }}>{aadharNum}</span>
                  </div>
                )}
                {panNum && (
                  <div>
                    <strong style={{ color: "#64748b" }}>PAN: </strong>
                    <span style={{ color: COLOR_TEAL, fontWeight: 600 }}>{panNum}</span>
                  </div>
                )}
                {bloodGroup && (
                  <div>
                    <strong style={{ color: "#64748b" }}>Blood Group: </strong>
                    <span
                      style={{
                        background: "#fff1f0",
                        border: "1px solid #ffa39e",
                        color: "#cf1322",
                        padding: "0px 6px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {String(bloodGroup).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
        );
      },
    },
    {
      title: "Address",
      key: "address",
      render: (_, record) => {
        const info = record.info || {};
        const homeAddress = val(info.homeAddress);
        const linkedin = val(info.linkdinUrl);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {homeAddress ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
                <EnvironmentOutlined style={{ color: COLOR_BLUE, marginTop: 3, flexShrink: 0 }} />
                <span>{homeAddress}</span>
              </div>
            ) : (
              <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
            )}

            {linkedin && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginTop: 2 }}>
                <LinkedinOutlined style={{ color: COLOR_BLUE }} />
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: COLOR_BLUE, textDecoration: "none", fontWeight: 500 }}
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Graduation Details",
      key: "graduationDetails",
      render: (_, record) => {
        const info = record.info || {};
        const graduation = val(info.graduation);
        const course = val(info.graduationCourse);
        const passYear = val(info.graduationPassOutYear);
        const collegeAddress = val(info.graduationCollegeAddress);
        const collegeUrl = val(info.graduationCollegeWebsiteUrl);
        const intermediate = val(info.intermediate);
        const ssc = val(info.ssc);
        const diploma = val(info.diploma);

        const hasAnyGraduation = graduation || course || passYear || collegeAddress || collegeUrl;

        if (!hasAnyGraduation && !intermediate && !ssc && !diploma) {
          return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(graduation || course) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a", fontSize: 13, fontWeight: 700 }}>
                <BookOutlined style={{ color: COLOR_BLUE }} />
                <span>
                  {[graduation, course].filter(Boolean).join(" — ")}
                  {passYear ? <span style={{ color: "#64748b", fontWeight: 500, fontSize: 12 }}> ({passYear})</span> : null}
                </span>
              </div>
            )}

            {collegeAddress && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 12, color: "#475569" }}>
                <EnvironmentOutlined style={{ color: COLOR_TEAL, marginTop: 3, flexShrink: 0 }} />
                <span>{collegeAddress}</span>
              </div>
            )}

            {collegeUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <GlobalOutlined style={{ color: COLOR_BLUE, flexShrink: 0 }} />
                <a
                  href={collegeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: COLOR_BLUE, textDecoration: "none" }}
                >
                  {collegeUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}

            {(intermediate || ssc || diploma) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4, fontSize: 11, color: "#64748b" }}>
                {intermediate && (
                  <span style={{ background: "#f8fafc", padding: "1px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                    <strong>Inter:</strong> {intermediate}
                  </span>
                )}
                {ssc && (
                  <span style={{ background: "#f8fafc", padding: "1px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                    <strong>SSC:</strong> {ssc}
                  </span>
                )}
                {diploma && (
                  <span style={{ background: "#f8fafc", padding: "1px 6px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                    <strong>Diploma:</strong> {diploma}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Documents",
      key: "documents",
      render: (_, record) => {
        const info = record.info || {};
        const aadharUrl = val(record.aadharUrl) || val(info.aadharUrl);
        const panUrl = val(record.panUrl) || val(info.panUrl);

        if (!aadharUrl && !panUrl) {
          return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
        }

        return (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {aadharUrl && (
              <Image
                src={aadharUrl}
                width={64}
                height={42}
                style={{
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                preview={{ mask: null }}
              />
            )}

            {panUrl && (
              <Image
                src={panUrl}
                width={64}
                height={42}
                style={{
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                preview={{ mask: null }}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div style={{ padding: "0 0 24px" }}>
        {/* Title row */}
        <div style={{ marginBottom: 20 }}>
          <Title
            level={4}
            style={{
              margin: 0,
              color: "#000000",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Employee Info Details
          </Title>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message="Data Load Error"
            description={error}
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spin size="large" tip="Loading employee information…" />
          </div>
        )}

        {/* Empty State */}
        {!loading && employees.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: "60px 20px",
              borderRadius: 14,
              border: "1px dashed #cbd5e1",
              textAlign: "center",
            }}
          >
            <Empty description="No employee information records found." />
          </div>
        )}

        {/* Details Table */}
        {!loading && employees.length > 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,

              overflow: "hidden",
            }}
          >
            <Table
              bordered
              dataSource={employees}
              columns={columns}
             scroll={{x:true}}
              rowKey={(r) => r.userId || r._key}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: employees.length,
                showSizeChanger: false,
                showQuickJumper: false,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
              rowClassName={(_, i) => (i % 2 === 0 ? "table-row-even" : "table-row-odd")}
            />
          </div>
        )}

        <style>{`
          .ant-table-bordered {
            border: 1px solid #f0f0f0 !important;
          }
          .ant-table-bordered .ant-table-thead > tr > th {
            background: #fafafa !important;
            color: #000000 !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            border-bottom: 1px solid #f0f0f0 !important;
            border-right: 1px solid #f0f0f0 !important;
          }
          .ant-table-bordered .ant-table-tbody > tr > td {
            border-right: 1px solid #f0f0f0 !important;
            border-bottom: 1px solid #f0f0f0 !important;
          }
          .table-row-odd {
            background-color: #fafcfd;
          }
          .table-row-even {
            background-color: #ffffff;
          }
          .ant-table-tbody > tr:hover > td {
            background-color: #f7f9fa !important;
          }
          .ant-image, .ant-image-img {
            cursor: pointer !important;
          }
        `}</style>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EmployeeInfoDetails;
