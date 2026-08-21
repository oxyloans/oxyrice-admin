import { useState, useEffect, useCallback, useRef } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { Table, DatePicker, Button, Tag, Input, Skeleton, message } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "../components/UserStatCard";

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-sm">
            <div className="h-9 bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="h-14 bg-white border-l-[3px] border-l-slate-200 border border-slate-200 relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)",
                  animation: "shimmer 1.4s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </div>
  );
}

const CARD_META = {
  total: { label: "Total Users", accent: "#0f172a", grad: "linear-gradient(135deg,#0f172a,#1e293b)", sub: "All time registrations", icon: <TeamOutlined /> },
  today: { label: "Today", accent: "#0891b2", grad: "linear-gradient(135deg,#0891b2,#06b6d4)", sub: "New registrations", icon: <RiseOutlined /> },
  yesterday: { label: "Yesterday", accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", sub: "Previous day", icon: <HistoryOutlined /> },
  week: { label: "This Week", accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", sub: "Last 7 days", icon: <BarChartOutlined /> },
  month: { label: "This Month", accent: "#d97706", grad: "linear-gradient(135deg,#d97706,#f59e0b)", sub: "Month to date", icon: <LineChartOutlined /> },
};

const TABLE_COMPONENTS = {
  header: {
    cell: (props) => (
      <th {...props} style={{ ...props.style, background: "#f8fafc", color: "#1e293b", fontWeight: 800, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "2px solid #e2e8f0", padding: "7px 10px", whiteSpace: "nowrap" }} />
    ),
  },
  body: {
    cell: (props) => (
      <td {...props} style={{ ...props.style, padding: "7px 10px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", color: "#0f172a", fontSize: 12, fontWeight: 700 }} />
    ),
    row: (props) => (
      <tr {...props} style={{ ...props.style, transition: "background .15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")} />
    ),
  },
};

const PAGE_SIZE = 50;

// Normalize API response fields to match the table's expected shape
function normalizeUserRow(u) {
  return {
    ...u,
    id: u.id || u.userId || "",
    fullName: u.fullName || u.userName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "",
    email: u.email || "",
    mobileNumber: u.mobileNumber || u.whastappNumber || u.whatsappNumber || "",
    whatsappNumber: u.whastappNumber || u.whatsappNumber || "",
    registerFrom: u.registerFrom || u.registeredFrom || "",
    userType: u.userType || "",
    created_at: u.created_at || u.userRegisterCreatedDate || u.createdAt || "",
    flatNo: u.flatNo || "",
    landMark: u.landMark || "",
    address: u.address || "",
    pinCode: u.pinCode || "",
  };
}

// Mobile search: POST to the correct endpoint and stream results in
async function fetchMobilePages(mob, onChunk, signal) {
  const res = await adminApi.post(
    "/user-service/getDataWithMobileOrWhatsappOrUserId",
    { number: mob.trim(), userId: null },
    { signal }
  );

  const raw = res.data?.activeUsersResponse ?? res.data?.data ?? [];
  const rows = Array.isArray(raw) ? raw.map(normalizeUserRow) : [];
  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  onChunk(rows, rows.length);
  return rows;
}

export default function AskOxyUsers() {
  const today = dayjs();
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [mobileInput, setMobileInput] = useState("");
  const [mobile, setMobile] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState({ total: null, today: null, yesterday: null, week: null, month: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const fromRef = useRef(fromDate);
  const toRef = useRef(toDate);
  const mobileRef = useRef("");
  const abortRef = useRef(null);
  fromRef.current = fromDate;
  toRef.current = toDate;

  const cancelPending = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  // Date-range fetch (server-paginated)
  const fetchByDate = useCallback(async (pg = 0, from, to) => {
    cancelPending();
    setLoading(true);
    setStreaming(false);
    try {
      const f = (from ?? fromRef.current).format("YYYY-MM-DD");
      const t = (to ?? toRef.current).format("YYYY-MM-DD");
      const res = await adminApi.get(
        `/user-service/date-rangeuserdetails?startDate=${f}&endDate=${t}&page=${pg}&size=${PAGE_SIZE}`
      );
      const rows = res.data?.content ?? [];
      const rowDate = (r) => r.created_at || r.createdAt || r.userRegisterCreatedDate || 0;
      rows.sort((a, b) => new Date(rowDate(b)) - new Date(rowDate(a)));
      setData(rows);
      setTotal(res.data?.totalElements ?? 0);
      setPage(pg);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Mobile search: streams results so UI updates progressively
  const fetchByMobile = useCallback(async (mob) => {
    cancelPending();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setStreaming(true);
    setData([]);
    setTotal(0);
    setPage(0);

    try {
      await fetchMobilePages(
        mob,
        (rows, tot) => {
          if (!ctrl.signal.aborted) {
            setData(rows);
            setTotal(tot);
            setLoading(false); // show data immediately
          }
        },
        ctrl.signal
      );
    } catch (err) {
      if (!ctrl.signal.aborted) {
        setData([]);
        setTotal(0);
        // API may return 500 when no user is found – show a friendly message
        if (err?.response?.status === 500) {
          message.info("No user found for this mobile number.");
        } else {
          message.error(err?.response?.data?.message || "Failed to search user. Please try again.");
        }
      }
    } finally {
      if (!ctrl.signal.aborted) {
        setLoading(false);
        setStreaming(false);
      }
      setInitialLoad(false);
    }
  }, []);

  const handleMobileSearch = useCallback((num) => {
    const n = (num ?? "").trim();
    setMobile(n);
    mobileRef.current = n;
    if (!n) {
      fetchByDate(0, fromRef.current, toRef.current);
    } else {
      fetchByMobile(n);
    }
  }, [fetchByDate, fetchByMobile]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await adminApi.get("/user-service/counts");
      const d = r.data;
      setStats({
        total: d.totalUsers ?? 0,
        today: d.todayUsers ?? 0,
        yesterday: d.yesterdayUsers ?? 0,
        week: d.thisWeekUsers ?? 0,
        month: d.thisMonthUsers ?? 0,
      });
    } catch { /* keep nulls */ } finally {
      setStatsLoading(false);
    }
  }, []);

  const quickFetch = useCallback((start, end) => {
    setFromDate(start);
    setToDate(end);
    fromRef.current = start;
    toRef.current = end;
    setMobileInput("");
    setMobile("");
    mobileRef.current = "";
    fetchByDate(0, start, end);
  }, [fetchByDate]);

  useEffect(() => {
    fetchByDate(0, fromDate, toDate);
    fetchStats();
    return () => cancelPending();
  }, []);

  const columns = [
    {
      title: "S.No",
      width: "5%",
      align: "center",
      render: (_, __, i) => <span className="font-bold text-xs text-slate-700">{page * PAGE_SIZE + i + 1}</span>,
    },
    {
      title: "User ID",
      dataIndex: "id",
      width: "9%",
      align: "center",
      render: (v) => v
        ? <span className="font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">#{v.slice(-4)}</span>
        : "—",
    },
    {
      title: "User Details",
      width: "20%",
      align: "left",
      render: (_, row) => (
        <div className="flex flex-col items-start gap-0.5">
          <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[160px]">
            {row.fullName || <span className="text-slate-400 font-normal">No Name</span>}
          </div>
          <span className="text-[11px] text-slate-500 font-bold break-all">{row.email || "—"}</span>
        </div>
      ),
    },
    {
      title: "Mobile",
      width: "13%",
      align: "center",
      render: (_, row) => {
        const num = row.mobileNumber || row.whatsappNumber;
        return num
          ? <span className="font-mono text-xs font-bold text-slate-800">{num}</span>
          : <span className="text-slate-300">—</span>;
      },
    },
    {
      title: "Source / Type",
      width: "15%",
      align: "center",
      render: (_, row) => (
        <div className="flex flex-col items-center gap-1">
          {row.registerFrom
            ? <Tag color={row.registerFrom === "WEB" ? "blue" : row.registerFrom === "APP" ? "green" : "default"} style={{ marginInlineEnd: 0, fontWeight: 700, fontSize: 11 }}>{row.registerFrom}</Tag>
            : <span className="text-slate-300">—</span>}
          {row.userType
            ? <Tag color={row.userType === "NEW USER" ? "purple" : "cyan"} style={{ marginInlineEnd: 0, borderRadius: 20, fontWeight: 700, fontSize: 10, border: "none", padding: "1px 8px" }}>{row.userType}</Tag>
            : null}
        </div>
      ),
    },
    {
      title: "Registration Date",
      dataIndex: "created_at",
      width: "14%",
      align: "center",
      render: (v) => v
        ? <div className="text-center">
            <div className="text-xs font-bold text-slate-800">{v.slice(0, 10)}</div>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">{v.slice(11, 16)}</div>
          </div>
        : "—",
    },
    {
      title: "Address",
      width: "24%",
      align: "center",
      render: (_, row) => {
        const parts = [row.flatNo, row.landMark, row.address, row.pinCode].filter(Boolean);
        return parts.length
          ? <span className="inline-block max-w-[220px] text-[11px] text-slate-700 font-bold whitespace-normal break-words">{parts.join(", ")}</span>
          : <span className="text-slate-300">—</span>;
      },
    },
  ];

  if (initialLoad && loading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {["total", "today", "yesterday", "week", "month"].map((id) => (
          <UserStatCard
            key={id}
            meta={CARD_META[id]}
            value={stats[id]}
            loading={statsLoading}
            onClick={id === "total" ? null : () => {
              const map = {
                today: [dayjs(), dayjs()],
                yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
                week: [dayjs().subtract(6, "day"), dayjs()],
                month: [dayjs().startOf("month"), dayjs()],
              };
              quickFetch(...map[id]);
            }}
          />
        ))}
      </div>

      {/* Filter + Table */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50">
          <span className="text-[11px] font-semibold text-slate-500">From</span>
          <DatePicker
            value={fromDate}
            onChange={(v) => { setFromDate(v); fromRef.current = v; }}
            format="YYYY-MM-DD"
            allowClear={false}
            disabledDate={(d) => toDate && d.isAfter(toDate, "day")}
            style={{ borderRadius: 7, height: 30, width: 130 }}
          />
          <span className="text-[11px] font-semibold text-slate-500">To</span>
          <DatePicker
            value={toDate}
            onChange={(v) => { setToDate(v); toRef.current = v; }}
            format="YYYY-MM-DD"
            allowClear={false}
            disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")}
            style={{ borderRadius: 7, height: 30, width: 130 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setMobileInput("");
              setMobile("");
              mobileRef.current = "";
              fetchByDate(0, fromRef.current, toRef.current);
            }}
            style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #0891b230" }}
          >
            Get Data
          </Button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <Input
            prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by mobile number..."
            value={mobileInput}
            onChange={(e) => setMobileInput(e.target.value)}
            onPressEnter={() => handleMobileSearch(mobileInput)}
            allowClear
            onClear={() => handleMobileSearch("")}
            style={{ width: 220, borderRadius: 7, height: 30 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading && !!mobile}
            onClick={() => handleMobileSearch(mobileInput)}
            style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #0891b230" }}
          >
            Search
          </Button>
          {mobile && (
            <Button
              onClick={() => { setMobileInput(""); handleMobileSearch(""); }}
              style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
            >
              Clear
            </Button>
          )}
          {total > 0 && (
            <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full ml-auto">
              {total.toLocaleString()} records
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">User Records</span>
            {total > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.length} / {total.toLocaleString()}
              </span>
            )}
          </div>
          {(loading || streaming) && (
            <span className="text-[11px] text-cyan-600 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-sky-200 border-t-cyan-600 inline-block" style={{ animation: "spin .7s linear infinite" }} />
              {streaming ? `Streaming… ${data.length} loaded` : "Loading..."}
            </span>
          )}
        </div>

        <Table
          className="oxyone-square-table"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading && data.length === 0}
          pagination={
            mobile
              ? {
                  pageSize: PAGE_SIZE,
                  total: data.length,
                  showSizeChanger: false,
                  showTotal: (t) => `${t.toLocaleString()} users found`,
                  style: { padding: "8px 12px 10px", margin: 0 },
                }
              : {
                  current: page + 1,
                  pageSize: PAGE_SIZE,
                  total,
                  showSizeChanger: false,
                  showTotal: (t) => `Total ${t.toLocaleString()} users`,
                  onChange: (p) => fetchByDate(p - 1, fromRef.current, toRef.current),
                  style: { padding: "8px 12px 10px", margin: 0 },
                }
          }
          scroll={{ x: true }}
          size="small"
          tableLayout="fixed"
          components={TABLE_COMPONENTS}
        />
      </div>
    </div>
  );
}
