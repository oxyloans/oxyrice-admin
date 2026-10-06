import axios from "axios";
import { regDayKey } from "../util/registrationDates";

// OxyLoans fintech API
const OXYLOANS_API_KEY = "oxy_contact_ff0ccf7744c64875af1de19c54650a17";
const OXYLOANS_LENDER_URL =
  "https://fintech.oxyloans.com/oxyloans/v1/user/admin/lenderContactList";

const postOxyLoans = (url, pageSize) =>
  axios
    .post(url, { pageNo: 1, pageSize }, { headers: { "X-Api-Key": OXYLOANS_API_KEY } })
    .then((res) => res.data ?? {});

// activeLendersList is paged by the same pageSize as listOfData, so read the
// count with a tiny request first, then fetch exactly that many.
async function fetchActiveLenders() {
  const first = await postOxyLoans(OXYLOANS_LENDER_URL, 1);
  const count = Number(first.activeLendersCount) || 0;
  if (count <= 1) return Array.isArray(first.activeLendersList) ? first.activeLendersList : [];
  const all = await postOxyLoans(OXYLOANS_LENDER_URL, count);
  return Array.isArray(all.activeLendersList) ? all.activeLendersList : [];
}

// Single source for the OXYONE 5 Actors. Both the dedicated Active* pages and
// ActorsDashboard read from here, so wiring an API in one place updates both.
//
// TODO: wire the remaining APIs — set `fetchRows` to an async function
// returning the raw rows array (see fetchActiveLenders above).
export const ACTOR_SOURCES = [
  { key: "activeLenders", entityPlural: "Active Lenders", color: "#2563eb", fetchRows: fetchActiveLenders },
  // Hidden until their APIs are wired — uncomment together with their nav
  // entries in config.jsx and routes in routesConfig.js.
  // { key: "activeBorrowers", entityPlural: "Active Borrowers", color: "#7c3aed", fetchRows: undefined },
  // { key: "activeAdvocates", entityPlural: "Active Advocates", color: "#6d28d9", fetchRows: undefined },
  // { key: "activePartners", entityPlural: "Active Partners", color: "#059669", fetchRows: undefined },
  // { key: "activeRecoveryAgents", entityPlural: "Active Recovery Agents", color: "#e11d48", fetchRows: undefined },
];

export const actorSource = (key) => ACTOR_SOURCES.find((s) => s.key === key);

// Local registration day off a raw row (field name may differ per API; the
// API sends UTC timestamps).
export const actorRowDate = (r) =>
  regDayKey(r?.registeredDate || r?.registrationDate || r?.createdAt || r?.created_at);
