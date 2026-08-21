import QueriesStatusPage from "../components/QueriesStatusPage";

export default function QueriesOxyBricks() {
  return (
    <QueriesStatusPage
      projectType="OXYBRICKS"
      endpoint="https://meta.oxyloans.com/api/write-to-us/student/getQueries1"
      apiKey="oxybricks@123456"
    />
  );
}
