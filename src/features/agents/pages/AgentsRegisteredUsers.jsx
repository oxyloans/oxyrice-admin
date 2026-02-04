import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Row,
  Col,
  message,
  Button,
  Tag,
  
  Typography,
  
} from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import AgentsAdminLayout from "../components/AgentsAdminLayout";
import BASE_URL from "../../../core/config/Config";

const { Search } = Input;
const { Title } = Typography;

const AgentsRegisteredUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const navigate = useNavigate();

  // Fetch all agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/user-service/getUserDataBasedOnType`,
        {
          params: { primaryType: "AGENT", registerFrom: "WEB" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      message.error("Failed to fetch agent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(
      (item) =>
        item.mobileNumber?.includes(searchText) ||
        item.whatsappNumber?.includes(searchText)
    );
  }, [data, searchText]);

  // Excel download
  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      message.warning("No data available to download");
      return;
    }

    const exportData = filteredData.map((item, index) => ({
      "S.No": index + 1,
      "User ID (Last 4 Digits)": item.userId ? item.userId.slice(-4) : "",
      "Mobile Number": item.mobileNumber || "",
      "WhatsApp Number": item.whatsappNumber || "",
      "Registered Date": item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "",
      "Register From": item.registerFrom || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registered Agents");
    XLSX.writeFile(workbook, "Registered_Agents_List.xlsx");
    message.success("Excel file downloaded successfully!");
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      align: "center",
      width: 70,
      responsive: ["sm"], // hides on xs
    },
    {
      title: "User ID (Last 4 Digits)",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      render: (text, record) =>
        text ? (
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(
                `/admin/agent-user?userId=${encodeURIComponent(record.userId)}`
              )
            }
          >
            #{text.slice(-4)}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
      render: (text) =>
        text ? (
          <Tag
            color="green"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/admin/agent-user?number=${encodeURIComponent(text)}`)
            }
          >
            {text}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsappNumber",
      key: "whatsappNumber",
      align: "center",
      render: (text) =>
        text ? (
          <Tag
            color="volcano"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/admin/agent-user?number=${encodeURIComponent(text)}`)
            }
          >
            {text}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Registered Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
      responsive: ["md"], // hides on mobile
    },
    {
      title: "Register From",
      dataIndex: "registerFrom",
      key: "registerFrom",
      align: "center",
      responsive: ["md"], // hides on small screens
    },
  ];

  return (
    <AgentsAdminLayout>
      {/* Header Section */}
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
       
      >
        <Col xs={24} sm={12} md={8}>
          <Title
            level={4}
            style={{
              marginBottom: 0,
              color: "#351664",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Registered Agents
          </Title>
        </Col>

        <Col
          xs={24}
          sm={12}
          md={16}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <Search
            placeholder="Search by Mobile / WhatsApp"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 250,
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAgents}
            loading={loading}
            style={{
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcel}
            style={{
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            }}
          >
            Download
          </Button>
        </Col>
      </Row>

      {/* Table Section */}
      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(r) => r.userId || `${r.mobileNumber}-${r.whatsappNumber}`}
          loading={loading}
          bordered
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ["50", "100", "200"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: true }}
          style={{ width: "100%" }}
        />
      </div>
    </AgentsAdminLayout>
  );

};

export default AgentsRegisteredUsers;
