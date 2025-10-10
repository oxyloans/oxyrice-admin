
import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, message, Table, Input, Button } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import { SearchOutlined } from "@ant-design/icons";

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
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        size: size.toString(),
      });
      if (search) {
        params.append("agentName", search.trim());
      }

      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/getAllConversations?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.content) {
        // Reverse data to show latest first
        const reversedData = [...res.data.content].reverse();
        setData(reversedData);
        setPagination((prev) => ({
          ...prev,
          total: res.data.totalElements || res.data.content.length,
        }));
      } else {
        setData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(pagination.current - 1, pagination.pageSize, searchText);
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchText(trimmedValue);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchConversations(0, pagination.pageSize, trimmedValue);
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

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
        {/* Header */}
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
              enterButton={
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#008cba",
                    borderColor: "#008cba",
                    color: "#fff",
                  }}
                  icon={<SearchOutlined />}
                />
              }
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
            pageSizeOptions: ["100", "500", "1000", "2000"],
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
