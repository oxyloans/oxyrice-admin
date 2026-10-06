import {
  StarOutlined,
  RiseOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PercentageOutlined,
  WalletOutlined,
  TeamOutlined,
  AuditOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { inDayRange, quickRangeKeys, regDayKey, regTime } from "../util/registrationDates";

/* ── Journey/registration categories shared by the overview and detail
   pages. Matched against askOxyOfers + journeyName + projectType, so
   classification keeps working even if a record only fills one field. ── */
const normalizeText = (s) =>
  (s || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

export const JOURNEY_CATEGORIES = [
  {
    key: "assuredLending",
    label: "Oxy Partner Assured Lending vs Oxy Nearby Verified Lending",
    color: "#0284c7",
    icon: <PercentageOutlined />,
    match: "OXY PARTNER ASSURED LENDING VS OXY NEARBY VERIFIED LENDING",
    keywords: ["ASSURED LENDING", "NEARBY VERIFIED LENDING"],
  },
  {
    key: "oxyBorrower",
    label: "Join as an Oxy Borrower",
    color: "#9333ea",
    icon: <WalletOutlined />,
    match: "JOIN AS AN OXY BORROWER",
    keywords: ["OXY BORROWER"],
  },
  {
    key: "recoveryAgent",
    label: "Recovery Agent / Partner Journey",
    color: "#059669",
    icon: <TeamOutlined />,
    match: "START YOUR RECOVERY AGENT PARTNER JOURNEY",
    keywords: ["RECOVERY AGENT"],
  },
  {
    key: "legalPartner",
    label: "Legal Partner / Advocate Journey",
    color: "#d97706",
    icon: <AuditOutlined />,
    match: "START YOUR LEGAL PARTNER ADVOCATE JOURNEY",
    keywords: ["LEGAL PARTNER", "ADVOCATE JOURNEY"],
  },
  {
    key: "financialPartner",
    label: "Financial Partner / NBFC / Bank Journey",
    color: "#e11d48",
    icon: <BankOutlined />,
    match: "START YOUR FINANCIAL PARTNER NBFC BANK JOURNEY",
    keywords: ["FINANCIAL PARTNER", "NBFC"],
  },
];

export function classifyJourney(record) {
  const haystack = normalizeText(
    [record.askOxyOfers, record.journeyName, record.projectType].join(" "),
  );
  const exact = JOURNEY_CATEGORIES.find((c) => haystack === c.match);
  if (exact) return exact.key;
  const byKeyword = JOURNEY_CATEGORIES.find((c) =>
    c.keywords.some((kw) => haystack.includes(kw)),
  );
  return byKeyword?.key ?? null;
}

/* ── Time stat card meta — same shape as InterestedPage's STAT_META ── */
export const STAT_META = {
  total: {
    label: "All Time",
    accent: "#e11d48",
    sub: "All matching records",
    icon: <StarOutlined />,
  },
  today: {
    label: "Today",
    accent: "#0891b2",
    sub: "New today",
    icon: <RiseOutlined />,
  },
  yesterday: {
    label: "Yesterday",
    accent: "#7c3aed",
    sub: "Previous day",
    icon: <HistoryOutlined />,
  },
  week: {
    label: "This Week",
    accent: "#059669",
    sub: "Last 7 days",
    icon: <BarChartOutlined />,
  },
  month: {
    label: "This Month",
    accent: "#d97706",
    sub: "Month to date",
    icon: <LineChartOutlined />,
  },
};

// Interested-users API rows with the local registration day (`_day`) and
// time (`_time`) precomputed from the UTC `createdAt`, newest first.
export function withRegDay(data) {
  const rows = (Array.isArray(data) ? data : []).map((r) => ({
    ...r,
    _day: regDayKey(r.createdAt),
    _time: regTime(r.createdAt),
  }));
  rows.sort((a, b) => b._time - a._time);
  return rows;
}

// Same buckets as every other registration card: today, yesterday,
// last 7 days, month to date — on the viewer's local day.
export function inTimeBucket(record, bucket) {
  if (bucket === "total") return true;
  const day = record._day ?? regDayKey(record.createdAt);
  const range = quickRangeKeys(bucket);
  return range ? inDayRange(day, range[0], range[1]) : true;
}

/* ── Custom table styling — matches InterestedPage ───────── */
export const TABLE_COMPONENTS = {
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
        }}
      />
    ),
  },
};
