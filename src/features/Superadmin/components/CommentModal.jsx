import { useEffect, useRef, useState } from "react";
import { getSession, fetchWithAuth } from "../auth";

const BASE = "https://meta.oxyloans.com";

export default function CommentModal({ userId, userName, onClose, dataType = "Banks" }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [userStatus, setUserStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const session = getSession();
  const bottomRef = useRef(null);

  const fetchComments = () => {
    setLoading(true);
    fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${userId}`)
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d) ? d : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, [userId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleSave = async () => {
    if (!text.trim() || !session) return;
    setSaving(true);
    await fetchWithAuth(`${BASE}/api/user-service/write/update-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUserId: session.id, comments: text.trim(), dataType, userId, userStatus }),
    });
    setText("");
    setSaving(false);
    fetchComments();
  };

  const initials = userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">{userName}</p>
            <p className="text-xs text-blue-200 mt-0.5">
              {loading ? "Loading..." : `${comments.length} note${comments.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
          {loading && (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />)}
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-medium text-gray-500">No notes yet</p>
              <p className="text-xs mt-1">Add the first note below</p>
            </div>
          )}

          {!loading && comments.map((c, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow">
                {session?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed">{c.adminComments}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.userStatus ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                    {c.userStatus ? "● Active" : "● Inactive"}
                  </span>
                  {c.createdAt && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(c.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-4 border-t border-gray-100 bg-white space-y-3">
          <textarea
            rows={2}
            placeholder="Write a note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSave(); }}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setUserStatus(!userStatus)}
                className={`w-9 h-5 rounded-full transition-colors relative ${userStatus ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${userStatus ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-xs font-medium text-gray-600">{userStatus ? "Active" : "Inactive"}</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Ctrl+Enter to save</span>
              <button
                onClick={handleSave}
                disabled={saving || !text.trim()}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 hover:scale-105 active:scale-95"
              >
                {saving ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                {saving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
