import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SECTIONS } from "./config.jsx";
import { PRODUCT_COUNTS } from "../util/productCounts.js";
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
];

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function ProductCard({ item, i, navigate, count, loading, label }) {
  const cfg = SECTIONS[item.key];
  const color = item.color;
  return (
    <div
      onClick={() => navigate(`/oxyone/${item.key}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/oxyone/${item.key}`); } }}
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
          {label && <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{label}</div>}
          {loading ? (
            <div className="h-7 w-16 bg-white/60 animate-pulse mt-1" />
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

export default function DashboardHome() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [todayCounts, setTodayCounts] = useState({});
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(PRODUCT_CARDS.map((c) => [c.key, !!FETCHERS[c.key]]))
  );
  const [todayLoading, setTodayLoading] = useState(() =>
    Object.fromEntries(PRODUCT_CARDS.map((c) => [c.key, !!TODAY_FETCHERS[c.key]]))
  );

  useEffect(() => {
    let cancelled = false;
    PRODUCT_CARDS.forEach(({ key }) => {
      const fn = FETCHERS[key];
      if (fn) {
        fn()
          .then((v) => { if (!cancelled) setCounts((c) => ({ ...c, [key]: v })); })
          .catch(() => { if (!cancelled) setCounts((c) => ({ ...c, [key]: null })); })
          .finally(() => { if (!cancelled) setLoading((l) => ({ ...l, [key]: false })); });
      }
      const tf = TODAY_FETCHERS[key];
      if (tf) {
        tf()
          .then((v) => { if (!cancelled) setTodayCounts((c) => ({ ...c, [key]: v })); })
          .catch(() => { if (!cancelled) setTodayCounts((c) => ({ ...c, [key]: null })); })
          .finally(() => { if (!cancelled) setTodayLoading((l) => ({ ...l, [key]: false })); });
      }
    });
    return () => { cancelled = true; };
  }, []);

  const chartData = PRODUCT_CARDS.map(({ key, color }) => ({
    key,
    name: SECTIONS[key].title.replace("OxyLoans ", ""),
    users: Number(counts[key]) || 0,
    color,
  }));

  // Grand total — sums all resolved counts, updates live as each platform resolves
  const grandTotal = useMemo(() => {
    const vals = PRODUCT_CARDS.map(({ key }) => counts[key]).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  }, [counts]);

  const allLoading = PRODUCT_CARDS.some(({ key }) => loading[key]);

  // Auto-refresh every 30 seconds to stay dynamic
  useEffect(() => {
    const id = setInterval(() => {
      PRODUCT_CARDS.forEach(({ key }) => {
        const fn = FETCHERS[key];
        if (fn) fn().then((v) => setCounts((c) => ({ ...c, [key]: v ?? c[key] }))).catch(() => {});
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>

      {/* ── Grand Total Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%)",
          border: "1px solid #bae6fd",
          boxShadow: "0 2px 12px #0891b210",
        }}
      >
        {/* bg decoration */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: "#0891b208" }} />
        <div className="absolute right-20 bottom-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "#05966908" }} />

        <div className="relative z-10 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", color: "#fff", boxShadow: "0 4px 12px #0891b230" }}
          >
            <UsergroupAddOutlined />
          </div>
          <div>
            <div className="text-slate-800 font-black text-[16px] mt-0.5 leading-tight">Total Registered Users</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Live count across all OXYONE products</div>
          </div>
        </div>

        <div className="relative z-10 text-right flex-shrink-0">
          {allLoading && grandTotal == null ? (
            <div className="h-10 w-28 rounded-xl animate-pulse bg-slate-200" />
          ) : (
            <>
              <div className="text-4xl font-black leading-none" style={{ color: "#0891b2" }}>
                {grandTotal == null ? "—" : grandTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">registered users</div>
            </>
          )}
        </div>
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

      {/* ── Total user cards ── */}
      <div className="text-[15px] font-black text-slate-900 mt-4 mb-0">
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