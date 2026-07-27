import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Col,
  ConfigProvider,
  Empty,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  Tooltip,
  message,
} from "antd";
import {
  DeleteOutlined,
  DislikeOutlined,
  LikeOutlined,
  MessageOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout";
import {
  deleteCommunityComment,
  getCommunityComments,
  replyToCommunityComment,
} from "../api/communityCommentsApi";
import "./CommunityComments.css";

const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const badgeColor = (badge) => {
  if (badge === "ADMIN_VERIFIED") return "green";
  if (badge === "GOLD") return "gold";
  if (badge === "SILVER") return "default";
  return "orange";
};

const ReplyItem = ({ reply }) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  if (!reply) return null;

  const nestedReplies = Array.isArray(reply.replies)
    ? reply.replies.filter(Boolean)
    : [];
  const replyCount = Math.max(
    Number(reply.totalReplies) || 0,
    nestedReplies.length,
  );

  return (
    <div className="community-reply">
      <Flex align="flex-start" gap={10}>
        <Avatar
          size={30}
          icon={<UserOutlined />}
          className="community-reply-avatar"
        />
        <div className="community-reply-content">
          <div className="community-comment-meta">
            <Text strong>{reply.user?.name || "Community user"}</Text>
            {reply.user?.badge && (
              <Tag bordered={false} color={badgeColor(reply.user.badge)}>
                {reply.user.badge.replaceAll("_", " ")}
              </Tag>
            )}
            <span>{formatDate(reply.createdAt)}</span>
          </div>
          <p>{reply.comment}</p>
          <Space size={8} wrap>
            <Tag bordered={false} icon={<LikeOutlined />}>
              {reply.reactions?.totalLikes || 0}
            </Tag>
            <Tag bordered={false} icon={<DislikeOutlined />}>
              {reply.reactions?.totalDislikes || 0}
            </Tag>
            {replyCount > 0 && (
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => setRepliesOpen((current) => !current)}
              >
                {repliesOpen
                  ? "Hide replies"
                  : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </Button>
            )}
          </Space>
        </div>
      </Flex>

      {repliesOpen && nestedReplies.length > 0 && (
        <div className="community-nested-replies">
          {nestedReplies.map((nestedReply) => (
            <ReplyItem key={nestedReply.id} reply={nestedReply} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentReplies = ({ replies, totalReplies }) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const availableReplies = Array.isArray(replies)
    ? replies.filter(Boolean)
    : [];
  const replyCount = Math.max(
    Number(totalReplies) || 0,
    availableReplies.length,
  );

  if (replyCount === 0) return null;

  return (
    <div className="community-replies-section">
      <Button
        type="link"
        size="small"
        icon={<MessageOutlined />}
        onClick={() => setRepliesOpen((current) => !current)}
      >
        {repliesOpen
          ? "Hide replies"
          : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
      </Button>
      {repliesOpen && (
        <div className="community-replies">
          {availableReplies.length > 0 ? (
            availableReplies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))
          ) : (
            <Text type="secondary" className="text-xs">
              Replies are unavailable.
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

function CommunityComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replying, setReplying] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const loadComments = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await getCommunityComments({
          pageNumber: page - 1,
          pageSize,
        });
        const payload = response.data?.data || {};
        const totalPages = Number(payload.totalPages) || 0;
        if (totalPages > 0 && page > totalPages) {
          setPage(totalPages);
          return;
        }
        setComments(Array.isArray(payload.content) ? payload.content : []);
        setTotal(Number(payload.totalElements) || 0);
      } catch (error) {
        setComments([]);
        setTotal(0);
        message.error(getErrorMessage(error, "Unable to load comments"));
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize],
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitReply = async ({ comment }) => {
    if (!replyTarget) return;
    setReplying(true);
    try {
      await replyToCommunityComment(replyTarget.id, comment.trim());
      message.success("Reply added successfully");
      form.resetFields();
      setReplyTarget(null);
      await loadComments();
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to add reply"));
    } finally {
      setReplying(false);
    }
  };

  const removeComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      await deleteCommunityComment(commentId);
      message.success("Comment deleted successfully");
      if (comments.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadComments();
      }
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to delete comment"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminPanelLayout>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0f766e",
            colorInfo: "#0f766e",
            colorSuccess: "#16a34a",
            colorError: "#dc2626",
            borderRadius: 10,
            controlHeight: 40,
          },
          components: {
            Button: {
              fontWeight: 600,
              primaryShadow: "0 4px 12px rgba(15, 118, 110, 0.18)",
            },
          },
        }}
      >
      <main className="community-comments-page mx-auto max-w-7xl rounded-xl bg-white p-2 sm:p-4 lg:p-6">
        <Row className="community-comments-summary" gutter={[12, 12]}>
          <Col xs={14} sm={8} md={6} lg={5}>
            <div
              className="community-summary-panel h-full border p-4"
              style={{ background: "#e6f4ff", borderColor: "#91caff" }}
            >
              <Statistic
                title="All comments"
                value={total}
                prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
              />
            </div>
          </Col>
        </Row>

        <Row className="community-comments-heading" gutter={[16, 12]}>
          <Col xs={24} md={18}>
            <Title level={3} className="!mb-1 !text-slate-900">
              All Community Comments
            </Title>
            <Paragraph type="secondary" className="!mb-0">
              Review community discussions, respond as an administrator, and
              keep conversations helpful and respectful.
            </Paragraph>
          </Col>
        </Row>

        {loading ? (
          <div className="community-comments-list" aria-label="Loading comments">
            {[1, 2, 3].map((item) => (
              <div
                className="community-comment-card border border-slate-200 bg-white p-4"
                key={item}
              >
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Empty
            className="community-comments-empty border-slate-300 bg-white"
            description="No community comments found"
          />
        ) : (
          <div className="community-comments-list">
            {comments.map((item) => {
              const reactions = item.reactions || {};
              return (
                <div
                  className="community-comment-card border-slate-200 bg-white"
                  key={item.id}
                >
                  <div className="community-comment-card-body">
                  <div className="community-comment-top">
                    <div className="community-comment-user">
                      <Avatar
                        className="community-comment-avatar"
                        icon={<UserOutlined />}
                        size={44}
                      >
                        {item.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <div className="community-comment-user-details">
                        <Text
                          className="community-comment-user-name"
                          ellipsis={{ tooltip: item.user?.name }}
                        >
                          {item.user?.name || "Community user"}
                        </Text>
                        <div className="community-comment-meta">
                          {item.user?.badge && (
                            <Tag
                              bordered={false}
                              color={badgeColor(item.user.badge)}
                            >
                              {item.user.badge.replaceAll("_", " ")}
                            </Tag>
                          )}
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Space className="community-comment-actions" size={8} wrap>
                      <Button
                        type="primary"
                        size="middle"
                        icon={<SendOutlined />}
                        onClick={() => {
                          form.resetFields();
                          setReplyTarget(item);
                        }}
                      >
                        Reply as Admin
                      </Button>
                      <Tooltip title="Delete comment">
                        <Popconfirm
                          title="Delete this comment?"
                          description="This action cannot be undone."
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                          cancelText="Cancel"
                          onConfirm={() => removeComment(item.id)}
                        >
                          <Button
                            aria-label={`Delete comment ${item.id}`}
                            danger
                            size="middle"
                            loading={deletingId === item.id}
                            icon={<DeleteOutlined />}
                          >
                            {screens.md ? "Delete Comment" : "Delete"}
                          </Button>
                        </Popconfirm>
                      </Tooltip>
                    </Space>
                  </div>

                  <div className="community-comment-text">{item.comment}</div>

                  <div className="community-comment-stats">
                    <Badge
                      count={reactions.totalLikes || 0}
                      showZero
                      color="#1ab394"
                      overflowCount={999}
                    >
                      <Tag icon={<LikeOutlined />}>Likes</Tag>
                    </Badge>
                    <Badge
                      count={reactions.totalDislikes || 0}
                      showZero
                      color="#8c8c8c"
                      overflowCount={999}
                    >
                      <Tag icon={<DislikeOutlined />}>Dislikes</Tag>
                    </Badge>
                    <Badge
                      count={item.totalReplies || 0}
                      showZero
                      color="#1677ff"
                      overflowCount={999}
                    >
                      <Tag icon={<MessageOutlined />}>Replies</Tag>
                    </Badge>
                  </div>

                  <CommentReplies
                    replies={item.replies}
                    totalReplies={item.totalReplies}
                  />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {total > 0 && (
          <div className="community-comments-pagination">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              responsive
              hideOnSinglePage={false}
              // showQuickJumper={!screens.xs}
              showSizeChanger={!screens.xs}
              pageSizeOptions={[10, 20, 50]}
              showLessItems={screens.xs}
              showTotal={
                screens.xs ? undefined : (count) => `${count} comments`
              }
              onChange={(nextPage, nextSize) => {
                if (nextSize !== pageSize) {
                  setPageSize(nextSize);
                  setPage(1);
                } else {
                  setPage(nextPage);
                }
              }}
            />
          </div>
        )}
      </main>

      <Modal
        title={
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>
              Reply to {replyTarget?.user?.name || "community user"}
            </span>
          </Space>
        }
        open={Boolean(replyTarget)}
        onCancel={() => {
          if (!replying) {
            form.resetFields();
            setReplyTarget(null);
          }
        }}
        footer={null}
        destroyOnClose
        centered
        width={screens.xs ? "calc(100% - 24px)" : 520}
      >
        <div className="community-reply-context border-l-teal-700 bg-teal-50">
          <Text type="secondary">Original comment</Text>
          <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "more" }}>
            {replyTarget?.comment}
          </Paragraph>
        </div>
        <Form form={form} layout="vertical" onFinish={submitReply}>
          <Form.Item
            label="Reply"
            name="comment"
            rules={[
              { required: true, whitespace: true, message: "Enter a reply" },
            ]}
          >
            <Input.TextArea
              autoFocus
              maxLength={1000}
              rows={5}
              showCount
              placeholder="Write your reply..."
            />
          </Form.Item>
          <Flex justify="flex-end" gap={8} wrap>
            <Button
              size="middle"
              onClick={() => setReplyTarget(null)}
              disabled={replying}
            >
              Cancel Reply
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              size="middle"
              icon={<SendOutlined />}
              loading={replying}
            >
              Post Admin Reply
            </Button>
          </Flex>
        </Form>
      </Modal>
      </ConfigProvider>
    </AdminPanelLayout>
  );
}

export default CommunityComments;
