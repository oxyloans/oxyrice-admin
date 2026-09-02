import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SECTIONS } from "./config.jsx";
import {
  readSessionCache,
  writeSessionCache,
  fetchSectionRows,
  parseServerDate,
} from "./sectionData.js";

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

// Age = time from when the query was raised to when it was closed
// (resolvedOn), or to now if it's still open.
function formatAge(row) {
  const start = parseServerDate(row.createdAt);
  if (!start) return "—";
  const end = parseServerDate(row.resolvedOn) || new Date();
  const ms = Math.max(0, end - start);
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return "just now";
}

export default function SectionPage() {
  const { section: sectionKey } = useParams();
  const cfg = SECTIONS[sectionKey];
  if (!cfg) return <Navigate to="/oxyone" replace />;
  if (!cfg.endpoint && !cfg.tabs) return <EmptySection cfg={cfg} />;
  return <SectionTable key={sectionKey} cfg={cfg} />;
}

function EmptySection({ cfg }) {
  return (
    <div className="oxyone-section-card">
      <div className="oxyone-section-header">
        <div
          className="oxyone-section-icon"
          style={{ background: cfg.color + "18", color: cfg.color }}
        >
          {cfg.icon}
        </div>
        <div>
          <div className="oxyone-section-title">{cfg.title}</div>
          <div className="oxyone-section-subtitle">{cfg.subtitle}</div>
        </div>
      </div>
      <div className="oxyone-empty-state">
        <span className="oxyone-empty-state-icon">🗂️</span>
        <span>No data available yet.</span>
      </div>
    </div>
  );
}

function SectionTable({ cfg }) {
  const [activeTab, setActiveTab] = useState(cfg.tabs ? cfg.tabs[0].key : null);
  const tabCfg = cfg.tabs ? cfg.tabs.find((t) => t.key === activeTab) : cfg;
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const cacheRef = useRef({});
  const requestIdRef = useRef(0);
  const cacheKey = activeTab ?? "default";
  const storageKey = `${cfg.title}:${cacheKey}`;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      const cached = forceRefresh
        ? null
        : (cacheRef.current[cacheKey] ?? readSessionCache(storageKey));

      // Show cached data instantly (if any) instead of blocking on the network.
      if (cached) {
        cacheRef.current[cacheKey] = cached;
        setData(cached.rows);
        setTotalRecords(cached.total ?? cached.rows.length);
        setError("");
        setLoading(false);
      } else {
        setLoading(true);
        setError("");
      }

      // Always hit the network — silently refresh when we already showed a
      // cached snapshot, or surface loading/error state when we didn't.
      const requestId = ++requestIdRef.current;
      try {
        const { rows, total } = await fetchSectionRows(tabCfg);
        if (requestIdRef.current !== requestId) return; // a newer tab/request superseded this one
        cacheRef.current[cacheKey] = { rows, total };
        writeSessionCache(storageKey, rows, total);
        setData(rows);
        setTotalRecords(total);
        setError("");
      } catch {
        if (requestIdRef.current !== requestId) return;
        if (!cached) setError("Failed to load data. Please try again.");
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [tabCfg.endpoint, tabCfg.method, tabCfg.body, cacheKey, storageKey],
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, tabCfg.endpoint, tabCfg.method, tabCfg.body]);

  const filtered = data.filter((row) =>
    tabCfg.rowKeys.some((k) =>
      String(row[k] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pillClass = (val) => {
    const map = {
      active: "bg-emerald-50 text-emerald-600",
      completed: "bg-emerald-50 text-emerald-600",
      inactive: "bg-rose-50 text-rose-600",
      cancelled: "bg-rose-50 text-rose-600",
      pending: "bg-amber-50 text-amber-600",
      verified: "bg-blue-50 text-blue-600",
      new: "bg-violet-50 text-violet-600",
    };
    return map[String(val).toLowerCase()] || "bg-slate-100 text-slate-600";
  };

  const loadedCount = data.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Toolbar — title/icon already shown in the fixed top bar. Total
          Records, search, and refresh all live in one row directly above
          the table, so there's no dead space between the stat and the
          data. The total comes straight from the API's own reported
          total on every fetch/refresh. */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex-wrap gap-3">
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-2.5"
          style={{ background: cfg.color + "0d", borderColor: cfg.color + "33" }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 leading-none">
              Total Records
            </div>
            <div
              className="text-2xl font-extrabold leading-tight tabular-nums mt-0.5"
              style={{ color: cfg.color }}
            >
              {loading && totalRecords == null
                ? "…"
                : Number(totalRecords ?? loadedCount).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              placeholder="Search loaded records..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-9 pr-8 border border-slate-200 rounded-[9px] text-sm text-slate-900 outline-none bg-white w-64 transition-all focus:border-slate-300 focus:shadow-[0_0_0_3px_rgba(17,17,20,.05)] placeholder:text-slate-400"
            />
            {search && (
              <svg
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <button
            onClick={() => fetchData(true)}
            title="Refresh"
            className="w-9 h-9 rounded-[9px] border border-slate-200 bg-white text-base cursor-pointer grid place-items-center transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:rotate-90"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Tabs */}
      {cfg.tabs && (
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-100 flex-wrap">
          {cfg.tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setSearch("");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-[9px] border text-xs font-semibold cursor-pointer transition-all
                ${activeTab === t.key ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 hover:text-slate-800"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[11px] font-extrabold tracking-[.5px] uppercase text-slate-800 px-3 py-2 text-left bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                  #
                </th>
                {tabCfg.columns.map((c) => (
                  <th
                    key={c}
                    className="text-[11px] font-extrabold tracking-[.5px] uppercase text-slate-800 px-3 py-2 text-left bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-xs text-slate-400 border-b border-slate-100">
                    {i + 1}
                  </td>
                  {tabCfg.columns.map((c) => (
                    <td key={c} className="px-3 py-2 border-b border-slate-100">
                      <div
                        className="h-3 rounded w-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #eef0f2 25%, #f6f7f9 37%, #eef0f2 63%)",
                          backgroundSize: "400px 100%",
                          animation: `shimmer 1.4s ease-in-out infinite`,
                          animationDelay: `${i * 60}ms`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-sm text-red-500">
            <span className="text-3xl opacity-55">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => fetchData(true)}
              className="px-5 py-2 rounded-[9px] border border-slate-200 bg-white text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
            >
              Retry
            </button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-sm text-slate-400">
            <span className="text-3xl opacity-55">🗂️</span>
            <span>No data found{search ? ` for "${search}"` : ""}.</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[11px] font-extrabold tracking-[.5px] uppercase text-slate-800 px-3 py-2 text-left bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                  #
                </th>
                {tabCfg.columns.map((c) => (
                  <th
                    key={c}
                    className="text-[11px] font-extrabold tracking-[.5px] uppercase text-slate-800 px-3 py-2 text-left bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr
                  key={i}
                  className={`transition-colors hover:bg-slate-100/70 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
                >
                  <td className="px-3 py-2 border-b border-slate-100 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-7 h-[22px] rounded-[6px] bg-slate-100 text-slate-800 text-[11px] font-black">
                      {(page - 1) * PER_PAGE + i + 1}
                    </span>
                  </td>
                  {tabCfg.rowKeys.map((k) => (
                    <td
                      key={k}
                      className={`px-3 py-2 text-xs text-slate-900 border-b border-slate-100 ${k === "query" ? "whitespace-normal break-words min-w-[260px]" : "whitespace-nowrap"}`}
                    >
                      {k === "status" || k === "queryStatus" ? (
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${pillClass(row[k])}`}
                        >
                          {row[k] ?? "—"}
                        </span>
                      ) : k === "emailVerified" || k === "testUserStatus" ? (
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${String(row[k]) === "true" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {String(row[k]) === "true" ? "Yes" : "No"}
                        </span>
                      ) : k === "isActive" ? (
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${String(row[k]) === "true" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {String(row[k]) === "true" ? "Active" : "Inactive"}
                        </span>
                      ) : k === "query" ? (
                        <span className="block max-w-[420px]">
                          {row[k] || "—"}
                        </span>
                      ) : k === "createdAt" || k === "resolvedOn" ? (
                        formatDate(row[k])
                      ) : k === "age" ? (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">
                          {formatAge(row)}
                        </span>
                      ) : String(row[k] ?? "").includes("\n") ? (
                        <div className="flex flex-col gap-0.5">
                          {String(row[k])
                            .split("\n")
                            .map((line, li) => (
                              <span key={li}>{line}</span>
                            ))}
                        </div>
                      ) : (
                        row[k] || "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filtered.length > PER_PAGE && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-2">
          <span className="text-xs text-slate-400">
            Showing {(page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="min-w-8 h-8 px-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={i} className="text-sm text-slate-400 px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-8 h-8 px-2 border rounded-lg text-xs font-medium cursor-pointer transition-all ${page === p ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="min-w-8 h-8 px-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
