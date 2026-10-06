import ActorUsersPage from "../components/ActorUsersPage";
import { actorSource } from "./actorsData";

// API is configured in actorsData.js (shared with the Actors dashboard).
const { entityPlural, fetchRows } = actorSource("activePartners");

export default function ActivePartners() {
  return <ActorUsersPage entityPlural={entityPlural} fetchRows={fetchRows} />;
}
