import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../core/config/axiosInstance";
import { useAdminComments } from "../util/useAdminComments";
import { Table, Button, Input, Skeleton, Tag } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
  RiseOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import CommentsModal from "./CommentsModal";
import { actionColumn, updatedCommentsColumn } from "./adminCommentsColumns";
import UserStatCard from "../components/UserStatCard";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(isoWeek);

/* ── Page skeleton while first load ─────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[860px]">
        {[1, 2, 3, 4].map((i) => (
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
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    </div>
  );
}

/* ── Colour maps for tags ────────────────────────────────── */
const OFFER_COLORS = { FREEAIBOOK: "cyan", FREERICEBAG: "green" };

/* ── Stat card meta ──────────────────────────────────────── */
const STAT_META = {
  total: {
    label: "Total Interested",
    accent: "#e11d48",
    grad: "linear-gradient(135deg,#e11d48,#f43f5e)",
    sub: "All users who expressed interest",
    icon: <StarOutlined />,
  },
  today: {
    label: "Today",
    accent: "#0891b2",
    grad: "linear-gradient(135deg,#0891b2,#06b6d4)",
    sub: "New interests today",
    icon: <RiseOutlined />,
  },
  week: {
    label: "This Week",
    accent: "#059669",
    grad: "linear-gradient(135deg,#059669,#10b981)",
    sub: "Mon – Sun",
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

function StatCard({ id, value, loading, active, onClick }) {
  return (
    <UserStatCard
      meta={STAT_META[id]}
      value={value}
      loading={loading}
      active={active}
      onClick={onClick}
    />
  );
}

/* ── Custom table styling ────────────────────────────────── */
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
    row: (props) => <tr {...props} />,
  },
};

export default function InterestedPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("total");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const comments = useAdminComments();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get(
        "/marketing-service/campgin/getAllInterestedUsres",
      );
      setAll(Array.isArray(res.data) ? res.data : []);
      setPage(0);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Dynamic counts derived from data ──────────────────── */
  const todayCount = all.filter(
    (r) => r.createdAt && dayjs(r.createdAt).isSame(dayjs(), "day"),
  ).length;
  const weekCount = all.filter(
    (r) =>
      r.createdAt &&
      dayjs(r.createdAt).isSameOrAfter(dayjs().startOf("isoWeek"), "day") &&
      dayjs(r.createdAt).isSameOrBefore(dayjs().endOf("isoWeek"), "day"),
  ).length;
  const monthCount = all.filter(
    (r) => r.createdAt && dayjs(r.createdAt).isSame(dayjs(), "month"),
  ).length;

  /* ── Card filter + search filter ───────────────────────── */
  const dateFiltered = all.filter((r) => {
    if (activeFilter === "total") return true;
    if (!r.createdAt) return false;
    const d = dayjs(r.createdAt);
    if (activeFilter === "today") return d.isSame(dayjs(), "day");
    if (activeFilter === "week")
      return (
        d.isSameOrAfter(dayjs().startOf("isoWeek"), "day") &&
        d.isSameOrBefore(dayjs().endOf("isoWeek"), "day")
      );
    if (activeFilter === "month") return d.isSame(dayjs(), "month");
    return true;
  });

  const filtered = dateFiltered.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.mobileNumber || "").includes(q) ||
      (r.userId || "").toLowerCase().includes(q) ||
      (r.projectType || "").toLowerCase().includes(q) ||
      (r.askOxyOfers || "").toLowerCase().includes(q) ||
      (r.journeyName || "").toLowerCase().includes(q)
    );
  });

  /* ── Fetch the latest comment for each row on the visible page only ── */
  const visibleIdsKey = filtered
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .map((r) => r.userId)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (visibleIdsKey) comments.prefetchRowComments(visibleIdsKey.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIdsKey]);

  const handleCardClick = (key) => {
    setActiveFilter(key);
    setPage(0);
    setSearchInput("");
    setSearch("");
  };

  const columns = [
    {
      title: "S.No",
      width: 60,
      align: "center",
      render: (_, __, i) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] text-slate-700 text-[11px] font-bold">
          {page * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
width:" 60",
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-[11px] font-semibold text-slate-700 tracking-[.2px] whitespace-nowrap">
            #{v.slice(-4)}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
width: 130,
      align: "center",
      render: (v) =>
        v ? (
          <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
            {v}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },

    {
      title: "Interested In",
      dataIndex: "askOxyOfers",
      width: 220,
      align: "left",
      render: (v) =>
        v ? (
          <Tag
            color={OFFER_COLORS[v] || "geekblue"}
            style={{
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 11,
              border: "none",
              padding: "2px 10px",
              display: "inline-block",
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {v}
          </Tag>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
width: 220,
      align: "center",
      render: (v) =>
        v ? (
          <div>
            <div className="text-xs font-bold text-slate-900">
              {v.slice(0, 10)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {v.slice(11, 16)}
            </div>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    actionColumn(comments.openCommentsModal, { readOnly: true }),
    {
      ...updatedCommentsColumn(
        comments.rowComments,
        comments.openCommentsModal,
        { readOnly: true },
      ),
      align: "left",
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Header: title+subtitle left | refresh right ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          
          <div>
            <div className="text-[15px] font-black text-slate-900 tracking-tight leading-tight">
              Interested Users
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              All users who expressed interest across products
            </div>
          </div>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
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

      {/* ── Stat Cards (clickable filters) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[860px]">
        <StatCard
          id="total"
          value={all.length}
          loading={loading && page === 0}
          active={activeFilter === "total"}
          onClick={() => handleCardClick("total")}
        />
        <StatCard
          id="today"
          value={todayCount}
          loading={loading && page === 0}
          active={activeFilter === "today"}
          onClick={() => handleCardClick("today")}
        />
        <StatCard
          id="week"
          value={weekCount}
          loading={loading && page === 0}
          active={activeFilter === "week"}
          onClick={() => handleCardClick("week")}
        />
        <StatCard
          id="month"
          value={monthCount}
          loading={loading && page === 0}
          active={activeFilter === "month"}
          onClick={() => handleCardClick("month")}
        />
      </div>

      {error ? (
        // ── Error state ──
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 py-14 px-6 text-sm text-red-500">
          <span className="text-3xl opacity-55">⚠️</span>
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="px-5 py-2 rounded-[9px] border border-slate-200 bg-white text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        // ── Table Card ──
        <div className="bg-white border border-slate-200 shadow-sm min-w-0">
          {/* Toolbar: label+count left | search right */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">
                {activeFilter === "total"
                  ? "User Records"
                  : `${STAT_META[activeFilter].label} Users`}
              </span>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {filtered.length} / {dateFiltered.length.toLocaleString()}
              </span>
              {activeFilter !== "total" && (
                <button
                  onClick={() => handleCardClick("total")}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-transparent border-none cursor-pointer px-1"
                >
                  Clear filter ✕
                </button>
              )}
              {loading && (
                <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border-2 border-rose-200 border-t-rose-700 inline-block"
                    style={{ animation: "spin .7s linear infinite" }}
                  />
                  Loading...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search mobile, ID, project, offer..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearch(e.target.value);
                  setPage(0);
                }}
                allowClear
                style={{ width: 240, borderRadius: 7, height: 30 }}
              />
              <Button
                icon={<SearchOutlined />}
                type="primary"
                onClick={() => {
                  setSearch(searchInput);
                  setPage(0);
                }}
                style={{
                  background: "linear-gradient(135deg,#e11d48,#f43f5e)",
                  border: "none",
                  borderRadius: 7,
                  height: 30,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                Search
              </Button>
            </div>
          </div>

          <Table
            className="oxyone-square-table"
            rowKey={(r, i) => r.userId ?? r.mobileNumber ?? i}
            columns={columns}
            dataSource={filtered}
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
            scroll={{ x:true }}
            tableLayout="fixed"
            size="small"
            style={{ width: "100%" }}
            components={TABLE_COMPONENTS}
          />
        </div>
      )}

      {/* ── HelpDesk Comments Modal ─────────────────────────── */}
      <CommentsModal c={comments} readOnly />
    </div>
  );
}
