import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import adminApi from "../../../core/config/axiosInstance";
import { Table, Input, Tag, Skeleton, Tabs, DatePicker, Button, Empty } from "antd";
import {
  SearchOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "./UserStatCard";

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

const STATUS_LABEL = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_TAG_COLOR = {
  PENDING: "orange",
  COMPLETED: "green",
  CANCELLED: "red",
};

const CARD_META = {
  total: { label: "Total Queries", accent: "#0f172a", icon: <TeamOutlined /> },
  today: { label: "Today", accent: "#0891b2", icon: <RiseOutlined /> },
  yesterday: { label: "Yesterday", accent: "#7c3aed", icon: <HistoryOutlined /> },
  week: { label: "This Week", accent: "#059669", icon: <BarChartOutlined /> },
  month: { label: "This Month", accent: "#d97706", icon: <LineChartOutlined /> },
};

const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(prefix, status) {
  try {
    const raw = sessionStorage.getItem(prefix + status);
    if (!raw) return null;
    const { ts, rows } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return rows;
  } catch {
    return null;
  }
}

function writeCache(prefix, status, rows) {
  try {
    sessionStorage.setItem(
      prefix + status,
      JSON.stringify({ ts: Date.now(), rows }),
    );
  } catch {
    // storage unavailable/full — safe to ignore, it's only a perf cache
  }
}

function parseServerDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = parseServerDate(value);
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// For Completed/Cancelled queries, "today/week/month" should reflect when
// the query was closed (resolvedOn), not when it was originally raised —
// otherwise a ticket raised weeks ago and closed today wouldn't show up
// under "Today". Pending has no close date, so it always uses createdAt.
function getStatDate(row, status) {
  if (status === "COMPLETED" || status === "CANCELLED") {
    return row.resolvedOn || row.createdAt;
  }
  return row.createdAt;
}

function formatAge(row) {
  const start = parseServerDate(row.createdAt);
  if (!start) return "—";
  const end = parseServerDate(row.resolvedOn) || new Date();
  // Truncate both sides to the minute so the age agrees with the
  // minute-precision "Raised On" / "Closed On" columns next to it — a raw
  // ms diff can floor to 0 even when the two columns show different minutes.
  const startMin = Math.floor(start.getTime() / 60000);
  const endMin = Math.floor(end.getTime() / 60000);
  const minutes = Math.max(0, endMin - startMin);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
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
          verticalAlign: "top",
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

// Some (status, primaryType) combos — e.g. Lender "Completed" — genuinely
// return a multi-MB payload that takes ~18-22s server-side regardless of page
// size (confirmed against the live API). Keep this comfortably above that so
// a real-but-slow response isn't mistaken for a hang and dropped.
const REQUEST_TIMEOUT_MS = 45_000;
const PAGE_SIZE = 20;
// This backend's per-call latency is dominated by server-side work, not
// payload size or round-trip count — a 100-row page and a 2000-row page
// take about the same ~18-19s for a large status. So fetch in as few
// requests as possible: one large page covers realistic volumes, and the
// loop only kicks in as a safety net if a status ever exceeds that.
const FETCH_PAGE_SIZE = 5000;
const MAX_FETCH_PAGES = 5;

const defaultBuildRequestBody = (projectType) => (status) => ({
  projectType,
  queryStatus: status,
});
const defaultExtractRows = (data) => (Array.isArray(data) ? data : []);
const defaultNormalizeRow = (row) => row;

// Generic "Pending / Completed / Cancelled" query dashboard for a given
// projectType, backed by POST /user-service/write/getAllQueries. Mirrors the
// look/behaviour of AskOxyUsers.jsx / OxyBricksUsers.jsx (Registered tab):
// AntD tabs up top, 5 always-visible stat cards, a date-range + search
// filter row, then the table — nothing gated behind an extra click.
//
// Some backends (e.g. the OxyLoans Lender queries API) use a differently
// shaped request/response and paginate server-side. `paginated` + the
// `buildRequestBody` / `extractRows` / `normalizeRow` overrides let a caller
// adapt those without forking this component — see QueriesLender.jsx.
export default function QueriesStatusPage({
  projectType,
  endpoint = "/user-service/write/getAllQueries",
  apiKey,
  paginated = false,
  buildRequestBody,
  extractRows,
  normalizeRow,
}) {
  const buildBody = buildRequestBody || defaultBuildRequestBody(projectType);
  const getRows = extractRows || defaultExtractRows;
  const mapRow = normalizeRow || defaultNormalizeRow;
  const cachePrefix = `oxyoneQueries${projectType}Cache:`;
  const today = dayjs();

  const [rowsByStatus, setRowsByStatus] = useState({
    PENDING: null,
    COMPLETED: null,
    CANCELLED: null,
  });
  const [loadingByStatus, setLoadingByStatus] = useState({
    PENDING: true,
    COMPLETED: true,
    CANCELLED: true,
  });
  const [activeStatus, setActiveStatus] = useState("PENDING");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [showAll, setShowAll] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const requestIdRef = useRef({});

  const fetchStatus = useCallback(
    async (status, forceRefresh = false) => {
      const cached = !forceRefresh ? readCache(cachePrefix, status) : null;
      if (cached) {
        setRowsByStatus((prev) => ({ ...prev, [status]: cached }));
        setLoadingByStatus((prev) => ({ ...prev, [status]: false }));
      } else {
        setLoadingByStatus((prev) => ({ ...prev, [status]: true }));
      }

      const requestId = (requestIdRef.current[status] ?? 0) + 1;
      requestIdRef.current[status] = requestId;
      try {
        const headers = apiKey
          ? { "X-Api-Key": apiKey, "Content-Type": "application/json" }
          : undefined;
        // This backend occasionally hangs on a given status with no response
        // at all. Without a timeout, that single call leaves this status
        // stuck "loading" forever — cap it so a hang degrades to "no data
        // yet, try again" instead of spinning indefinitely.
        const post = (body) =>
          apiKey
            ? axios.post(endpoint, body, { headers, timeout: REQUEST_TIMEOUT_MS })
            : adminApi.post(endpoint, body, { timeout: REQUEST_TIMEOUT_MS });

        let rows = [];
        if (paginated) {
          for (let pageNo = 1; pageNo <= MAX_FETCH_PAGES; pageNo++) {
            const res = await post(buildBody(status, pageNo, FETCH_PAGE_SIZE));
            const pageRows = getRows(res.data);
            rows = rows.concat(pageRows.map(mapRow));
            if (pageRows.length < FETCH_PAGE_SIZE) break;
          }
        } else {
          const res = await post(buildBody(status));
          rows = getRows(res.data).map(mapRow);
        }

        if (requestIdRef.current[status] !== requestId) return;
        writeCache(cachePrefix, status, rows);
        setRowsByStatus((prev) => ({ ...prev, [status]: rows }));
      } catch {
        if (requestIdRef.current[status] !== requestId) return;
        if (!cached)
          setRowsByStatus((prev) => ({ ...prev, [status]: prev[status] ?? [] }));
      } finally {
        if (requestIdRef.current[status] === requestId) {
          setLoadingByStatus((prev) => ({ ...prev, [status]: false }));
        }
      }
    },
    [cachePrefix, endpoint, apiKey, paginated, buildBody, getRows, mapRow],
  );

  useEffect(() => {
    fetchStatus("PENDING");
    fetchStatus("COMPLETED");
    fetchStatus("CANCELLED");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType, endpoint, apiKey]);

  const activeRows = useMemo(
    () => rowsByStatus[activeStatus] ?? [],
    [rowsByStatus, activeStatus],
  );
  const activeLoading = loadingByStatus[activeStatus] && rowsByStatus[activeStatus] == null;
  const initialLoad =
    loadingByStatus.PENDING &&
    loadingByStatus.COMPLETED &&
    loadingByStatus.CANCELLED &&
    rowsByStatus.PENDING == null &&
    rowsByStatus.COMPLETED == null &&
    rowsByStatus.CANCELLED == null;

  // Today / Yesterday / Week / Month breakdown of the active tab's data,
  // computed client-side since the API has no date-range parameter.
  const stats = useMemo(() => {
    const yesterday = today.subtract(1, "day");
    const weekStart = today.subtract(6, "day");
    let todayN = 0, yestN = 0, weekN = 0, monthN = 0;
    activeRows.forEach((r) => {
      const d = parseServerDate(getStatDate(r, activeStatus));
      if (!d) return;
      const dj = dayjs(d);
      if (dj.isSame(today, "day")) todayN++;
      if (dj.isSame(yesterday, "day")) yestN++;
      if (!dj.isBefore(weekStart, "day") && !dj.isAfter(today, "day")) weekN++;
      if (dj.isSame(today, "month")) monthN++;
    });
    return { total: activeRows.length, today: todayN, yesterday: yestN, week: weekN, month: monthN };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, activeStatus]);

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setShowAll(true);
    setSearchInput("");
    setSearch("");
    setPage(0);
  };

  const quickFetch = useCallback((start, end) => {
    setFromDate(start);
    setToDate(end);
    setShowAll(false);
    setSearchInput("");
    setSearch("");
    setPage(0);
  }, []);

  const showAllRows = useCallback(() => {
    setShowAll(true);
    setSearchInput("");
    setSearch("");
    setPage(0);
  }, []);

  const dateFiltered = useMemo(() => {
    return activeRows.filter((r) => {
      const d = parseServerDate(getStatDate(r, activeStatus));
      return d && !dayjs(d).isBefore(fromDate, "day") && !dayjs(d).isAfter(toDate, "day");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRows, fromDate, toDate, activeStatus]);

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return activeRows.filter((r) =>
      [r.randomTicketId, r.name, r.email, r.mobileNumber, r.query]
        .some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [activeRows, search]);

  const displayed = search.trim() ? searchFiltered : showAll ? activeRows : dateFiltered;

  const handleSearch = useCallback((val) => {
    setSearch((val ?? "").trim());
    setPage(0);
  }, []);

  const paged = displayed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns = useMemo(() => {
    const base = [
      {
        title: "S.No",
        width: 60,
        align: "center",
        render: (_, __, i) => (
          <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black">
            {page * PAGE_SIZE + i + 1}
          </span>
        ),
      },
      {
        title: "Ticket ID",
        dataIndex: "randomTicketId",
        align: "center",
        render: (v) => (
          <span className="font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
            {v || "—"}
          </span>
        ),
      },
      {
        title: "User Details",
        align: "left",
        render: (_, row) => (
          <div className="flex flex-col items-start gap-0.5">
            <div className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[170px]">
              {row.name || <span className="text-slate-400 font-normal">No Name</span>}
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
              {row.email || "—"}
            </div>
          </div>
        ),
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
        title: "Query",
        dataIndex: "query",
        align: "left",
        render: (v) => (
          <span className="inline-block max-w-[320px] text-[11px] text-slate-700 font-medium whitespace-normal break-words">
            {v || "—"}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "queryStatus",
        align: "center",
        render: (v) => (
          <Tag
            color={STATUS_TAG_COLOR[v] || "default"}
            style={{ marginInlineEnd: 0, borderRadius: 15, fontWeight: 700, fontSize: 9, border: "none", padding: "1px 8px" }}
          >
            {v}
          </Tag>
        ),
      },
      {
        title: "Raised On",
        dataIndex: "createdAt",
        align: "center",
        render: (v) => (
          <span className="text-[11px] font-bold text-slate-800">{formatDate(v)}</span>
        ),
      },
    ];

    if (activeStatus === "COMPLETED") {
      base.push(
        {
          title: "Resolved By",
          dataIndex: "resolvedBy",
          align: "center",
          render: (v) => v || <span className="text-slate-300">—</span>,
        },
        {
          title: "Closed On",
          dataIndex: "resolvedOn",
          align: "center",
          render: (v) => (
            <span className="text-[11px] font-bold text-slate-800">{formatDate(v)}</span>
          ),
        },
      );
    } else if (activeStatus === "CANCELLED") {
      base.push(
        {
          title: "Reason",
          dataIndex: "comments",
          align: "left",
          render: (v) => (
            <span className="inline-block max-w-[220px] text-[11px] text-slate-700 font-medium whitespace-normal break-words">
              {v || "—"}
            </span>
          ),
        },
        {
          title: "Closed On",
          dataIndex: "resolvedOn",
          align: "center",
          render: (v) => (
            <span className="text-[11px] font-bold text-slate-800">{formatDate(v)}</span>
          ),
        },
      );
    }

    if (activeStatus !== "CANCELLED") {
      base.push({
        title: "Age",
        align: "center",
        render: (_, row) => (
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
            {formatAge(row)}
          </span>
        ),
      });
    }

    return base;
  }, [activeStatus, page]);

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-4 -mt-6" style={{ animation: "fadeUp .3s ease both" }}>
      <div className="bg-white border border-slate-200 shadow-sm min-w-0 overflow-hidden">
        {/* Status tabs */}
        <div className="px-4 pt-1 bg-slate-50 border-b border-slate-100">
          <Tabs
            activeKey={activeStatus}
            onChange={handleTabChange}
            size="small"
            items={["PENDING", "COMPLETED", "CANCELLED"].map((status) => ({
              key: status,
              label: `${STATUS_LABEL[status]}${
                rowsByStatus[status] == null ? "" : ` (${rowsByStatus[status].length.toLocaleString()})`
              }`,
            }))}
            style={{ marginBottom: -1 }}
          />
        </div>

        <div style={{ animation: "fadeIn .2s ease both" }}>
          {/* Stat cards */}
          <div className="px-3 pt-3 pb-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {["total", "today", "yesterday", "week", "month"].map((id) => (
                <UserStatCard
                  key={id}
                  meta={CARD_META[id]}
                  value={stats[id]}
                  loading={activeLoading}
                  onClick={
                    id === "total"
                      ? showAllRows
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
              onClick={() => { setShowAll(false); setSearchInput(""); setSearch(""); setPage(0); }}
              style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #0891b230" }}
            >
              Get Data
            </Button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <Input
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search ticket, name, email, mobile, query..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => handleSearch(searchInput)}
              allowClear
              onClear={() => handleSearch("")}
              style={{ width: 260, borderRadius: 7, height: 30 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => handleSearch(searchInput)}
              style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", border: "none", borderRadius: 7, height: 30, fontWeight: 600, paddingInline: 12, fontSize: 11, boxShadow: "0 2px 8px #0891b230" }}
            >
              Search
            </Button>
            {(!showAll || search) && (
              <Button
                onClick={() => { setSearchInput(""); showAllRows(); }}
                style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
              >
                Clear
              </Button>
            )}
            {displayed.length > 0 && (
              <span className="text-[11px] text-cyan-700 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full ml-auto">
                {displayed.length.toLocaleString()} records
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">
                {STATUS_LABEL[activeStatus]} Queries
              </span>
              {displayed.length > 0 && (
                <span className="bg-sky-50 text-cyan-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  {paged.length} / {displayed.length.toLocaleString()}
                </span>
              )}
            </div>
            {activeLoading && (
              <span className="text-[11px] text-cyan-700 font-semibold flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border-2 border-sky-200 border-t-cyan-700 inline-block"
                  style={{ animation: "spin .7s linear infinite" }}
                />
                Loading...
              </span>
            )}
          </div>

          {activeLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <span
                className="w-6 h-6 rounded-full border-[3px] border-sky-200 border-t-cyan-700 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading {STATUS_LABEL[activeStatus].toLowerCase()} queries...
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-slate-400 text-xs">
                    <div className="font-semibold text-slate-500 mb-1">
                      No {STATUS_LABEL[activeStatus].toLowerCase()} queries found
                    </div>
                    {search
                      ? "Try a different search term"
                      : showAll
                        ? "None available at the moment"
                        : "None in this date range"}
                  </div>
                }
              />
            </div>
          ) : (
            <Table
              className="oxyone-square-table"
              rowKey="id"
              columns={columns}
              dataSource={paged}
              loading={false}
              pagination={{
                current: page + 1,
                pageSize: PAGE_SIZE,
                total: displayed.length,
                showSizeChanger: false,
                showTotal: (t) => `Total ${t.toLocaleString()} queries`,
                onChange: (p) => setPage(p - 1),
                style: { padding: "8px 12px 10px", margin: 0 },
              }}
              scroll={{ x: true }}
              size="small"
              components={TABLE_COMPONENTS}
            />
          )}
        </div>
      </div>
    </div>
  );
}
