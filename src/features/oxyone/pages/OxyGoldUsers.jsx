import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Table, DatePicker, Button, Input, Skeleton, Tabs } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "../components/UserStatCard";

const API_BASE = "https://meta.oxyloans.com/api/oxygold-api/auth/viewAllUsers";
const API_KEY = "bwjpL6+95jM2BFkBQfHteyT7eSVNQpLKBPuHQihGzNo=";
const PAGE_SIZE = 10;

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

// Match AskOxy card colors exactly
const CARD_META = {
  total: {
    label: "Total Users",
    accent: "#0f172a",
    grad: "linear-gradient(135deg,#0f172a,#1e293b)",
    sub: "All registered OxyGold users",
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

// Match AskOxy table header/row colors exactly
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

function filterByCard(rows, cardId) {
  const todayStr = dayjs().format("YYYY-MM-DD");
  const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const weekStart = dayjs().subtract(6, "day").startOf("day");
  const monthStart = dayjs().startOf("month").startOf("day");
  return rows.filter((r) => {
    const d = r.createdAt ? r.createdAt.slice(0, 10) : null;
    if (!d) return false;
    const dt = dayjs(d);
    if (cardId === "today") return d === todayStr;
    if (cardId === "yesterday") return d === yesterdayStr;
    if (cardId === "week") return !dt.isBefore(weekStart, "day");
    if (cardId === "month") return !dt.isBefore(monthStart, "day");
    return true;
  });
}

function filterByDate(rows, from, to) {
  const f = from.format("YYYY-MM-DD");
  const t = to.format("YYYY-MM-DD");
  return rows.filter((r) => {
    const d = r.createdAt ? r.createdAt.slice(0, 10) : null;
    return d && d >= f && d <= t;
  });
}

export default function OxyGoldUsers() {
  const today = dayjs();
  const [allUsers, setAllUsers] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const [activeTab, setActiveTab] = useState("date");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [mobileInput, setMobileInput] = useState("");
  const [mobile, setMobile] = useState("");
  const [stats, setStats] = useState({ total: null, today: null, yesterday: null, week: null, month: null });
  const [statsLoading, setStatsLoading] = useState(true);

  const fromRef = useRef(fromDate);
  const toRef = useRef(toDate);
  fromRef.current = fromDate;
  toRef.current = toDate;

  const paginate = useCallback((rows, pg = 0) => {
    const start = pg * PAGE_SIZE;
    setData(rows.slice(start, start + PAGE_SIZE));
    setTotalElements(rows.length);
    setPage(pg);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setLoading(true);
    try {
      const first = await axios.get(API_BASE, {
        params: { page: 0, size: 100 },
        headers: { "X-Api-Key": API_KEY },
      });
      const pagination = first.data?.data ?? first.data ?? {};
      const totalEl = Number(pagination.totalElements) || 0;
      const totalPages = Number(pagination.totalPages) || 1;
      const firstRows = Array.isArray(pagination.content) ? pagination.content : [];

      let allRows = [...firstRows];
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            axios.get(API_BASE, {
              params: { page: i + 1, size: 100 },
              headers: { "X-Api-Key": API_KEY },
            }).then((r) => {
              const p = r.data?.data ?? r.data ?? {};
              return Array.isArray(p.content) ? p.content : [];
            }).catch(() => [])
          )
        );
        allRows = allRows.concat(rest.flat());
      }

      allRows.sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      );
      setAllUsers(allRows);

      const todayStr = dayjs().format("YYYY-MM-DD");
      const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const weekStart = dayjs().subtract(6, "day").startOf("day");
      const monthStart = dayjs().startOf("month").startOf("day");

      let todayCount = 0, yesterdayCount = 0, weekCount = 0, monthCount = 0;
      for (const row of allRows) {
        const d = row.createdAt ? row.createdAt.slice(0, 10) : null;
        if (!d) continue;
        const dt = dayjs(d);
        if (d === todayStr) todayCount++;
        if (d === yesterdayStr) yesterdayCount++;
        if (!dt.isBefore(weekStart, "day")) weekCount++;
        if (!dt.isBefore(monthStart, "day")) monthCount++;
      }

      setStats({ total: totalEl, today: todayCount, yesterday: yesterdayCount, week: weekCount, month: monthCount });

      // Default: show all users
      paginate(allRows, 0);
    } catch {
      /* keep nulls */
    } finally {
      setInitialLoad(false);
      setStatsLoading(false);
      setLoading(false);
    }
  }, [paginate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Card click — sets card filter, switches to date tab, clears search
  const handleCardClick = useCallback((cardId) => {
    setMobileInput("");
    setMobile("");
    if (cardId === "total") {
      setActiveCard(null);
      setActiveTab("date");
      paginate(allUsers, 0);
      return;
    }
    setActiveCard(cardId);
    setActiveTab("date");
    paginate(filterByCard(allUsers, cardId), 0);
  }, [allUsers, paginate]);

  const handleRemoveFilter = useCallback(() => {
    setActiveCard(null);
    setMobileInput("");
    setMobile("");
    paginate(allUsers, 0);
  }, [allUsers, paginate]);

  // Date search — clears card filter
  const handleDateSearch = useCallback(() => {
    setActiveCard(null);
    setMobileInput("");
    setMobile("");
    paginate(filterByDate(allUsers, fromRef.current, toRef.current), 0);
  }, [allUsers, paginate]);

  // Mobile search — works within active card filter if set
  const handleMobileSearch = useCallback((num) => {
    const n = num?.trim();
    setMobile(n || "");
    const base = activeCard ? filterByCard(allUsers, activeCard) : allUsers;
    if (!n) { paginate(base, 0); return; }
    paginate(base.filter((r) => r.phoneNumber?.includes(n) || r.whatsappNumber?.includes(n)), 0);
  }, [allUsers, activeCard, paginate]);

  const handlePageChange = useCallback((pg) => {
    if (mobile) {
      const base = activeCard ? filterByCard(allUsers, activeCard) : allUsers;
      paginate(base.filter((r) => r.phoneNumber?.includes(mobile) || r.whatsappNumber?.includes(mobile)), pg - 1);
    } else if (activeCard) {
      paginate(filterByCard(allUsers, activeCard), pg - 1);
    } else {
      paginate(allUsers, pg - 1);
    }
  }, [allUsers, activeCard, mobile, paginate]);

  const columns = [
    {
      title: "S.No",
      width: 55,
      align: "center",
      render: (_, __, i) => (
        <span className="font-semibold text-xs text-slate-500">
          {page * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      width: 80,
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
            #{v}
          </span>
        ) : "—",
    },
    {
      title: "User Details",
      width: 220,
      render: (_, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ");
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 grid place-items-center text-white"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
            >
              {name ? (
                <span className="font-black text-xs">{name[0].toUpperCase()}</span>
              ) : (
                <UserOutlined style={{ fontSize: 13 }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[160px]">
                {name || <span className="text-slate-400 font-normal italic">No Name</span>}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                {row.email || <span className="text-slate-300">No email</span>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Contact",
      width: 180,
      render: (_, row) => {
        const sameAsMobile = row.whatsappNumber && row.whatsappNumber === row.phoneNumber;
        return (
          <div className="flex flex-col gap-1">
            {row.phoneNumber ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                {row.phoneNumber}
              </span>
            ) : (
              <span className="text-slate-300 text-xs">—</span>
            )}
            {row.whatsappNumber && !sameAsMobile && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
                WA {row.whatsappNumber}
              </span>
            )}
            {row.alternativeNumber && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                Alt {row.alternativeNumber}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Registered On",
      dataIndex: "createdAt",
      width: 120,
      align: "center",
      render: (v) =>
        v ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              <CalendarOutlined style={{ fontSize: 10, color: "#0891b2" }} />
              {v.slice(0, 10)}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">{v.slice(11, 16)}</div>
          </div>
        ) : <span className="text-slate-300">—</span>,
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {["total", "today", "yesterday", "week", "month"].map((id) => (
          <div
            key={id}
            onClick={() => handleCardClick(id)}
            className="cursor-pointer"
            style={{ outline: activeCard === id ? `2px solid ${CARD_META[id].accent}` : "none", borderRadius: 12 }}
          >
            <UserStatCard meta={CARD_META[id]} value={stats[id]} loading={statsLoading} />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
        {/* Tabs — match AskOxy slate-50 bg */}
        <div className="px-3 pt-1 bg-slate-50 border-b border-slate-100">
          <Tabs
            activeKey={activeTab}
            onChange={(k) => { setActiveTab(k); setActiveCard(null); }}
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
              {/* Active card filter badge */}
              {activeCard && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                  {CARD_META[activeCard].label}
                  <CloseCircleOutlined
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleRemoveFilter}
                  />
                </span>
              )}
              {!activeCard && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">From</span>
                    <DatePicker
                      value={fromDate}
                      onChange={(v) => { setFromDate(v); fromRef.current = v; }}
                      format="YYYY-MM-DD"
                      allowClear={false}
                      disabledDate={(d) => toDate && d.isAfter(toDate, "day")}
                      style={{ borderRadius: 7, height: 30, width: 130 }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">To</span>
                    <DatePicker
                      value={toDate}
                      onChange={(v) => { setToDate(v); toRef.current = v; }}
                      format="YYYY-MM-DD"
                      allowClear={false}
                      disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")}
                      style={{ borderRadius: 7, height: 30, width: 130 }}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleDateSearch}
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
                </>
              )}
              {totalElements > 0 && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {totalElements.toLocaleString()} records
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
                  if (!e.target.value) handleMobileSearch("");
                }}
                onPressEnter={() => handleMobileSearch(mobileInput)}
                allowClear
                style={{ width: 240, borderRadius: 7, height: 30 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleMobileSearch(mobileInput)}
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
                  onClick={() => { setMobileInput(""); handleMobileSearch(""); }}
                  style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
                >
                  Clear
                </Button>
              )}
              {totalElements > 0 && mobile && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {totalElements.toLocaleString()} records
                </span>
              )}
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">User Records</span>
            {totalElements > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.length} / {totalElements.toLocaleString()}
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
          rowKey="userId"
          columns={columns}
          dataSource={data}
          loading={false}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: totalElements,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} users`,
            onChange: handlePageChange,
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
