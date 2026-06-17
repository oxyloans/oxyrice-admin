import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  {
    to: '/superadmin/dashboard', label: 'Dashboard', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )
  },
  {
    to: '/superadmin/companies', label: 'Companies', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )
  },
  {
    to: '/superadmin/banks', label: 'Banks', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
    )
  },
];

const Sidebar = ({ collapsed, onLogout, session , isMobile }) => (
  <aside
    style={{
      width: collapsed ? '0px' : '220px',
      minWidth: collapsed ? '0px' : '220px',
      position: isMobile ? 'absolute' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      height: isMobile ? '100%' : 'auto',
      zIndex: isMobile ? 25 : 'auto',
      overflow: 'hidden',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      background: '#1e2a4a',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}
  >
    {/* Nav links */}
    <div style={{ width: '220px', padding: '1.25rem 0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <p style={{
        fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
        color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase',
        padding: '0 0.75rem', marginBottom: '0.5rem', whiteSpace: 'nowrap',
      }}>
        Menu
      </p>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  background: isActive
                    ? 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'
                    : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(148,163,184,0.85)',
                  boxShadow: isActive ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                })}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: session info + logout */}
      <div style={{
        width: '220px',
        marginLeft: '-0.75rem',
        padding: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>


        {/* Logout button */}
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '13px', fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#fca5a5';
          }}
        >
          <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </aside>
);

export default Sidebar;