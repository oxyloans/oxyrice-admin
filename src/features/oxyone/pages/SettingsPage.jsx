import { SECTIONS } from "./config.jsx";

export default function SettingsPage() {
  const cfg = SECTIONS.settings;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[10px] grid place-items-center text-lg flex-shrink-0"
            style={{ background: cfg.color + "18", color: cfg.color }}>{cfg.icon}</div>
          <div>
            <div className="text-sm font-bold text-slate-900">{cfg.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{cfg.subtitle}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-sm text-slate-400">
        <span className="text-3xl opacity-55">🛠️</span>
        <span>Settings are coming soon.</span>
      </div>
    </div>
  );
}
