import axios from "axios";
import adminApi, { ensureFreshAccessToken } from "../../../core/config/axiosInstance";

// Shared by SectionPage (the per-dataset table) and CampaignDashboard (the
// summary cards) so both always agree on transport, row shape, and totals.

export const CACHE_PREFIX = "oxyoneSectionCache:";
const CACHE_TTL_MS = 5 * 60 * 1000;

export const CAMPAIGN_KEYS = [
  "askoxyHelpdeskData",
  "rotaryData",
  "cbsData",
  "advocatesData",
  "ftcciData",
  "mumbaiData",
  "kukatpallyData",
  "talwarData",
  "ramMohanDarisaData",
  "amfiData",
  "radhaLinkedinData",
  "naukariData",
  "sudheerData",
  "tahsildarData",
  "activeMembershipData",
  "amsLostCustomerData",
  "clientWiseAumData",
  "k2kFintechData",
  "sakshamData",
  "tieData",
  "twoYearsServiceData",
  "unknownData",
  "naukriRasData",
];

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
  endpoint.includes("allOxyUsersAssignedToHelpDesk") ||
  endpoint.includes("rotary-data") ||
  endpoint.includes("getAllCbsData") ||
  endpoint.includes("getAllAdvocatesData") ||
  endpoint.includes("FtcciData") ||
  endpoint.includes("getAllMumbaiData") ||
  endpoint.includes("AllKukatpallyData") ||
  endpoint.includes("getAllTalwarData") ||
  endpoint.includes("getAllRamMohanDarisa") ||
  endpoint.includes("amfi-reports") ||
  endpoint.includes("radha-linkedin") ||
  endpoint.includes("sa-naukari-records") ||
  endpoint.includes("sudheer-data") ||
  endpoint.includes("tahsildar") ||
  endpoint.includes("active-membership") ||
  endpoint.includes("ams-lost-customer-data") ||
  endpoint.includes("client-wise-aum-report") ||
  endpoint.includes("k2k-fintech") ||
  endpoint.includes("saksham") ||
  endpoint.includes("tie-data") ||
  endpoint.includes("two-years-service-data") ||
  endpoint.includes("unknow-data") ||
  endpoint.includes("naukri-ras");

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

// Rows are re-uploaded/re-scraped over time, producing repeats of the same
// person/record with only the timestamp differing — and sometimes with
// different fields filled in per copy (e.g. one scrape has an email, another
// has a phone number). Keep just the first (newest, since rows are sorted
// newest-first before this runs) copy's slot, but merge in any field left
// blank there from later duplicates, so the kept record ends up as complete
// as the data allows instead of missing fields the row was deduped from.
const DEDUPE_IGNORE_KEYS = new Set(["createdAt", "resolvedOn"]);

const isBlankValue = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return !s || ["-", "--", "n/a", "na", "null"].includes(s);
};

// `dedupeKeys` (optional) narrows which fields identify "the same record" —
// e.g. AMFI matches on name + pin alone, since email/phone are exactly the
// fields that vary between otherwise-duplicate copies. Defaults to every
// rowKey, matching the old exact-match behavior for everything else.
export function dedupeRows(rows, rowKeys, dedupeKeys) {
  const signatureKeys = (dedupeKeys ?? rowKeys).filter(
    (k) => !DEDUPE_IGNORE_KEYS.has(k),
  );
  if (signatureKeys.length === 0) return rows;

  const order = [];
  const merged = new Map();
  rows.forEach((row, i) => {
    const raw = signatureKeys
      .map((k) => String(row[k] ?? "").trim().toLowerCase())
      .join("|");
    const signature = raw || `__unique_${i}__`;
    const existing = merged.get(signature);
    if (existing) {
      for (const k of rowKeys) {
        if (isBlankValue(existing[k]) && !isBlankValue(row[k])) {
          existing[k] = row[k];
        }
      }
    } else {
      merged.set(signature, { ...row });
      order.push(signature);
    }
  });
  return order.map((signature) => merged.get(signature));
}

export function parseServerDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Fetches one section's rows via the correct transport (direct + refreshed
// bearer token vs adminApi), then applies the same name merge (from
// name1/name2 or firstName/lastName), sort, and dedup as the dedicated
// table page — so the count this returns always matches what that page
// would show.
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
  rows = rows.map((r) => {
    if (cfg.mergeEmailFields) {
      const email = cfg.mergeEmailFields
        .map((key) => r[key])
        .filter((value) => !isBlankValue(value))
        .join("\n");
      r = { ...r, email };
    }
    if (!r.name && (r.name1 || r.name2)) {
      return { ...r, name: [r.name1, r.name2].filter(Boolean).join("\n") };
    }
    if (!r.name && (r.firstName || r.lastName)) {
      return { ...r, name: [r.firstName, r.lastName].filter(Boolean).join(" ") };
    }
    return r;
  });
  rows.sort(
    (a, b) =>
      (parseServerDate(b.createdAt)?.getTime() ?? 0) -
      (parseServerDate(a.createdAt)?.getTime() ?? 0),
  );
  rows = dedupeRows(rows, cfg.rowKeys, cfg.dedupeKeys);
  const total = extractTotalCount(res?.data, rows.length);
  return { rows, total };
}
