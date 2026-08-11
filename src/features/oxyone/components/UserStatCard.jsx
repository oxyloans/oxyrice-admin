import { Statistic } from "antd";

export default function UserStatCard({
  meta,
  value,
  loading,
  onClick,
  active = false,
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative h-[120px] overflow-hidden transition-all ${
        onClick
          ? "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          : ""
      }`}
      style={{
        borderRadius: 16,
        border: `${active ? 2 : 1}px solid ${active ? meta.accent : `${meta.accent}35`}`,
        background: `${meta.accent}12`,
        boxShadow: active
          ? `0 4px 14px ${meta.accent}25`
          : "0 2px 4px rgba(15,23,42,.08)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        className="absolute -right-6 -bottom-8 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `${meta.accent}0d` }}
      />
      <div className="relative z-10 h-full flex items-center gap-4 px-5">
        <div
          className="w-12 h-12 rounded-xl grid place-items-center flex-shrink-0 text-xl"
          style={{ background: `${meta.accent}12`, color: meta.accent }}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500 truncate">
            {meta.label}
          </div>
          <Statistic
            value={loading ? undefined : (value ?? 0)}
            loading={loading}
            styles={{
              content: {
                marginTop: 5,
                color: "#020617",
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
