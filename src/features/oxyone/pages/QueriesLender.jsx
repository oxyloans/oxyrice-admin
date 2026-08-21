import QueriesStatusPage from "../components/QueriesStatusPage";

const ENDPOINT =
  "https://fintech.oxyloans.com/oxyloans/v1/user/queryDetailsBasedOnPrimaryType1";
const API_KEY = "oxy_contact_ff0ccf7744c64875af1de19c54650a17";

// Internal PENDING/COMPLETED/CANCELLED tab keys -> the status values this API expects.
const STATUS_VALUE = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// This API returns receivedOn/respondedOn as "DD-MM-YYYY HH:mm:ss", but
// QueriesStatusPage's date parser expects "YYYY-MM-DD HH:mm:ss" (ISO-ish).
// Reformat here rather than touching the shared parser used by every other
// query source.
function toIsoDate(value) {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}:\d{2}:\d{2})$/.exec(value || "");
  return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}` : value;
}

// Maps this endpoint's field names onto the shape QueriesStatusPage expects
// (randomTicketId / queryStatus / createdAt / resolvedOn).
function normalizeLenderQueryRow(row) {
  return {
    ...row,
    randomTicketId: row.ticketId,
    queryStatus: String(row.status || "").toUpperCase(),
    createdAt: toIsoDate(row.receivedOn),
    resolvedOn: toIsoDate(row.respondedOn),
  };
}

export default function QueriesLender() {
  return (
    <QueriesStatusPage
      projectType="LENDER"
      endpoint={ENDPOINT}
      apiKey={API_KEY}
      paginated
      buildRequestBody={(status, pageNo, pageSize) => ({
        pageNo,
        pageSize,
        status: STATUS_VALUE[status] || status,
        primaryType: "LENDER",
      })}
      extractRows={(data) =>
        Array.isArray(data?.listOfUserQueryDetailsResponseDto)
          ? data.listOfUserQueryDetailsResponseDto
          : Array.isArray(data)
            ? data
            : []
      }
      normalizeRow={normalizeLenderQueryRow}
    />
  );
}
