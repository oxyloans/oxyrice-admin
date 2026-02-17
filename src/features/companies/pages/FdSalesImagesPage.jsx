import React from "react";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import IbjIibsFdSalesTable from "./IbjIibsFdSalesTable";
const FdSalesImagesPage = () => {
  return (
    <CompaniesLayout>
      <IbjIibsFdSalesTable
        title="FD Sales Dashboard"
        apiUrl={`${BASE_URL}/ai-service/agent/fdSalesImages`}
      />
    </CompaniesLayout>
  );
};

export default FdSalesImagesPage;
