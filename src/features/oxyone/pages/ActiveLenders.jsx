import ActorUsersPage from "../components/ActorUsersPage";
import { actorSource } from "./actorsData";

// API is configured in actorsData.js (shared with the Actors dashboard).
const { entityPlural, fetchRows } = actorSource("activeLenders");

// activeLendersList rows carry participation info but no address.
const EXTRA_COLUMNS = [
  {
    title: "Participation Amount",
    dataIndex: "totalParticipationAmount",
    width: 150,
    align: "right",
    render: (v) =>
      v != null ? (
        <span className="text-xs font-bold text-emerald-700">
          ₹{Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    title: "First Participation",
    dataIndex: "firstParticipationDate",
    width: 140,
    align: "center",
    render: (v) =>
      v ? (
        <div className="text-center">
          <div className="text-xs font-bold text-slate-800">{v.slice(0, 10)}</div>
          <div className="text-[11px] text-slate-600 font-bold mt-0.5">{v.slice(11, 16)}</div>
        </div>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
];

const HIDE_COLUMNS = ["Address"];

export default function ActiveLenders() {
  return (
    <ActorUsersPage
      entityPlural={entityPlural}
      fetchRows={fetchRows}
      extraColumns={EXTRA_COLUMNS}
      hideColumns={HIDE_COLUMNS}
    />
  );
}
