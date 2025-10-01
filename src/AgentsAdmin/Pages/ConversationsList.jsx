"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, Spin, message, Table, Input } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Title } = Typography;
const { Search } = Input;

const ConversationsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const token = localStorage.getItem("token");

  const fetchConversations = async (
    pageNumber = 0,
    size = 100,
    search = ""
  ) => {
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
        setPagination((prev) => ({
          ...prev,
          total: res.data.totalElements,
        }));
      }
    } catch (err) {
      message.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(pagination.current - 1, pagination.pageSize, searchText);
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "sno",
        align: "center",
        render: (_text, _record, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
        width: 80,
      },
      {
        title: "Agent Name",
        dataIndex: "agentName",
        key: "agentName",
        align: "center",
        render: (text) => text || "-",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
        render: (text) => (
          <div
            style={{
              maxWidth: 400,
              textAlign: "center",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {text || "No description available"}
          </div>
        ),
      },
      {
        title: "Starter 1",
        dataIndex: "conStarter1",
        key: "conStarter1",
        align: "center",
        render: (text) => text || "-",
      },
      {
        title: "Starter 2",
        dataIndex: "conStarter2",
        key: "conStarter2",
        align: "center",
        render: (text) => text || "-",
      },
      {
        title: "Starter 3",
        dataIndex: "conStarter3",
        key: "conStarter3",
        align: "center",
        render: (text) => text || "-",
      },
      {
        title: "Starter 4",
        dataIndex: "conStarter4",
        key: "conStarter4",
        align: "center",
        render: (text) => text || "-",
      },
    ],
    [pagination.current, pagination.pageSize]
  );

  return (
    <AgentsAdminLayout>
      <div style={{ padding: "24px" }}>
        {/* Header Row */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
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
              style={{ width: 260 }}
              enterButton
            />
          </Col>
        </Row>

        <Table
          rowKey={(record) =>
            record.agentId || Math.random().toString(36).slice(2)
          }
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["500", "1000", "2000", "3000"],
          }}
          onChange={handleTableChange}
          bordered
          scroll={{ x: true }}
          locale={{
            emptyText: (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <Typography.Text type="secondary">
                  No conversations found.
                </Typography.Text>
              </div>
            ),
          }}
        />
      </div>
    </AgentsAdminLayout>
  );
};

export default ConversationsList;
