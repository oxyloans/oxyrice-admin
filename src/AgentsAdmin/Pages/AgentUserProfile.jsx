import React, { useEffect, useMemo, useState } from "react";
import {
  Descriptions,
  Typography,
  message,
  Spin,
  Space,
  Button,
  Divider,
  Tag,
  Table,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";
import BASE_URL from "../../AdminPages/Config";

const { Title, Text } = Typography;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AgentUserProfile = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const number = query.get("number");
  const userId = query.get("userId");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const payload = useMemo(
    () => ({
      number: number || null,
      userId: userId || null,
    }),
    [number, userId]
  );

  const titleLabel = useMemo(() => {
    if (userId) return `User Details (User ID: ${userId})`;
    if (number) return `User Details (Number: ${number})`;
    return "User Details";
  }, [number, userId]);

  const fetchDetails = async (autoFetchComments = false) => {
    if (!number && !userId) {
      message.warning("Provide either a number or a userId in query params.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/user-service/getDataWithMobileOrWhatsappOrUserId`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const resp = response.data;
      if (
        resp &&
        Array.isArray(resp.activeUsersResponse) &&
        resp.activeUsersResponse.length > 0
      ) {
        const user = resp.activeUsersResponse[0];
        setData(user);

        if (autoFetchComments && user.userId) {
          fetchComments(user.userId, true);
        }
      } else {
        setData(null);
        message.info("No user found for given input.");
      }
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Failed to fetch user details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id = null, auto = false) => {
    const userIdToFetch = id || data?.userId;
    if (!userIdToFetch) {
      message.warning("User ID not available.");
      return;
    }

    setCommentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/user-service/fetchAdminComments`,
        { userId: userIdToFetch },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const commentsData = response.data;
      if (Array.isArray(commentsData) && commentsData.length > 0) {
        setComments(commentsData);
        setShowComments(true);
      } else {
        setComments([]);
        setShowComments(true);
        if (!auto) {
          message.info("No comments updated for this user.");
        }
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 500) {
        message.warning("No comments updated for this user.");
      } else {
        message.error(
          err?.response?.data?.message || "Failed to fetch comments."
        );
      }
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(true);
  }, [number, userId]);

  const commentColumns = [
    {
      title: "Admin Comments",
      dataIndex: "adminComments",
      key: "adminComments",
      align: "center",
      width: 250,
    },
    {
      title: "Customer Behaviour",
      dataIndex: "customerBehaviour",
      key: "customerBehaviour",
      width: 160,
      align: "center",
    },
    {
      title: "Updated By",
      dataIndex: "commentsUpdateBy",
      key: "commentsUpdateBy",
      width: 150,
      align: "center",
    },
    {
      title: "Updated Date",
      dataIndex: "commentsCreatedDate",
      key: "commentsCreatedDate",
      width: 200,
      align: "center",
      render: (date) =>
        date
          ? new Date(date).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }) + " (IST)"
          : "-",
    },

    {
      title: "Active Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 130,
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Active" : "Inactive"}</Tag>
      ),
    },
  ];

  return (
    <AgentsAdminLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <Title level={3} className="!m-0 text-[#351664] text-lg sm:text-2xl">
            {titleLabel}
          </Title>
          <Space className="mt-3 sm:mt-0 flex-wrap">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => fetchDetails(true)}
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
              icon={<CommentOutlined />}
              onClick={() => fetchComments()}
              loading={commentsLoading}
              disabled={!data?.userId}
              style={{
                backgroundColor: "#1AB394",
                borderColor: "#1AB394",
                color: "#fff",
              }}
            >
              View Comments
            </Button>
          </Space>
        </div>

        <Divider className="my-4" />

        {/* User Details */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="medium" />
          </div>
        ) : data ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-x-auto">
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2 }}
                size="middle"
                labelStyle={{ width: 220, fontWeight: 600 }}
              >
                <Descriptions.Item label="User ID">
                  {data.userId && (
                    <Tag color="blue" className="text-base font-medium">
                      #{data.userId.slice(-4)}
                    </Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Name">
                  {data.userName || data.firstName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile Number">
                  <Tag color="green">
                    {data.countryCode ? `${data.countryCode} ` : ""}
                    {data.mobileNumber || "-"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="WhatsApp Number">
                  <Tag color="volcano">
                    {data.countryCode ? `${data.countryCode} ` : ""}
                    {data.whastappNumber || "-"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                  {data.email || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Gender">
                  {data.gender || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Register From">
                  {data.registeredFrom || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Registered Date">
                  {data.userRegisterCreatedDate
                    ? new Date(data.userRegisterCreatedDate).toLocaleString(
                        "en-IN",
                        {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      ) + " (IST)"
                    : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                  <Tag
                    color={data.whatsappVerified ? "green" : "red"}
                    style={{ fontWeight: 600 }}
                  >
                    {data.whatsappVerified ? "Verified" : "Not Verified"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Assigned Coins">
                  <Tag color="gold">{data.assignCoins || "0"}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Comments Table */}
            {showComments && (
              <div className="mt-6">
                <Title level={4} className="text-[#351664] text-lg sm:text-xl">
                  Admin Comments
                </Title>
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 overflow-x-auto">
                  <Table
                    columns={commentColumns}
                    dataSource={comments}
                    rowKey="adminUserId"
                    scroll={{ x: true }}
                    pagination={false}
                    bordered
                    loading={commentsLoading}
                    locale={{
                      emptyText: "No comments updated for this user.",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <Text>No data found for the given query.</Text>
          </div>
        )}
      </div>
    </AgentsAdminLayout>
  );
};

export default AgentUserProfile;
