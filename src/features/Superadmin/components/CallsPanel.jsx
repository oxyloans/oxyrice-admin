import { useEffect, useState } from "react";
import { getSession, fetchWithAuth } from "../auth";

const BASE = "https://meta.oxyloans.com";
const today = () => new Date().toISOString().split("T")[0];

export default function CallsPanel() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const session = getSession();

  const fetchCalls = (d) => {
    if (!session) return;
    setLoading(true);
    fetchWithAuth(`${BASE}/api/user-service/write/getAllCallsData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpAdminUserId: session.id, specificDate: d }),
    })
      .then((r) => r.json())
      .then((d) => setCalls(Array.isArray(d) ? d : []))
      .catch(() => setCalls([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalls(date); }, [date]);

  const active = calls.filter((c) => c.userStatus).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-white text-sm">Call Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {calls.length} calls · <span className="text-emerald-400">{active} active</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 [color-scheme:dark]"
        />
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 space-y-2.5">
        {loading && (
          <div className="space-y-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-3xl mb-2">📵</span>
            <p className="text-sm font-medium">No calls recorded</p>
            <p className="text-xs mt-1">for {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          </div>
        )}

        {!loading && calls.map((c, i) => (
          <div key={i} className="relative flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${c.userStatus ? "bg-emerald-400 shadow-sm shadow-emerald-300" : "bg-gray-300"}`} />
              {i < calls.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.name ?? "—"}</p>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${c.userStatus ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-500"}`}>
                    {c.userStatus ? "Active" : "Inactive"}
                  </span>
                </div>
                {c.comments && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.comments}</p>
                )}
                {c.updatedAt && (
                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && calls.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{active} active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{calls.length - active} inactive</span>
          </div>
        </div>
      )}
    </div>
  );
}
