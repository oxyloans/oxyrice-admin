import OxyLoansContactsPage from "../components/OxyLoansContactsPage";
import { OXYLOANS_CONTACT_URLS } from "../util/oxyloansContacts";

export default function OxyLoansLender() {
  return <OxyLoansContactsPage url={OXYLOANS_CONTACT_URLS.lender} label="Lender" plural="lenders" />;
}
