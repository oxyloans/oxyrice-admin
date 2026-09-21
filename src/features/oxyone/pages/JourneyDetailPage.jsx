import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../../../core/config/axiosInstance";
import { Table, Button, Input, Skeleton, DatePicker, Empty } from "antd";
import { ReloadOutlined, SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { parseServerDate } from "./sectionData";
import UserStatCard from "../components/UserStatCard";
import { useAdminComments } from "../util/useAdminComments";
import CommentsModal from "./CommentsModal";
import { actionColumn, updatedCommentsColumn } from "./adminCommentsColumns";
import {
  JOURNEY_CATEGORIES,
  classifyJourney,
  STAT_META,
  TABLE_COMPONENTS,
} from "./journeyCategories";

/* ── Page skeleton while first load ─────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="h-8 w-48 rounded bg-slate-100 animate-pulse" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[120px] rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    </div>
  );
}

export default function JourneyDetailPage() {
  const { journeyKey } = useParams();
  const navigate = useNavigate();
  const journey = JOURNEY_CATEGORIES.find((c) => c.key === journeyKey);
  const today = dayjs();

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");

  const [activeQuick, setActiveQuick] = useState("total");
  const [fromDate, setFromDate] = useState(today.subtract(6, "day"));
  const [toDate, setToDate] = useState(today);
  const [showAll, setShowAll] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const comments = useAdminComments();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get(
        "/marketing-service/campgin/getAllInterestedUsres",
      );
      setAll(Array.isArray(res.data) ? res.data : []);
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

  const rows = useMemo(
    () => all.filter((r) => classifyJourney(r) === journeyKey),
    [all, journeyKey],
  );

  // Today/Yesterday/Week/Month/Total breakdown — always computed from every
  // record for this journey, independent of the current date filter, so the
  // cards stay accurate reference points no matter what's on screen.
  const stats = useMemo(() => {
    const yesterday = today.subtract(1, "day");
    const weekStart = today.subtract(6, "day");
    let todayN = 0, yestN = 0, weekN = 0, monthN = 0;
    rows.forEach((r) => {
      const d = parseServerDate(r.createdAt);
      if (!d) return;
      const dj = dayjs(d);
      if (dj.isSame(today, "day")) todayN++;
      if (dj.isSame(yesterday, "day")) yestN++;
      if (!dj.isBefore(weekStart, "day") && !dj.isAfter(today, "day")) weekN++;
      if (dj.isSame(today, "month")) monthN++;
    });
    return { total: rows.length, today: todayN, yesterday: yestN, week: weekN, month: monthN };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const quickFetch = useCallback((id, start, end) => {
    setActiveQuick(id);
    setFromDate(start);
    setToDate(end);
    setShowAll(false);
    setSearchInput("");
    setSearch("");
    setPage(0);
  }, []);

  const showAllRows = useCallback(() => {
    setActiveQuick("total");
    setShowAll(true);
    setSearchInput("");
    setSearch("");
    setPage(0);
  }, []);

  const dateFiltered = useMemo(() => {
    return rows.filter((r) => {
      const d = parseServerDate(r.createdAt);
      return d && !dayjs(d).isBefore(fromDate, "day") && !dayjs(d).isAfter(toDate, "day");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, fromDate, toDate]);

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (r.mobileNumber || "").toLowerCase().includes(q) ||
        (r.userId || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const displayed = search.trim() ? searchFiltered : showAll ? rows : dateFiltered;

  const filteredRows = useMemo(
    () =>
      [...displayed].sort(
        (a, b) =>
          (parseServerDate(b.createdAt)?.getTime() ?? 0) -
          (parseServerDate(a.createdAt)?.getTime() ?? 0),
      ),
    [displayed],
  );

  const handleSearch = useCallback((val) => {
    setActiveQuick(null);
    setSearch((val ?? "").trim());
    setPage(0);
  }, []);

  const paged = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  /* ── Fetch the latest comment for each row on the visible page only ── */
  const visibleIdsKey = paged
    .map((r) => r.userId)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (visibleIdsKey) comments.prefetchRowComments(visibleIdsKey.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIdsKey]);

  const columns = [
    {
      title: "S.No",
      width: 60,
      align: "center",
      render: (_, __, i) => (
        <span className="inline-flex items-center justify-center w-7 h-[22px] text-slate-700 text-[11px] font-bold">
          {page * pageSize + i + 1}
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      width: 90,
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
      width: 150,
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
      title: "Interested In (API value)",
      width: 320,
      align: "left",
      render: (_, r) => {
        const raw = r.askOxyOfers || r.journeyName || r.projectType;
        return raw ? (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: `${journey.color}18`, color: journey.color }}
          >
            {raw}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 160,
      align: "center",
      render: (v) =>
        v ? (
          <div>
            <div className="text-xs font-bold text-slate-900">{v.slice(0, 10)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {v.slice(11, 16)}
            </div>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    // actionColumn(comments.openCommentsModal, { readOnly: true }),
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

  if (!journey) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 py-14 px-6 text-sm text-slate-500">
        <span>Unknown journey.</span>
        <button
          onClick={() => navigate("/oxyone/journeyScorecard")}
          className="px-5 py-2 rounded-[9px] border border-slate-200 bg-white text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
        >
          Back to Journeys
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Header: back link left | refresh right ── */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate("/oxyone/journeyScorecard")}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-[1.2px] cursor-pointer bg-transparent border-none p-0 transition-colors"
        >
          <ArrowLeftOutlined style={{ fontSize: 11 }} />
          Back to Journeys
        </button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchData}
          loading={loading}
          size="small"
          style={{
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12,
            border: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          Refresh
        </Button>
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
        <>
          {/* ── Time stat cards (clickable quick filters) ── */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            {["total", "today", "yesterday", "week", "month"].map((id) => (
              <UserStatCard
                key={id}
                meta={STAT_META[id]}
                value={stats[id]}
                loading={loading}
                active={activeQuick === id}
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
                        quickFetch(id, ...map[id]);
                      }
                }
              />
            ))}
          </div>

          {/* ── Records ── */}
          <div className="bg-white border border-slate-200 shadow-sm min-w-0 overflow-hidden">
            {/* Date range + Get Data */}
            <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 flex-wrap bg-slate-50">
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
                onClick={() => {
                  setActiveQuick(null);
                  setShowAll(false);
                  setSearchInput("");
                  setSearch("");
                  setPage(0);
                }}
                style={{
                  background: `linear-gradient(135deg,${journey.color},${journey.color})`,
                  border: "none",
                  borderRadius: 7,
                  height: 30,
                  fontWeight: 600,
                  paddingInline: 12,
                  fontSize: 11,
                }}
              >
                Get Data
              </Button>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search mobile or user ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onPressEnter={() => handleSearch(searchInput)}
                allowClear
                onClear={() => handleSearch("")}
                style={{ width: 220, borderRadius: 7, height: 30 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchInput)}
                style={{
                  background: `linear-gradient(135deg,${journey.color},${journey.color})`,
                  border: "none",
                  borderRadius: 7,
                  height: 30,
                  fontWeight: 600,
                  paddingInline: 12,
                  fontSize: 11,
                }}
              >
                Search
              </Button>
              {(!showAll || search) && (
                <Button
                  onClick={() => {
                    setSearchInput("");
                    showAllRows();
                  }}
                  style={{ borderRadius: 7, height: 30, fontWeight: 600, fontSize: 11 }}
                >
                  Clear
                </Button>
              )}
              {filteredRows.length > 0 && (
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-auto"
                  style={{ background: `${journey.color}12`, color: journey.color }}
                >
                  {filteredRows.length.toLocaleString()} records
                </span>
              )}
            </div>

            {/* Toolbar */}
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Records</span>
                {filteredRows.length > 0 && (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {paged.length} / {filteredRows.length.toLocaleString()}
                  </span>
                )}
              </div>
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

            {loading && filteredRows.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <span
                  className="w-6 h-6 rounded-full border-[3px] border-slate-200 inline-block"
                  style={{ borderTopColor: journey.color, animation: "spin .7s linear infinite" }}
                />
                Loading records...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-12">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-slate-400 text-xs">
                      <div className="font-semibold text-slate-500 mb-1">No records found</div>
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
                rowKey={(r, i) => r.userId ?? r.mobileNumber ?? i}
                columns={columns}
                dataSource={paged}
                loading={false}
                pagination={{
                  current: page + 1,
                  pageSize,
                  total: filteredRows.length,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 25, 50, 100],
                  showTotal: (t) => `Showing all ${t.toLocaleString()} records`,
                  onChange: (p, ps) => {
                    setPage(p - 1);
                    setPageSize(ps);
                  },
                  style: { padding: "8px 12px 10px", margin: 0 },
                }}
                scroll={{ x: true }}
                tableLayout="fixed"
                size="small"
                style={{ width: "100%" }}
                components={TABLE_COMPONENTS}
              />
            )}
          </div>
        </>
      )}

      {/* ── HelpDesk Comments Modal ─────────────────────────── */}
      <CommentsModal c={comments} readOnly />
    </div>
  );
}
