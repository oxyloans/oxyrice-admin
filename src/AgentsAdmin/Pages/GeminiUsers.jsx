import React, { useEffect, useState } from "react";
import {
  Table,
  Image,
  Spin,
  Input,
  Row,
  Col,
  message,
  Button,
  Tag,
} from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const GeminiUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchData(page - 1, pageSize);
  }, [page]);

  const fetchData = async (pageNumber, size) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllGeminiUsers?page=${pageNumber}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const reversedList = (res.data.listResponse || []).reverse();
      setData(reversedList);
      setTotalCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching Gemini users:", error);
      message.error("Failed to fetch Gemini users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Toggle TestUser API
  const toggleTestUser = async (id, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(
        `${BASE_URL}/user-service/updateTestUsers`,
        {
          id: id,
          testUser: !currentStatus, // flip status
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      message.success(
        `User updated to ${!currentStatus ? "TEST USER" : "LIVE USER"}`
      );
      fetchData(page - 1, pageSize); // refresh data
    } catch (error) {
      console.error("Error updating test user:", error);
      message.error("Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Client-side filter
  const filteredData = data.filter(
    (item) =>
      item.userId?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.mobileNumber?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      render: (text, record, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      render: (id) => `#${id?.slice(-4)}`,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      align: "center",
    },
    {
      title: "Original Image",
      dataIndex: "orginalImage",
      key: "orginalImage",
      align: "center",
      render: (url) => <Image width={80} src={url} />,
    },
    {
      title: "Processed Image",
      dataIndex: "processedImage",
      key: "processedImage",
      align: "center",
      render: (url) => <Image width={80} src={url} />,
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      align: "center",
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      align: "center",
    },
    
    // {
    //   title: "Action",
    //   key: "action",
    //   align: "center",
    //   render: (record) => (
    //     <Button
    //       style={{
    //         backgroundColor: "#008CBA",
    //         color: "white",
    //         border: "none",
    //       }}
    //       onClick={() => toggleTestUser(record.userId, record.testUser)}
    //     >
    //       {record.testUser ? "Set Live" : "Set Test"}
    //     </Button>
    //   ),
    // },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: 20 }}>
        {/* 🔝 Heading + Search */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <h1 style={{ margin: 0, fontWeight: "bold", fontSize: "20px" }}>
              Og Registered Users
            </h1>
          </Col>
          <Col>
            <Input.Search
              placeholder="Search by User ID / Mobile Number"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
          </Col>
        </Row>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <Spin size="medium" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="userId"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalCount,
              onChange: (p) => setPage(p),
            }}
            bordered
            scroll={{ x: true }}
          />
        )}
      </div>
    </AgentsAdminLayout>
  );
};

export default GeminiUsers;
