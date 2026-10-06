import OxyLoansContactsPage from "../components/OxyLoansContactsPage";
import { OXYLOANS_CONTACT_URLS } from "../util/oxyloansContacts";

export default function OxyLoansBorrower() {
  return <OxyLoansContactsPage url={OXYLOANS_CONTACT_URLS.borrower} label="Borrower" plural="borrowers" />;
}
