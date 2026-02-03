import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Input, Spin, message, Empty, Tag } from "antd";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import AgentsAdminLayout from "../components/AgentsAdminLayout";

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
      render: (id) => (
        <Tag color="#008cba" style={{ fontWeight: 500 }}>
          {id ? `#${id.slice(-4)}` : "-"}
        </Tag>
      ),
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
      align: "center",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#333" }}>{text || "-"}</span>
      ),
    },
    {
      title: "Creator Name",
      dataIndex: "creatorName",
      key: "creatorName",
      width: 200,
      align: "center",
      render: (text) => (
        <Tag
          color="success"
          style={{
            display: "inline-block",
            whiteSpace: "normal",
            wordBreak: "break-word",
            textAlign: "center",
            lineHeight: "1.4",
            padding: "4px 8px",
            fontSize: 13,
            borderRadius: 6,
            maxWidth: 180, // ensures wrapping stays inside width
          }}
        >
          {text || "-"}
        </Tag>
      ),
    },

    // {
    //   title: "User Messages",
    //   key: "chatList",
    //   align: "left",
    //   render: (_text, record) => {
    //     const chats = record.agentChatListList || [];
    //     const userMessages = [];

    //     chats.forEach((chat) => {
    //       try {
    //         const prompt = chat.prompt || "";
    //         const regex = /\{\s*role=user,\s*content=([^}]+)\}/g;
    //         let match;
    //         while ((match = regex.exec(prompt)) !== null) {
    //           const content = match[1].trim();
    //           if (content) userMessages.push(content);
    //         }
    //       } catch (error) {
    //         console.error("Error parsing prompt:", error);
    //       }
    //     });

    //     if (userMessages.length === 0)
    //       return <span style={{ color: "#999" }}>No user messages</span>;

    //     return (
    //       <div
    //         style={{
    //           maxHeight: 180,
    //           overflowY: "auto",
    //           backgroundColor: "#f9f9f9",
    //           borderRadius: 6,
    //           padding: "8px 10px",
    //           boxShadow: "inset 0 0 3px rgba(0,0,0,0.08)",
    //         }}
    //       >
    //         {userMessages.map((content, idx) => (
    //           <div
    //             key={idx}
    //             style={{
    //               borderBottom:
    //                 idx < userMessages.length - 1 ? "1px solid #eee" : "none",
    //               padding: "6px 0",
    //               fontSize: 13,
    //               color: "#333",
    //               lineHeight: 1.4,
    //             }}
    //           >
    //             {content}
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "User Messages",
      key: "chatList",
      align: "left",
      render: (_text, record) => {
        const chats = record.agentChatListList || [];
        const userMessages = [];

        chats.forEach((chat) => {
          try {
            const prompt = chat.prompt || "";
            const regex = /\{\s*role=user,\s*content=([^}]+)\}/g;
            let match;
            while ((match = regex.exec(prompt)) !== null) {
              const content = match[1].trim();
              if (content) {
                userMessages.push({
                  message: content,
                  userId: chat.userId || "-", // attach userId with each message
                });
              }
            }
          } catch (error) {
            console.error("Error parsing prompt:", error);
          }
        });

        if (userMessages.length === 0)
          return <span style={{ color: "#999" }}>No user messages</span>;

        return (
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
              borderRadius: 6,
              padding: "8px 10px",
              boxShadow: "inset 0 0 3px rgba(0,0,0,0.08)",
            }}
          >
            {userMessages.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom:
                    idx < userMessages.length - 1 ? "1px solid #eee" : "none",
                  padding: "8px 0",
                  fontSize: 13,
                  color: "#333",
                  lineHeight: 1.4,
                }}
              >
                {/* User ID Display */}
                <div
                  style={{
                    fontSize: 12,
                    color: "#008cba",
                    fontWeight: 500,
                    marginBottom: 3,
                    wordBreak: "break-word",
                  }}
                >
                  User ID:{" "}
                  <span style={{ color: "#555", fontWeight: 400 }}>
                    {item.userId}
                  </span>
                </div>

                {/* User Message */}
                <div style={{ wordBreak: "break-word" }}>{item.message}</div>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <AgentsAdminLayout>
      <div style={{ padding: 20, minHeight: "100vh" }}>
        <Card
          title={
            <span style={{ fontSize: 18, fontWeight: 600, color: "#333" }}>
              User Chat History (Admin View)
            </span>
          }
          extra={
            <Input.Search
              placeholder="Search by Agent Name, ID, or Creator"
              allowClear
              enterButton="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(val) => setSearchText(val)}
              style={{
                width: 350,
                borderRadius: 8,
                overflow: "hidden",
              }}
              className="custom-search"
            />
          }
          bordered={false}
          style={{
            borderRadius: 10,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            background: "#fff",
          }}
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
              <Spin size="medium" />
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
              style={{
                borderRadius: 10,
                overflow: "hidden",
              }}
            />
          )}
        </Card>

        <style>
          {`
            .ant-input-search-button {
              background-color: #008cba !important;
              border-color: #008cba !important;
              color: #fff !important;
              font-weight: 500;
            }
            .ant-input-search-button:hover {
              background-color: #0078a3 !important;
              border-color: #0078a3 !important;
            }
            .ant-card-head {
              background: #f8fbfd !important;
              border-bottom: 1px solid #e8e8e8;
            }
          
          `}
        </style>
      </div>
    </AgentsAdminLayout>
  );
};

export default UserHistoryAdmin;
