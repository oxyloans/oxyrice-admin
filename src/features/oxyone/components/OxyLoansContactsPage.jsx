import { useState, useEffect, useCallback, useMemo } from "react";
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
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserStatCard from "./UserStatCard";
import { fetchContactPage, loadAllContacts } from "../util/oxyloansContacts";
import {
  countQuickRanges,
  formatRegDate,
  inDayRange,
  quickRangeKeys,
} from "../util/registrationDates";

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

const cardMeta = (label, plural) => ({
  total: {
    label: `Total ${label}s`,
    accent: "#0f172a",
    grad: "linear-gradient(135deg,#0f172a,#1e293b)",
    sub: `All registered ${plural}`,
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
});

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

const PRIMARY_BTN_STYLE = {
  background: "linear-gradient(135deg,#0891b2,#0e7490)",
  border: "none",
  borderRadius: 7,
  height: 30,
  fontWeight: 600,
  paddingInline: 12,
  fontSize: 11,
  boxShadow: "0 2px 8px #0891b230",
};

const ALL = { type: "all" };

function applyFilter(rows, filter) {
  if (filter.type === "card") {
    const [f, t] = quickRangeKeys(filter.card);
    return rows.filter((r) => inDayRange(r._day, f, t));
  }
  if (filter.type === "date") {
    return rows.filter((r) => inDayRange(r._day, filter.from, filter.to));
  }
  if (filter.type === "search") {
    const q = filter.query.toLowerCase();
    const digits = filter.query.replace(/\D/g, "");
    return rows.filter(
      (r) =>
        (digits && String(r.mobileNumber).replace(/\D/g, "").includes(digits)) ||
        r.email.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        String(r.id) === filter.query,
    );
  }
  return rows;
}

/* Lender / Borrower / Partner registrations. The first page comes from the
   server straight away; the full list loads in the background and every
   count, card, date search and mobile search runs over all of it. */
export default function OxyLoansContactsPage({ url, label, plural }) {
  const meta = useMemo(() => cardMeta(label, plural), [label, plural]);
  const today = dayjs();

  const [all, setAll] = useState(null);
  const [allError, setAllError] = useState(false);
  const [preview, setPreview] = useState({ rows: [], totalCount: 0 });
  const [previewLoading, setPreviewLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [filter, setFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("date");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [mobileInput, setMobileInput] = useState("");

  const loadAll = useCallback(
    (force = false) => {
      setAllError(false);
      if (force) setAll(null);
      loadAllContacts(url, { force })
        .then((res) => setAll(res.rows))
        .catch((err) => {
          console.error(`${label} API error:`, err);
          setAllError(true);
          message.error(`Failed to load all ${plural}. Counts and filters may be incomplete — please retry.`);
        });
    },
    [url, label, plural],
  );

  const fetchPreview = useCallback(
    async (pg) => {
      setPreviewLoading(true);
      try {
        const res = await fetchContactPage(url, pg, PAGE_SIZE);
        setPreview(res);
        setPage(pg);
      } catch (err) {
        console.error(`${label} API error:`, err);
        message.error(err?.response?.data?.message || `Failed to load ${label.toLowerCase()} data. Please try again.`);
      } finally {
        setPreviewLoading(false);
        setInitialLoad(false);
      }
    },
    [url, label],
  );

  useEffect(() => {
    fetchPreview(1);
    loadAll();
  }, [fetchPreview, loadAll]);

  const filtered = useMemo(() => (all ? applyFilter(all, filter) : null), [all, filter]);

  const stats = useMemo(() => {
    if (!all) return { total: preview.totalCount || null };
    return { total: all.length, ...countQuickRanges(all, (r) => r._day) };
  }, [all, preview.totalCount]);

  // Until the full list arrives, the unfiltered view pages through the
  // server; filtered views wait for the full list (table shows loading).
  const usingPreview = !filtered && filter.type === "all";
  const totalCount = filtered ? filtered.length : usingPreview ? preview.totalCount : 0;
  const pageRows = filtered
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : usingPreview
      ? preview.rows
      : [];
  const tableLoading = filtered ? false : usingPreview ? previewLoading : !allError;

  const changeFilter = useCallback((next) => {
    setFilter(next);
    setPage(1);
  }, []);

  const handleCardClick = useCallback(
    (cardId) => {
      setMobileInput("");
      setActiveTab("date");
      changeFilter(cardId === "total" ? ALL : { type: "card", card: cardId });
    },
    [changeFilter],
  );

  const handleRemoveFilter = useCallback(() => {
    setMobileInput("");
    changeFilter(ALL);
  }, [changeFilter]);

  const handleDateSearch = useCallback(() => {
    if (!fromDate || !toDate) return;
    setMobileInput("");
    changeFilter({
      type: "date",
      from: fromDate.format("YYYY-MM-DD"),
      to: toDate.format("YYYY-MM-DD"),
    });
  }, [fromDate, toDate, changeFilter]);

  const handleMobileSearch = useCallback(
    (value) => {
      const query = (value ?? "").trim();
      changeFilter(query ? { type: "search", query } : ALL);
    },
    [changeFilter],
  );

  const handlePageChange = useCallback(
    (pg) => {
      if (usingPreview) fetchPreview(pg);
      else setPage(pg);
    },
    [usingPreview, fetchPreview],
  );

  const activeCard = filter.type === "card" ? filter.card : null;
  const searchQuery = filter.type === "search" ? filter.query : "";
  const filterBusy = !all && !allError;

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
      render: (v) => {
        const d = formatRegDate(v);
        return d ? (
          <div className="text-center">
            <div className="text-xs font-bold text-slate-800">{d.date}</div>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">{d.time}</div>
          </div>
        ) : <span className="text-slate-300">—</span>;
      },
    },
  ];

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {["total", "today", "yesterday", "week", "month"].map((id) => (
          <UserStatCard
            key={id}
            meta={meta[id]}
            value={stats[id]}
            loading={id === "total" ? stats.total == null && !allError : !all && !allError}
            active={id === "total" ? filter.type === "all" : activeCard === id}
            onClick={() => handleCardClick(id)}
          />
        ))}
      </div>

      {allError && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-rose-50 border border-rose-200 text-[12px] font-semibold text-rose-700">
          <span>Couldn't load the full {label.toLowerCase()} list — counts, date and mobile search are unavailable.</span>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => loadAll(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 shadow-sm min-w-0">
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
              {activeCard && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                  {meta[activeCard].label}
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
                      onChange={(v) => v && setFromDate(v)}
                      format="YYYY-MM-DD"
                      allowClear={false}
                      disabledDate={(d) => (toDate && d.isAfter(toDate, "day")) || d.isAfter(dayjs(), "day")}
                      style={{ borderRadius: 7, height: 30, width: 130 }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">To</span>
                    <DatePicker
                      value={toDate}
                      onChange={(v) => v && setToDate(v)}
                      format="YYYY-MM-DD"
                      allowClear={false}
                      disabledDate={(d) => (fromDate && d.isBefore(fromDate, "day")) || d.isAfter(dayjs(), "day")}
                      style={{ borderRadius: 7, height: 30, width: 130 }}
                    />
                  </div>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    loading={filterBusy && filter.type === "date"}
                    disabled={allError}
                    onClick={handleDateSearch}
                    style={PRIMARY_BTN_STYLE}
                  >
                    Get Data
                  </Button>
                  {filter.type === "date" && (
                    <Button
                      onClick={handleRemoveFilter}
                      style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
                    >
                      Clear
                    </Button>
                  )}
                </>
              )}
              {filtered && filter.type !== "search" && (
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
                  if (!e.target.value && searchQuery) handleMobileSearch("");
                }}
                onPressEnter={() => handleMobileSearch(mobileInput)}
                allowClear
                style={{ width: 240, borderRadius: 7, height: 30 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={filterBusy && filter.type === "search"}
                disabled={allError}
                onClick={() => handleMobileSearch(mobileInput)}
                style={PRIMARY_BTN_STYLE}
              >
                Search
              </Button>
              {searchQuery && (
                <Button
                  onClick={() => { setMobileInput(""); handleMobileSearch(""); }}
                  style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
                >
                  Clear
                </Button>
              )}
              {filtered && searchQuery && (
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
            <span className="font-bold text-xs text-slate-900">{label} Records</span>
            {totalCount > 0 && (
              <span className="bg-sky-50 text-cyan-600 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {pageRows.length} / {totalCount.toLocaleString()}
              </span>
            )}
          </div>
          {filterBusy && (
            <span className="text-[11px] text-cyan-600 font-semibold flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-sky-200 border-t-cyan-600 inline-block"
                style={{ animation: "spin .7s linear infinite" }}
              />
              Loading all records...
            </span>
          )}
        </div>

        <Table
          className="oxyone-square-table"
          rowKey={(row) => row.id || `${row.mobileNumber}-${row.registeredDate}`}
          columns={columns}
          dataSource={pageRows}
          loading={tableLoading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: totalCount,
            showSizeChanger: false,
            showTotal: (t) => `Total ${t.toLocaleString()} ${plural}`,
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
