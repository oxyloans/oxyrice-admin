import OxyLoansContactsPage from "../components/OxyLoansContactsPage";
import { OXYLOANS_CONTACT_URLS } from "../util/oxyloansContacts";

export default function PartnerLenderUsers() {
  return <OxyLoansContactsPage url={OXYLOANS_CONTACT_URLS.partner} label="Partner" plural="partners" />;
}
