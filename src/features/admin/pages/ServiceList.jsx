import React, { useEffect, useState } from "react";
import { Table, message, Spin, Tabs } from "antd";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import AdminPanelLayoutTest from "../components/AdminPanel";

const { TabPane } = Tabs;

const ServiceList = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("CA SERVICES");

  // Fetch all agreements
  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getAllAgreements`,
      );
      setAgreements(response.data);
    } catch (error) {
      message.error("Failed to fetch agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // Mapping visible tab labels to real cacsType values
  const tabToTypeMap = {
    "CA SERVICES": "CA SERVICE",
    "CS SERVICES": "CS SERVICE",
  };

  // Filter agreements based on selected tab
  const filteredAgreements = agreements.filter(
    (item) => item.cacsType === tabToTypeMap[activeTab],
  );

  // Table column definitions
  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ID (Last 4)",
      dataIndex: "id",
      align: "center",
      render: (id) => `#${id?.slice(-4)}`,
    },
    {
      title: "Agreement Name",
      dataIndex: "agreementName",
      align: "center",
    },
    {
      title: "Category Name",
      dataIndex: "cacsName",
      align: "center",
    },

    {
      title: "Description",
      dataIndex: "agreementDescription",
      align: "center",
    },
    {
      title: "Price A",
      dataIndex: "agreementPriceA",
      align: "center",
    },
    {
      title: "Price B",
      dataIndex: "agreementPriceB",
      align: "center",
    },
    {
      title: "Price C",
      dataIndex: "agreementPriceC",
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      align: "center",
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-xl font-bold mb-2 md:mb-0">Service List</h2>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="CA SERVICES" key="CA SERVICES" />
          <TabPane tab="CS SERVICES" key="CS SERVICES" />
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin tip="Loading..." size="large" />
          </div>
        ) : (
          <Table
            dataSource={filteredAgreements}
            rowKey="id"
            columns={columns}
            bordered
            pagination={{ pageSize: 50 }}
            scroll={{ x: true }}
          />
        )}
      </div>
    </AdminPanelLayoutTest>
  );
};

export default ServiceList;
