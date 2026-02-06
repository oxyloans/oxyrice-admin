import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button, Input, Row, Col } from "antd";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import AdminPanelLayoutTest from "../components/AdminPanel";

const { Search } = Input;

const InitiatedAmountList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from API
  const fetchInitiatedAmounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/initiatedAmountForCustomers`,
        { headers: { accept: "*/*" } },
      );
      setData(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error("Error fetching initiated amounts:", error);
      message.error("Failed to fetch initiated amounts");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchInitiatedAmounts();
  }, []);

  // Search handler
  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = data.filter((item) =>
      item.customerName.toLowerCase().includes(searchValue),
    );
    setFilteredData(filtered);
  };

  // Table columns
  const columns = [
    {
      title: "S.No",
      key: "index",
      render: (text, record, index) => index + 1,
      align: "center",
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
      align: "center",
      render: (id) => `#${id.slice(-4)}`, // show only last 4 chars
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          style={{
            color: status === "INITIATED" ? "green" : "red",
            fontWeight: "500",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "center",
      key: "amount",
      render: (amount) => `₹ ${amount.toLocaleString()}`,
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 20 }}>
        {/* Header with title left, search + refresh right */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <h1 className="font-bold" style={{ margin: 0 }}>
              Initiated Amount for Customers
            </h1>
          </Col>
          <Col>
            <div style={{ display: "flex", gap: "10px" }}>
              <Search
                placeholder="Search by Customer Name"
                onSearch={handleSearch}
                allowClear
                style={{ width: 220 }}
              />
              <Button type="primary" onClick={fetchInitiatedAmounts}>
                Refresh
              </Button>
            </div>
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="customerId"
            bordered
            pagination={{ pageSize: 100 }}
          />
        )}
      </div>
    </AdminPanelLayoutTest>
  );
};

export default InitiatedAmountList;
