"use client";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  message,
  Pagination,
  Input,
} from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const ConversationsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");

  const token = localStorage.getItem("token");

  const fetchConversations = async (pageNumber = 0, size = 10, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllConversations?page=${pageNumber}&size=${size}${
          search ? `&agentName=${encodeURIComponent(search)}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.content) {
        setData(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch (err) {
      message.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(page, pageSize, searchText);
  }, [page, pageSize, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
    setPage(0); // reset to first page when searching
  };

  return (
    <AgentsAdminLayout>
      <div style={{ padding: "20px" }}>
        {/* Header Row */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Agent Conversations
            </Title>
          </Col>
          <Col>
            <Search
              placeholder="Search by Agent Name"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="medium" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.agentId}>
                <Card
                  title={item.agentName}
                  bordered={true}
                  hoverable
                  style={{ borderRadius: "8px", minHeight: "250px" }}
                >
                  <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                    {item.description}
                  </Paragraph>
                  <div style={{ marginTop: "10px" }}>
                    <Text strong>Starter 1: </Text>
                    <Text>{item.conStarter1}</Text>
                    <br />
                    <Text strong>Starter 2: </Text>
                    <Text>{item.conStarter2}</Text>
                    <br />
                    <Text strong>Starter 3: </Text>
                    <Text>{item.conStarter3}</Text>
                    <br />
                    <Text strong>Starter 4: </Text>
                    <Text>{item.conStarter4}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Pagination
            current={page + 1}
            pageSize={pageSize}
            total={total}
            onChange={(p, size) => {
              setPage(p - 1);
              setPageSize(size);
            }}
            showSizeChanger
          />
        </div>
      </div>
    </AgentsAdminLayout>
  );
};

export default ConversationsList;
