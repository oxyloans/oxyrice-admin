import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Table, DatePicker, Button, Input, Skeleton, Tabs, message } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "../components/UserStatCard";

const API_URL =
  "https://fintech.oxyloans.com/oxyloans/v1/user/admin/lenderContactList";
const API_KEY = "oxy_contact_ff0ccf7744c64875af1de19c54650a17";
const PAGE_SIZE = 10;
const FETCH_BATCH_SIZE = 100;

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
    label: "Total Lenders",
    accent: "#0f172a",
    grad: "linear-gradient(135deg,#0f172a,#1e293b)",
    sub: "All registered lenders",
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
          fontWeight: 700,
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

// Normalize API response fields
function normalizeLenderRow(l) {
  return {
    ...l,
    id: l.userId || l.id || "",
    fullName: l.name || l.fullName || "",
    mobileNumber: l.mobileNumber || l.mobile || "",
    email: l.email || "",
    address: l.address || "",
    registeredDate: l.registeredDate || l.createdAt || l.created_at || "",
  };
}

export default function OxyLoansLender() {
  const today = dayjs();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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

  // Fetch a single page from the API (server-side pagination)
  const fetchPage = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await axios.post(
        API_URL,
        { pageNo: pg, pageSize: PAGE_SIZE },
        { headers: { "X-Api-Key": API_KEY } }
      );
      const d = res.data ?? {};
      const rows = Array.isArray(d.listOfData) ? d.listOfData.map(normalizeLenderRow) : [];
      setData(rows);
      setTotalCount(Number(d.totalCount) || rows.length);
      setPage(Number(d.pageNo) || pg);
    } catch (err) {
      console.error("Lender API error:", err);
      message.error(err?.response?.data?.message || "Failed to load lender data. Please try again.");
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Fetch stats — Total shows instantly from first response, other counts from first batch
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const first = await axios.post(
        API_URL,
        { pageNo: 1, pageSize: FETCH_BATCH_SIZE },
        { headers: { "X-Api-Key": API_KEY } }
      );
      const firstData = first.data ?? {};
      const firstRows = Array.isArray(firstData.listOfData) ? firstData.listOfData : [];
      const total = Number(firstData.totalCount) || firstRows.length;

      // Set Total immediately
      setStats((prev) => ({ ...prev, total }));

      // Compute Today/Yesterday/Week/Month from first batch only (fast)
      const todayStr = dayjs().format("YYYY-MM-DD");
      const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const weekStart = dayjs().subtract(6, "day").startOf("day");
      const monthStart = dayjs().startOf("month").startOf("day");

      let todayCount = 0, yesterdayCount = 0, weekCount = 0, monthCount = 0;
      for (const row of firstRows) {
        const d = (row.registeredDate || row.createdAt || row.created_at || "").slice(0, 10);
        if (!d) continue;
        const dt = dayjs(d);
        if (d === todayStr) todayCount++;
        if (d === yesterdayStr) yesterdayCount++;
        if (!dt.isBefore(weekStart, "day")) weekCount++;
        if (!dt.isBefore(monthStart, "day")) monthCount++;
      }

      setStats({
        total,
        today: todayCount,
        yesterday: yesterdayCount,
        week: weekCount,
        month: monthCount,
      });
    } catch {
      /* keep nulls */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
    fetchStats();
  }, [fetchPage, fetchStats]);

  // Card click — filter by date range using client-side filtering on current page data
  const handleCardClick = useCallback((cardId) => {
    setMobileInput("");
    setMobile("");
    if (cardId === "total") {
      setActiveCard(null);
      setActiveTab("date");
      fetchPage(1);
      return;
    }
    setActiveCard(cardId);
    setActiveTab("date");
    // Fetch first page and filter client-side
    axios
      .post(
        API_URL,
        { pageNo: 1, pageSize: FETCH_BATCH_SIZE },
        { headers: { "X-Api-Key": API_KEY } }
      )
      .then((res) => {
        const d = res.data ?? {};
        const rows = Array.isArray(d.listOfData) ? d.listOfData.map(normalizeLenderRow) : [];
        const todayStr = dayjs().format("YYYY-MM-DD");
        const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        const weekStart = dayjs().subtract(6, "day").startOf("day");
        const monthStart = dayjs().startOf("month").startOf("day");
        const filtered = rows.filter((r) => {
          const dd = (r.registeredDate || "").slice(0, 10);
          if (!dd) return false;
          const dt = dayjs(dd);
          if (cardId === "today") return dd === todayStr;
          if (cardId === "yesterday") return dd === yesterdayStr;
          if (cardId === "week") return !dt.isBefore(weekStart, "day");
          if (cardId === "month") return !dt.isBefore(monthStart, "day");
          return true;
        });
        filtered.sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate));
        setData(filtered);
        setTotalCount(filtered.length);
        setPage(1);
      })
      .catch(() => {
        setData([]);
        setTotalCount(0);
      });
  }, [fetchPage]);

  const handleRemoveFilter = useCallback(() => {
    setActiveCard(null);
    setMobileInput("");
    setMobile("");
    fetchPage(1);
  }, [fetchPage]);

  // Date search — fetch first page and filter client-side
  const handleDateSearch = useCallback(() => {
    setActiveCard(null);
    setMobileInput("");
    setMobile("");
    const f = fromRef.current.format("YYYY-MM-DD");
    const t = toRef.current.format("YYYY-MM-DD");
    axios
      .post(
        API_URL,
        { pageNo: 1, pageSize: FETCH_BATCH_SIZE },
        { headers: { "X-Api-Key": API_KEY } }
      )
      .then((res) => {
        const d = res.data ?? {};
        const rows = Array.isArray(d.listOfData) ? d.listOfData.map(normalizeLenderRow) : [];
        const filtered = rows.filter((r) => {
          const dd = (r.registeredDate || "").slice(0, 10);
          return dd && dd >= f && dd <= t;
        });
        filtered.sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate));
        setData(filtered);
        setTotalCount(filtered.length);
        setPage(1);
      })
      .catch(() => {
        setData([]);
        setTotalCount(0);
      });
  }, []);

  // Mobile search — fetch first page and filter client-side
  const handleMobileSearch = useCallback((num) => {
    const n = num?.trim();
    setMobile(n || "");
    if (!n) {
      fetchPage(1);
      return;
    }
    axios
      .post(
        API_URL,
        { pageNo: 1, pageSize: FETCH_BATCH_SIZE },
        { headers: { "X-Api-Key": API_KEY } }
      )
      .then((res) => {
        const d = res.data ?? {};
        const rows = Array.isArray(d.listOfData) ? d.listOfData.map(normalizeLenderRow) : [];
        const filtered = rows.filter((r) =>
          r.mobileNumber?.includes(n) ||
          r.email?.toLowerCase().includes(n.toLowerCase()) ||
          r.fullName?.toLowerCase().includes(n.toLowerCase())
        );
        filtered.sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate));
        setData(filtered);
        setTotalCount(filtered.length);
        setPage(1);
      })
      .catch(() => {
        setData([]);
        setTotalCount(0);
      });
  }, [fetchPage]);

  const handlePageChange = useCallback((pg) => {
    fetchPage(pg);
  }, [fetchPage]);

  const columns = [
    {
      title: "S.No",
      width: 55,
      align: "center",
      render: (_, __, i) => (
        <span className="font-bold text-xs text-slate-700">
          {(page - 1) * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "id",
      width: 90,
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
            #{String(v).slice(-4)}
          </span>
        ) : "—",
    },
    {
      title: "User Details",
      width: 220,
      render: (_, row) => (
        <div className="flex flex-col items-start gap-0.5">
          <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[160px]">
            {row.fullName || <span className="text-slate-400 font-normal">No Name</span>}
          </div>
          <span className="text-[11px] text-slate-500 font-bold break-all">
            {row.email || "—"}
          </span>
        </div>
      ),
    },
    {
      title: "Mobile",
      width: 130,
      align: "center",
      render: (_, row) =>
        row.mobileNumber ? (
          <span className="font-mono text-xs font-bold text-slate-800">
            {row.mobileNumber}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Address",
      width: 240,
      render: (_, row) =>
        row.address ? (
          <span className="inline-block max-w-[220px] text-[11px] text-slate-700 font-bold whitespace-normal break-words">
            {row.address}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Registered Date",
      dataIndex: "registeredDate",
      width: 130,
      align: "center",
      render: (v) =>
        v ? (
          <div className="text-center">
            <div className="text-xs font-bold text-slate-800">{v.slice(0, 10)}</div>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">{v.slice(11, 16)}</div>
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
              {totalCount > 0 && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {totalCount.toLocaleString()} records
                </span>
              )}
            </>
          ) : (
            <>
              <Input
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search by mobile / email / name..."
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
              {totalCount > 0 && mobile && (
                <span className="text-[11px] text-cyan-600 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  {totalCount.toLocaleString()} records
                </span>
              )}
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">Lender Records</span>
            {totalCount > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.length} / {totalCount.toLocaleString()}
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
          rowKey={(row) => row.id || row.userId || row.mobileNumber || Math.random()}
          columns={columns}
          dataSource={data}
          loading={loading && data.length === 0}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: totalCount,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} lenders`,
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