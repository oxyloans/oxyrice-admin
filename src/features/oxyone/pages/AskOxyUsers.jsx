import { useState, useEffect, useCallback, useRef } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { Table, DatePicker, Button, Tag, Input, Skeleton, Tabs } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
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
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)",
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
  total: {
    label: "Total Users",
    accent: "#0f172a",
    grad: "linear-gradient(135deg,#0f172a,#1e293b)",
    sub: "All time registrations",
    icon: <TeamOutlined />,
  },
  today: {
    label: "Today",
    accent: "#0891b2",
    grad: "linear-gradient(135deg,#0891b2,#06b6d4)",
    sub: "New registrations",
    icon: <RiseOutlined />,
  },
  yesterday: {
    label: "Yesterday",
    accent: "#7c3aed",
    grad: "linear-gradient(135deg,#7c3aed,#a855f7)",
    sub: "Previous day",
    icon: <HistoryOutlined />,
  },
  week: {
    label: "This Week",
    accent: "#059669",
    grad: "linear-gradient(135deg,#059669,#10b981)",
    sub: "Last 7 days",
    icon: <BarChartOutlined />,
  },
  month: {
    label: "This Month",
    accent: "#d97706",
    grad: "linear-gradient(135deg,#d97706,#f59e0b)",
    sub: "Month to date",
    icon: <LineChartOutlined />,
  },
};

function StatCard({ id, value, loading, onClick }) {
  return (
    <UserStatCard
      meta={CARD_META[id]}
      value={value}
      loading={loading}
      onClick={onClick}
    />
  );
}

const TABLE_COMPONENTS = {
  header: {
    cell: (props) => (
      <th
        {...props}
        style={{
          ...props.style,
          background: "#f8fafc",
          color: "#1e293b",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          borderBottom: "2px solid #e2e8f0",
          padding: "7px 10px",
          whiteSpace: "nowrap",
        }}
      />
    ),
  },
  body: {
    cell: (props) => (
      <td
        {...props}
        style={{
          ...props.style,
          padding: "7px 10px",
          borderBottom: "1px solid #f1f5f9",
          verticalAlign: "middle",
          color: "#0f172a",
          fontSize: 12,
        }}
      />
    ),
    row: (props) => (
      <tr
        {...props}
        style={{ ...props.style, transition: "background .15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      />
    ),
  },
};

export default function AskOxyUsers() {
  const today = dayjs();
  const [activeTab, setActiveTab] = useState("date");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [mobile, setMobile] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState({
    total: null,
    today: null,
    yesterday: null,
    week: null,
    month: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const PAGE_SIZE = 50;
  const fromRef = useRef(fromDate);
  const toRef = useRef(toDate);
  fromRef.current = fromDate;
  toRef.current = toDate;

  const fetchData = useCallback(async (pg = 0, from, to) => {
    const f = from ?? fromRef.current;
    const t = to ?? toRef.current;
    if (!f || !t) return;
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/user-service/date-rangeuserdetails?startDate=${f.format("YYYY-MM-DD")}&endDate=${t.format("YYYY-MM-DD")}&page=${pg}&size=${PAGE_SIZE}`,
      );
      setData(res.data?.content ?? []);
      setTotal(res.data?.totalElements ?? 0);
      setPage(pg);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const fetchByMobile = useCallback(
    async (num) => {
      const n = num?.trim();
      if (!n) {
        fetchData(0, fromRef.current, toRef.current);
        return;
      }
      setLoading(true);
      try {
        const res = await adminApi.get(
          `/user-service/date-rangeuserdetails?mobileNumber=${n}&page=0&size=${PAGE_SIZE}`,
        );
        setData(res.data?.content ?? []);
        setTotal(res.data?.totalElements ?? 0);
        setPage(0);
      } catch {
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [fetchData],
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await adminApi.get("/user-service/counts");
      const d = r.data;
      console.log("[counts API]", d);
      setStats({
        total: d.totalUsers ?? 0,
        today: d.todayUsers ?? 0,
        yesterday: d.yesterdayUsers ?? 0,
        week: d.thisWeekUsers ?? 0,
        month: d.thisMonthUsers ?? 0,
      });
    } catch {
      /* keep nulls */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const quickFetch = useCallback(
    (start, end) => {
      setFromDate(start);
      setToDate(end);
      fromRef.current = start;
      toRef.current = end;
      setActiveTab("date");
      fetchData(0, start, end);
    },
    [fetchData],
  );

  useEffect(() => {
    fetchData(0, fromDate, toDate);
    fetchStats();
  }, []);

  const columns = [
    {
      title: "S.No",
      width: "6%",
      align: "center",
      render: (_, __, i) => (
        <span className="font-semibold text-xs text-slate-700">
          {page * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "id",
      width: "10%",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-semibold text-slate-700 whitespace-nowrap">
            #{v.slice(-4)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "User Details",
      width: "22%",
      align: "left",
      render: (_, row) => (
        <div className="flex flex-col items-start gap-1">
          <div className="min-w-0 text-left">
            <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[150px]">
              {row.fullName || (
                <span className="text-slate-400 font-normal">No Name</span>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium break-all">
            {row.email || row.whatsappNumber || row.mobileNumber || "—"}
          </span>
        </div>
      ),
    },
    {
      title: "Registered From",
      dataIndex: "registerFrom",
      width: "14%",
      align: "center",
      render: (v) => {
        return v ? (
          <Tag
            color={v === "WEB" ? "blue" : v === "APP" ? "green" : "default"}
            style={{ marginInlineEnd: 0, fontWeight: 700 }}
          >
            {v}
          </Tag>
        ) : (
          "—"
        );
      },
    },
    {
      title: "User Type",
      dataIndex: "userType",
      width: "13%",
      align: "center",
      render: (v) =>
        v ? (
          <Tag
            color={v === "NEW USER" ? "purple" : "green"}
            style={{
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 11,
              border: "none",
              padding: "1px 10px",
            }}
          >
            {v}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      title: "Registration Date",
      dataIndex: "created_at",
      width: "16%",
      align: "center",
      render: (v) =>
        v ? (
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-800">
              {v.slice(0, 10)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {v.slice(11, 16)}
            </div>
          </div>
        ) : (
          "—"
        ),
    },
    {
      title: "Address",
      width: "19%",
      align: "center",
      render: (_, row) => {
        const parts = [
          row.flatNo,
          row.landMark,
          row.address,
          row.pinCode,
        ].filter(Boolean);
        return parts.length ? (
          <span className="inline-block max-w-[220px] text-[11px] text-slate-700 font-medium whitespace-normal break-words">
            {parts.join(", ")}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );
      },
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Header row: title+subtitle left | refresh right ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-[15px] font-black text-slate-900 tracking-tight leading-tight">
              AskOxy.AI — Registered Users
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Monitor and manage registered users by date range
            </div>
          </div>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            fetchData(page, fromDate, toDate);
            fetchStats();
          }}
          style={{
            borderRadius: 8,
            height: 32,
            fontWeight: 600,
            fontSize: 12,
            border: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          id="total"
          value={stats.total}
          loading={statsLoading}
          onClick={null}
        />
        <StatCard
          id="today"
          value={stats.today}
          loading={statsLoading}
          onClick={() => {
            const t = dayjs();
            quickFetch(t, t);
          }}
        />
        <StatCard
          id="yesterday"
          value={stats.yesterday}
          loading={statsLoading}
          onClick={() => {
            const y = dayjs().subtract(1, "day");
            quickFetch(y, y);
          }}
        />
        <StatCard
          id="week"
          value={stats.week}
          loading={statsLoading}
          onClick={() => quickFetch(dayjs().subtract(6, "day"), dayjs())}
        />
        <StatCard
          id="month"
          value={stats.month}
          loading={statsLoading}
          onClick={() => quickFetch(dayjs().startOf("month"), dayjs())}
        />
      </div>

      {/* ── Filter + Table Card ── */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
        {/* Ant Design tab bar */}
        <div className="px-3 pt-1 bg-slate-50 border-b border-slate-100">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            items={[
              { key: "date", label: "Search by Date" },
              { key: "mobile", label: "Search by Mobile" },
            ]}
            style={{ marginBottom: -1 }}
          />
        </div>

        {/* Filter controls */}
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          {activeTab === "date" ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  From
                </span>
                <DatePicker
                  value={fromDate}
                  onChange={(v) => {
                    setFromDate(v);
                    fromRef.current = v;
                  }}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  disabledDate={(d) => toDate && d.isAfter(toDate, "day")}
                  style={{ borderRadius: 7, height: 30, width: 130 }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  To
                </span>
                <DatePicker
                  value={toDate}
                  onChange={(v) => {
                    setToDate(v);
                    toRef.current = v;
                  }}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")}
                  style={{ borderRadius: 7, height: 30, width: 130 }}
                />
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchData(0, fromRef.current, toRef.current)}
                style={{
                  background: "linear-gradient(135deg,#0891b2,#0e7490)",
                  border: "none",
                  borderRadius: 7,
                  height: 30,
                  fontWeight: 600,
                  paddingInline: 12,
                  fontSize: 11,
                  boxShadow: "0 2px 8px #0891b230",
                }}
              >
                Get Data
              </Button>
              {total > 0 && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {total.toLocaleString()} records
                </span>
              )}
            </>
          ) : (
            <>
              <Input
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Enter mobile / WhatsApp number..."
                value={mobileInput}
                onChange={(e) => {
                  setMobileInput(e.target.value);
                  if (!e.target.value) {
                    setMobile("");
                    fetchData(0, fromRef.current, toRef.current);
                  }
                }}
                onPressEnter={() => {
                  setMobile(mobileInput);
                  fetchByMobile(mobileInput);
                }}
                allowClear
                style={{ width: 240, borderRadius: 7, height: 30 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setMobile(mobileInput);
                  fetchByMobile(mobileInput);
                }}
                style={{
                  background: "linear-gradient(135deg,#0891b2,#0e7490)",
                  border: "none",
                  borderRadius: 7,
                  height: 30,
                  fontWeight: 600,
                  paddingInline: 12,
                  fontSize: 11,
                  boxShadow: "0 2px 8px #0891b230",
                }}
              >
                Search
              </Button>
              {mobile && (
                <Button
                  onClick={() => {
                    setMobileInput("");
                    setMobile("");
                    fetchData(0, fromRef.current, toRef.current);
                  }}
                  style={{
                    borderRadius: 7,
                    height: 30,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  Clear
                </Button>
              )}
              {total > 0 && mobile && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {total.toLocaleString()} records
                </span>
              )}
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">
              User Records
            </span>
            {total > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.length} / {total.toLocaleString()}
              </span>
            )}
          </div>
          {loading && (
            <span className="text-[11px] text-cyan-600 font-semibold flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-sky-200 border-t-cyan-600 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading...
            </span>
          )}
        </div>

        <Table
          className="oxyone-square-table"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={false}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: (p) => fetchData(p - 1, fromRef.current, toRef.current),
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
