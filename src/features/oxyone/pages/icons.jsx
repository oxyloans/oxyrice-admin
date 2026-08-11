/* ── Brand mark (matches Login screen) ───────────────────────── */
export const OxyMark = () => (
  <svg width="20" height="20" viewBox="0 0 56 56" fill="none">
    <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".95">
      <line x1="8" y1="17" x2="28" y2="6" />
      <line x1="28" y1="6" x2="48" y2="17" />
      <line x1="8" y1="17" x2="8" y2="39" />
      <line x1="8" y1="39" x2="28" y2="50" />
      <path d="M28 6 C40 14 40 24 28 28" />
      <line x1="48" y1="23" x2="48" y2="31" />
    </g>
    <circle cx="8" cy="17" r="4" fill="#fff" />
    <circle cx="28" cy="6" r="4" fill="#fff" />
    <circle cx="48" cy="17" r="4" fill="#fff" />
    <circle cx="28" cy="28" r="3" fill="#fff" />
    <circle cx="8" cy="39" r="4" fill="#fff" />
    <circle cx="28" cy="50" r="4" fill="#fff" />
  </svg>
);

/* ── Topbar welcome illustration ──────────────────────────── */
export const WelcomeIllustration = () => (
  <svg width="86" height="70" viewBox="0 0 128 104" fill="none">
    <ellipse cx="64" cy="96" rx="56" ry="6" fill="rgba(0,0,0,.18)" />
    <rect x="70" y="34" width="42" height="30" rx="5" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
    <rect x="72" y="38" width="38" height="20" rx="2" fill="rgba(255,255,255,.1)" />
    <rect x="86" y="64" width="10" height="8" fill="rgba(255,255,255,.2)" />
    <rect x="78" y="72" width="26" height="4" rx="2" fill="rgba(255,255,255,.25)" />
    <rect x="6" y="86" width="116" height="6" rx="3" fill="rgba(255,255,255,.16)" />
    <path d="M20 30a19 19 0 0 1 38 0v6h-6v-6a13 13 0 0 0-26 0v6h-6z" fill="#1e2538" />
    <circle cx="20" cy="34" r="5" fill="#1e2538" />
    <circle cx="58" cy="34" r="5" fill="#1e2538" />
    <rect x="15" y="32" width="6" height="10" rx="3" fill="#ffb37a" />
    <circle cx="39" cy="34" r="16" fill="#ffb37a" />
    <path d="M23 30a16 16 0 0 1 32 0c0-9-7-16-16-16s-16 7-16 16z" fill="#2b2438" />
    <path d="M14 92c1-16 11-26 25-26s24 10 25 26z" fill="var(--brand-blue)" />
    <path d="M39 66c8 0 15 3.5 19.5 10-4 3-11 5-19.5 5s-15.5-2-19.5-5c4.5-6.5 11.5-10 19.5-10z" fill="#ffffff" opacity=".08" />
  </svg>
);

/* ── White SVG Icons for Sidebar ────────────────────────── */
export const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  lender:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  borrower:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  askoxy:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  oxybricks: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  oxygold:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  partner:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  interested:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};
