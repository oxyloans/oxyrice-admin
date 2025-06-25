import React, { useEffect, useState } from "react";
import { Table, message, Spin } from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";
const ServiceList = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch agreements
  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getAllAgreements`
      );
      setAgreements(response.data);
    } catch (error) {
      message.error("Failed to fetch agreements");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // Define table columns
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
    // {
    //   title: "Category ID (Last 4)",
    //   dataIndex: "caCsEntityId",
    //   align: "center",
    //   render: (id) => `#${id?.slice(-4)}`,
    // },
  ];

    return (
      <AdminPanelLayoutTest>
        <div className="p-4">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h2 className="text-xl font-bold mb-2 md:mb-0">
              Service List
            </h2>
           
          </div>

          {loading ? (
            <Spin className="text-center" tip="Loading..." />
          ) : (
            <Table
              dataSource={agreements}
              rowKey="id"
              columns={columns}
              bordered
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </div>
      </AdminPanelLayoutTest>
    );
};

export default ServiceList;
