import ActorUsersPage from "../components/ActorUsersPage";
import { actorSource } from "./actorsData";

// API is configured in actorsData.js (shared with the Actors dashboard).
const { entityPlural, fetchRows } = actorSource("activeAdvocates");

export default function ActiveAdvocates() {
  return <ActorUsersPage entityPlural={entityPlural} fetchRows={fetchRows} />;
}
