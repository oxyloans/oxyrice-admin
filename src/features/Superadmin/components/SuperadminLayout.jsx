import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getSession, clearSession, fetchWithAuth } from '../auth';
import logo from '../../../assets/img/oglogo1_white.png';
import { SearchProvider, useSearch } from './SearchContext';

const SuperadminLayoutInner = ({ children }) => {
  const navigate = useNavigate();
  const session = getSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const { searchValue, setSearchValue } = useSearch();

  // Search API states
  const [searchResults, setSearchResults] = useState({ companies: [], bankEmployees: [], companyEmployees: [] });
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setCollapsed(true);
        setMobileOpen(false);
      } else {
        setCollapsed(false);
      }
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  // Debounced search API fetch
  useEffect(() => {
    if (!searchValue || searchValue.trim().length < 2) {
      setSearchResults({ companies: [], bankEmployees: [], companyEmployees: [] });
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      setShowDropdown(true);
      try {
        const res = await fetchWithAuth(`https://meta.oxyloans.com/api/user-service/write/search?keyword=${encodeURIComponent(searchValue.trim())}`, {
          headers: { 'accept': '*/*' }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults({
            companies: Array.isArray(data?.companies) ? data.companies : [],
            bankEmployees: Array.isArray(data?.bankEmployees) ? data.bankEmployees : [],
            companyEmployees: Array.isArray(data?.companyEmployees) ? data.companyEmployees : [],
          });
        } else {
          setSearchResults({ companies: [], bankEmployees: [], companyEmployees: [] });
        }
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults({ companies: [], bankEmployees: [], companyEmployees: [] });
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchValue]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    clearSession();
    navigate('/superadmin/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(o => !o);
    } else {
      setCollapsed(c => !c);
    }
  };

  const renderSearchDropdown = () => {
    if (!showDropdown) return null;
    
    const hasCompanies = searchResults?.companies && searchResults.companies.length > 0;
    const hasCompanyEmployees = searchResults?.companyEmployees && searchResults.companyEmployees.length > 0;
    const hasBankEmployees = searchResults?.bankEmployees && searchResults.bankEmployees.length > 0;
    const totalResults = (searchResults?.companies?.length || 0) + 
                         (searchResults?.companyEmployees?.length || 0) + 
                         (searchResults?.bankEmployees?.length || 0);

    return (
      <div 
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          zIndex: 100,
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {searching ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span>⏳</span> Searching platform...
          </div>
        ) : totalResults === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
            No matching contacts or companies found
          </div>
        ) : (
          <div>
            <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Search Results ({totalResults})
            </div>

            {/* Companies Group */}
            {hasCompanies && (
              <div>
                <div style={{ padding: '8px 16px 4px 16px', fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏢 Companies ({searchResults.companies.length})
                </div>
                {searchResults.companies.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchValue('');
                      const isBank = item.classification && (
                        item.classification.toUpperCase() === 'BANK' ||
                        item.classification.toUpperCase() === 'BANKS'
                      );
                      if (isBank) {
                        navigate(`/superadmin/banks/${item.id}/employees`);
                      } else {
                        navigate(`/superadmin/companies/${item.id}/employees`);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.companyName}</div>
                        {item.classification && (
                          <div style={{ fontSize: '10.5px', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
                            {item.classification}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {item.website && (
                          <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noreferrer" title="Website" style={{ padding: '4px', background: '#e0e7ff', borderRadius: '6px', color: '#4f46e5', display: 'flex' }}>
                            🌐
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Company Employees Group */}
            {hasCompanyEmployees && (
              <div>
                <div style={{ padding: '8px 16px 4px 16px', fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👥 Company Employees ({searchResults.companyEmployees.length})
                </div>
                {searchResults.companyEmployees.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
                          {item.position}
                        </div>
                        {item.companyName && (
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🏢</span> {item.companyName}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                        {item.email && (
                          <a href={`mailto:${item.email}`} title="Email Contact" style={{ padding: '4px', background: '#f1f5f9', borderRadius: '6px', color: '#475569', display: 'flex' }}>
                            ✉️
                          </a>
                        )}
                        {item.mobileNumber && (
                          <a href={`tel:${item.mobileNumber}`} title="Call Contact" style={{ padding: '4px', background: '#f1f5f9', borderRadius: '6px', color: '#475569', display: 'flex' }}>
                            📞
                          </a>
                        )}
                        {item.linkdinUrl && (
                          <a href={item.linkdinUrl} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{ padding: '4px', background: '#e0e7ff', borderRadius: '6px', color: '#0a66c2', display: 'flex' }}>
                            🔗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bank Employees Group */}
            {hasBankEmployees && (
              <div>
                <div style={{ padding: '8px 16px 4px 16px', fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏦 Bank Employees ({searchResults.bankEmployees.length})
                </div>
                {searchResults.bankEmployees.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
                          {item.position}
                        </div>
                        {item.companyName && (
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🏛️</span> {item.companyName}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                        {item.email && (
                          <a href={`mailto:${item.email}`} title="Email Contact" style={{ padding: '4px', background: '#f1f5f9', borderRadius: '6px', color: '#475569', display: 'flex' }}>
                            ✉️
                          </a>
                        )}
                        {item.mobileNumber && (
                          <a href={`tel:${item.mobileNumber}`} title="Call Contact" style={{ padding: '4px', background: '#f1f5f9', borderRadius: '6px', color: '#475569', display: 'flex' }}>
                            📞
                          </a>
                        )}
                        {item.linkdinUrl && (
                          <a href={item.linkdinUrl} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{ padding: '4px', background: '#e0e7ff', borderRadius: '6px', color: '#0a66c2', display: 'flex' }}>
                            🔗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#f0f2f8',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        background: 'linear-gradient(90deg, #1e2a4a 0%, #162040 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        zIndex: 40,
        gap: '0.5rem',
        minWidth: 0,
      }}>

        {/* Left: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>

          <img src={logo} alt="OxyGlobal" style={{ height: '58px', objectFit: 'contain', flexShrink: 0 }} />
          <button
            onClick={toggleSidebar}
            aria-label={isMobile ? (mobileOpen ? 'Close menu' : 'Open menu') : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
            style={{
              width: '32px', height: '32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: 'rgba(255,255,255,0.9)', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: 'rgba(255,255,255,0.9)', borderRadius: '2px', transition: 'all 0.2s' }} />
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: 'rgba(255,255,255,0.9)', borderRadius: '2px' }} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* Center: search bar — hidden on mobile unless toggled */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <svg
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search companies, banks, users…"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onFocus={() => { if (searchValue.trim().length >= 2) setShowDropdown(true); }}
                style={{
                  width: '100%',
                  padding: '0.45rem 2rem 0.45rem 2rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocusCapture={e => {
                  e.target.style.background = 'rgba(255,255,255,0.11)';
                  e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                }}
                onBlur={e => {
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <kbd style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '9px', color: 'rgba(148,163,184,0.45)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px', padding: '1px 5px', fontFamily: 'monospace',
              }}>⌘K</kbd>
              {renderSearchDropdown()}
            </div>
          </div>
        )}

        {/* Spacer on mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

          {/* Mobile search toggle */}
          {isMobile && (
            <button
              onClick={() => setShowSearch(s => !s)}
              aria-label="Toggle search"
              style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: showSearch ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg style={{ width: '14px', height: '14px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '12px', fontWeight: 500, color: '#fff',
              background: 'linear-gradient(90deg, #ef4444, #f43f5e)',
              border: 'none', borderRadius: '8px',
              padding: isMobile ? '0.45rem 0.5rem' : '0.45rem 0.75rem',
              cursor: 'pointer', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isMobile && 'Logout'}
          </button>
        </div>
      </header>

      {/* Mobile search bar (dropdown) */}
      {isMobile && showSearch && (
        <div style={{
          background: '#1e2a4a',
          padding: '0.625rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 35,
          flexShrink: 0,
        }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'rgba(148,163,184,0.5)', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search companies, banks, users…"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => { if (searchValue.trim().length >= 2) setShowDropdown(true); }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocusCapture={e => {
                e.target.style.background = 'rgba(255,255,255,0.11)';
                e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
              }}
              onBlur={e => {
                e.target.style.background = 'rgba(255,255,255,0.07)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {renderSearchDropdown()}
          </div>
        </div>
      )}

      {/* ── BODY: sidebar + main ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', minHeight: 0 }}>

        {/* Mobile overlay backdrop */}
        {isMobile && mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 20,
              backdropFilter: 'blur(1px)',
            }}
          />
        )}

        <Sidebar
           collapsed={isMobile ? !mobileOpen : collapsed}
          mobileOpen={mobileOpen}
          isMobile={isMobile}
          onLogout={logout}
          session={session}
          onClose={() => setMobileOpen(false)}
        />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '1rem' : '1.5rem',
          minWidth: 0,
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const SuperadminLayout = ({ children }) => (
  <SearchProvider>
    <SuperadminLayoutInner>{children}</SuperadminLayoutInner>
  </SearchProvider>
);

export default SuperadminLayout;