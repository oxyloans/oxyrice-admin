import ActorUsersPage from "../components/ActorUsersPage";
import { actorSource } from "./actorsData";

// API is configured in actorsData.js (shared with the Actors dashboard).
const { entityPlural, fetchRows } = actorSource("activeRecoveryAgents");

export default function ActiveRecoveryAgents() {
  return <ActorUsersPage entityPlural={entityPlural} fetchRows={fetchRows} />;
}
