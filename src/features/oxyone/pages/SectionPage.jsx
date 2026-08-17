import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import adminApi from "../../../core/config/axiosInstance";
import { SECTIONS } from "./config.jsx";

const CACHE_PREFIX = "oxyoneSectionCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

function readSessionCache(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, rows } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return rows;
  } catch {
    return null;
  }
}

function writeSessionCache(key, rows) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-slate-100">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center text-lg flex-shrink-0"
          style={{ background: cfg.color + "18", color: cfg.color }}
        >
          {cfg.icon}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">{cfg.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{cfg.subtitle}</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-sm text-slate-400">
        <span className="text-4xl opacity-50">🗂️</span>
        <span>No data available yet.</span>
      </div>
    </div>
  );
}

function SectionTable({ cfg }) {
  const [activeTab, setActiveTab] = useState(cfg.tabs ? cfg.tabs[0].key : null);
  const tabCfg = cfg.tabs ? cfg.tabs.find((t) => t.key === activeTab) : cfg;
  const [data, setData] = useState([]);
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
        setData(cached);
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
        const res =
          tabCfg.method === "POST"
            ? await adminApi.post(tabCfg.endpoint, tabCfg.body ?? {})
            : await adminApi.get(tabCfg.endpoint);
        if (requestIdRef.current !== requestId) return; // a newer tab/request superseded this one
        const rows = Array.isArray(res.data) ? res.data : [];
        cacheRef.current[cacheKey] = rows;
        writeSessionCache(storageKey, rows);
        setData(rows);
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-wrap gap-2.5">
        <div className="flex items-center gap-3.5">
          <div
            className="w-9 h-9 rounded-[10px] grid place-items-center text-lg flex-shrink-0"
            style={{ background: cfg.color + "18", color: cfg.color }}
          >
            {cfg.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{cfg.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{cfg.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            {data.length} total
          </span>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 border border-slate-200 rounded-[9px] text-sm text-slate-800 outline-none bg-slate-50 w-44 transition-all focus:border-slate-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,20,.05)] placeholder:text-slate-400"
          />
          <button
            onClick={() => fetchData(true)}
            className="w-9 h-9 rounded-[9px] border border-slate-200 bg-slate-50 text-base cursor-pointer grid place-items-center transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:rotate-90"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Tabs */}
      {cfg.tabs && (
        <div className="flex items-center gap-1.5 px-6 py-3.5 border-b border-slate-100 flex-wrap">
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
                <th className="text-[10.5px] font-bold tracking-[.7px] uppercase text-slate-400 px-4 py-3 text-left bg-slate-50 border-b border-slate-100 whitespace-nowrap">
                  #
                </th>
                {tabCfg.columns.map((c) => (
                  <th
                    key={c}
                    className="text-[10.5px] font-bold tracking-[.7px] uppercase text-slate-400 px-4 py-3 text-left bg-slate-50 border-b border-slate-100 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-xs text-slate-400 border-b border-slate-100">
                    {i + 1}
                  </td>
                  {tabCfg.columns.map((c) => (
                    <td key={c} className="px-4 py-3 border-b border-slate-100">
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
                <th className="text-[10.5px] font-bold tracking-[.7px] uppercase text-slate-400 px-4 py-3 text-left bg-slate-50 border-b border-slate-100 whitespace-nowrap">
                  #
                </th>
                {tabCfg.columns.map((c) => (
                  <th
                    key={c}
                    className="text-[10.5px] font-bold tracking-[.7px] uppercase text-slate-400 px-4 py-3 text-left bg-slate-50 border-b border-slate-100 whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-xs text-slate-400 border-b border-slate-100 whitespace-nowrap">
                    {(page - 1) * PER_PAGE + i + 1}
                  </td>
                  {tabCfg.rowKeys.map((k) => (
                    <td
                      key={k}
                      className={`px-4 py-3 text-sm text-slate-700 border-b border-slate-100 ${k === "query" ? "whitespace-normal break-words min-w-[260px]" : "whitespace-nowrap"}`}
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
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 flex-wrap gap-2">
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
