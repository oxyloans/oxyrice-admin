import axios from "axios";
import React, { useState, useEffect } from "react";
import AdminPanelLayoutTest from "../components/AdminPanel";
import { Table, Col, Row, Select, Tag, Button, message, Spin } from "antd";
import { useParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import BASE_URL from "../../../core/config/Config";
const { Option } = Select;

const AllInforMationOfBarCode = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { itemId } = useParams();
  const [error, setError] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");

  const fetchData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getBarCodeInfo/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setData(response.data.barCodeResponse);
      setCount(response.data.count);
      setCurrentStatus(response.data.status);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadBarcode = async (record) => {
    const accessToken = localStorage.getItem("accessToken");
    setDownloadLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/product-service/downloadSingleBarcode`,
        {
          itemId: record.itemId,
          barcodeValue: record.barcode,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        },
      );

      // Create a blob URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${record.barcode}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`Barcode ${record.barcode} downloaded successfully`);
      setDownloadLoading(false);
    } catch (error) {
      console.error("Download error:", error);
      message.error("Failed to download barcode");
      setDownloadLoading(false);
    }
  };

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
      render: (itemId) => (
        <span className="text-gray-500 font-mono text-xs">
          #{itemId?.substring(itemId.length - 4) || "N/A"}
        </span>
      ),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
    },
    {
      title: "Barcode ID",
      dataIndex: "barcode",
      key: "barcode",
      align: "center",
    },
    {
      title: "Barcode Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Current Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          style={{ backgroundColor: "#2980b9", color: "white" }}
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadBarcode(record)}
          loading={downloadLoading}
          disabled={record.status !== "active"}
        >
          Download
        </Button>
      ),
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
      </Row>

      {/* Display Error */}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {/* Display Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Spin size="medium" tip="Loading barcode information..." />
        </div>
      )}

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
