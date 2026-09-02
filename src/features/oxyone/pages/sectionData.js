import axios from "axios";
import adminApi, { ensureFreshAccessToken } from "../../../core/config/axiosInstance";

// Shared by SectionPage (the per-dataset table) and CampaignDashboard (the
// summary cards) so both always agree on transport, row shape, and totals.

export const CACHE_PREFIX = "oxyoneSectionCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

export function readSessionCache(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, rows, total } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return { rows, total };
  } catch {
    return null;
  }
}

export function writeSessionCache(key, rows, total) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ ts: Date.now(), rows, total }),
    );
  } catch {
    // storage unavailable/full — safe to ignore, it's only a perf cache
  }
}

export const isDirectAskoxyRequest = (endpoint = "") =>
  endpoint.includes("rotary-data") ||
  endpoint.includes("getAllCbsData") ||
  endpoint.includes("getAllAdvocatesData") ||
  endpoint.includes("FtcciData") ||
  endpoint.includes("getAllMumbaiData") ||
  endpoint.includes("AllKukatpallyData") ||
  endpoint.includes("sudheerVakkalagadda") ||
  endpoint.includes("getAllTalwarData") ||
  endpoint.includes("getAllRamMohanDarisa");

export const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.rows,
    payload.content,
    payload.data,
    payload.items,
    payload.results,
    payload.users,
    payload.list,
    payload.records,
    payload.response,
    payload.responseData,
    payload.activeUsersResponse,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const extractTotalCount = (payload, fallbackLength) => {
  if (!payload || typeof payload !== "object") return fallbackLength;
  return (
    payload.totalElements ??
    payload.totalCount ??
    payload.total ??
    fallbackLength
  );
};

// Rows are re-uploaded/re-scraped over time, producing exact repeats of the
// same person/record with only the timestamp differing. Keep just the
// newest copy (rows are sorted newest-first before this runs), so
// duplicates collapse down to the one at the top.
const DEDUPE_IGNORE_KEYS = new Set(["createdAt", "resolvedOn"]);

export function dedupeRows(rows, rowKeys) {
  const signatureKeys = rowKeys.filter((k) => !DEDUPE_IGNORE_KEYS.has(k));
  if (signatureKeys.length === 0) return rows;

  const seen = new Set();
  const result = [];
  for (const row of rows) {
    const signature = signatureKeys
      .map((k) => String(row[k] ?? "").trim().toLowerCase())
      .join("|");
    if (signature && seen.has(signature)) continue;
    if (signature) seen.add(signature);
    result.push(row);
  }
  return result;
}

export function parseServerDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Fetches one section's rows via the correct transport (direct + refreshed
// bearer token vs adminApi), then applies the same name1/name2 merge, sort,
// and dedup as the dedicated table page — so the count this returns always
// matches what that page would show.
export async function fetchSectionRows(cfg) {
  let res;
  if (isDirectAskoxyRequest(cfg.endpoint)) {
    const token = await ensureFreshAccessToken();
    const requestConfig = {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    };
    res =
      cfg.method === "POST"
        ? await axios.post(cfg.endpoint, cfg.body ?? {}, requestConfig)
        : await axios.get(cfg.endpoint, requestConfig);
  } else {
    res =
      cfg.method === "POST"
        ? await adminApi.post(cfg.endpoint, cfg.body ?? {})
        : await adminApi.get(cfg.endpoint);
  }

  let rows = normalizeRows(res?.data ?? []);
  rows = rows.map((r) =>
    !r.name && (r.name1 || r.name2)
      ? { ...r, name: [r.name1, r.name2].filter(Boolean).join("\n") }
      : r,
  );
  rows.sort(
    (a, b) =>
      (parseServerDate(b.createdAt)?.getTime() ?? 0) -
      (parseServerDate(a.createdAt)?.getTime() ?? 0),
  );
  rows = dedupeRows(rows, cfg.rowKeys);
  const total = extractTotalCount(res?.data, rows.length);
  return { rows, total };
}
