import React, { useEffect, useState } from "react";
import { Table, message, Input, Row, Col, Select } from "antd";
import AdminPanelLayout from "./AdminPanel.jsx";
import axios from "axios";

const { Option } = Select;

const ExchangeOrders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExchangeOrders();
  }, []);

  const fetchExchangeOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyglobal.tech/api/erice-service/order/getAllExchangeOrder",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setData(response.data);
      setFilteredData(response.data);
      message.success("Exchange orders fetched successfully.");
    } catch (error) {
      message.error("Error fetching exchange orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredData(
      data.filter(
        (item) =>
          item.orderId?.toLowerCase().includes(value) ||
          item.userName?.toLowerCase().includes(value) ||
          item.mobileNumber?.toLowerCase().includes(value)
      )
    );
  };

  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "S.NO",
      render: (_, __, index) => index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    { title: "Order ID", dataIndex: "orderId", align: "center" },
    { title: "User Name", dataIndex: "userName", align: "center" },
    {
      title: "Exchange Request Date",
      dataIndex: "exchangeRequestDate",
      align: "center",
    },
    { title: "Days Difference", dataIndex: "daysDifference", align: "center" },
    { title: "Mobile Number", dataIndex: "mobileNumber", align: "center" },
    { title: "Reason", dataIndex: "reason", align: "center" },
  ];

  return (
    <AdminPanelLayout>
      <div>
        <Row justify="space-between" className="mb-4">
          <Col>
            <h2 className="text-xl font-bold mb-2 sm:mb-0">
              Exchange Order List{" "}
            </h2>
          </Col>
          {/* <Col>
          <Input
            placeholder="Search by Order ID, User Name, or Mobile Number"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }}
          />
        </Col> */}
        </Row>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            Show{" "}
            <Select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              style={{ width: 70 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
            </Select>{" "}
            entries
          </Col>

          <Col>
            Search:{" "}
            <Input
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: 150 }}
            />
          </Col>
        </Row>
        <Table
          dataSource={filteredData.slice(
            (currentPage - 1) * entriesPerPage,
            currentPage * entriesPerPage
          )}
          columns={columns}
          rowKey="orderId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: entriesPerPage,
            total: filteredData.length,
            onChange: setCurrentPage,
          }}
          scroll={{ x: "100%" }}
          bordered
        />
      </div>
    </AdminPanelLayout>
  );
};

export default ExchangeOrders;
