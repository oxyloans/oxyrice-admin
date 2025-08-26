import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button, Input, Row, Col } from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

const { Search } = Input;

const ApprovedAmountList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from API
  const fetchApprovedAmounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/approvedAmountCustomers`,
        { headers: { accept: "*/*" } }
      );
      setData(response.data || []);
      setFilteredData(response.data || []); // keep backup for search
    } catch (error) {
      console.error("Error fetching approved amounts:", error);
      message.error("Failed to fetch approved amounts");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchApprovedAmounts();
  }, []);

  // Search handler
  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = data.filter((item) =>
      item.customerName.toLowerCase().includes(searchValue)
    );
    setFilteredData(filtered);
  };

  // Table columns
  const columns = [
    {
      title: "S.No",
      key: "index",
      align: "center",
      render: (text, record, index) => index + 1,
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color: status?.toUpperCase() === "APPROVED" ? "green" : "orange",
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
      key: "amount",
      align:"center",
      render: (amount) => `₹ ${amount.toLocaleString()}`,
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 20 }}>
        {/* Header Row with Title (Left) & Button + Search (Right) */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <h1 className="font-bold"  style={{ margin: 0 }}>
              Approved Amount for Customers
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
              <Button type="primary" onClick={fetchApprovedAmounts}>
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

export default ApprovedAmountList;
