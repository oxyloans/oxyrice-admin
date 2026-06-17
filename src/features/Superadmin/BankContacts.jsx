import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, fetchWithAuth } from "./auth";
import { useSearch } from "./components/SearchContext";

const BASE = "https://meta.oxyloans.com";

const HL = ({ text, search }) => {
  if (!search || !text) return <>{text}</>;
  const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 rounded px-0.5 font-semibold not-italic">{p}</mark>
        ) : p
      )}
    </>
  );
};

const PALETTES = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-sky-100",    text: "text-sky-700"    },
  { bg: "bg-teal-100",   text: "text-teal-700"   },
  { bg: "bg-rose-100",   text: "text-rose-700"   },
  { bg: "bg-amber-100",  text: "text-amber-700"  },
];

const Avatar = ({ name, size = "w-7 h-7 text-[10px]" }) => {
  const p   = PALETTES[(name || "?").charCodeAt(0) % PALETTES.length];
  const ini = (name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`${size} ${p.bg} ${p.text} rounded-full flex items-center justify-center font-bold shrink-0 select-none`}>
      {ini}
    </div>
  );
};

const NotesCell = ({ bankId, initNotes }) => {
  const [notes,   setNotes]   = useState(initNotes || []);
  const [text,    setText]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const inputRef              = useRef(null);

  const save = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await fetchWithAuth(`${BASE}/api/user-service/write/addComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: bankId, comment: text.trim() }),
      });
      const res = await fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${bankId}`);
      const d   = await res.json();
      setNotes(Array.isArray(d) ? d : []);
      setText("");
    } catch (_) {}
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {/* Existing notes */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-0.5">
          {notes.map((n, i) => (
            <div key={n.id || i} className="bg-slate-50 border border-slate-100 rounded-md px-2 py-1.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-indigo-600 truncate">{n.commentedBy || "Unknown"}</span>
                {n.createdAt && (
                  <span className="text-[9px] text-slate-300 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-snug break-words">{n.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input always visible */}
      <div className="flex gap-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
          placeholder={notes.length === 0 ? "Add note…" : "Add another…"}
          disabled={saving}
          className="flex-1 min-w-0 text-[11px] px-2 py-1 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 placeholder-slate-300 text-slate-700 transition-all"
        />
        <button
          onClick={save}
          disabled={saving || !text.trim()}
          className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "…" : "↵"}
        </button>
      </div>
    </div>
  );
};

export default function BankContacts() {
  const [data,          setData]          = useState([]);
  const [rowNotes,      setRowNotes]      = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [sortKey,       setSortKey]       = useState("name");
  const [sortDir,       setSortDir]       = useState("asc");
  const { searchValue: search, setSearchValue: setSearch } = useSearch();

  useEffect(() => {
    fetchWithAuth(`${BASE}/api/user-service/write/get-all-countries-bank-data`)
      .then(r => { if (!r.ok) throw new Error("Failed to load contacts"); return r.json(); })
      .then(async rows => {
        setData(rows);
        // fetch all notes for every row upfront
        const allNotes = await Promise.all(
          rows.map(r =>
            fetchWithAuth(`${BASE}/api/user-service/write/getCommentsByUserId/${r.id}`)
              .then(res => res.json())
              .then(d => ({ id: r.id, notes: Array.isArray(d) ? d : [] }))
              .catch(() => ({ id: r.id, notes: [] }))
          )
        );
        const notesMap = {};
        const countMap = {};
        allNotes.forEach(({ id, notes }) => {
          notesMap[id] = notes;
          countMap[id] = notes.length;
        });
        setRowNotes(notesMap);
        setCommentCounts(countMap);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data
    .filter(r =>
      [r.name, r.companyName, r.exCompanyName, r.location, r.email, r.position]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const kpis = [
    { label: "Total",    value: data.length,                                            color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-100" },
    { label: "Email",    value: data.filter(r => r.email).length,                       color: "text-teal-600",   bg: "bg-teal-50",    border: "border-teal-100"   },
    { label: "Mobile",   value: data.filter(r => r.mobileNumber?.trim()).length,         color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100" },
    { label: "LinkedIn", value: data.filter(r => r.linkdinUrl).length,                  color: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-100"    },
    { label: "Noted",    value: Object.values(commentCounts).filter(c => c > 0).length, color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100"  },
  ];

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return (
      <svg className="w-2.5 h-2.5 text-slate-300 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className="w-2.5 h-2.5 text-indigo-400 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={sortDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    );
  };

  return (
    <div className="min-h-full">

      {/* ── Page header — compact ── */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">CRM · Banking</p>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Bank contacts</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" })}
          </span>
        </div>
      </div>

      {/* ── KPI strip — tight ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {kpis.map(k => (
          <div key={k.label} className={`flex items-baseline gap-2 ${k.bg} border ${k.border} rounded-lg px-3 py-1.5`}>
            <span className={`text-base font-bold leading-none ${k.color}`}>{k.value}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── Table card — fills remaining space ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span> contacts
              {search && <span className="text-slate-400"> · "{search}"</span>}
            </span>
          </div>
          <div className="relative w-64">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, company, email…"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table — NO max-height, page itself scrolls */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed", minWidth: 1100 }}>
            <colgroup>
              <col style={{ width: 44  }} /> {/* # */}
              <col style={{ width: 180 }} /> {/* Contact */}
              <col style={{ width: 150 }} /> {/* Title */}
              <col style={{ width: 170 }} /> {/* Company */}
              <col style={{ width: 130 }} /> {/* Location */}
              <col style={{ width: 190 }} /> {/* Email */}
              <col style={{ width: 120 }} /> {/* Mobile */}
              <col style={{ width: 80  }} /> {/* LinkedIn */}
              <col style={{ width: 240 }} /> {/* Notes */}
            </colgroup>

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">#</th>
                {[
                  { key: "name",          label: "Contact"  },
                  { key: "position",      label: "Title"    },
                  { key: "companyName",   label: "Company"  },
                  { key: "location",      label: "Location" },
                  { key: "email",         label: "Email"    },
                  { key: "mobileNumber",  label: "Mobile"   },
                  { key: null,            label: "LinkedIn" },
                  { key: null,            label: "Notes"    },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap ${key ? "cursor-pointer hover:text-slate-600 transition-colors" : ""}`}
                  >
                    {label}
                    {key && <SortIcon col={key} />}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading && [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-3.5 rounded bg-slate-100 animate-pulse" style={{ width: `${50 + (j * 7) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {error && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-red-500">{error}</td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm text-slate-400 font-medium">No contacts found</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting your search term</p>
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group align-top">

                  {/* Row number */}
                  <td className="px-3 py-3 text-[10px] text-slate-300 font-medium tabular-nums pt-3.5">
                    {String(i + 1).padStart(2, "0")}
                  </td>

                  {/* Contact */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.name || "?"} />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        <HL text={r.name} search={search} />
                      </span>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-slate-500 truncate block">
                      <HL text={r.position || "—"} search={search} />
                    </span>
                  </td>

                  {/* Company */}
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      <HL text={r.companyName} search={search} />
                    </p>
                    {r.exCompanyName && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        prev: <HL text={r.exCompanyName} search={search} />
                      </p>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-slate-500 truncate block">
                      <HL text={r.location || "—"} search={search} />
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-3 py-3">
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="text-xs text-indigo-600 hover:underline truncate block">
                        <HL text={r.email} search={search} />
                      </a>
                    ) : <span className="text-xs text-slate-200">—</span>}
                  </td>

                  {/* Mobile */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-slate-600 tabular-nums">
                      {r.mobileNumber?.trim() ? <HL text={r.mobileNumber.trim()} search={search} /> : <span className="text-slate-200">—</span>}
                    </span>
                  </td>

                  {/* LinkedIn */}
                  <td className="px-3 py-3 text-center">
                    {r.linkdinUrl ? (
                      <a
                        href={r.linkdinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded px-1.5 py-0.5 transition-colors"
                      >
                        <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        View
                      </a>
                    ) : <span className="text-slate-200 text-xs">—</span>}
                  </td>

                  {/* Notes — always visible, no click needed */}
                  <td className="px-3 py-2.5">
                    <NotesCell bankId={r.id} initNotes={rowNotes[r.id] || []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {filtered.length} of {data.length} contacts
            {search && (
              <button onClick={() => setSearch("")} className="ml-2 text-indigo-500 hover:text-indigo-700 font-semibold">
                Clear
              </button>
            )}
          </p>
          <p className="text-[10px] text-slate-300">Click column headers to sort</p>
        </div>
      </div>
    </div>
  );
}