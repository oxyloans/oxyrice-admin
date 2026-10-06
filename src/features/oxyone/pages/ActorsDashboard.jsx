import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SECTIONS } from "./config.jsx";
import { ACTOR_SOURCES, actorRowDate } from "./actorsData";

function formatCount(n) {
  return Number(n).toLocaleString();
}

// Same card style as QueriesDashboard's ProductCard.
function ActorCard({ item, i, navigate, count, loading, label, color }) {
  const cfg = SECTIONS[item.key];
  const go = () => navigate(`/oxyone/${item.key}`);
  const notWired = !item.fetchRows;
  return (
    <div
      onClick={go}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }}
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
          <div className="text-[10px] font-bold mt-0.5" style={{ color }}>
            {notWired ? "API pending" : label}
          </div>
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

function countsFor(rows) {
  const today = dayjs().format("YYYY-MM-DD");
  const todayCount = rows.filter((r) => actorRowDate(r) === today).length;
  return { total: rows.length, today: todayCount };
}

const SECTIONS_TO_SHOW = [
  { id: "total", title: "Total Active Actors", label: "Total" },
  { id: "today", title: "Today's New Actors", label: "Today" },
];

export default function ActorsDashboard() {
  const navigate = useNavigate();
  // counts[key] = { total, today } | null (failed / not wired)
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(ACTOR_SOURCES.map((s) => [s.key, !!s.fetchRows])),
  );

  useEffect(() => {
    const load = () => {
      ACTOR_SOURCES.forEach(({ key, fetchRows }) => {
        if (!fetchRows) return;
        fetchRows()
          .then((rows) => setCounts((c) => ({ ...c, [key]: countsFor(Array.isArray(rows) ? rows : []) })))
          .catch(() => setCounts((c) => ({ ...c, [key]: c[key] ?? null })))
          .finally(() => setLoading((l) => ({ ...l, [key]: false })));
      });
    };
    load();
    // Auto-refresh every 30 seconds, same as the Queries dashboard
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>
      {SECTIONS_TO_SHOW.map((sec, si) => (
        <div key={sec.id} className={si > 0 ? "mt-4" : ""}>
          <div className="text-[15px] font-black text-slate-900 mb-2">{sec.title}</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            {ACTOR_SOURCES.map((item, i) => (
              <ActorCard
                key={`${sec.id}-${item.key}`}
                item={item}
                i={i}
                navigate={navigate}
                count={counts[item.key]?.[sec.id]}
                loading={!!loading[item.key]}
                label={sec.label}
                color={item.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
