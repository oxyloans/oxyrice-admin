import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import adminApi from "../../../core/config/axiosInstance";
import { SECTIONS } from "./config.jsx";

const FINTECH_ENDPOINT =
  "https://fintech.oxyloans.com/oxyloans/v1/user/queryDetailsBasedOnPrimaryType1";
const FINTECH_API_KEY = "oxy_contact_ff0ccf7744c64875af1de19c54650a17";
const FINTECH_STATUS_VALUE = { PENDING: "Pending", COMPLETED: "Completed", CANCELLED: "Cancelled" };
const STATUS_VALUES = ["PENDING", "COMPLETED", "CANCELLED"];
const FETCH_PAGE_SIZE = 5000;
const MAX_FETCH_PAGES = 5;
// Some (status, primaryType) combos — e.g. Lender "Completed" — genuinely
// return a multi-MB payload that takes ~18-22s server-side regardless of page
// size (confirmed against the live API). Keep this comfortably above that so
// a real-but-slow response isn't mistaken for a hang and dropped, while still
// capping truly stuck requests so a category doesn't load forever.
const REQUEST_TIMEOUT_MS = 45_000;

// Mirrors QueriesStatusPage's session cache: show last-known counts instantly
// on load, then silently refresh over the network — same pattern used by
// every dedicated queries page, so a revisit within 5 minutes is instant.
const CACHE_PREFIX = "oxyoneQueriesDashboardCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(key, status) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}:${status}`);
    if (!raw) return null;
    const { ts, rows } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return rows;
  } catch {
    return null;
  }
}

function writeCache(key, status, rows) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${key}:${status}`, JSON.stringify({ ts: Date.now(), rows }));
  } catch {
    // storage unavailable/full — safe to ignore, it's only a perf cache
  }
}

// This API returns receivedOn/respondedOn as "DD-MM-YYYY HH:mm:ss"; normalize
// to something `new Date()` can parse, matching QueriesLender/Borrower.
function toIsoDate(value) {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}:\d{2}:\d{2})$/.exec(value || "");
  return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}` : value;
}

function parseServerDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function isToday(value) {
  const d = parseServerDate(value);
  if (!d) return false;
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}


// Fetches rows for a single status from a non-paginated getAllQueries-style
// endpoint (used by AskOxy.AI and OxyBricks). Resolving per-status (rather
// than waiting on all three) lets the dashboard show a count as soon as the
// fastest status responds instead of blocking on the slowest.
async function fetchGenericStatusRows({ endpoint, apiKey, useAdminApi, buildBody, extractRows, status }) {
  const body = buildBody(status);
  const res = useAdminApi
    ? await adminApi.post(endpoint, body, { timeout: REQUEST_TIMEOUT_MS })
    : await axios.post(endpoint, body, {
        headers: apiKey ? { "X-Api-Key": apiKey, "Content-Type": "application/json" } : undefined,
        timeout: REQUEST_TIMEOUT_MS,
      });
  return extractRows(res.data).map((r) => ({ ...r, queryStatus: status }));
}

// Fetches rows for a single status from the paginated OxyLoans fintech
// endpoint (used by Lender and Borrower queries).
async function fetchFintechStatusRows(primaryType, status) {
  let rows = [];
  for (let pageNo = 1; pageNo <= MAX_FETCH_PAGES; pageNo++) {
    const res = await axios.post(
      FINTECH_ENDPOINT,
      { pageNo, pageSize: FETCH_PAGE_SIZE, status: FINTECH_STATUS_VALUE[status], primaryType },
      {
        headers: { "X-Api-Key": FINTECH_API_KEY, "Content-Type": "application/json" },
        timeout: REQUEST_TIMEOUT_MS,
      },
    );
    const data = res.data;
    const pageRows = Array.isArray(data?.listOfUserQueryDetailsResponseDto)
      ? data.listOfUserQueryDetailsResponseDto
      : Array.isArray(data)
        ? data
        : [];
    rows = rows.concat(
      pageRows.map((r) => ({
        ...r,
        createdAt: toIsoDate(r.receivedOn),
        resolvedOn: toIsoDate(r.respondedOn),
        queryStatus: status,
      })),
    );
    if (pageRows.length < FETCH_PAGE_SIZE) break;
  }
  return rows;
}

// One entry per queries category, mirroring the exact endpoint/body each
// dedicated page (QueriesUsers/QueriesOxyBricks/QueriesLender/QueriesBorrower)
// passes into QueriesStatusPage, so counts here stay consistent with those pages.
const QUERY_SOURCES = [
  {
    key: "queriesAskoxy",
    color: "#0891b2",
    fetchStatusRows: (status) =>
      fetchGenericStatusRows({
        endpoint: "/user-service/write/getAllQueries",
        useAdminApi: true,
        buildBody: (s) => ({ projectType: "ASKOXY", queryStatus: s }),
        extractRows: (data) => (Array.isArray(data) ? data : []),
        status,
      }),
  },
  {
    key: "queriesOxybricks",
    color: "#b45309",
    fetchStatusRows: (status) =>
      fetchGenericStatusRows({
        endpoint: "https://meta.oxyloans.com/api/write-to-us/student/getQueries1",
        apiKey: "oxybricks@123456",
        buildBody: (s) => ({ projectType: "OXYBRICKS", queryStatus: s }),
        extractRows: (data) => (Array.isArray(data) ? data : []),
        status,
      }),
  },
  {
    key: "queriesLender",
    color: "#2563eb",
    fetchStatusRows: (status) => fetchFintechStatusRows("LENDER", status),
  },
  {
    key: "queriesBorrower",
    color: "#7c3aed",
    fetchStatusRows: (status) => fetchFintechStatusRows("BORROWER", status),
  },
];

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function ProductCard({ item, i, navigate, count, loading, label, partial }) {
  const cfg = SECTIONS[item.key];
  const color = item.color;
  return (
    <div
      onClick={() => navigate(`/oxyone/${item.key}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/oxyone/${item.key}`); } }}
      role="button"
      tabIndex={0}
      className="group h-[120px] rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ animationDelay: `${i * 50}ms`, animation: "fadeUp .5s ease both", background: "#ffffff", border: `1.5px solid ${color}40`, boxShadow: `0 2px 8px ${color}15` }}
    >
      <div className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-125" style={{ background: `${color}0d` }} />
      <div className="relative z-10 h-full flex items-center gap-3 px-4">
        <div className="w-11 h-11 rounded-xl grid place-items-center text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: `${color}12`, color }}>
          {cfg.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">{cfg.title}</div>
          {label && <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{label}</div>}
          {loading ? (
            <div className="h-7 w-16 rounded-md bg-slate-200 animate-pulse mt-1" />
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="text-2xl font-extrabold leading-none" style={{ color }}>
                {count == null ? "—" : formatCount(count)}
              </div>
              {partial && (
                <span
                  title="Still fetching some statuses — this count will keep updating"
                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                  style={{ background: color, animation: "pulse 1.4s ease-in-out infinite" }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// A single-status count card — one per category, colored by status (not by
// category), so Pending and Completed each get their own separate card
// instead of being combined into one card together.
function StatusCard({ item, i, navigate, count, done, statusColor, statusLabel }) {
  const cfg = SECTIONS[item.key];
  return (
    <div
      onClick={() => navigate(`/oxyone/${item.key}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/oxyone/${item.key}`); } }}
      role="button"
      tabIndex={0}
      className="group h-[120px] rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ animationDelay: `${i * 50}ms`, animation: "fadeUp .5s ease both", background: "#ffffff", border: `1.5px solid ${statusColor}40`, boxShadow: `0 2px 8px ${statusColor}15` }}
    >
      <div className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-125" style={{ background: `${statusColor}0d` }} />
      <div className="relative z-10 h-full flex items-center gap-3 px-4">
        <div className="w-11 h-11 rounded-xl grid place-items-center text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: `${statusColor}12`, color: statusColor }}>
          {cfg.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">{cfg.title}</div>
          <div className="text-[10px] font-bold mt-0.5" style={{ color: statusColor }}>{statusLabel}</div>
          {!done ? (
            <div className="h-7 w-16 rounded-md bg-slate-200 animate-pulse mt-1" />
          ) : (
            <div className="text-2xl font-extrabold mt-1 leading-none" style={{ color: statusColor }}>
              {count == null ? "—" : formatCount(count)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QueriesDashboard() {
  const navigate = useNavigate();
  const [todayCounts, setTodayCounts] = useState({});
  const [todayLoading, setTodayLoading] = useState(() =>
    Object.fromEntries(QUERY_SOURCES.map((c) => [c.key, true]))
  );
  // A category's count can display before all 3 statuses are in (so the fastest
  // one shows immediately instead of waiting on the slowest — e.g. "Completed"
  // is known to be much slower for some categories). `settled` tracks which
  // statuses have actually finished (success or failure) per category, so the
  // UI can flag "this total is still partial" instead of silently under-counting.
  const [settled, setSettled] = useState(() =>
    Object.fromEntries(QUERY_SOURCES.map((c) => [c.key, new Set()]))
  );
  // Per-(category, status) counts, for the Pending/Completed breakdown cards.
  const [statusCounts, setStatusCounts] = useState(() =>
    Object.fromEntries(QUERY_SOURCES.map((c) => [c.key, {}]))
  );
  // rowsByKey.current[key][status] = rows for that (category, status) pair,
  // filled in independently as each request resolves. failedByKey tracks
  // statuses that errored with no data at all (cache or network), so a full
  // outage can show "—" instead of a misleading "0".
  const rowsByKey = useRef(Object.fromEntries(QUERY_SOURCES.map((c) => [c.key, {}])));
  const failedByKey = useRef(Object.fromEntries(QUERY_SOURCES.map((c) => [c.key, new Set()])));

  const markSettled = (key, status) => {
    setSettled((s) => {
      const next = new Set(s[key]);
      next.add(status);
      return { ...s, [key]: next };
    });
  };

  const applyRows = (key, status, rows) => {
    failedByKey.current[key].delete(status);
    rowsByKey.current[key][status] = rows;
    const all = Object.values(rowsByKey.current[key]).flat();
    // "Today's Queries" counts queries raised today, regardless of status —
    // not when a Completed/Cancelled row was closed.
    setTodayCounts((c) => ({ ...c, [key]: all.filter((r) => isToday(r.createdAt)).length }));
    setStatusCounts((s) => ({ ...s, [key]: { ...s[key], [status]: rows.length } }));
    setTodayLoading((l) => ({ ...l, [key]: false }));
    markSettled(key, status);
  };

  const applyFailure = (key, status) => {
    failedByKey.current[key].add(status);
    const neverGotData = Object.keys(rowsByKey.current[key]).length === 0;
    const allFailed = failedByKey.current[key].size === STATUS_VALUES.length;
    if (neverGotData && allFailed) {
      setTodayCounts((c) => ({ ...c, [key]: null }));
    }
    setStatusCounts((s) => ({ ...s, [key]: { ...s[key], [status]: s[key]?.[status] ?? null } }));
    setTodayLoading((l) => ({ ...l, [key]: false }));
    markSettled(key, status);
  };

  const loadCounts = () => {
    QUERY_SOURCES.forEach(({ key, fetchStatusRows }) => {
      STATUS_VALUES.forEach((status) => {
        // Show cached rows for this (category, status) instantly, then
        // silently refresh over the network — same pattern as QueriesStatusPage.
        const cached = readCache(key, status);
        if (cached) applyRows(key, status, cached);

        fetchStatusRows(status)
          .then((rows) => {
            writeCache(key, status, rows);
            applyRows(key, status, rows);
          })
          .catch(() => applyFailure(key, status));
      });
    });
  };

  const isPartial = (key) => (settled[key]?.size ?? 0) < STATUS_VALUES.length;

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 30 seconds to stay dynamic
  useEffect(() => {
    const id = setInterval(loadCounts, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>

      {/* ── Today's queries ── */}
      <div>
        <div className="text-[15px] font-black text-slate-900 mb-2">
          Today's Queries
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {QUERY_SOURCES.map((item, i) => (
            <ProductCard
              key={`today-${item.key}`}
              item={item}
              i={i}
              navigate={navigate}
              count={todayCounts[item.key]}
              loading={!!todayLoading[item.key]}
              label="Today"
              partial={isPartial(item.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Total Pending queries — one card per category ── */}
      <div className="text-[15px] font-black text-slate-900 mt-4 mb-0">
        Total Pending Queries
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {QUERY_SOURCES.map((item, i) => (
          <StatusCard
            key={`pending-${item.key}`}
            item={item}
            i={i}
            navigate={navigate}
            count={statusCounts[item.key]?.PENDING}
            done={!!settled[item.key]?.has("PENDING")}
            statusColor="#d97706"
            statusLabel="Pending"
          />
        ))}
      </div>

      {/* ── Total Completed queries — one card per category ── */}
      <div className="text-[15px] font-black text-slate-900 mt-4 mb-0">
        Total Completed Queries
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {QUERY_SOURCES.map((item, i) => (
          <StatusCard
            key={`completed-${item.key}`}
            item={item}
            i={i}
            navigate={navigate}
            count={statusCounts[item.key]?.COMPLETED}
            done={!!settled[item.key]?.has("COMPLETED")}
            statusColor="#059669"
            statusLabel="Completed"
          />
        ))}
      </div>

    </div>
  );
}
