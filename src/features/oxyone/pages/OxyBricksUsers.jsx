import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import adminApi from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import { Table, Button, Input, DatePicker, Skeleton, Empty, Tabs } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  FilterOutlined,
  CalendarOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UserStatCard from "../components/UserStatCard";

dayjs.extend(customParseFormat);

/* ── Page Skeleton ─────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden shadow-sm border border-slate-200"
          >
            <div className="h-10 bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="h-16 bg-white border-l-[3px] border-l-slate-200 border border-slate-200 relative overflow-hidden">
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 7 }} />
      </div>
    </div>
  );
}

/* ── Stat Card Meta ────────────────────────────────────────── */
const STAT_META = {
  active: {
    label: "Active Users",
    accent: "#059669",
    grad: "linear-gradient(135deg,#059669,#10b981)",
    soft: "rgba(5,150,105,.08)",
    sub: "Currently active on OxyBricks",
    icon: <CheckCircleOutlined />,
    trend: "+12%",
    trendUp: true,
  },
  registered: {
    label: "Registered Users",
    accent: "#b45309",
    grad: "linear-gradient(135deg,#b45309,#d97706)",
    soft: "rgba(180,83,9,.08)",
    sub: "Total registered (live)",
    icon: <AppstoreOutlined />,
    trend: "+8%",
    trendUp: true,
  },
};

function StatCard({ id, value, loading }) {
  return <UserStatCard meta={STAT_META[id]} value={value} loading={loading} />;
}

/* ── Registered-tab stat card meta (mirrors AskOxy.ai's) ─────── */
const REG_CARD_META = {
  total: { label: "Total Registered Users", accent: "#0f172a", grad: "linear-gradient(135deg,#0f172a,#1e293b)", sub: "All time registrations", icon: <TeamOutlined /> },
  today: { label: "Today", accent: "#0891b2", grad: "linear-gradient(135deg,#0891b2,#06b6d4)", sub: "New registrations", icon: <RiseOutlined /> },
  yesterday: { label: "Yesterday", accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", sub: "Previous day", icon: <HistoryOutlined /> },
  week: { label: "This Week", accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", sub: "Last 7 days", icon: <BarChartOutlined /> },
  month: { label: "This Month", accent: "#d97706", grad: "linear-gradient(135deg,#d97706,#f59e0b)", sub: "Month to date", icon: <LineChartOutlined /> },
};

/* ── Table Components ──────────────────────────────────────── */
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
          padding: "8px 12px",
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
          padding: "8px 12px",
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
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbeb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      />
    ),
  },
};

/* ── Active Users Tab ──────────────────────────────────────── */
function ActiveUsersTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        "/oxybrick-service/getTotalActiveUserDetails",
      );
      const rows = res.data?.userDetails ?? [];
      setData(rows);
      setTotal(res.data?.userCount ?? rows.length);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = search
    ? data.filter(
        (r) =>
          r.mobileNumber?.includes(search) ||
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : data;
  const paged = filtered
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .map((r, i) => ({ ...r, _sno: page * PAGE_SIZE + i + 1 }));

  const columns = [
    {
      title: "S.No",
      width: 68,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black">
          {row._sno}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      render: (value) =>
        value?.trim() ? (
          <span className="font-bold text-slate-900 text-xs">{value}</span>
        ) : (
          <span className="text-slate-400 text-xs">No Name</span>
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      render: (value) => (
        <span className="text-xs text-slate-600 break-all">{value || "—"}</span>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      align: "center",
      // render: (v) =>
      //   v ? (
      //     <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
      //       {v}
      //     </span>
      //   ) : (
      //     "—"
      //   ),
    },
    {
      title: "Participations",
      dataIndex: "participationCount",
      align: "center",
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "totalParticipationAmount",
      align: "center",
      render: (v) =>
        v != null ? (
          <span className="font-bold text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            ₹{Number(v).toLocaleString("en-IN")}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col">
      {/* Stat card */}
      <div className="px-3 pt-3 pb-1 max-w-[280px]">
        <StatCard id="active" value={total} loading={loading && initialLoad} />
      </div>

      {/* Search row */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap mt-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">Active Users</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            {total.toLocaleString()} total
          </span>
          {loading && (
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-amber-200 border-t-amber-700 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search by name, mobile, email..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value);
              setPage(0);
            }}
            allowClear
            style={{
              width: 250,
              borderRadius: 8,
              height: 32,
              borderColor: "#e2e8f0",
            }}
          />
          <Button
            icon={<FilterOutlined />}
            type="primary"
            onClick={() => {
              setSearch(searchInput);
              setPage(0);
            }}
            style={{
              background: "linear-gradient(135deg,#b45309,#d97706)",
              border: "none",
              borderRadius: 8,
              height: 32,
              fontWeight: 600,
              fontSize: 11,
              boxShadow: "0 2px 8px rgba(180,83,9,.25)",
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-slate-400 text-xs">
                <div className="font-semibold text-slate-500 mb-1">
                  No active users found
                </div>
                {search
                  ? "Try adjusting your search criteria"
                  : "No active users available at the moment"}
              </div>
            }
          />
        </div>
      ) : (
        <Table
          className="oxyone-square-table"
          rowKey="_sno"
          columns={columns}
          dataSource={paged}
          loading={false}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: (p) => setPage(p - 1),
            style: { padding: "8px 12px 10px", margin: 0 },
          }}
          scroll={{ x: true }}
          size="small"
          components={TABLE_COMPONENTS}
        />
      )}
    </div>
  );
}

/* ── Registered Users Tab (mirrors AskOxy.ai's UI/functionality) ── */
function RegisteredUsersTab() {
  const today = dayjs();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [showAll, setShowAll] = useState(true);
  const [mobileInput, setMobileInput] = useState("");
  const [mobile, setMobile] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // The API has no date-range/mobile-search params, so we load the full
  // list once (pageSize covers current + near-term growth) and filter
  // client-side, the same way the stat cards and date filter behave.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/auth-service/auth/oxybricks-registered-users?pageIndex=0&pageSize=5000&sortBy=createdAt&sortOrder=DESC`,
      );
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setRawData(rows);
    } catch {
      setRawData([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const parseRegDate = (v) => (v ? dayjs(v, "DD/MM/YYYY") : null);

  const stats = useMemo(() => {
    const yesterday = today.subtract(1, "day");
    const weekStart = today.subtract(6, "day");
    let todayN = 0, yestN = 0, weekN = 0, monthN = 0;
    rawData.forEach((r) => {
      const d = parseRegDate(r.registeredDate);
      if (!d || !d.isValid()) return;
      if (d.isSame(today, "day")) todayN++;
      if (d.isSame(yesterday, "day")) yestN++;
      if (!d.isBefore(weekStart, "day") && !d.isAfter(today, "day")) weekN++;
      if (d.isSame(today, "month")) monthN++;
    });
    return { total: rawData.length, today: todayN, yesterday: yestN, week: weekN, month: monthN };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData]);

  const quickFetch = useCallback((start, end) => {
    setFromDate(start);
    setToDate(end);
    setShowAll(false);
    setMobileInput("");
    setMobile("");
    setPage(0);
  }, []);

  const showAllUsers = useCallback(() => {
    setShowAll(true);
    setMobileInput("");
    setMobile("");
    setPage(0);
  }, []);

  const dateFiltered = useMemo(() => {
    return rawData.filter((r) => {
      const d = parseRegDate(r.registeredDate);
      return d && d.isValid() && !d.isBefore(fromDate, "day") && !d.isAfter(toDate, "day");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData, fromDate, toDate]);

  const mobileFiltered = useMemo(
    () => (mobile ? rawData.filter((r) => (r.mobileNumber || "").includes(mobile)) : null),
    [rawData, mobile],
  );

  const displayed = mobile ? mobileFiltered : showAll ? rawData : dateFiltered;

  const handleMobileSearch = useCallback((num) => {
    setMobile((num ?? "").trim());
    setPage(0);
  }, []);

  const paged = displayed
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .map((r, i) => ({ ...r, _sno: page * PAGE_SIZE + i + 1 }));

  const columns = [
    {
      title: "S.No",
      width: 68,
      align: "center",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black ml-2.5">
          {row._sno}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      align: " center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[5px] text-amber-800 tracking-[.2px] whitespace-nowrap">
            #{v.slice(-4)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "User Details",

      render: (_, row) => {
        const name = row.name?.trim() || "";
        return (
          <div className="flex items-center gap-2.5">
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[170px]">
                {name || (
                  <span className="text-slate-400 font-normal">No Name</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-[170px]">
                {row.email || "—"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {v}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Registered Date",
      dataIndex: "registeredDate",

      align: "center",
      render: (v) =>
        v ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            <CalendarOutlined style={{ fontSize: 10, color: "#b45309" }} />
            {v}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      align: "center",
      render: (v) =>
        v && v !== "null" ? (
          <span className="inline-block max-w-[220px] text-[11px] text-slate-700 font-bold whitespace-normal break-words">
            {v}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col">
      {/* Stat cards */}
      <div className="px-3 pt-3 pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {["total", "today", "yesterday", "week", "month"].map((id) => (
            <UserStatCard
              key={id}
              meta={REG_CARD_META[id]}
              value={stats[id]}
              loading={loading && initialLoad}
              onClick={
                id === "total"
                  ? showAllUsers
                  : () => {
                      const map = {
                        today: [dayjs(), dayjs()],
                        yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
                        week: [dayjs().subtract(6, "day"), dayjs()],
                        month: [dayjs().startOf("month"), dayjs()],
                      };
                      quickFetch(...map[id]);
                    }
              }
            />
          ))}
        </div>
      </div>

      {/* Filter row */}
      <div className="px-3 py-2 mt-2 border-t border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50">
        <span className="text-[11px] font-semibold text-slate-500">From</span>
        <DatePicker
          value={fromDate}
          onChange={(v) => v && setFromDate(v)}
          format="YYYY-MM-DD"
          allowClear={false}
          disabledDate={(d) => toDate && d.isAfter(toDate, "day")}
          style={{ borderRadius: 7, height: 30, width: 130 }}
        />
        <span className="text-[11px] font-semibold text-slate-500">To</span>
        <DatePicker
          value={toDate}
          onChange={(v) => v && setToDate(v)}
          format="YYYY-MM-DD"
          allowClear={false}
          disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")}
          style={{ borderRadius: 7, height: 30, width: 130 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => { setShowAll(false); setMobileInput(""); setMobile(""); setPage(0); }}
          style={{
            background: "linear-gradient(135deg,#b45309,#d97706)",
            border: "none",
            borderRadius: 7,
            height: 30,
            fontWeight: 600,
            paddingInline: 12,
            fontSize: 11,
            boxShadow: "0 2px 8px rgba(180,83,9,.25)",
          }}
        >
          Get Data
        </Button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Search by mobile number..."
          value={mobileInput}
          onChange={(e) => setMobileInput(e.target.value)}
          onPressEnter={() => handleMobileSearch(mobileInput)}
          allowClear
          onClear={() => handleMobileSearch("")}
          style={{ width: 200, borderRadius: 7, height: 30 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleMobileSearch(mobileInput)}
          style={{
            background: "linear-gradient(135deg,#b45309,#d97706)",
            border: "none",
            borderRadius: 7,
            height: 30,
            fontWeight: 600,
            paddingInline: 12,
            fontSize: 11,
            boxShadow: "0 2px 8px rgba(180,83,9,.25)",
          }}
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
        {displayed.length > 0 && (
          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full ml-auto">
            {displayed.length.toLocaleString()} records
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">Registered Users</span>
          {displayed.length > 0 && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {paged.length} / {displayed.length.toLocaleString()}
            </span>
          )}
        </div>
        {loading && (
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border-2 border-amber-200 border-t-amber-700 inline-block"
              style={{ animation: "spin .7s linear infinite" }}
            />
            Loading...
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-slate-400 text-xs">
                <div className="font-semibold text-slate-500 mb-1">
                  No registered users found
                </div>
                {mobile
                  ? "Try a different mobile number"
                  : showAll
                    ? "No registered users available at the moment"
                    : "No registered users in this date range"}
              </div>
            }
          />
        </div>
      ) : (
        <Table
          className="oxyone-square-table"
          rowKey="_sno"
          columns={columns}
          dataSource={paged}
          loading={false}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: displayed.length,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: (p) => setPage(p - 1),
            style: { padding: "8px 12px 10px", margin: 0 },
          }}
          scroll={{ x: true }}
          size="small"
          components={TABLE_COMPONENTS}
        />
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function OxyBricksUsers() {
  const [activeTab, setActiveTab] = useState("registered");
  const [activeCount, setActiveCount] = useState(null);
  const [regCount, setRegCount] = useState(null);
  const [countLoad, setCountLoad] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.allSettled([
          adminApi.get("/oxybrick-service/getTotalActiveUserDetails"),
          axios.get(
            `${BASE_URL}/auth-service/auth/oxybricks-registered-users?pageIndex=0&pageSize=20&sortBy=createdAt&sortOrder=DESC`,
          ),
        ]);
        if (r1.status === "fulfilled") {
          const d = r1.value.data;
          setActiveCount(d?.userCount ?? d?.userDetails?.length ?? 0);
        }
        if (r2.status === "fulfilled") {
          const d = r2.value.data;
          setRegCount(d?.count ?? d?.data?.length ?? 0);
        }
      } finally {
        setCountLoad(false);
      }
    })();
  }, []);

  return (
    <div
      className="flex flex-col gap-4 -mt-6"
      style={{ animation: "fadeUp .3s ease both" }}
    >
      {/* ── Tab Card ── */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0 overflow-hidden">
        {/* Ant Design tab bar */}
        <div className="px-4 pt-1 bg-slate-50 border-b border-slate-100">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            items={[
              {
                key: "registered",
                label: `Registered Users${regCount == null ? "" : ` (${regCount.toLocaleString()})`}`,
              },
              {
                key: "active",
                label: `Active Users${activeCount == null ? "" : ` (${activeCount.toLocaleString()})`}`,
              },
            ]}
            style={{ marginBottom: -1 }}
          />
        </div>

        {/* Tab content */}
        <div style={{ animation: "fadeIn .2s ease both" }}>
          {activeTab === "registered" && <RegisteredUsersTab />}
          {activeTab === "active" && <ActiveUsersTab />}
        </div>
      </div>
    </div>
  );
}
