import React, { useEffect, useState } from "react";
import { Table, Image, Spin, Input, Row, Col, Tooltip, message } from "antd";
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }

      );
      setData(res.data.listResponse || []);
      setTotalCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching Gemini users:", error);
      message.error("Failed to fetch Gemini users. Please try again later.");
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
      render: (id) => `#${id.slice(-4)}`,
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber" || "_",
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
              Agents Registered Users
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
            <Spin size="large" />
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
