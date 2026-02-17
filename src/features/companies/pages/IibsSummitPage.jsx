import React from "react";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import IbjIibsFdSalesTable from "./IbjIibsFdSalesTable";

const IibsSummitPage = () => {
  return (
    <CompaniesLayout>
      <IbjIibsFdSalesTable
        title="IIBS Summit Dashboard"
        apiUrl={`${BASE_URL}/ai-service/agent/iibsSummit`}
      />
    </CompaniesLayout>
  );
};

export default IibsSummitPage;
