import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSession } from "./auth";
import { fetchCompanies, fetchBanks, fetchDashboardStats } from "./api/superadminService";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const Avatar = ({ name }) => {
  const initials = name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "BC";
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500"
  ];
  const color = colors[(name ? name.charCodeAt(0) : 0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shadow shrink-0`}>
      {initials}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    companiesCount: 0,
    banksCount: 0,
    companyContactsCount: 0,
    commentsCount: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [recentBanks, setRecentBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCompanies(0, 5),
      fetchBanks(0, 5),
      fetchDashboardStats()
    ])
      .then(([companiesRes, banksRes, statsRes]) => {
        const companies = companiesRes?.data?.content || [];
        const banks = banksRes?.data?.content || [];
        const dashboardStats = statsRes?.data || {};

        setStats({
          companiesCount: dashboardStats.totalCompanies || companiesRes?.data?.totalElements || companies.length,
          banksCount: dashboardStats.totalBanks || banksRes?.data?.totalElements || banks.length,
          companyContactsCount: dashboardStats.totalCompanyContacts || 0,
          commentsCount: dashboardStats.totalComments || 0,
        });

        setRecentCompanies(companies.slice(0, 5));
        setRecentBanks(banks.slice(0, 5));
      })
      .catch((e) => {
        console.error("Dashboard data load error:", e);
        setError("Failed to load dashboard data. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statCards = [
    {
      label: "Total Companies",
      value: stats.companiesCount,
      icon: "🏢",
      gradient: "from-blue-600 to-cyan-500",
      link: "/superadmin/companies"
    },
    {
      label: "Total Banks",
      value: stats.banksCount,
      icon: "🏦",
      gradient: "from-purple-600 to-indigo-600",
      link: "/superadmin/banks"
    },
    {
      label: "Total Company Contacts",
      value: stats.companyContactsCount,
      icon: "👥",
      gradient: "from-emerald-500 to-teal-600",
      link: "/superadmin/companies"
    },
    {
      label: "Total Comments",
      value: stats.commentsCount,
      icon: "💬",
      gradient: "from-orange-500 to-amber-500",
      link: "/superadmin/companies"
    }
  ];

  const chartData = [
    { name: "Companies", count: stats.companiesCount, color: "#3b82f6" },
    { name: "Banks", count: stats.banksCount, color: "#8b5cf6" },
    { name: "Contacts", count: stats.companyContactsCount, color: "#10b981" },
    { name: "Comments", count: stats.commentsCount, color: "#f97316" }
  ];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Superadmin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {session?.name || "Superadmin"}. Here's an overview of your platform.</p>
        </div>
        <div className="text-xs text-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm shrink-0 self-start sm:self-auto">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:border-blue-150 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                {card.icon}
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
                )}
                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-lg">→</span>
          </Link>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/superadmin/add-company"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-semibold text-sm transition-colors"
          >
            <span className="text-lg">🏢</span> Add New Company
          </Link>
          <Link
            to="/superadmin/add-bank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 font-semibold text-sm transition-colors"
          >
            <span className="text-lg">🏦</span> Add New Bank
          </Link>
          <Link
            to="/superadmin/add-employee"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-semibold text-sm transition-colors"
          >
            <span className="text-lg">👤</span> Add New Employee
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-red-600">
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Analytics Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-5">
        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Platform Statistics</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of companies, banks, contacts, and comments.</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Live Data
          </span>
        </div>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="h-40 w-full bg-gray-50 animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-lg">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{data.name}</p>
                          <p className="text-lg font-bold text-gray-900 mt-0.5">{data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Onboarded List cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Onboarded Companies Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Companies</h3>
            <Link to="/superadmin/companies" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-3 min-h-[200px]">
            {loading && [...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl" />
            ))}
            {!loading && recentCompanies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-xs">
                <span>🏢</span>
                <p className="mt-1 font-medium">No companies registered yet</p>
              </div>
            )}
            {!loading && recentCompanies.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/superadmin/companies/${c.id}/employees`)}
                className="flex items-center justify-between p-3 bg-gray-50/60 hover:bg-blue-50/40 border border-gray-100 hover:border-blue-100 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={c.companyName} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-850 truncate group-hover:text-blue-600 transition-colors">{c.companyName}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.location || "Location not specified"}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Partner Banks Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Banks</h3>
            <Link to="/superadmin/banks" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-3 min-h-[200px]">
            {loading && [...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl" />
            ))}
            {!loading && recentBanks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-xs">
                <span>🏦</span>
                <p className="mt-1 font-medium">No banks registered yet</p>
              </div>
            )}
            {!loading && recentBanks.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/superadmin/banks/${b.id}/employees`)}
                className="flex items-center justify-between p-3 bg-gray-50/60 hover:bg-purple-50/40 border border-gray-100 hover:border-purple-100 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={b.companyName} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-850 truncate group-hover:text-purple-600 transition-colors">{b.companyName}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{b.location || "Location not specified"}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-purple-400 transition-colors">→</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
