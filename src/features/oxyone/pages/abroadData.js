import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS } from "./config.jsx";
import {
  readSessionCache,
  writeSessionCache,
  fetchSectionRows,
} from "./sectionData.js";

// Shared by the Abroad Dashboard and Consultancies pages. Both read the same
// API as the "Abroad Student Data" table (borrower-fd-created-stats) and share
// its session cache, so all three pages always agree on the numbers.

const SOURCE_KEY = "abroadStudentDashboard";
const UNKNOWN = "Not specified";
const DIRECT_KEY = "direct";

const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const isBlank = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return !s || ["-", "--", "n/a", "na", "null"].includes(s);
};

// Display spelling: collapse spaces, drop an unmatched ")" ("GLOBAL OPPORTUNITIES)").
const tidy = (v) => {
  const s = String(v).trim().replace(/\s+/g, " ");
  return s.includes("(") ? s : s.replace(/\)+$/, "").trim();
};

/* ── Name normalization ──────────────────────────────────────
   The API's consultancy/country fields are free text typed per record, so one
   consultancy shows up as "BIG LEAP", "Bigleap", "big leap consultancy", "bi
   leap"… Counting raw strings inflated "Total Consultancies" (~190 buckets for
   far fewer real firms). Each value is reduced to a comparison key, then keys
   that are only a typo apart are merged. */

// Filler words that don't identify a consultancy.
const CONSULTANCY_FILLER =
  /\b(consultanc(?:y|ies|e)|consultants?|overseas|pvt|private|ltd|limited|educational|education|edu|services?)\b/g;

function consultancyKey(value) {
  const base = String(value)
    .toLowerCase()
    .replace(/,.*$/, "") // "Uniabroad Overseas Consultancy, Trissur" → drop city
    .replace(/[^a-z0-9 ]/g, " ");
  const stripped = base.replace(CONSULTANCY_FILLER, " ");
  // Keep the filler if it was the whole name (e.g. just "Overseas").
  return (stripped.trim() ? stripped : base).replace(/\s+/g, "");
}

/* The university field also holds visa types ("VISIT", "Visting", "Work Visa",
   "DEPENDENT") and stray country names ("US", "UK", "India"). Those are not
   universities: visa types get their own bucket, country names/junk count as
   "Not specified". Everything else is a university, even without the word
   ("TEESSIDE", "CARDIFF"), and "University of East London" / "East London
   University" / "University Of Eastlondon" share one key. */
const VISA_KEY = "__visa";
const VISA_VALUES =
  /^(visi?t\w{0,4}|visist|visa|visitvisa|workvisa|work|depend\w*|depand\w*)$/;
const NOT_A_UNIVERSITY = new Set(["malta", "mauritius", "canada", "poland", "germany", "unitedking", "uniteadking"]);

function universityKey(value) {
  const words = String(value)
    .toLowerCase()
    .replace(/[^a-z ]/g, " "); // drops digits/punctuation ("MANCHESTER UNIVUSIETY8,00,000")
  const compact = words.replace(/\s+/g, "");
  if (VISA_VALUES.test(compact)) return VISA_KEY;
  if (COUNTRY_ALIASES[compact] || NOT_A_UNIVERSITY.has(compact)) return "";
  const key = words
    .replace(/\buniv\w*|\bof\b|\bthe\b|\bat\b/g, " ") // "university" and its misspellings
    .replace(/\s+/g, "");
  return key.length >= 3 ? key : ""; // "S", "OO", "UNIVERSUTY OF" → not specified
}

// Common spellings/abbreviations → one country name.
// First-name → canonical display name for lead persons.
const LEAD_PERSON_ALIASES = {
  arun: "Arun",
  arjun: "Arjun",
  sreejith: "Sreejith",
  sreekanth: "Sreekanth",
  anoop: "Anoop",
  anu: "Anu",
  riya: "Riya",
};

// Full-name patterns that must be matched before the first-token fallback.
const LEAD_PERSON_FULL = [
  [/(?:^|\buma\s*)a?mahes(?:h?war?|h)(?:\s*rao)?(?:\s|$)/i, "Uma Maheshwar"],
];

function leadPersonKey(value) {
  const clean = String(value)
    .toLowerCase()
    .replace(/\b(sir|madam|mr|ms|mrs|dr)\.?\b/g, "")
    .replace(/[^a-z ]/g, " ")
    .trim();
  for (const [re, canonical] of LEAD_PERSON_FULL) {
    if (re.test(clean)) return canonical;
  }
  const first = clean.split(/\s+/)[0];
  return LEAD_PERSON_ALIASES[first] ?? clean.replace(/\s+/g, " ");
}

const COUNTRY_ALIASES = {
  uk: "United Kingdom", unitedkingdom: "United Kingdom", england: "United Kingdom",
  wales: "United Kingdom", scotland: "United Kingdom", britain: "United Kingdom",
  us: "USA", usa: "USA", usd: "USA", unitedstates: "USA", america: "USA",
  aus: "Australia", australia: "Australia", astreliya: "Australia",
  in: "India", india: "India",
  frans: "France", france: "France",
  irland: "Ireland", ireland: "Ireland",
  netherland: "Netherlands", netherlands: "Netherlands", nethorland: "Netherlands", holland: "Netherlands",
  luthiania: "Lithuania", lithuania: "Lithuania",
  newzealand: "New Zealand", nz: "New Zealand",
  erope: "Europe", europe: "Europe",
  dubai: "UAE", uae: "UAE",
};

const countryKey = (value) => String(value).toLowerCase().replace(/[^a-z]/g, "");

// Optimal-string-alignment distance (Levenshtein + adjacent swaps).
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Short keys ("iaec" vs "iace", "avc" vs "avas") are too ambiguous to fuzzy-match.
function isTypoOf(a, b) {
  const shorter = Math.min(a.length, b.length);
  if (shorter < 6 || Math.abs(a.length - b.length) > 2) return false;
  return editDistance(a, b) <= (shorter >= 10 ? 2 : 1);
}

// Maps each distinct key to a representative key, merging typo-level variants.
// Keys are visited most-used first so the common spelling becomes the anchor.
function mergeTypos(keyCounts, frozen = new Set()) {
  const anchors = [];
  const rep = new Map();
  for (const [key] of [...keyCounts].sort((a, b) => b[1] - a[1])) {
    const anchor = frozen.has(key) ? null : anchors.find((a) => isTypoOf(a, key));
    if (anchor) rep.set(key, anchor);
    else {
      rep.set(key, key);
      if (!frozen.has(key)) anchors.push(key);
    }
  }
  return rep;
}

function buildKeyer(rows, field) {
  const isCountry = field === "country";
  const isLeadBy = field === "leadBy";
  const rawKey = (v) => {
    if (isBlank(v)) return "";
    if (isLeadBy) return leadPersonKey(v);
    if (isCountry) {
      const k = countryKey(v);
      if (!k || /^\d+$/.test(k)) return "";
      return COUNTRY_ALIASES[k] ? countryKey(COUNTRY_ALIASES[k]) : k;
    }
    return field === "university" ? universityKey(v) : consultancyKey(v);
  };

  const counts = new Map();
  for (const r of rows) {
    const k = rawKey(r[field]);
    if (k) counts.set(k, (counts.get(k) || 0) + 1);
  }
  // Merge typo-level variants ("ZUBEDHA" → "ZUBEIDHA", "CADRIFF" → "Cardiff").
  // The Direct / visa buckets are fixed and never absorb other names.
  const rep = mergeTypos(counts, new Set([DIRECT_KEY, VISA_KEY]));
  return (v) => {
    const k = rawKey(v);
    return k ? rep.get(k) ?? k : "";
  };
}

// Groups rows by `field` ("consultancy" or "country"), most leads first.
// Each group: { key, name, isNamed, leads, amount, fdAmount, countries, rows, variants }.
// `isNamed` is false for the "Not specified" and "Direct" buckets, which are
// not real consultancies/countries and are left out of the totals.
export function groupRows(rows, field) {
  const keyOf = buildKeyer(rows, field);
  const countryOf = field === "country" ? null : buildKeyer(rows, "country");
  const map = new Map();
  for (const r of rows) {
    const key = keyOf(r[field]);
    let g = map.get(key);
    if (!g) {
      g = { key, leads: 0, amount: 0, fdAmount: 0, countries: new Set(), rows: [], spellings: new Map() };
      map.set(key, g);
    }
    g.leads += 1;
    g.amount += toNumber(r.amount);
    g.fdAmount += toNumber(r.fdAmount);
    if (countryOf) {
      const c = countryOf(r.country);
      if (c) g.countries.add(c);
    }
    if (key) {
      const s = tidy(r[field]);
      g.spellings.set(s, (g.spellings.get(s) || 0) + 1);
    }
    g.rows.push(r);
  }

  const aliasName = (key) =>
    Object.values(COUNTRY_ALIASES).find((n) => countryKey(n) === key);

  return [...map.values()]
    .map(({ spellings, ...g }) => {
      const variants = [...spellings].sort((a, b) => b[1] - a[1]).map(([s]) => s);
      const isDirect = field === "consultancy" && g.key === DIRECT_KEY;
      const isVisa = field === "university" && g.key === VISA_KEY;
      const name = !g.key
        ? UNKNOWN
        : isDirect
          ? "Direct"
          : isVisa
            ? "Visa (visit / work / dependent)"
            : (field === "country" && aliasName(g.key)) || variants[0];
      const isNamed = !!g.key && !isDirect && !isVisa;
      return {
        ...g,
        isNamed,
        isVisa,
        isUniversity: field === "university" ? isNamed : undefined,
        name,
        variants,
      };
    })
    // Real names first (most leads first), then the Direct / visa / Not specified buckets.
    .sort((a, b) => b.isNamed - a.isNamed || b.leads - a.leads || a.name.localeCompare(b.name));
}

export function formatRupees(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// Rows from the abroad student API: cached snapshot first, then a live fetch.
export function useAbroadRows() {
  const cfg = SECTIONS[SOURCE_KEY];
  const storageKey = `${cfg.title}:default`; // same key SectionPage uses
  const [rows, setRows] = useState(() => readSessionCache(storageKey)?.rows ?? []);
  const [loading, setLoading] = useState(() => !readSessionCache(storageKey));
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const { rows: fresh, total } = await fetchSectionRows(cfg);
      if (requestIdRef.current !== requestId) return;
      writeSessionCache(storageKey, fresh, total);
      setRows(fresh);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setError("Failed to load abroad student data. Please try again.");
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error, reload: load };
}
