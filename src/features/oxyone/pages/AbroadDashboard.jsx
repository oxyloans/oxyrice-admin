import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  BankOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAbroadRows, groupRows } from "./abroadData.js";

const onEnter = (fn) => (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

// Headline card: total leads, links to the full student list.
function LeadsHero({ value, loading, onClick }) {
  return (
    <div
      onClick={onClick}
      onKeyDown={onEnter(onClick)}
      role="button"
      tabIndex={0}
      className="group relative overflow-hidden rounded-2xl px-6 py-5 cursor-pointer flex flex-wrap items-center justify-between gap-4 transition-shadow hover:shadow-lg"
      style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%)",
        border: "1px solid #bae6fd",
        boxShadow: "0 2px 10px rgba(14,165,233,.08)",
      }}
    >
      <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(14,165,233,.08)" }} />
      <div className="absolute right-24 -bottom-16 w-36 h-36 rounded-full pointer-events-none" style={{ background: "rgba(124,58,237,.06)" }} />

      <div className="relative flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl grid place-items-center text-2xl flex-shrink-0" style={{ background: "#e0f2fe", color: "#0284c7" }}>
          <TeamOutlined />
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-sky-700">Total Leads</div>
          {loading ? (
            <div className="h-10 w-28 rounded-lg bg-slate-200 animate-pulse mt-1" />
          ) : (
            <div className="text-[40px] font-black text-slate-900 leading-none mt-1 tabular-nums">{value}</div>
          )}
          <div className="text-[12px] text-slate-500 mt-1.5">Abroad student records</div>
        </div>
      </div>

      <span
        className="relative inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-3 py-1.5 rounded-md"
        style={{ background: "#0284c7" }}
      >
        View
        <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

function StatCard({ label, value, hint, icon, color, loading, onClick }) {
  return (
    <div
      onClick={onClick}
      onKeyDown={onEnter(onClick)}
      role="button"
      tabIndex={0}
      className="group relative rounded-2xl bg-white p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
    >
      <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full" style={{ background: color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-500 truncate">{label}</div>
          {loading ? (
            <div className="h-9 w-16 rounded-md bg-slate-200 animate-pulse mt-1.5" />
          ) : (
            <div className="text-[32px] font-extrabold text-slate-900 leading-tight tabular-nums mt-0.5">{value}</div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl grid place-items-center text-[20px] flex-shrink-0" style={{ background: `${color}14`, color }}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[12px]">
        <span className="text-slate-400 truncate">{hint}</span>
        <span className="flex items-center gap-1 font-semibold flex-shrink-0" style={{ color }}>
          View
          <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

export default function AbroadDashboard() {
  const navigate = useNavigate();
  const { rows, loading, error, reload } = useAbroadRows();
  const firstLoad = loading && rows.length === 0;

  const consultancies = useMemo(() => groupRows(rows, "consultancy"), [rows]);
  const universities = useMemo(() => groupRows(rows, "university"), [rows]);
  const countries = useMemo(() => groupRows(rows, "country"), [rows]);
  const leadPersons = useMemo(() => groupRows(rows, "leadBy"), [rows]);
  // "Not specified" is a bucket for blank values, not a real consultancy/country.
  const namedConsultancies = consultancies.filter((g) => g.isNamed).length;
  const namedUniversities = universities.filter((g) => g.isNamed && g.isUniversity).length;
  const namedCountries = countries.filter((g) => g.isNamed).length;
  const namedLeadPersons = leadPersons.filter((g) => g.isNamed).length;

  const stats = [
    { label: "Total Consultancies", value: namedConsultancies, hint: "", icon: <ApartmentOutlined />, color: "#0ea5e9", path: "abroadConsultancies" },
    { label: "Universities", value: namedUniversities, hint: "", icon: <BankOutlined />, color: "#059669", path: "abroadUniversities" },
    { label: "Countries", value: namedCountries, hint: "", icon: <GlobalOutlined />, color: "#e11d48", path: "abroadCountries" },
    { label: "Lead Persons", value: namedLeadPersons, hint: "", icon: <UserOutlined />, color: "#7c3aed", path: "abroadLeadPersons" },
  ];

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeUp .3s ease both" }}>
      {/* ── Header ── */}
      {error && rows.length === 0 && (
        <div className="oxyone-section-card">
          <div className="oxyone-error-state">
            <span>{error}</span>
            <button type="button" className="oxyone-error-retry" onClick={reload}>
              Retry
            </button>
          </div>
        </div>
      )}

      <LeadsHero
        value={rows.length.toLocaleString()}
        loading={firstLoad}
        onClick={() => navigate("/oxyone/abroadStudentDashboard")}
      />

      {/* ── Breakdown cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.path}
            label={s.label}
            value={s.value.toLocaleString()}
            hint={s.hint}
            icon={s.icon}
            color={s.color}
            loading={firstLoad}
            onClick={() => navigate(`/oxyone/${s.path}`)}
          />
        ))}
      </div>
    </div>
  );
}
