import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BankOutlined,
  BuildOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DownOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./OxyoneTables.css";
import oxyoneLogo from "../../../assets/img/oxyone.png";
import { NAV_SECTIONS, SECTIONS } from "../pages/config.jsx";
import { JOURNEY_CATEGORIES } from "../pages/journeyCategories";

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
  journeyScorecard: <TrophyOutlined />,
  settings: <SettingOutlined />,
  logout: <LogoutOutlined />,
  database: <DatabaseOutlined />,
  university: <BankOutlined />,
};

const GROUP_ICONS = {
  "USERS REGISTRATIONS": <TeamOutlined />,
  Queries: <QuestionCircleOutlined />,
  "Campaign Data": <DatabaseOutlined />,
  "Abroad Data": <GlobalOutlined />,
};

const NAV_GROUPS = NAV_SECTIONS.filter((s) => s.label !== "System");

// Title-case labels like "USERS REGISTRATIONS" so every section reads the same.
const groupTitle = (label) =>
  label === label.toUpperCase()
    ? label.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : label;

function useActiveSection() {
  const { pathname } = useLocation();
  if (pathname === "/oxyone" || pathname === "/oxyone/") return "dashboard";
  const match = pathname.match(/^\/oxyone\/([^/]+)/);
  return match ? match[1] : "dashboard";
}

// On a specific journey's page (/oxyone/journeyScorecard/:journeyKey), the
// header should show that journey's own name/icon/color instead of the
// generic "Interested Scorecard" section title.
function useHeaderInfo(activeSection) {
  const { pathname } = useLocation();
  if (activeSection === "journeyScorecard") {
    const match = pathname.match(/^\/oxyone\/journeyScorecard\/([^/]+)/);
    const journey = match && JOURNEY_CATEGORIES.find((c) => c.key === match[1]);
    if (journey) {
      return {
        title: journey.label,
        subtitle: "Registration journey",
        color: journey.color,
        icon: journey.icon,
      };
    }
  }
  return SECTIONS[activeSection];
}

// Hoisted out of DashboardLayout: defining this inline in the render body
// gave it a new function identity on every re-render (e.g. every nav click,
// since that updates activeSection), which made React remount the whole
// sidebar <nav> and reset its scroll position to the top. As a stable
// top-level component, the same DOM node persists across navigations and
// keeps whatever scroll position it had.
function SidebarContent({
  mobile = false,
  sidebarCollapsed,
  activeSection,
  onNav,
  onCloseMobile,
}) {
  const collapsed = !mobile && sidebarCollapsed;
  // Sections are dropdowns showing only their names; they open only when
  // the user clicks them.
  const [openSections, setOpenSections] = useState({});
  const toggleSection = (label) =>
    setOpenSections((o) => ({ ...o, [label]: !o[label] }));

  const renderItem = (n, nested = false) => {
    const isActive = activeSection === n.key;
    return (
      <button
        key={n.key}
        onClick={() => onNav(n.key)}
        title={collapsed ? n.label : undefined}
        className={`oxy-side-row w-full flex items-center gap-2.5 rounded-xl cursor-pointer border text-left transition-all duration-200 ${
          collapsed ? "justify-center px-0 py-2.5" : nested ? "pl-7 pr-3 py-2" : "px-3 py-2.5"
        } ${isActive ? "is-active" : ""}`}
      >
        <span
          className={`grid place-items-center flex-shrink-0 ${nested ? "text-[14px]" : "text-[16px]"}`}
        >
          {SIDEBAR_ICONS[n.icon]}
        </span>
        {!collapsed && (
          <span className={`${nested ? "text-[13px]" : "text-[14px]"} truncate flex-1`}>
            {n.label}
          </span>
        )}
      </button>
    );
  };

  return (
    // flex-1 + min-h-0 (not h-full): lets the nav scroll inside the aside so
    // the Collapse/Expand toggle below it is never pushed off-screen.
    <div className="flex flex-col flex-1 min-h-0 pt-5">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 pb-5 flex-shrink-0 ${collapsed ? "justify-center px-2" : ""}`}
      >
        {/* Collapsed, the box crops the image to the hexagon mark on its left. */}
        {collapsed ? (
          <div className="w-10 h-10 overflow-hidden flex-shrink-0 justify-center rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-1">
            <img src={oxyoneLogo} alt="OXYONE" className="h-full w-full object-contain -ml-0.5" />
          </div>
        ) : (
          <div className="w-full rounded-2xl justify-center border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-2.5">
            <img src={oxyoneLogo} alt="OXYONE" className="h-11 w-auto max-w-full min-w-0 object-contain" />
          </div>
        )}
        {/* Close btn — mobile only */}
        {mobile && (
          <button
            onClick={onCloseMobile}
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
      <nav className="oxyone-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 flex flex-col gap-1">
        {NAV_GROUPS.map((sec, idx) => {
          // Collapsed rail has no section rows to click, so show all icons there.
          if (collapsed) {
            return (
              <div key={sec.label} className="flex flex-col gap-1">
                {idx > 0 && <div className="mx-2 my-1.5 border-t border-white/10" />}
                {sec.items.map((n) => renderItem(n))}
              </div>
            );
          }
          const open = !!openSections[sec.label];
          const hasActive = sec.items.some((i) => i.key === activeSection);
          return (
            <div key={sec.label} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => toggleSection(sec.label)}
                aria-expanded={open}
                className={`oxy-side-row w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer border text-left transition-all duration-200 ${
                  hasActive && !open ? "is-active" : ""
                }`}
              >
                <span className="grid place-items-center flex-shrink-0 text-[15px]">
                  {GROUP_ICONS[sec.label] ?? <DatabaseOutlined />}
                </span>
                <span className="text-[14px] truncate flex-1 font-medium">
                  {groupTitle(sec.label)}
                </span>
                <DownOutlined
                  className={`text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && sec.items.map((n) => renderItem(n, true))}
            </div>
          );
        })}
      </nav>

      {/* Log out — pinned to the bottom */}
      <div className="flex-shrink-0 px-3 pt-3 pb-3 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => onNav("logout")}
          title={collapsed ? "Log out" : undefined}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-red-400/20 cursor-pointer text-white text-[14px] font-semibold transition-all duration-200 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 shadow-[0_8px_20px_rgba(239,68,68,0.25)]"
        >
          <LogoutOutlined style={{ fontSize: 15 }} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const activeSection = useActiveSection();
  const headerInfo = useHeaderInfo(activeSection);
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
          background: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.92))",
          borderRight: "1px solid rgba(148,163,184,0.14)",
          boxShadow: "18px 0 45px rgba(15, 23, 42, 0.22)",
          backdropFilter: "blur(12px)",
        }}
      >
        <SidebarContent
          sidebarCollapsed={sidebarCollapsed}
          activeSection={activeSection}
          onNav={handleNav}
        />
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
          background: "linear-gradient(180deg, rgba(15,23,42,0.99), rgba(15,23,42,0.94))",
          borderRight: "1px solid rgba(148,163,184,0.12)",
          boxShadow: "18px 0 42px rgba(15, 23, 42, 0.28)",
          backdropFilter: "blur(12px)",
        }}
      >
        <SidebarContent
          mobile
          sidebarCollapsed={sidebarCollapsed}
          activeSection={activeSection}
          onNav={handleNav}
          onCloseMobile={() => setSidebarOpen(false)}
        />
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
        {headerInfo && (
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-9 h-9 rounded-xl grid place-items-center text-base flex-shrink-0"
              style={{
                background: headerInfo.color + "18",
                color: headerInfo.color,
              }}
            >
              {headerInfo.icon}
            </span>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[17px] font-extrabold text-slate-900 truncate tracking-tight">
                {headerInfo.title}
              </span>
              {headerInfo.subtitle && (
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {headerInfo.subtitle}
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
        <div className="pt-20 px-4 pb-4 flex flex-col gap-3.5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
