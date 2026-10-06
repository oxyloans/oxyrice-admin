import axios from "axios";
import { regDayKey, regTime } from "./registrationDates";

/* ── OxyLoans lender / borrower / partner contact lists ─────────
   The API only supports { pageNo, pageSize } — no date or mobile filter —
   so any date search, card filter or count has to run over the full list.
   Pages of 5000 come back in well under a second, so the whole list
   (~38k borrowers) loads in a few seconds; it's cached briefly so moving
   between pages doesn't refetch it. ── */

export const OXYLOANS_API_KEY = "oxy_contact_ff0ccf7744c64875af1de19c54650a17";
const BASE = "https://fintech.oxyloans.com/oxyloans/v1/user/admin";
export const OXYLOANS_CONTACT_URLS = {
  lender: `${BASE}/lenderContactList`,
  borrower: `${BASE}/borrowerContactList`,
  partner: `${BASE}/partnerContactList`,
};

const FULL_BATCH_SIZE = 5000;
const SINCE_BATCH_SIZE = 500;
const MAX_SINCE_PAGES = 40;
const CACHE_TTL_MS = 2 * 60_000;

export function normalizeContactRow(r) {
  const registeredDate = r.registeredDate || r.registrationDate || r.createdAt || r.created_at || "";
  return {
    ...r,
    id: r.userId || r.id || "",
    fullName: r.name || r.fullName || "",
    mobileNumber: r.mobileNumber || r.mobile || "",
    email: r.email || "",
    address: r.address || "",
    registeredDate,
    _day: regDayKey(registeredDate),
    _time: regTime(registeredDate),
  };
}

export async function fetchContactPage(url, pageNo, pageSize) {
  const res = await axios.post(
    url,
    { pageNo, pageSize },
    { headers: { "X-Api-Key": OXYLOANS_API_KEY } },
  );
  const d = res.data ?? {};
  return {
    rows: Array.isArray(d.listOfData) ? d.listOfData.map(normalizeContactRow) : [],
    totalCount: Number(d.totalCount) || 0,
  };
}

const byNewest = (a, b) => b._time - a._time;

// Pages are fetched in parallel, so a registration landing mid-load can
// shift a row across a page boundary — drop the duplicate copy.
function dedupe(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    if (!r.id) return true;
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

const cache = new Map();

// Every contact for `url`, newest first. Rejects if any page fails, so
// callers never show a silently partial list.
export function loadAllContacts(url, { force = false } = {}) {
  const hit = cache.get(url);
  if (!force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise;

  const promise = (async () => {
    const first = await fetchContactPage(url, 1, FULL_BATCH_SIZE);
    const pages = Math.ceil(first.totalCount / FULL_BATCH_SIZE);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
        fetchContactPage(url, i + 2, FULL_BATCH_SIZE),
      ),
    );
    const rows = dedupe(first.rows.concat(...rest.map((p) => p.rows)));
    rows.sort(byNewest);
    return { rows, totalCount: first.totalCount };
  })();

  cache.set(url, { at: Date.now(), promise });
  promise.catch(() => {
    if (cache.get(url)?.promise === promise) cache.delete(url);
  });
  return promise;
}

// Contacts registered on/after `since` (a dayjs, local day). The list comes
// back newest first (a handful of rows are slightly out of order), so page
// until a whole page is older than a day before `since`. Cheap enough for
// the dashboard's 30s refresh, unlike loading the full list.
export async function loadContactsSince(url, since) {
  const sinceMs = since.startOf("day").valueOf();
  const stopMs = since.startOf("day").subtract(1, "day").valueOf();
  let rows = [];
  for (let pageNo = 1; pageNo <= MAX_SINCE_PAGES; pageNo++) {
    const page = await fetchContactPage(url, pageNo, SINCE_BATCH_SIZE);
    rows = rows.concat(page.rows);
    const last = page.rows[page.rows.length - 1];
    if (page.rows.length < SINCE_BATCH_SIZE || !last || last._time < stopMs) break;
  }
  return dedupe(rows).filter((r) => r._time >= sinceMs);
}
