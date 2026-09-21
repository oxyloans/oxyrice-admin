import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SECTIONS } from "./config.jsx";
import { PRODUCT_COUNTS } from "../util/productCounts.js";
import { fetchSectionRows } from "./sectionData.js";
import { JOURNEY_CATEGORIES, classifyJourney, inTimeBucket } from "./journeyCategories";
import adminApi from "../../../core/config/axiosInstance";
import { UsergroupAddOutlined } from "@ant-design/icons";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const FETCHERS = Object.fromEntries(PRODUCT_COUNTS.map((p) => [p.key, p.fetchCount]));
const TODAY_FETCHERS = Object.fromEntries(
  PRODUCT_COUNTS.filter((p) => p.fetchTodayCount).map((p) => [p.key, p.fetchTodayCount])
);

const PRODUCT_CARDS = [
  { key: "lender",         color: "#0284c7" },
  { key: "borrower",       color: "#9333ea" },
  { key: "askoxy",         color: "#0891b2" },
  { key: "oxybricks",      color: "#059669" },
  { key: "oxygold",        color: "#ea580c" },
  { key: "partnerlender",  color: "#059669" },
  { key: "interested",     color: "#e11d48" },
];

// All product cards roll up into the registered-users totals below.
const TOTAL_CARDS = PRODUCT_CARDS;

// Shorter names for these dashboard cards only — SECTIONS[key].title still
// carries the full "OxyLoans Lender"/"OxyLoans Borrower" name used for the
// page header and sidebar elsewhere.
const CARD_TITLE_OVERRIDES = {
  lender: "Lender",
  borrower: "Borrower",
};

const CAMPAIGN_KEYS = [
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
];

function formatCount(n) {
  return Number(n).toLocaleString();
}

function SummaryCard({ icon, title, subtitle, value, unit, loading, accent, gradient, bg, border }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-3.5 min-w-0"
      style={{ background: bg, border: `2px solid ${border}`, boxShadow: `0 2px 10px ${accent}12` }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg grid place-items-center text-sm flex-shrink-0"
          style={{ background: gradient, color: "#fff", boxShadow: `0 3px 8px ${accent}30` }}
        >
          {icon}
        </div>
        <div className="text-[12.5px] font-black text-slate-800 leading-tight truncate">{title}</div>
      </div>
      {loading && value == null ? (
        <div className="h-8 w-24 rounded-lg animate-pulse bg-white/60" />
      ) : (
        <div className="text-2xl font-black leading-none" style={{ color: accent }}>
          {value == null ? "—" : value.toLocaleString()}
        </div>
      )}
      <div className="text-[10px] text-slate-400 font-semibold mt-1">{unit}</div>
      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{subtitle}</div>
    </div>
  );
}

function ProductCard({ item, i, navigate, count, loading, label, icon, title, path, wrap }) {
  const cfg = SECTIONS[item.key];
  const color = item.color;
  const cardIcon = icon ?? cfg.icon;
  const cardTitle = title ?? (CARD_TITLE_OVERRIDES[item.key] ?? cfg.title);
  const dest = `/oxyone/${path ?? item.key}`;
  return (
    <div
      onClick={() => navigate(dest)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(dest); } }}
      role="button"
      tabIndex={0}
      className={`group ${wrap ? "h-[150px]" : "h-[100px]"} rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2`}
      style={{ animationDelay: `${i * 50}ms`, animation: "fadeUp .5s ease both", background: "#ffffff", border: `2px solid ${color}65`, boxShadow: `0 2px 8px ${color}15` }}
    >
      <div className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-125" style={{ background: `${color}0d` }} />
      <div className={`relative z-10 flex items-center gap-2.5 px-3 h-full ${wrap ? "py-3" : ""}`}>
        <div className="w-9 h-9 rounded-lg grid place-items-center text-base flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: `${color}12`, color }}>
          {cardIcon}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-medium text-slate-800 ${wrap ? "leading-snug" : "truncate"}`}>{cardTitle}</div>
          {label && <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{label}</div>}
          {loading ? (
            <div className="h-7 w-16 bg-white/60 animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-extrabold mt-1 leading-none" style={{ color }}>
              {count == null ? "—" : formatCount(count)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function DashboardHome() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [todayCounts, setTodayCounts] = useState({});
  const [campaignCounts, setCampaignCounts] = useState({});
  const [campaignLoading, setCampaignLoading] = useState(() =>
    Object.fromEntries(CAMPAIGN_KEYS.map((key) => [key, true]))
  );
  const campaignTotal = useMemo(() => {
    const values = CAMPAIGN_KEYS.map((key) => campaignCounts[key]).filter((value) => value != null);
    return values.length === CAMPAIGN_KEYS.length
      ? values.reduce((total, value) => total + Number(value), 0)
      : null;
  }, [campaignCounts]);
  const campaignLoadingState = CAMPAIGN_KEYS.some((key) => campaignLoading[key]);
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(PRODUCT_CARDS.map((c) => [c.key, !!FETCHERS[c.key]]))
  );
  const [todayLoading, setTodayLoading] = useState(() =>
    Object.fromEntries(PRODUCT_CARDS.map((c) => [c.key, !!TODAY_FETCHERS[c.key]]))
  );

  const loadProductCounts = () => {
    PRODUCT_CARDS.forEach(({ key }) => {
      const fn = FETCHERS[key];
      if (fn) {
        fn()
          .then((v) => setCounts((c) => ({ ...c, [key]: v })))
          .catch(() => setCounts((c) => ({ ...c, [key]: c[key] ?? null })))
          .finally(() => setLoading((l) => ({ ...l, [key]: false })));
      }
      const tf = TODAY_FETCHERS[key];
      if (tf) {
        tf()
          .then((v) => setTodayCounts((c) => ({ ...c, [key]: v })))
          .catch(() => setTodayCounts((c) => ({ ...c, [key]: c[key] ?? null })))
          .finally(() => setTodayLoading((l) => ({ ...l, [key]: false })));
      }
    });
  };

  useEffect(() => {
    loadProductCounts();
    const id = setInterval(loadProductCounts, 30_000);
    return () => clearInterval(id);
  }, []);

  const loadCampaignCounts = () => {
    CAMPAIGN_KEYS.forEach((key) => {
      fetchSectionRows(SECTIONS[key])
        .then(({ total, rows }) => {
          setCampaignCounts((current) => ({
            ...current,
            [key]: total ?? rows.length,
          }));
        })
        .catch(() => {
          setCampaignCounts((current) => ({
            ...current,
            [key]: null,
          }));
        })
        .finally(() => {
          setCampaignLoading((current) => ({ ...current, [key]: false }));
        });
    });
  };

  useEffect(() => {
    loadCampaignCounts();
    const id = setInterval(loadCampaignCounts, 30_000);
    return () => clearInterval(id);
  }, []);

  const [journeyAll, setJourneyAll] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(true);

  const loadJourneyData = () => {
    adminApi
      .get("/marketing-service/campgin/getAllInterestedUsres")
      .then((res) => setJourneyAll(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setJourneyLoading(false));
  };

  useEffect(() => {
    loadJourneyData();
    const id = setInterval(loadJourneyData, 30_000);
    return () => clearInterval(id);
  }, []);

  const journeyCards = JOURNEY_CATEGORIES.map((cat) => {
    const rows = journeyAll.filter((r) => classifyJourney(r) === cat.key);
    return {
      ...cat,
      total: rows.length,
      today: rows.filter((r) => inTimeBucket(r, "today")).length,
    };
  });

  const chartData = PRODUCT_CARDS.map(({ key, color }) => ({
    key,
    name: SECTIONS[key].title.replace("OxyLoans ", ""),
    users: Number(counts[key]) || 0,
    color,
  }));

  // Grand total — sums all resolved counts, updates live as each platform resolves
  const grandTotal = useMemo(() => {
    const vals = TOTAL_CARDS.map(({ key }) => counts[key]).filter((v) => v != null);
    return vals.length === TOTAL_CARDS.length
      ? vals.reduce((a, b) => a + b, 0)
      : null;
  }, [counts]);

  const allLoading = TOTAL_CARDS.some(({ key }) => loading[key]);
  const totalUser = grandTotal != null && campaignTotal != null
    ? grandTotal + campaignTotal
    : null;
  const totalUserLoading = allLoading || campaignLoadingState;

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>

      {/* ── Summary cards: total user / registered / campaign ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={<UsergroupAddOutlined />}
          title="Total User"
          value={totalUser}
          loading={totalUserLoading}
          accent="#059669"
          gradient="linear-gradient(135deg,#059669,#047857)"
          bg="linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)"
          border="#a7f3d0"
        />
        <SummaryCard
          icon={<UsergroupAddOutlined />}
          title="Total Registered Users"

          value={grandTotal}
          loading={allLoading}
          accent="#0891b2"
          gradient="linear-gradient(135deg,#0891b2,#0e7490)"
          bg="linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)"
          border="#bae6fd"
        />
        <SummaryCard
          icon={<UsergroupAddOutlined />}
          title="Total Campaign Records"
          value={campaignTotal}
          loading={campaignLoadingState}
          accent="#d97706"
          gradient="linear-gradient(135deg,#d97706,#b45309)"
          bg="linear-gradient(135deg,#fff7ed 0%,#fef3c7 100%)"
          border="#fde68a"
        />
      </div>

      {/* ── Today's registrations ── */}
      <div>
        <div className="text-[15px] font-black text-slate-900 mb-2">
          Today's Registrations
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {PRODUCT_CARDS.map((item, i) => (
            <ProductCard
              key={`today-${item.key}`}
              item={item}
              i={i}
              navigate={navigate}
              count={todayCounts[item.key]}
              loading={!!todayLoading[item.key]}
              label="Today"
            />
          ))}
        </div>
      </div>

      {/* ── Interested Users ── */}
      <div>
        <div className="text-[15px] font-black text-slate-900 mb-2">
          Today's Interested Users
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {journeyCards.map((card, i) => (
            <ProductCard
              key={`journey-${card.key}`}
              item={card}
              i={i}
              navigate={navigate}
              count={card.today}
              loading={journeyLoading}
              label="Today"
              icon={card.icon}
              title={card.label}
              path={`journeyScorecard/${card.key}`}
              wrap
            />
          ))}
        </div>
      </div>

      {/* ── Total user cards ── */}
      <div>
        <div className="text-[15px] font-black text-slate-900 mb-2">
          Users Across All OXYONE products.
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {PRODUCT_CARDS.map((item, i) => (
            <ProductCard
              key={item.key}
              item={item}
              i={i}
              navigate={navigate}
              count={counts[item.key]}
              loading={!!loading[item.key]}
            />
          ))}
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-w-0">
        <div className="mb-4">
          <div className="text-sm font-bold text-slate-900">Product User Analytics</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Registered users across the OXYONE</div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false}
                label={{ value: "Products", position: "insideBottom", offset: -3, fontSize: 11, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false}
                label={{ value: "Users", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }} />
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Users"]} />
              <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                {chartData.map((item) => <Cell key={item.key} fill={item.color} />)}
                <LabelList dataKey="users" position="top"
                  formatter={(v) => v ? Number(v).toLocaleString() : ""}
                  style={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
