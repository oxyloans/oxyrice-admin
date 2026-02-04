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
  Card,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import AgentsAdminLayout from "../components/AgentsAdminLayout";
import BASE_URL from "../../../core/config/Config";

const { Search } = Input;
const { Title, Text } = Typography;

const AgentsCreatrionUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();

  // Fetch all agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/ai-service/agent/agentedCreatedUsersDetails`,
        {
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
  let result = data;

  // ✅ Show only records with testuser === false
  result = result.filter((item) => item.testuser === false);

  // ✅ Apply search filter (if text entered)
  if (searchText) {
    result = result.filter(
      (item) =>
        item.mobile_number?.includes(searchText) ||
        item.whatsapp_number?.includes(searchText)
    );
  }

  return result;
}, [data, searchText]);

const handleDownloadExcel = () => {
  if (filteredData.length === 0) {
    message.warning("No data available to download");
    return;
  }

  // Flatten and format all user + agent details
  const exportData = filteredData.flatMap((user, index) => {
    if (user.agentDetails && user.agentDetails.length > 0) {
      return user.agentDetails.map((agent, agentIndex) => ({
        "S.No": `${index + 1}.${agentIndex + 1}`,
        "User ID": user.user_id || "N/A",
        "User Name": user.user_name || "N/A",
        Email: user.email || "N/A",
        "Mobile Number": user.mobile_number || "N/A",
        "WhatsApp Number": user.whatsapp_number || "N/A",
        "Agent ID": agent.id || "N/A",
        "Agent Name": agent.agent_name || "N/A",
        "Assistance ID": agent.assistance_id || "N/A",
        "Agent Created Date": agent.created_at
          ? new Date(agent.created_at).toLocaleString()
          : "N/A",
      }));
    } else {
      // No agents case
      return [
        {
          "S.No": index + 1,
          "User ID": user.user_id || "N/A",
          "User Name": user.user_name || "N/A",
          Email: user.email || "N/A",
          "Mobile Number": user.mobile_number || "N/A",
          "WhatsApp Number": user.whatsapp_number || "N/A",
          "Agent ID": "N/A",
          "Agent Name": "No Agents",
          "Assistance ID": "N/A",
          "Agent Created Date": "N/A",
        },
      ];
    }
  });

  // Convert to Excel sheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Agents Created Users");

  // Download Excel file
  XLSX.writeFile(workbook, "Agents_Created_Users_All_Details.xlsx");
  message.success("Excel file downloaded successfully with all details!");
};


  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",
      width: 80,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "User ID",
      dataIndex: "user_id",
      key: "user_id",
      align: "center",
      render: (text) =>
        text ? (
          <Tag color="#008cba" style={{ fontWeight: 500 }}>
            {text.slice(-4)}
          </Tag>
        ) : (
          "-"
        ),
    },
  {
  title: "User Details",
  key: "user_details",
  align: "center",
  render: (_, record) => (
    <div
      style={{
        backgroundColor: "#f9f9f9",
      
        textAlign: "left",
        borderRadius: 8,
        padding: "10px 12px",
        display: "inline-block",
        width: "100%",
      }}
    >
      <div style={{ fontWeight: 600, color: "#351664", fontSize: 15 }}>
        {record.user_name || "N/A"}
      </div>
      <div style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>
        Email:{" "}
        <span style={{ color: "#1ab394", fontWeight: 500 }}>
          {record.email || "N/A"}
        </span>
      </div>
      <div style={{ color: "#555", fontSize: 13, marginBottom: 4 ,}}>
        Mobile:{" "}
        <Tag color="#1ab394" style={{ fontWeight: 500 }}>
          {record.mobile_number || "N/A"}
        </Tag>
      </div>
      <div style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>
        WhatsApp:{" "}
        <Tag color="#008cba" style={{ fontWeight: 500 }}>
          {record.whatsapp_number || "N/A"}
        </Tag>
      </div>
    </div>
  ),
}
    ,
    {
      title: "Agent Details",
      key: "agentDetails",
      align: "center",
      render: (_, record) => {
        if (!record.agentDetails || record.agentDetails.length === 0)
          return <Text type="secondary">No Agents</Text>;

        return (
          <div style={{ textAlign: "left" }}>
            {record.agentDetails.map((agent, idx) => (
              <Card
                key={idx}
                size="small"
                style={{
                  marginBottom: 8,
                  backgroundColor: "#f9f9f9",
                 
                }}
              >
                <div style={{ fontWeight: 600, color: "#008cba" }}>
                  {agent.agent_name}
                </div>
                <div style={{ color: "#555", fontSize: 13 }}>
                  Created:{" "}
                  <span style={{ color: "#1ab394", fontWeight: 500 }}>
                    {new Date(agent.created_at).toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <AgentsAdminLayout>
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 20 }}
      >
        <Col xs={24} sm={12}>
          <Title
            level={4}
            style={{
              marginBottom: 0,
              color: "#351664",
              fontWeight: "bold",
            }}
          >
            Agents Creation Users
          </Title>
        </Col>

        <Col
          xs={24}
          sm={12}
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
            style={{ width: 230 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAgents}
            loading={loading}
            style={{
              backgroundColor: "#008cba",
              color: "#fff",
              borderColor: "#008cba",
            }}
          >
            Refresh
          </Button>
          {/* <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcel}
            style={{
              backgroundColor: "#1ab394",
              borderColor: "#1ab394",
              color: "#fff",
            }}
          >
            Download
          </Button> */}
        </Col>
      </Row>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(r) => r.user_id}
          loading={loading}
          bordered
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{x:"true"}}
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentsCreatrionUsers;
