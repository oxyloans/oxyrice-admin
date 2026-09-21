import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../core/config/axiosInstance";
import { Button } from "antd";
import { ReloadOutlined, RightOutlined } from "@ant-design/icons";
import { JOURNEY_CATEGORIES, classifyJourney, inTimeBucket } from "./journeyCategories";

/* ── Page skeleton while first load ─────────────────────── */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="h-6 w-40 rounded bg-slate-100 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[150px] rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function JourneyScorecardPage() {
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.get(
        "/marketing-service/campgin/getAllInterestedUsres",
      );
      setAll(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cards = JOURNEY_CATEGORIES.map((cat) => {
    const rows = all.filter((r) => classifyJourney(r) === cat.key);
    return {
      ...cat,
      total: rows.length,
      today: rows.filter((r) => inTimeBucket(r, "today")).length,
    };
  });

  if (initialLoad) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-3.5">
      {error ? (
        // ── Error state ──
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 py-14 px-6 text-sm text-red-500">
          <span className="text-3xl opacity-55">⚠️</span>
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="px-5 py-2 rounded-[9px] border border-slate-200 bg-white text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* ── Section header: eyebrow left | refresh right ── */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[1.2px]">
              Registration Journeys
            </span>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              size="small"
              loading={loading}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              Refresh
            </Button>
          </div>

          {/* ── Journey cards — click to open that journey's page ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.key}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/oxyone/journeyScorecard/${card.key}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/oxyone/journeyScorecard/${card.key}`);
                  }
                }}
                className="group relative overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none flex flex-col"
                style={{
                  borderRadius: 14,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                }}
              >
                <div className="h-[3px] w-full flex-shrink-0" style={{ background: card.color }} />
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg grid place-items-center text-[16px] flex-shrink-0"
                      style={{ background: `${card.color}15`, color: card.color }}
                    >
                      {card.icon}
                    </div>
                    <RightOutlined
                      className="mt-1.5 transition-transform duration-150 group-hover:translate-x-0.5"
                      style={{ fontSize: 11, color: "#cbd5e1" }}
                    />
                  </div>
                  <div className="text-[13px] font-bold leading-snug text-slate-800 mb-3 flex-1">
                    {card.label}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-2xl font-black leading-none"
                        style={{ color: card.color }}
                      >
                        {card.total.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        records
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${card.color}12`, color: card.color }}
                    >
                      {card.today.toLocaleString()} today
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
