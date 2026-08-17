import { useState, useEffect, useCallback, useRef } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { Table, DatePicker, Button, Tag, Input, Skeleton } from "antd";
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
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)", animation: "shimmer 1.4s ease-in-out infinite" }} />
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
  total:     { label: "Total Partners",  accent: "#0f172a", grad: "linear-gradient(135deg,#0f172a,#1e293b)", sub: "All time registrations", icon: <TeamOutlined /> },
  today:     { label: "Today",           accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", sub: "New registrations",      icon: <RiseOutlined /> },
  yesterday: { label: "Yesterday",       accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", sub: "Previous day",           icon: <HistoryOutlined /> },
  week:      { label: "This Week",       accent: "#0891b2", grad: "linear-gradient(135deg,#0891b2,#06b6d4)", sub: "Last 7 days",            icon: <BarChartOutlined /> },
  month:     { label: "This Month",      accent: "#d97706", grad: "linear-gradient(135deg,#d97706,#f59e0b)", sub: "Month to date",          icon: <LineChartOutlined /> },
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

function normalizeRow(u) {
  return {
    ...u,
    id: u.id || u.userId || "",
    fullName: u.fullName || u.userName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "",
    email: u.email || "",
    mobileNumber: u.mobileNumber || u.mobile || "",
    partnerType: u.partnerType || "",
    status: u.status || "",
    created_at: u.createdAt || u.registeredDate || u.created_at || "",
  };
}

export default function PartnerLenderUsers() {
  const today = dayjs();
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [mobileInput, setMobileInput] = useState("");
  const [mobile, setMobile] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState({ total: null, today: null, yesterday: null, week: null, month: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const fromRef = useRef(fromDate);
  const toRef = useRef(toDate);
  fromRef.current = fromDate;
  toRef.current = toDate;

  const fetchByDate = useCallback(async (pg = 0, from, to) => {
    setLoading(true);
    try {
      const f = (from ?? fromRef.current).format("YYYY-MM-DD");
      const t = (to ?? toRef.current).format("YYYY-MM-DD");
      const res = await adminApi.get("/user-service/partners", {
        params: { page: pg, size: PAGE_SIZE, partnerType: "LENDER", startDate: f, endDate: t },
      });
      const d = res.data ?? {};
      setData((d.content ?? []).map(normalizeRow));
      setTotal(d.totalElements ?? d.totalCount ?? 0);
      setPage(pg);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const fetchByMobile = useCallback(async (mob) => {
    setLoading(true);
    setData([]);
    setTotal(0);
    try {
      const res = await adminApi.get("/user-service/partners", {
        params: { page: 0, size: 200, partnerType: "LENDER", mobile: mob.trim() },
      });
      const rows = (res.data?.content ?? []).map(normalizeRow);
      setData(rows);
      setTotal(rows.length);
      setPage(0);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const handleMobileSearch = useCallback((num) => {
    const n = (num ?? "").trim();
    setMobile(n);
    if (!n) fetchByDate(0, fromRef.current, toRef.current);
    else fetchByMobile(n);
  }, [fetchByDate, fetchByMobile]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminApi.get("/user-service/partners", { params: { page: 0, size: 1, partnerType: "LENDER" } });
      const totalCount = res.data?.totalElements ?? res.data?.totalCount ?? 0;
      const todayStr = dayjs().format("YYYY-MM-DD");
      const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const weekStr = dayjs().subtract(6, "day").format("YYYY-MM-DD");
      const monthStr = dayjs().startOf("month").format("YYYY-MM-DD");

      const [todayRes, yesterdayRes, weekRes, monthRes] = await Promise.allSettled([
        adminApi.get("/user-service/partners", { params: { page: 0, size: 1, partnerType: "LENDER", startDate: todayStr, endDate: todayStr } }),
        adminApi.get("/user-service/partners", { params: { page: 0, size: 1, partnerType: "LENDER", startDate: yesterdayStr, endDate: yesterdayStr } }),
        adminApi.get("/user-service/partners", { params: { page: 0, size: 1, partnerType: "LENDER", startDate: weekStr, endDate: todayStr } }),
        adminApi.get("/user-service/partners", { params: { page: 0, size: 1, partnerType: "LENDER", startDate: monthStr, endDate: todayStr } }),
      ]);

      setStats({
        total: totalCount,
        today: todayRes.status === "fulfilled" ? (todayRes.value.data?.totalElements ?? 0) : 0,
        yesterday: yesterdayRes.status === "fulfilled" ? (yesterdayRes.value.data?.totalElements ?? 0) : 0,
        week: weekRes.status === "fulfilled" ? (weekRes.value.data?.totalElements ?? 0) : 0,
        month: monthRes.status === "fulfilled" ? (monthRes.value.data?.totalElements ?? 0) : 0,
      });
    } catch { /* keep nulls */ } finally {
      setStatsLoading(false);
    }
  }, []);

  const quickFetch = useCallback((start, end) => {
    setFromDate(start); setToDate(end);
    fromRef.current = start; toRef.current = end;
    setMobileInput(""); setMobile("");
    fetchByDate(0, start, end);
  }, [fetchByDate]);

  useEffect(() => {
    fetchByDate(0, fromDate, toDate);
    fetchStats();
  }, []);

  const columns = [
    {
      title: "S.No", width: "5%", align: "center",
      render: (_, __, i) => <span className="font-bold text-xs text-slate-700">{page * PAGE_SIZE + i + 1}</span>,
    },
    {
      title: "User Details", width: "22%", align: "left",
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[160px]">
            {row.fullName || <span className="text-slate-400 font-normal">No Name</span>}
          </div>
          <span className="text-[11px] text-slate-500 font-bold break-all">{row.email || "—"}</span>
        </div>
      ),
    },
    {
      title: "Mobile", width: "14%", align: "center",
      render: (_, row) => row.mobileNumber
        ? <span className="font-mono text-xs font-bold text-slate-800">{row.mobileNumber}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      title: "Partner Type", width: "14%", align: "center",
      render: (_, row) => row.partnerType
        ? <Tag color="green" style={{ marginInlineEnd: 0, fontWeight: 700, fontSize: 11 }}>{row.partnerType}</Tag>
        : <span className="text-slate-300">—</span>,
    },
    {
      title: "Status", width: "12%", align: "center",
      render: (_, row) => row.status
        ? <Tag color={row.status === "ACTIVE" ? "cyan" : "default"} style={{ marginInlineEnd: 0, fontWeight: 700, fontSize: 11 }}>{row.status}</Tag>
        : <span className="text-slate-300">—</span>,
    },
    {
      title: "Registered Date", dataIndex: "created_at", width: "14%", align: "center",
      render: (v) => v
        ? <div className="text-center">
            <div className="text-xs font-bold text-slate-800">{v.slice(0, 10)}</div>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">{v.slice(11, 16)}</div>
          </div>
        : "—",
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
                today:     [dayjs(), dayjs()],
                yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
                week:      [dayjs().subtract(6, "day"), dayjs()],
                month:     [dayjs().startOf("month"), dayjs()],
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
          <DatePicker value={fromDate} onChange={(v) => { setFromDate(v); fromRef.current = v; }} format="YYYY-MM-DD" allowClear={false} disabledDate={(d) => toDate && d.isAfter(toDate, "day")} style={{ borderRadius: 7, height: 30, width: 130 }} />
          <span className="text-[11px] font-semibold text-slate-500">To</span>
          <DatePicker value={toDate} onChange={(v) => { setToDate(v); toRef.current = v; }} format="YYYY-MM-DD" allowClear={false} disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")} style={{ borderRadius: 7, height: 30, width: 130 }} />
          <Button
            type="primary" icon={<SearchOutlined />}
            onClick={() => { setMobileInput(""); setMobile(""); fetchByDate(0, fromRef.current, toRef.current); }}
            style={{ background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #05996930" }}
          >Get Data</Button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <Input
            prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by mobile..."
            value={mobileInput}
            onChange={(e) => setMobileInput(e.target.value)}
            onPressEnter={() => handleMobileSearch(mobileInput)}
            allowClear onClear={() => handleMobileSearch("")}
            style={{ width: 200, borderRadius: 7, height: 30 }}
          />
          <Button
            type="primary" icon={<SearchOutlined />} loading={loading && !!mobile}
            onClick={() => handleMobileSearch(mobileInput)}
            style={{ background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #05996930" }}
          >Search</Button>
          {mobile && (
            <Button onClick={() => { setMobileInput(""); handleMobileSearch(""); }} style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}>Clear</Button>
          )}
          {total > 0 && (
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full ml-auto">
              {total.toLocaleString()} records
            </span>
          )}
        </div>

        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">Partner Records</span>
            {total > 0 && (
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.length} / {total.toLocaleString()}
              </span>
            )}
          </div>
          {loading && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-200 border-t-emerald-600 inline-block" style={{ animation: "spin .7s linear infinite" }} />
              Loading...
            </span>
          )}
        </div>

        <Table
          className="oxyone-square-table"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading && data.length === 0}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} partners`,
            onChange: (p) => fetchByDate(p - 1, fromRef.current, toRef.current),
            style: { padding: "8px 12px 10px", margin: 0 },
          }}
          scroll={{ x: true }}
          size="small"
          tableLayout="fixed"
          components={TABLE_COMPONENTS}
        />
      </div>
    </div>
  );
}
