import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BankOutlined,
  BuildOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./OxyoneTables.css";
import { OxyMark } from "../pages/icons";
import { NAV_SECTIONS, SECTIONS } from "../pages/config.jsx";

const SIDEBAR_ICONS = {
  dashboard: <DashboardOutlined />,
  lender: <BankOutlined />,
  borrower: <WalletOutlined />,
  askoxy: <RobotOutlined />,
  oxybricks: <BuildOutlined />,
  oxygold: <TrophyOutlined />,
  partner: <TeamOutlined />,
  interested: <StarOutlined />,
  settings: <SettingOutlined />,
  logout: <LogoutOutlined />,
};

function useActiveSection() {
  const { pathname } = useLocation();
  if (pathname === "/oxyone" || pathname === "/oxyone/") return "dashboard";
  const match = pathname.match(/^\/oxyone\/([^/]+)/);
  return match ? match[1] : "dashboard";
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const activeSection = useActiveSection();
  const searchRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  // Close search on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleNav = (key) => {
    if (key === "logout") {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("redirectAfterLogin_oxyone", currentPath);
      navigate("/admin/oxyonelogin");
    } else {
      navigate(key === "dashboard" ? "/oxyone" : `/oxyone/${key}`);
      setSidebarOpen(false);
    }
  };

  const searchableItems = useMemo(
    () =>
      NAV_SECTIONS.flatMap((s) => s.items).filter((i) => i.key !== "logout"),
    [],
  );
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchableItems.filter((i) => i.label.toLowerCase().includes(q));
  }, [query, searchableItems]);

  const goToResult = (key) => {
    navigate(key === "dashboard" ? "/oxyone" : `/oxyone/${key}`);
    setQuery("");
    setSearchFocused(false);
  };

  /* ── Shared sidebar content ── */
  const SidebarContent = ({ mobile = false }) => {
    const collapsed = !mobile && sidebarCollapsed;
    return (
      <div className="flex flex-col h-full pt-4">
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 pb-4 mb-1 flex-shrink-0 ${collapsed ? "justify-center px-3" : ""}`}
        >
          <div
            className="w-8 h-8 rounded-xl grid place-items-center flex-shrink-0"
            style={{
              background: "#1AB394",
              boxShadow: "0 3px 10px rgba(26,179,148,.3)",
            }}
          >
            <OxyMark />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-black text-white tracking-wide">
                OXYONE
              </span>
              <span className="text-[9px] font-semibold tracking-widest uppercase text-white/40 mt-0.5">
                Admin Panel
              </span>
            </div>
          )}
          {/* Close btn — mobile only */}
          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto w-7 h-7 rounded-lg grid place-items-center text-white/50 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Nav — scrollable middle */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 flex flex-col gap-0.5">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.label} className="mb-1">
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <div className="text-[9px] font-black tracking-[1.6px] uppercase text-white/30 px-3 pt-3 pb-1.5 select-none">
                  {sec.label}
                </div>
              )}
              {collapsed && (
                <div className="mx-3 my-2 border-t border-white/10" />
              )}
              {sec.items.map((n) => {
                const isActive = activeSection === n.key;
                return (
                  <button
                    key={n.key}
                    onClick={() => handleNav(n.key)}
                    title={collapsed ? n.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 border-none text-left mb-0.5 ${
                      collapsed ? "justify-center px-0" : ""
                    }
                      ${
                        isActive
                          ? "text-white font-bold"
                          : n.danger
                            ? "text-white/60 hover:text-white font-medium"
                            : "text-white/70 hover:text-white font-medium"
                      }`}
                    style={isActive ? { background: "#2d3748" } : {}}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = n.danger
                          ? "rgba(239,68,68,.12)"
                          : "#2d3748";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "";
                    }}
                  >
                    <span className="w-5 h-5 grid place-items-center flex-shrink-0 text-[17px] text-white">
                      {SIDEBAR_ICONS[n.icon]}
                    </span>
                    {!collapsed && (
                      <span className="text-[12.5px] text-white truncate">
                        {n.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Desktop sidebar — fixed, full height ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-60"}`}
        style={{
          background: "#1A202C",
          borderRight: "1px solid #1A202C",
          boxShadow: "4px 0 24px rgba(0,0,0,.18)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 z-[99] flex flex-col transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "#1A202C",
          borderRight: "1px solid #1A202C",
          boxShadow: "8px 0 32px rgba(0,0,0,.35)",
        }}
      >
        <SidebarContent mobile />
      </aside>

      {/* ── Fixed header ── */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 flex items-center px-4 gap-3 z-50 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:left-16" : "md:left-60"}`}
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,.1)",
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#1AB394] hover:text-[#1AB394] hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer flex-shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <MenuUnfoldOutlined style={{ fontSize: 18 }} />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-[#1AB394] hover:text-[#1AB394] hover:bg-slate-100 transition-all border border-slate-200 bg-white cursor-pointer flex-shrink-0"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>

        {/* Title */}
        {/* {activeSection === "dashboard" ? (
          <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
                style={{ background: "#1AB394" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-800 tracking-tight">
                Dashboard
              </span>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <WelcomeIllustration />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {SECTIONS[activeSection] && (
              <span className="text-lg leading-none flex-shrink-0 text-[#1AB394]">
                {SECTIONS[activeSection].icon}
              </span>
            )}
            <span className="text-sm font-bold text-slate-800 truncate">
              {SECTIONS[activeSection]?.title ?? activeSection}
            </span>
          </div>
        )} */}

        {/* Search */}
        <div className="relative hidden sm:block ml-auto" ref={searchRef}>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all border
              ${searchFocused ? "border-[#1AB394] bg-white" : "border-slate-200 bg-slate-50"}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-400 flex-shrink-0"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              placeholder="Search sections..."
              value={query}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 text-xs w-40 placeholder:text-slate-400"
              style={{ fontFamily: "inherit" }}
            />
          </div>
          {searchFocused && query.trim() && (
            <div
              className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[60]"
              style={{ animation: "dropIn .18s ease both" }}
            >
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">
                  No matching sections
                </div>
              ) : (
                searchResults.map((r) => (
                  <div
                    key={r.key}
                    onClick={() => goToResult(r.key)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 text-sm text-slate-800 transition-colors"
                  >
                    <span
                      className="w-6 h-6 rounded-lg grid place-items-center text-xs flex-shrink-0"
                      style={
                        SECTIONS[r.key]
                          ? {
                              background: SECTIONS[r.key].color + "18",
                              color: SECTIONS[r.key].color,
                            }
                          : { background: "#f0f0f3", color: "#111" }
                      }
                    >
                      {SECTIONS[r.key]?.icon}
                    </span>
                    {r.label}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div
          className="relative w-9 h-9 rounded-lg grid place-items-center cursor-pointer text-[#999C9E] hover:text-[#1AB394] hover:bg-slate-100 transition-all flex-shrink-0"
          style={{ border: "1px solid #e5e7eb" }}
          title="Notifications"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white"
            style={{ animation: "dotPulse 2s ease infinite" }}
          />
        </div>
      </header>

      {/* ── Page body — offset sidebar + header ── */}
      <main
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-60"}`}
      >
        <div className="pt-24 px-4 pb-4 flex flex-col gap-3.5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
