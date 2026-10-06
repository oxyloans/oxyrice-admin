import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, DatePicker, Button, Input, Skeleton, Tabs, Empty, message } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CloseCircleOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "./UserStatCard";
import {
  formatRegDate,
  inDayRange,
  quickRangeKeys,
  regDayKey,
  regTime,
} from "../util/registrationDates";

const PAGE_SIZE = 10;

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-sm">
            <div className="h-9 bg-gradient-to-br from-slate-200 to-slate-300" />
            <div className="h-14 bg-white border-l-[3px] border-l-slate-200 border border-slate-200" />
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

const cardMeta = (entityPlural) => ({
  total: {
    label: `Total ${entityPlural}`,
    accent: "#0f172a",
    sub: `All active ${entityPlural.toLowerCase()}`,
    icon: <TeamOutlined />,
  },
  today: { label: "Today", accent: "#0891b2", sub: "New registrations", icon: <RiseOutlined /> },
  yesterday: { label: "Yesterday", accent: "#7c3aed", sub: "Previous day", icon: <HistoryOutlined /> },
  week: { label: "This Week", accent: "#059669", sub: "Last 7 days", icon: <BarChartOutlined /> },
  month: { label: "This Month", accent: "#d97706", sub: "Month to date", icon: <LineChartOutlined /> },
});

// Same table header/row styling as the OxyLoans Lender page
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

const BTN_STYLE = {
  background: "linear-gradient(135deg,#0891b2,#0e7490)",
  border: "none",
  borderRadius: 7,
  height: 30,
  fontWeight: 600,
  paddingInline: 12,
  fontSize: 11,
  boxShadow: "0 2px 8px #0891b230",
};

// Default row shape — pages can override via `normalizeRow` once the API is known.
function defaultNormalize(r) {
  return {
    ...r,
    id: r.userId || r.id || "",
    fullName: r.name || r.fullName || "",
    mobileNumber: r.mobileNumber || r.mobile || "",
    email: r.email || "",
    address: r.address || "",
    registeredDate: r.registeredDate || r.registrationDate || r.createdAt || r.created_at || "",
  };
}

// Local registration day — the API sends UTC timestamps.
const dateOf = (r) => regDayKey(r.registeredDate);

function inCardRange(cardId, d) {
  const range = quickRangeKeys(cardId);
  return range ? inDayRange(d, range[0], range[1]) : !!d;
}

/**
 * Shared page for the OXYONE 5 Actors (lender, borrower, advocate, partner,
 * recovery agent). `fetchRows` is an async function returning an array of raw
 * rows; until the API is wired in, leave it undefined and the page renders
 * its empty "API not connected" state.
 */
export default function ActorUsersPage({
  entityPlural,
  fetchRows,
  normalizeRow = defaultNormalize,
  extraColumns = [],
  hideColumns = [], // base column titles to drop, e.g. ["Address"]
}) {
  const today = dayjs();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(!!fetchRows);
  const [initialLoad, setInitialLoad] = useState(!!fetchRows);
  const [page, setPage] = useState(1);
  const [activeCard, setActiveCard] = useState(null);
  const [activeTab, setActiveTab] = useState("date");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [dateRange, setDateRange] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const meta = useMemo(() => cardMeta(entityPlural), [entityPlural]);

  const load = useCallback(async () => {
    if (!fetchRows) return;
    setLoading(true);
    try {
      const raw = await fetchRows();
      const list = (Array.isArray(raw) ? raw : []).map(normalizeRow);
      list.sort((a, b) => regTime(b.registeredDate) - regTime(a.registeredDate));
      setRows(list);
    } catch (err) {
      console.error(`${entityPlural} API error:`, err);
      message.error(
        err?.response?.data?.message || `Failed to load ${entityPlural.toLowerCase()}. Please try again.`,
      );
      setRows([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [fetchRows, normalizeRow, entityPlural]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const s = { total: rows.length, today: 0, yesterday: 0, week: 0, month: 0 };
    for (const r of rows) {
      const d = dateOf(r);
      for (const k of ["today", "yesterday", "week", "month"]) if (inCardRange(k, d)) s[k]++;
    }
    return s;
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (activeCard) list = list.filter((r) => inCardRange(activeCard, dateOf(r)));
    else if (dateRange) list = list.filter((r) => { const d = dateOf(r); return d && d >= dateRange[0] && d <= dateRange[1]; });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.mobileNumber?.includes(search) ||
          r.email?.toLowerCase().includes(q) ||
          r.fullName?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, activeCard, dateRange, search]);

  const resetFilters = () => {
    setActiveCard(null);
    setDateRange(null);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleCardClick = (id) => {
    resetFilters();
    setActiveTab("date");
    if (id !== "total") setActiveCard(id);
  };

  const handleDateSearch = () => {
    resetFilters();
    setDateRange([fromDate.format("YYYY-MM-DD"), toDate.format("YYYY-MM-DD")]);
  };

  const handleSearch = (v) => {
    setSearch((v || "").trim());
    setPage(1);
  };

  const columns = [
    {
      title: "S.No",
      width: 55,
      align: "center",
      render: (_, __, i) => (
        <span className="font-bold text-xs text-slate-700">{(page - 1) * PAGE_SIZE + i + 1}</span>
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
          <span className="text-[11px] text-slate-500 font-bold break-all">{row.email || "—"}</span>
        </div>
      ),
    },
    {
      title: "Mobile",
      width: 130,
      align: "center",
      render: (_, row) =>
        row.mobileNumber ? (
          <span className="font-mono text-xs font-bold text-slate-800">{row.mobileNumber}</span>
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
    ...extraColumns,
    {
      title: "Registered Date",
      dataIndex: "registeredDate",
      width: 130,
      align: "center",
      render: (v) => {
        const d = formatRegDate(v);
        return d ? (
          <div className="text-center">
            <div className="text-xs font-bold text-slate-800">{d.date}</div>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">{d.time}</div>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        );
      },
    },
  ].filter((c) => !hideColumns.includes(c.title));

  if (initialLoad) return <PageSkeleton />;

  const total = filtered.length;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {["total", "today", "yesterday", "week", "month"].map((id) => (
          <div
            key={id}
            onClick={() => handleCardClick(id)}
            className="cursor-pointer"
            style={{ outline: activeCard === id ? `2px solid ${meta[id].accent}` : "none", borderRadius: 12 }}
          >
            <UserStatCard meta={meta[id]} value={stats[id]} loading={loading && rows.length === 0} />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
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
              {activeCard ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                  {meta[activeCard].label}
                  <CloseCircleOutlined className="cursor-pointer hover:text-red-500" onClick={resetFilters} />
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">From</span>
                    <DatePicker
                      value={fromDate}
                      onChange={setFromDate}
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
                      onChange={setToDate}
                      format="YYYY-MM-DD"
                      allowClear={false}
                      disabledDate={(d) => fromDate && d.isBefore(fromDate, "day")}
                      style={{ borderRadius: 7, height: 30, width: 130 }}
                    />
                  </div>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleDateSearch} style={BTN_STYLE}>
                    Get Data
                  </Button>
                  {dateRange && (
                    <Button onClick={resetFilters} style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}>
                      Clear
                    </Button>
                  )}
                </>
              )}
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
                placeholder="Search by mobile / email / name..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (!e.target.value) handleSearch("");
                }}
                onPressEnter={() => handleSearch(searchInput)}
                allowClear
                style={{ width: 240, borderRadius: 7, height: 30 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchInput)} style={BTN_STYLE}>
                Search
              </Button>
              {search && (
                <Button
                  onClick={() => { setSearchInput(""); handleSearch(""); }}
                  style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
                >
                  Clear
                </Button>
              )}
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900">{entityPlural} Records</span>
            {total > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {total.toLocaleString()}
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
          rowKey={(row, i) => row.id || row.mobileNumber || i}
          columns={columns}
          dataSource={filtered}
          loading={loading && rows.length === 0}
          locale={{
            emptyText: fetchRows ? (
              <Empty description={`No ${entityPlural.toLowerCase()} found`} />
            ) : (
              <Empty
                image={<ApiOutlined style={{ fontSize: 40, color: "#94a3b8" }} />}
                description={
                  <span className="text-slate-500 text-xs font-semibold">
                    API not connected yet — {entityPlural.toLowerCase()} will appear here once it is wired up.
                  </span>
                }
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} ${entityPlural.toLowerCase()}`,
            onChange: setPage,
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
