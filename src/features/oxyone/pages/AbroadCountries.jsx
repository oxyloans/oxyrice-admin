import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAbroadRows, groupRows } from "./abroadData.js";

const ACCENT = "#e11d48";
const PER_PAGE = 15;

const show = (v) => (String(v ?? "").trim() ? v : "—");

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  leads: (a, b) => a.leads - b.leads,
};

function SearchBox({ value, onChange, placeholder, width = 280 }) {
  return (
    <div className="relative" style={{ width }}>
      <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]" />
      <input
        className="oxyone-search-input"
        style={{ paddingLeft: "2rem", width: "100%" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Metric({ label, value, loading }) {
  return (
    <div className="px-5 first:pl-0 border-l first:border-l-0 border-slate-200">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      {loading ? (
        <div className="h-6 w-12 rounded bg-slate-200 animate-pulse mt-0.5" />
      ) : (
        <div className="text-[20px] font-bold text-slate-900 leading-tight tabular-nums">{value}</div>
      )}
    </div>
  );
}

function SortHeader({ label, field, sort, onSort, align = "left", width }) {
  const active = sort.field === field;
  return (
    <th
      onClick={() => onSort(field)}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className="cursor-pointer select-none hover:text-slate-700"
      style={{ textAlign: align, width }}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {label}
        <span className="flex flex-col text-[8px] leading-[7px]">
          <CaretUpOutlined style={{ color: active && sort.dir === "asc" ? "#334155" : "#cbd5e1" }} />
          <CaretDownOutlined style={{ color: active && sort.dir === "desc" ? "#334155" : "#cbd5e1" }} />
        </span>
      </span>
    </th>
  );
}

function StudentsPanel({ group }) {
  const [q, setQ] = useState("");
  const students = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return group.rows;
    return group.rows.filter((r) =>
      ["userId", "name", "consultancy", "university"].some((k) =>
        String(r[k] ?? "").toLowerCase().includes(s),
      ),
    );
  }, [group, q]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
        <div className="text-[13px] font-semibold text-slate-700">
          Students going to {group.name}
          <span className="ml-2 text-[12px] font-normal text-slate-500">
            ({q ? `${students.length} of ${group.leads}` : group.leads})
          </span>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search students" width={240} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white max-h-[65vh] overflow-auto">
        <table className="oxyone-data-table">
          <thead className="sticky top-0 z-[1]">
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Consultancy</th>
              <th>University</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-400">
                  No students match "{q}"
                </td>
              </tr>
            ) : (
              students.map((r, i) => (
                <tr key={r.userId ?? i}>
                  <td className="text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="text-slate-500 tabular-nums">{show(r.userId)}</td>
                  <td className="font-medium text-slate-800">{show(r.name)}</td>
                  <td>{show(r.consultancy)}</td>
                  <td>{show(r.university)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AbroadCountries() {
  const { state } = useLocation();
  const { rows, loading, error, reload } = useAbroadRows();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: "leads", dir: "desc" });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(state?.focus ?? null);

  const groups = useMemo(() => groupRows(rows, "country"), [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : [...groups];
    const cmp = SORTERS[sort.field];
    list.sort((a, b) => {
      if (!a.key && b.key) return 1;
      if (a.key && !b.key) return -1;
      return sort.dir === "asc" ? cmp(a, b) : cmp(b, a);
    });
    return list;
  }, [groups, search, sort]);

  const rankOf = useMemo(() => new Map(visible.map((g, i) => [g.key, i + 1])), [visible]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const pageRows = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const openGroup = expanded == null ? null : groups.find((g) => g.key === expanded) ?? null;
  const namedCount = groups.filter((g) => g.isNamed).length;
  const firstLoad = loading && rows.length === 0;

  useEffect(() => setPage(1), [search, sort]);

  useEffect(() => {
    if (state?.focus == null || groups.length === 0) return;
    const idx = visible.findIndex((g) => g.key === state.focus);
    if (idx < 0) return;
    setPage(Math.floor(idx / PER_PAGE) + 1);
    requestAnimationFrame(() =>
      document
        .getElementById(`country-${state.focus || "none"}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, groups.length]);

  const onSort = (field) =>
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: field === "name" ? "asc" : "desc" },
    );

  return (
    <div className="flex flex-col gap-4" style={{ animation: "fadeUp .3s ease both" }}>
      <div className="oxyone-section-card">
        <div className="oxyone-section-toolbar flex-wrap gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search country" />
          <div className="flex items-center gap-4 ml-auto">
            {search && (
              <span className="text-[12px] text-slate-500">
                {visible.length} of {groups.length} countries
              </span>
            )}
            <div className="flex items-center">
              <Metric label="Countries" value={namedCount.toLocaleString()} loading={firstLoad} />
              <Metric label="Total Leads" value={rows.length.toLocaleString()} loading={firstLoad} />
            </div>
            <button
              type="button"
              className="oxyone-refresh-btn"
              onClick={reload}
              title="Refresh"
              aria-label="Refresh"
            >
              <ReloadOutlined spin={loading} />
            </button>
          </div>
        </div>

        {error && rows.length === 0 ? (
          <div className="oxyone-error-state">
            <span>{error}</span>
            <button type="button" className="oxyone-error-retry" onClick={reload}>
              Retry
            </button>
          </div>
        ) : firstLoad ? (
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 oxyone-loading-skeleton" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="oxyone-empty-state">
            {search ? `No country matches "${search}"` : "No country data available yet."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="oxyone-data-table" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>#</th>
                    <SortHeader label="Country" field="name" sort={sort} onSort={onSort} />
                    <SortHeader label="Leads" field="leads" sort={sort} onSort={onSort} align="right" width={140} />
                    <th style={{ width: 140, textAlign: "right" }}>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((g) => {
                    const isOpen = expanded === g.key;
                    const toggle = () => setExpanded(g.key);
                    return (
                      <Fragment key={g.key || "__none"}>
                        <tr
                          id={`country-${g.key || "none"}`}
                          onClick={toggle}
                          className="cursor-pointer"
                          style={
                            isOpen
                              ? { background: "#fff1f2", boxShadow: `inset 3px 0 0 ${ACCENT}` }
                              : undefined
                          }
                        >
                          <td className="text-slate-400 tabular-nums">{rankOf.get(g.key)}</td>
                          <td
                            className={`font-semibold ${g.isNamed ? "text-slate-800" : "text-slate-400 italic"}`}
                            title={
                              g.variants?.length > 1
                                ? `${g.name}\nAlso entered as: ${g.variants.slice(1).join(", ")}`
                                : g.name
                            }
                          >
                            <span className="truncate">{g.name}</span>
                          </td>
                          <td className="tabular-nums font-bold text-slate-900" style={{ textAlign: "right" }}>
                            {g.leads.toLocaleString()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle();
                              }}
                              aria-haspopup="dialog"
                              className="cursor-pointer text-[12px] font-semibold px-3 py-1 rounded-md transition-colors"
                              style={
                                isOpen
                                  ? { color: "#fff", background: ACCENT, border: `1px solid ${ACCENT}` }
                                  : { color: ACCENT, background: "#fff", border: `1px solid ${ACCENT}66` }
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="oxyone-pagination">
              <span className="oxyone-pagination-info">
                Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, visible.length)} of{" "}
                {visible.length}
              </span>
              {pageCount > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="page-btn"
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                  >
                    Prev
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pageCount || Math.abs(p - current) <= 1)
                    .map((p, i, arr) => (
                      <Fragment key={p}>
                        {i > 0 && p - arr[i - 1] > 1 && <span className="page-ellipsis">…</span>}
                        <button
                          type="button"
                          className={`page-btn ${p === current ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      </Fragment>
                    ))}
                  <button
                    type="button"
                    className="page-btn"
                    disabled={current === pageCount}
                    onClick={() => setPage(current + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Clicking View opens that row's students in a popup instead of expanding the table */}
      <Modal
        open={openGroup != null}
        onCancel={() => setExpanded(null)}
        footer={null}
        width={1000}
        centered
        destroyOnHidden
      >
        {openGroup && <StudentsPanel group={openGroup} />}
      </Modal>
    </div>
  );
}
