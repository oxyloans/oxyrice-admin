import axios from "axios";
import React, { useState, useEffect } from "react";
import AdminPanelLayoutTest from "./AdminPanel";
// import "./Barcode.css";
import { Table, Col, Row, Select, Tag } from "antd";
import { useParams } from "react-router-dom";
import BASE_URL from "./Config";
const { Option } = Select;

const AllInforMationOfBarCode = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { itemId } = useParams();
  const [error, setError] = useState(null);
  // const [status, setStatus] = useState("GENERATED");
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0); // Added count state
  const [currentStatus, setCurrentStatus] = useState(""); // Added currentStatus state

  // const handleStatusChange = (value) => setStatus(value);

  const fetchData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);
    setError(null); // Reset the error state before making a request

    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getBarCodeInfo/${itemId}`, // Corrected string interpolation
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setData(response.data.barCodeResponse); // Get the barcode data specifically
      setCount(response.data.count); // Set the count
      setCurrentStatus(response.data.status); // Set the current status
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // If the status changes, fetchData will be called again

  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
      align: "center",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
    },
    {
      title: "Barcode Status",
      dataIndex: "barcode",
      key: "barcode",
      align: "center",
      render: (barcode) => (
        <Tag color={barcode === "active" ? "green" : "red"}>
          {barcode === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Current Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      align: "center",
    },
  ];

  return (
    <AdminPanelLayoutTest>
      {/* Display Count and Status */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <div className="card">
            <h3>Total Count</h3>
            <p>{count}</p>
          </div>
        </Col>
        {/* <Col xs={24} sm={12} md={6}>
          <div className="card">
            <h3>Status</h3>
            <p>{currentStatus}</p>
          </div>
        </Col> */}
      </Row>

      {/* <Row justify="start" align="middle" className="mb-8 gap-4">
   
        <Col xs={24} sm={12} md={6} className="flex items-center">
          <Select
            className="w-full"
            value={status}
            onChange={handleStatusChange}
            style={{
              height: "40px", 
            }}
          >
            <Option value="GENERATED">GENERATED</Option>
            <Option value="ASSIGN">ASSIGN</Option>
            <Option value="DELIVERED">DELIVERED</Option>
            <Option value="CANCELED">CANCELED</Option>
          </Select>
        </Col>

        {/* Button to Get Data */}
      {/* <Col xs={24} sm={12} md={6} className="flex items-center">
          <Button
            className="text-white w-full sm:w-auto"
            style={{
              backgroundColor: "#1AB394",
              height: "40px", 
            }}
            onClick={fetchData}
            loading={loading}
          >
            Get Data
          </Button>
        </Col> */}
      {/* </Row>  */}

      {/* Display Error */}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {/* Display Data in Table */}
      {!loading && data.length > 0 && (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="itemId"
          pagination={false}
          bordered
          scroll={{ x: "100%" }}
        />
      )}

      {/* No Data Message */}
      {!loading && data.length === 0 && !error && <p>No data available.</p>}
    </AdminPanelLayoutTest>
  );
};

export default AllInforMationOfBarCode;
