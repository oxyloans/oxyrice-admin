import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BankOutlined,
  BuildOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
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
  partnerlender: <TeamOutlined />,
  interested: <StarOutlined />,
  settings: <SettingOutlined />,
  logout: <LogoutOutlined />,
  database: <DatabaseOutlined />,
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
      NAV_SECTIONS.flatMap((s) =>
        s.items.map((i) => ({ ...i, sectionLabel: s.label })),
      ).filter((i) => i.key !== "logout"),
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
          className={`flex items-center gap-3 px-4 pb-4 mb-2 flex-shrink-0 border-b border-white/[0.08] ${collapsed ? "justify-center px-3" : ""}`}
        >
          <div
            className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1AB394, #0f8a72)",
              boxShadow: "0 4px 14px rgba(26,179,148,.4)",
            }}
          >
            <OxyMark />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-[14.5px] font-black text-white tracking-wide">
                OXYONE
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/40 mt-1">
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
        <nav className="oxyone-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-1 flex flex-col">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.label}>
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <div className="px-4 pt-3.5 pb-1 select-none">
                  <span className="text-[10px] font-bold tracking-[1.2px] uppercase text-white/35">
                    {sec.label}
                  </span>
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
                    className={`w-full flex items-center gap-2.5 px-4 py-1.5 cursor-pointer transition-all duration-150 border-none text-left ${
                      collapsed ? "justify-center px-0" : ""
                    }
                      ${
                        isActive
                          ? "text-white font-bold"
                          : n.danger
                            ? "text-white/70 hover:text-white font-medium"
                            : "text-white/80 hover:text-white font-medium"
                      }`}
                    style={{
                      background: isActive ? "#2d3748" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = n.danger
                          ? "rgba(239,68,68,.1)"
                          : "rgba(255,255,255,.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "";
                    }}
                  >
                    <span
                      className="grid place-items-center flex-shrink-0 text-[15px]"
                      style={{
                        color: n.danger ? "#f87171" : "rgba(255,255,255,.9)",
                      }}
                    >
                      {SIDEBAR_ICONS[n.icon]}
                    </span>
                    {!collapsed && (
                      <span className="text-[12.5px] truncate flex-1">
                        {n.label}
                      </span>
                    )}
                    {!collapsed && (
                      <RightOutlined
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,.25)",
                          flexShrink: 0,
                        }}
                      />
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
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-64"}`}
        style={{
          background: "#1A202C",
          borderRight: "1px solid #1A202C",
          boxShadow: "4px 0 24px rgba(0,0,0,.18)",
        }}
      >
        <SidebarContent />
        {/* Desktop collapse toggle — fixed at bottom of sidebar */}
        <button
          className="hidden md:flex items-center justify-center w-full h-12 text-white/60 hover:text-white transition-all border-none bg-transparent cursor-pointer flex-shrink-0 group"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {sidebarCollapsed
            ? <MenuUnfoldOutlined style={{ fontSize: 15 }} />
            : <>
                <MenuFoldOutlined style={{ fontSize: 15 }} />
                <span className="ml-2 text-[12px] font-bold tracking-wide">Collapse</span>
              </>}
        </button>
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
        className={`fixed top-0 left-0 right-0 h-16 flex items-center px-4 gap-3 z-50 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:left-16" : "md:left-64"}`}
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 1px 6px rgba(0,0,0,.08)",
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#1AB394] hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer flex-shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <MenuUnfoldOutlined style={{ fontSize: 18 }} />
        </button>

        {/* Active page title */}
        {SECTIONS[activeSection] && (
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-9 h-9 rounded-xl grid place-items-center text-base flex-shrink-0"
              style={{
                background: SECTIONS[activeSection].color + "18",
                color: SECTIONS[activeSection].color,
              }}
            >
              {SECTIONS[activeSection].icon}
            </span>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[17px] font-extrabold text-slate-900 truncate tracking-tight">
                {SECTIONS[activeSection].title}
              </span>
              {SECTIONS[activeSection].subtitle && (
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {SECTIONS[activeSection].subtitle}
                </span>
              )}
            </div>
          </div>
        )}

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
            {query && (
              <svg
                onClick={() => setQuery("")}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 cursor-pointer"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
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
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{r.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        {r.sectionLabel}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Page body — offset sidebar + header ── */}
      <main
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        <div className="pt-24 px-4 pb-4 flex flex-col gap-3.5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
