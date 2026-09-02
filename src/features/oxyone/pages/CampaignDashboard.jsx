import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseOutlined } from "@ant-design/icons";
import { SECTIONS } from "./config.jsx";
import { readSessionCache, writeSessionCache, fetchSectionRows } from "./sectionData.js";

// One entry per Campaign Data dataset — mirrors the "Campaign Data" group in
// config.jsx's NAV_SECTIONS (minus this dashboard itself).
const CAMPAIGN_KEYS = [
  "rotaryData",
  "cbsData",
  "advocatesData",
  "ftcciData",
  "mumbaiData",
  "kukatpallyData",
  "sudheerVakkalagaddaData",
  "talwarData",
  "ramMohanDarisaData",
];

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function CampaignCard({ item, i, navigate, count, loading }) {
  const cfg = SECTIONS[item];
  const color = cfg.color;
  return (
    <div
      onClick={() => navigate(`/oxyone/${item}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/oxyone/${item}`);
        }
      }}
      role="button"
      tabIndex={0}
      className="group h-[120px] rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        animationDelay: `${i * 50}ms`,
        animation: "fadeUp .5s ease both",
        background: "#ffffff",
        border: `1.5px solid ${color}40`,
        boxShadow: `0 2px 8px ${color}15`,
      }}
    >
      <div
        className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-125"
        style={{ background: `${color}0d` }}
      />
      <div className="relative z-10 h-full flex items-center gap-3 px-4">
        <div
          className="w-11 h-11 rounded-xl grid place-items-center text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}12`, color }}
        >
          {cfg.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">{cfg.title}</div>
          {loading ? (
            <div className="h-7 w-16 rounded-md bg-slate-200 animate-pulse mt-1" />
          ) : (
            <div className="text-2xl font-extrabold mt-1 leading-none" style={{ color }}>
              {count == null ? "—" : formatCount(count)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(CAMPAIGN_KEYS.map((k) => [k, true])),
  );

  const loadCounts = () => {
    CAMPAIGN_KEYS.forEach((key) => {
      const cfg = SECTIONS[key];
      const storageKey = `${cfg.title}:default`;

      const cached = readSessionCache(storageKey);
      if (cached) {
        setCounts((c) => ({ ...c, [key]: cached.total ?? cached.rows.length }));
        setLoading((l) => ({ ...l, [key]: false }));
      }

      fetchSectionRows(cfg)
        .then(({ rows, total }) => {
          writeSessionCache(storageKey, rows, total);
          setCounts((c) => ({ ...c, [key]: total }));
        })
        .catch(() => {
          setCounts((c) => (c[key] != null ? c : { ...c, [key]: null }));
        })
        .finally(() => {
          setLoading((l) => ({ ...l, [key]: false }));
        });
    });
  };

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

  const grandTotal = useMemo(() => {
    const vals = CAMPAIGN_KEYS.map((k) => counts[k]).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + Number(b), 0) : null;
  }, [counts]);

  const allLoading = CAMPAIGN_KEYS.some((k) => loading[k]);

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>
      {/* ── Grand Total Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg,#fff7ed 0%,#fef3c7 50%,#f0fdf4 100%)",
          border: "1px solid #fde68a",
          boxShadow: "0 2px 12px #d9770610",
        }}
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "#d9770608" }} />
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "#05966908" }} />

        <div className="relative z-10 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#d97706,#b45309)", color: "#fff", boxShadow: "0 4px 12px #d9770630" }}
          >
            <DatabaseOutlined />
          </div>
          <div>
            <div className="text-slate-800 font-black text-[16px] mt-0.5 leading-tight">Total Campaign Records</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Live count across all campaign datasets</div>
          </div>
        </div>

        <div className="relative z-10 text-right flex-shrink-0">
          {allLoading && grandTotal == null ? (
            <div className="h-10 w-28 rounded-xl animate-pulse bg-slate-200" />
          ) : (
            <>
              <div className="text-4xl font-black leading-none" style={{ color: "#d97706" }}>
                {grandTotal == null ? "—" : grandTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">total records</div>
            </>
          )}
        </div>
      </div>

      {/* ── Per-dataset cards ── */}
      <div className="text-[15px] font-black text-slate-900 mt-1 mb-0">
        Campaign Datasets
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {CAMPAIGN_KEYS.map((key, i) => (
          <CampaignCard
            key={key}
            item={key}
            i={i}
            navigate={navigate}
            count={counts[key]}
            loading={!!loading[key]}
          />
        ))}
      </div>
    </div>
  );
}
