import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SECTIONS } from "./config.jsx";

import { PRODUCT_COUNTS } from "../util/productCounts.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* Product cards shown on the dashboard.
   Cards without a live fetcher (lender, borrower, partner) have no real
   endpoint wired up yet. */
const FETCHERS = Object.fromEntries(
  PRODUCT_COUNTS.map((p) => [p.key, p.fetchCount]),
);
const PRODUCT_CARDS = [
  { key: "lender", color: "#0284c7" },
  { key: "borrower", color: "#9333ea" },
  { key: "askoxy", color: "#0891b2", fetchCount: FETCHERS.askoxy },
  { key: "oxybricks", color: "#059669", fetchCount: FETCHERS.oxybricks },
  { key: "oxygold", color: "#ea580c", fetchCount: FETCHERS.oxygold },
  { key: "partner", color: "#0d9488" },
];

function formatCount(n) {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function ProductCard({ item, i, navigate, count, loading }) {
  const cfg = SECTIONS[item.key];
  const color = item.color;
  return (
    <div
      onClick={() => navigate(`/oxyone/${item.key}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/oxyone/${item.key}`);
        }
      }}
      role="button"
      tabIndex={0}
      className="group h-[120px] rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        animationDelay: `${i * 50}ms`,
        animation: "fadeUp .5s ease both",
        background: `${color}12`,
        border: `1px solid ${color}35`,
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
          <div className="text-xs font-medium text-slate-500 truncate">
            {cfg.title}
          </div>
          {loading ? (
            <div className="h-7 w-16 bg-white/60 animate-pulse mt-1" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-950 mt-1 leading-none">
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
  const [loading, setLoading] = useState(() =>
    Object.fromEntries(
      PRODUCT_CARDS.filter((c) => c.fetchCount).map((c) => [c.key, true]),
    ),
  );

  useEffect(() => {
    let cancelled = false;
    PRODUCT_CARDS.filter((c) => c.fetchCount).forEach(({ key, fetchCount }) => {
      fetchCount()
        .then((value) => {
          if (!cancelled) setCounts((c) => ({ ...c, [key]: value }));
        })
        .catch(() => {
          if (!cancelled) setCounts((c) => ({ ...c, [key]: null }));
        })
        .finally(() => {
          if (!cancelled) setLoading((l) => ({ ...l, [key]: false }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = PRODUCT_CARDS.map(({ key, color }) => ({
    key,
    name: SECTIONS[key].title.replace("OxyLoans ", ""),
    users: Number(counts[key]) || 0,
    color,
  }));
  const pieData = chartData.filter((item) => item.users > 0);

  return (
    <div
      className="flex flex-col gap-5"
      style={{ animation: "fadeUp .3s ease both" }}
    >
      <div>
        <h1 className="m-0 text-xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Monitor users and activity across all OXYONE products.
        </p>
      </div>

      {/* ── Product cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 border border-slate-200 bg-white p-4 min-w-0">
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-900">
              Product User Analytics
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Registered users across the OXYONE ecosystem
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Products",
                    position: "insideBottom",
                    offset: -3,
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Users",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Users",
                  ]}
                />
                <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                  {chartData.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                  <LabelList
                    dataKey="users"
                    position="top"
                    formatter={(value) =>
                      value ? Number(value).toLocaleString() : ""
                    }
                    style={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-4 min-w-0">
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-900">
              User Distribution
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Proportional overview of available user data
            </div>
          </div>
          <div className="h-[280px]">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="users"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((item) => (
                      <Cell key={item.key} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()} users`,
                      name,
                    ]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">
                No count data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
