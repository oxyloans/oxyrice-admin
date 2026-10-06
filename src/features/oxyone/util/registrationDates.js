import dayjs from "dayjs";

/* ── Registration date helpers ─────────────────────────────────
   Every registration API returns server timestamps in UTC. Some carry an
   explicit offset ("2026-10-06T05:37:52.658+0000"), most don't
   ("2026-10-06T07:44:50.666501", "2025-11-21 16:23:35.599"). Slicing the
   raw string or letting dayjs read it as local time puts anyone who signs
   up between 00:00 and 05:30 IST on the wrong day, so the cards, filters
   and the dashboard disagree. Parse everything as UTC and bucket by the
   viewer's local day instead.
   "DD/MM/YYYY" (OxyBricks) is already a calendar date and is kept as-is. ── */

const ISO_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;
const DMY_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export function parseRegDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date || typeof value === "number") {
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }
  const s = String(value).trim();

  let m = DMY_RE.exec(s);
  if (m) {
    const d = dayjs(new Date(+m[3], +m[2] - 1, +m[1]));
    return d.isValid() ? d : null;
  }

  m = ISO_RE.exec(s);
  if (m) {
    const [, y, mo, d, h, mi, sec, frac, tz] = m;
    // Date only — a calendar date, not an instant.
    if (h === undefined) return dayjs(new Date(+y, +mo - 1, +d));
    const ms = frac ? Math.round(Number(`0.${frac}`) * 1000) : 0;
    let t = Date.UTC(+y, +mo - 1, +d, +h, +mi, +(sec || 0), ms);
    if (tz && tz.toUpperCase() !== "Z") {
      const sign = tz[0] === "-" ? -1 : 1;
      const digits = tz.slice(1).replace(":", "");
      t -= sign * (+digits.slice(0, 2) * 60 + +digits.slice(2, 4)) * 60_000;
    }
    return dayjs(t);
  }

  const d = dayjs(s);
  return d.isValid() ? d : null;
}

// Local "YYYY-MM-DD" for a raw API date, "" when missing/invalid.
export const regDayKey = (value) => parseRegDate(value)?.format("YYYY-MM-DD") ?? "";

// Epoch ms for sorting newest first; missing dates sink to the bottom.
export const regTime = (value) => parseRegDate(value)?.valueOf() ?? 0;

// { date: "YYYY-MM-DD", time: "HH:mm" } in local time, or null.
export function formatRegDate(value) {
  const d = parseRegDate(value);
  return d ? { date: d.format("YYYY-MM-DD"), time: d.format("HH:mm") } : null;
}

/* ── Quick ranges used by every Today/Yesterday/Week/Month card ──
   week = last 7 days including today, month = month to date.        ── */
export const QUICK_RANGE_IDS = ["today", "yesterday", "week", "month"];

export function quickRange(id, now = dayjs()) {
  const today = now.startOf("day");
  switch (id) {
    case "today":
      return [today, today];
    case "yesterday": {
      const y = today.subtract(1, "day");
      return [y, y];
    }
    case "week":
      return [today.subtract(6, "day"), today];
    case "month":
      return [today.startOf("month"), today];
    default:
      return null;
  }
}

// Same as quickRange but as ["YYYY-MM-DD", "YYYY-MM-DD"] day keys.
export function quickRangeKeys(id, now = dayjs()) {
  const r = quickRange(id, now);
  return r ? [r[0].format("YYYY-MM-DD"), r[1].format("YYYY-MM-DD")] : null;
}

export const inDayRange = (dayKey, fromKey, toKey) =>
  !!dayKey && dayKey >= fromKey && dayKey <= toKey;

// { today, yesterday, week, month } counts. `getDayKey(row)` returns the
// row's local "YYYY-MM-DD" (see regDayKey).
export function countQuickRanges(rows, getDayKey, now = dayjs()) {
  const ranges = QUICK_RANGE_IDS.map((id) => [id, quickRangeKeys(id, now)]);
  const counts = { today: 0, yesterday: 0, week: 0, month: 0 };
  for (const row of rows) {
    const key = getDayKey(row);
    if (!key) continue;
    for (const [id, [f, t]] of ranges) if (key >= f && key <= t) counts[id]++;
  }
  return counts;
}
