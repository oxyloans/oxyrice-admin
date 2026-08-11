import { Button, Tooltip } from "antd";
import dayjs from "dayjs";

/* Shared "Action" column — opens the HelpDesk comments modal for a row. */
export function actionColumn(openCommentsModal, { width = 90, readOnly = false } = {}) {
  return {
    title: "Action", width, align: "center",
    render: (_, record) => (
      <Button
        size="small"
        onClick={() => openCommentsModal(record)}
        style={{ borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid #cbd5e1", color: "#334155" }}
      >
        {readOnly ? "View" : "Comments"}
      </Button>
    ),
  };
}

/* Shared "Updated Comments" column — previews the latest cached comment for a row. */
export function updatedCommentsColumn(rowComments, openCommentsModal, { width = 280, readOnly = false } = {}) {
  return {
    title: "Updated Comments", width,
    render: (_, record) => {
      const uid = record.userId;
      const state = rowComments[uid];

      if (!uid) return <span className="text-slate-300">—</span>;

      // ── Loading skeleton ──
      if (state === undefined) {
        return (
          <div className="flex flex-col gap-1.5 py-1.5">
            <div className="h-2.5 w-24 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-2.5 w-40 rounded-full bg-slate-100 animate-pulse" />
          </div>
        );
      }

      // ── No comments yet ──
      if (!state) {
        return (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-300 italic">No comments yet</span>
            {!readOnly && (
              <button onClick={() => openCommentsModal(record)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
                Add
              </button>
            )}
          </div>
        );
      }

      const created = state.commentsCreatedDate ? dayjs(state.commentsCreatedDate) : null;
      const dateLabel = created
        ? created.isSame(dayjs(), "day")
          ? `Today ${created.format("HH:mm")}`
          : created.isSame(dayjs().subtract(1, "day"), "day")
            ? `Yesterday ${created.format("HH:mm")}`
            : created.format("DD MMM, HH:mm")
        : "—";
      const isAdmin = (state.commentsUpdateBy || "").toUpperCase() === "ADMIN";

      return (
        <div className="flex flex-col gap-1.5 py-1.5">
          {/* Caller + status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-5 h-5 rounded-full grid place-items-center text-[9px] font-black text-white flex-shrink-0 ${isAdmin ? "bg-purple-500" : "bg-emerald-500"}`}>
                {(state.commentsUpdateBy || "?")[0].toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-slate-700 truncate max-w-[110px]">{state.commentsUpdateBy || "Unknown"}</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black flex-shrink-0 ${state.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {state.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          {/* Comment text */}
          <Tooltip title={state.adminComments || "No comment text"}>
            <div className="text-xs text-slate-600 leading-snug line-clamp-2">
              {state.adminComments || <span className="text-slate-300 italic">No comment text</span>}
            </div>
          </Tooltip>

          {/* Meta chips + change link (single line, chips truncate before wrapping) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              {state.customerBehaviour && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold whitespace-nowrap flex-shrink-0">{state.customerBehaviour}</span>
              )}
              {state.callingType && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold whitespace-nowrap flex-shrink-0">{state.callingType}</span>
              )}
              <span className="text-[10px] text-slate-400 whitespace-nowrap truncate">{dateLabel}</span>
            </div>
            <button onClick={() => openCommentsModal(record)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer p-0 flex-shrink-0 ml-auto">
              {readOnly ? "View" : "Change"}
            </button>
          </div>
        </div>
      );
    },
  };
}
