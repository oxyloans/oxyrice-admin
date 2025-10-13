import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Input, Spin, message, Empty } from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const PAGE_SIZE = 100;

const UserHistoryAdmin = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchUserHistory(page - 1, PAGE_SIZE);
  }, [page]);

  const fetchUserHistory = async (pageNumber, size) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/ai-service/agent/getShowingUserHistoryToAdmin?page=${pageNumber}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const content = res?.data?.content || [];
      setData(content);
      setTotalCount(res?.data?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching user history:", error);
      message.error("Failed to fetch user history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side search
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.agentName?.toLowerCase().includes(q) ||
        item.creatorName?.toLowerCase().includes(q) ||
        item.agentId?.toLowerCase().includes(q)
    );
  }, [data, searchText]);

  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
      width: 70,
      fixed: "left",
      render: (_text, _record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Agent ID",
      dataIndex: "agentId",
      key: "agentId",
      align: "center",
      render: (id) => <span title={id}>{id ? `#${id.slice(-4)}` : "-"}</span>,
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
      align: "center",
      render: (text) => <span title={text}>{text || "-"}</span>,
    },

    {
      title: "Creator Name",
      dataIndex: "creatorName",
      key: "creatorName",
      align: "center",
      render: (text) => <span title={text}>{text || "-"}</span>,
    },

    {
      title: "User Messages",
      key: "chatList",
      align: "left",
      render: (_text, record) => {
        const chats = record.agentChatListList || [];

        // Extract only role=user messages
        const userMessages = [];

        chats.forEach((chat) => {
          try {
            const prompt = chat.prompt || "";
            // Match all {role=user, content=...} patterns in the prompt string
            const regex = /\{\s*role=user,\s*content=([^}]+)\}/g;
            let match;

            while ((match = regex.exec(prompt)) !== null) {
              const content = match[1].trim();
              if (content) {
                userMessages.push(content);
              }
            }
          } catch (error) {
            console.error("Error parsing prompt:", error);
          }
        });

        if (userMessages.length === 0) return <span>-</span>;

        return (
          <div
            style={{
              maxHeight: 160,
              overflowY: "auto",
              padding: "6px 8px",
              backgroundColor: "#fafafa",
              borderRadius: 6,
            }}
          >
            {userMessages.map((content, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom:
                    idx < userMessages.length - 1 ? "1px solid #eee" : "none",
                  padding: "6px 0",
                  fontSize: 13,
                  color: "#333",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: 20 }}>
        <Card
          title="User Chat History (Admin View)"
          extra={
            <Input.Search
              placeholder="Search by Agent Name, ID, or Creator"
              allowClear
              enterButton
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(val) => setSearchText(val)}
              style={{ width: 350 }}
            />
          }
          bordered={false}
        >
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
              locale={{ emptyText: <Empty description="No records found" /> }}
              dataSource={filteredData}
              columns={columns}
              rowKey={(row) => row.agentId || Math.random()}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total: totalCount,
                onChange: (p) => setPage(p),
                showTotal: (total) => `Total ${total} records`,
              }}
              bordered
              scroll={{ x: true }}
            />
          )}
        </Card>
      </div>
    </AgentsAdminLayout>
  );
};

export default UserHistoryAdmin;
