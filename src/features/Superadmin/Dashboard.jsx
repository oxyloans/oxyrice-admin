import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSession, clearSession, fetchWithAuth } from "./auth";
import CallsPanel from "./components/CallsPanel";
import CommentModal from "./components/CommentModal";
import logo from "../../assets/img/oxyglobal.png";

const BASE = "https://meta.oxyloans.com";

const Avatar = ({ name }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-pink-500 to-rose-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}>
      {initials}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const session = getSession();

  const fetchCommentCounts = (rows) => {
    Promise.all(
      rows.map((r) =>
        fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${r.id}`)
          .then((res) => res.json())
          .then((d) => ({ id: r.id, count: Array.isArray(d) ? d.length : 0 }))
          .catch(() => ({ id: r.id, count: 0 }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ id, count }) => { map[id] = count; });
      setCommentCounts(map);
    });
  };

  useEffect(() => {
    fetchWithAuth(`${BASE}/api/user-service/write/get-all-countries-bank-data`)
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch"); return r.json(); })
      .then((rows) => { setData(rows); fetchCommentCounts(rows); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshCount = (bankId) => {
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${bankId}`)
      .then((r) => r.json())
      .then((d) => setCommentCounts((prev) => ({ ...prev, [bankId]: Array.isArray(d) ? d.length : 0 })))
      .catch(() => {});
  };

  const logout = () => { clearSession(); navigate("/superadmin/login"); };

  const filtered = data.filter((r) =>
    [r.name, r.companyName, r.exCompanyName, r.location, r.email]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Contacts", value: data.length, icon: "👥", gradient: "from-blue-600 to-indigo-600", light: "bg-blue-50 text-blue-600" },
    { label: "With Email", value: data.filter((r) => r.email).length, icon: "✉️", gradient: "from-emerald-500 to-teal-500", light: "bg-emerald-50 text-emerald-600" },
    { label: "With Mobile", value: data.filter((r) => r.mobileNumber?.trim()).length, icon: "📱", gradient: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-600" },
    { label: "Commented", value: Object.values(commentCounts).filter((c) => c > 0).length, icon: "💬", gradient: "from-orange-500 to-amber-500", light: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bank Contacts</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and track all banking contacts</p>
          </div>
          <div className="text-xs text-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl shadow-lg shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-gray-800 text-sm">
                  {filtered.length} <span className="text-gray-400 font-normal">contacts</span>
                </span>
              </div>
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[68vh] p-4 space-y-3">
              {loading && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-24" />
                  ))}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-sm font-medium">No contacts found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
              {!loading && !error && filtered.map((r, i) => (
                <div
                  key={r.id}
                  className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200"
                >
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-3">
                    <Avatar name={r.name} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-300">#{String(i + 1).padStart(2, "0")}</span>
                            <p className="font-bold text-gray-900 text-sm truncate">{r.name}</p>
                          </div>
                          {r.position && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{r.position}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedUser({ id: r.id, name: r.name })}
                          className="shrink-0 relative inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                          Notes
                          {commentCounts[r.id] > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
                              {commentCounts[r.id]}
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                        {[
                          { icon: "🏢", label: "Company", value: r.companyName },
                          { icon: "🏛", label: "Ex-Company", value: r.exCompanyName },
                          { icon: "📍", label: "Location", value: r.location },
                          { icon: "📱", label: "Mobile", value: r.mobileNumber?.trim() },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{icon} {label}</p>
                            <p className="text-xs text-gray-700 font-semibold truncate mt-0.5">{value || "—"}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2.5 flex items-center gap-4 flex-wrap">
                        {r.email && (
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="text-xs text-gray-600 truncate max-w-[180px]">{r.email}</span>
                          </div>
                        )}
                        {r.linkdinUrl && (
                          <a
                            href={r.linkdinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition-colors"
                          >
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            <span className="text-xs text-blue-600 font-medium">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of <span className="font-semibold text-gray-600">{data.length}</span> contacts
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* <div className="xl:col-span-1">
            <CallsPanel />
          </div> */}
        </div>

      {selectedUser && (
        <CommentModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          onClose={() => { refreshCount(selectedUser.id); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}
