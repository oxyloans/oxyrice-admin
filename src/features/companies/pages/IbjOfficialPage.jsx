import React from "react";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import IbjIibsFdSalesTable from "./IbjIibsFdSalesTable";

const IbjOfficialPage = () => {
  return (
    <CompaniesLayout>
      <IbjIibsFdSalesTable
        title="IBJ Official Dashboard"
        apiUrl={`${BASE_URL}/ai-service/agent/ibjOffical`}
      />
    </CompaniesLayout>
  );
};

export default IbjOfficialPage;
