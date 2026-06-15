import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getSession, clearSession } from '../auth';

/**
 * Layout component for Superadmin pages.
 * Applies glass‑morphism background and includes the navigation sidebar.
 */
const SuperadminLayout = ({ children }) => {
  const navigate = useNavigate();
  const session = getSession();

  const logout = () => {
    clearSession();
    navigate('/superadmin/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f0f2f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* <h2 className="text-lg font-bold text-gray-800">Superadmin Console</h2> */}
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {session.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-700 leading-none">{session.name}</p>
                  <p className="text-[10px] text-blue-500 leading-none mt-0.5">{session.primaryType}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 px-3 py-2 rounded-xl transition-all shadow-sm shadow-red-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperadminLayout;
