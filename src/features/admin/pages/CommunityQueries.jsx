import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Col,
  Collapse,
  ConfigProvider,
  Empty,
  Flex,
  Grid,
  Input,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CommentOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EyeOutlined,
  FilterOutlined,
  LikeOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout";
import {
  deleteCommunityComment,
  deleteCommunityQuery,
  getCommunityQueries,
  getCommunityQueryComments,
  replyToCommunityComment,
} from "../api/communityCommentsApi";
import { getCommunityCategories } from "../api/communityCategoriesApi";
import "./CommunityQueries.css";

const { Paragraph, Text, Title } = Typography;
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

const CommentThread = ({
  comment,
  depth = 0,
  replyingToId,
  replyText,
  postingReply,
  onReplyStart,
  onReplyCancel,
  onReplyTextChange,
  onReplySubmit,
  deletingCommentId,
  onCommentDelete,
}) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  if (!comment) return null;
  const replies = Array.isArray(comment.replies)
    ? comment.replies.filter(Boolean)
    : [];
  const replyCount = Math.max(Number(comment.totalReplies) || 0, replies.length);

  return (
    <div
      className={`community-thread-item ${depth > 0 ? "community-thread-reply" : ""}`}
    >
      <Flex gap={10} align="flex-start">
        <div className="community-thread-avatar-column">
          <Avatar
            size={depth > 0 ? 30 : 36}
            icon={<UserOutlined />}
            className="shrink-0 bg-teal-100 text-teal-700"
          />
          {repliesOpen && replies.length > 0 && (
            <div className="community-thread-connector" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Flex align="center" justify="space-between" gap={8} wrap>
            <Space size={[6, 4]} wrap>
              <Text strong>{comment.user?.name || "Community user"}</Text>
              {comment.user?.badge && (
                <Tag
                  bordered={false}
                  color={badgeColor(comment.user.badge)}
                  className="!mr-0"
                >
                  {comment.user.badge.replaceAll("_", " ")}
                </Tag>
              )}
            </Space>
            <Space size={4}>
              <Text type="secondary" className="text-xs">
                {formatDate(comment.createdAt)}
              </Text>
              <Tooltip title="Delete comment">
                <Popconfirm
                  title="Delete this comment?"
                  description="This comment and its replies may be removed."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onCommentDelete(comment.id)}
                >
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={deletingCommentId === comment.id}
                    aria-label={`Delete comment ${comment.id}`}
                  />
                </Popconfirm>
              </Tooltip>
            </Space>
          </Flex>
          <Paragraph className="!mb-2 !mt-2 whitespace-pre-wrap !text-[14px] !leading-6 !text-slate-700">
            {comment.comment}
          </Paragraph>
          <Space className="community-thread-actions" size={6} wrap>
            <Tag bordered={false} icon={<LikeOutlined />}>
              {comment.reactions?.totalLikes || 0}
            </Tag>
            <Tag bordered={false} icon={<DislikeOutlined />}>
              {comment.reactions?.totalDislikes || 0}
            </Tag>
            {replyCount > 0 && (
              <Button
                type="text"
                size="small"
                className="!h-7 !px-2 !text-xs !font-medium !text-slate-600"
                icon={<CommentOutlined />}
                onClick={() => setRepliesOpen((current) => !current)}
              >
                {repliesOpen
                  ? "Hide replies"
                  : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </Button>
            )}
            <Button
              type="text"
              size="small"
              icon={<CommentOutlined />}
              className="!h-7 !px-2 !text-xs !font-medium !text-teal-700"
              onClick={() => onReplyStart(comment)}
            >
              Reply
            </Button>
          </Space>

          {replyingToId === comment.id && (
            <div className="community-reply-composer">
              <Flex gap={10} align="flex-start">
                <Avatar
                  size={30}
                  icon={<UserOutlined />}
                  className="shrink-0 bg-teal-700 text-white"
                />
                <div className="min-w-0 flex-1">
                  <Text type="secondary" className="mb-2 block text-xs">
                    Replying to {comment.user?.name || "Community user"}
                  </Text>
                  <Input.TextArea
                    autoFocus
                    value={replyText}
                    maxLength={1000}
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    placeholder="Post your admin reply"
                    onChange={(event) => onReplyTextChange(event.target.value)}
                    onPressEnter={(event) => {
                      if (!event.shiftKey) {
                        event.preventDefault();
                        onReplySubmit(comment.id);
                      }
                    }}
                  />
                  <Flex justify="flex-end" gap={8} className="mt-2">
                    <Button
                      size="small"
                      disabled={postingReply}
                      onClick={onReplyCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SendOutlined />}
                      loading={postingReply}
                      disabled={!replyText.trim()}
                      onClick={() => onReplySubmit(comment.id)}
                    >
                      Reply
                    </Button>
                  </Flex>
                </div>
              </Flex>
            </div>
          )}
        </div>
      </Flex>

      {repliesOpen && replies.length > 0 && (
        <div className="community-thread-children">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingToId={replyingToId}
              replyText={replyText}
              postingReply={postingReply}
              onReplyStart={onReplyStart}
              onReplyCancel={onReplyCancel}
              onReplyTextChange={onReplyTextChange}
              onReplySubmit={onReplySubmit}
              deletingCommentId={deletingCommentId}
              onCommentDelete={onCommentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function CommunityQueries() {
  const screens = useBreakpoint();
  const [queries, setQueries] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([
    { label: "All Categories", value: "" },
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const loadQueries = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await getCommunityQueries({
          categoryId,
          pageNumber: page - 1,
          pageSize,
        });
        const payload = response.data?.data || {};
        const totalPages = Number(payload.totalPages) || 0;
        if (totalPages > 0 && page > totalPages) {
          setPage(totalPages);
          return;
        }
        setQueries(Array.isArray(payload.content) ? payload.content : []);
        setTotal(Number(payload.totalElements) || 0);
      } catch (error) {
        setQueries([]);
        setTotal(0);
        message.error(getErrorMessage(error, "Unable to load community queries"));
      } finally {
        setLoading(false);
      }
    },
    [categoryId, page, pageSize],
  );

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  useEffect(() => {
    const loadCategoryOptions = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCommunityCategories();
        const categoryData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setCategoryOptions([
          { label: "All Categories", value: "" },
          ...categoryData
            .filter(
              (item) =>
                item.active === true &&
                item.id != null &&
                item.categoryName?.trim(),
            )
            .map((item) => ({
              label: item.categoryName.trim(),
              value: item.id,
            })),
        ]);
      } catch (error) {
        setCategoryOptions([{ label: "All Categories", value: "" }]);
        message.error(
          getErrorMessage(error, "Unable to load community categories"),
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategoryOptions();
  }, []);

  const openComments = async (query) => {
    if (selectedQuery?.id === query.id) {
      setSelectedQuery(null);
      setComments([]);
      setReplyingToId(null);
      setReplyText("");
      return;
    }
    setSelectedQuery(query);
    setComments([]);
    setCommentsLoading(true);
    try {
      const response = await getCommunityQueryComments(query.id);
      setComments(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to load query comments"));
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitReply = async (commentId) => {
    const value = replyText.trim();
    if (!value || !selectedQuery || postingReply) return;

    setPostingReply(true);
    try {
      await replyToCommunityComment(commentId, value);
      message.success("Reply posted successfully");
      setReplyingToId(null);
      setReplyText("");
      const response = await getCommunityQueryComments(selectedQuery.id);
      setComments(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to post reply"));
    } finally {
      setPostingReply(false);
    }
  };

  const removeComment = async (commentId) => {
    if (!selectedQuery) return;

    setDeletingCommentId(commentId);
    try {
      await deleteCommunityComment(commentId);
      message.success("Comment deleted successfully");
      const response = await getCommunityQueryComments(selectedQuery.id);
      setComments(Array.isArray(response.data?.data) ? response.data.data : []);
      setQueries((current) =>
        current.map((query) =>
          query.id === selectedQuery.id
            ? {
                ...query,
                totalComments: Math.max(0, (query.totalComments || 0) - 1),
              }
            : query,
        ),
      );
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to delete comment"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const removeQuery = async (queryId) => {
    setDeletingId(queryId);
    try {
      await deleteCommunityQuery(queryId);
      message.success("Community query deleted successfully");
      if (queries.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadQueries();
      }
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to delete community query"));
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
        <main className="mx-auto max-w-7xl rounded-2xl bg-white p-3 sm:p-5 lg:p-6">
          <Row
            gutter={[16, 16]}
            align="middle"
            justify="space-between"
            className="mb-5"
          >
            <Col xs={24} md={15}>
              <Title level={3} className="!mb-1 !text-slate-900">
                Community Queries
              </Title>
              <Paragraph type="secondary" className="!mb-0">
                Review user questions, view their discussions, and manage
                community content.
              </Paragraph>
            </Col>
            <Col xs={24} sm={14} md={8} lg={7}>
              <div className="md:ml-auto">
                <Text
                  type="secondary"
                  className="mb-2 block text-sm font-medium"
                >
                  Filter by category
                </Text>
                <Select
                  aria-label="Filter community queries by category"
                  className="w-full"
                  showSearch
                  optionFilterProp="label"
                  loading={categoriesLoading}
                  value={categoryId}
                  options={categoryOptions}
                  suffixIcon={<FilterOutlined />}
                  onChange={(value) => {
                    setCategoryId(value);
                    setPage(1);
                    setTotal(0);
                  }}
                />
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="grid gap-4" aria-label="Loading queries">
              {[1, 2, 3].map((item) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-6"
                  key={item}
                >
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </div>
              ))}
            </div>
          ) : queries.length === 0 ? (
            <Empty
              className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-14"
              description={
                categoryId
                  ? `No ${categoryOptions.find((item) => item.value === categoryId)?.label || "category"} queries found`
                  : "No community queries found"
              }
            />
          ) : (
            <div className="grid gap-4">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
                >
                  <Flex
                    align="flex-start"
                    justify="space-between"
                    gap={16}
                    vertical={screens.xs}
                  >
                    <Flex align="center" gap={12} className="min-w-0">
                      <Avatar
                        size={44}
                        icon={<UserOutlined />}
                        className="shrink-0 bg-teal-100 text-teal-700"
                      >
                        {query.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <div className="min-w-0 py-0.5">
                        <Text strong ellipsis className="block text-slate-900">
                          {query.user?.name || "Community user"}
                        </Text>
                        <Text
                          type="secondary"
                          className="mt-1.5 flex items-center gap-1.5 text-xs"
                        >
                          <ClockCircleOutlined className="text-[11px]" />
                          <span>{formatDate(query.createdAt)}</span>
                        </Text>
                      </div>
                    </Flex>
                    <Space size={8}>
                      <Tooltip title="Delete query">
                      <Popconfirm
                        title="Delete this query?"
                        description="The query and its discussion will be removed."
                        okText="Delete Query"
                        cancelText="Keep Query"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => removeQuery(query.id)}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          loading={deletingId === query.id}
                          aria-label={`Delete query ${query.id}`}
                        />
                      </Popconfirm>
                      </Tooltip>
                    </Space>
                  </Flex>

                  <Title level={4} className="!mb-2 !mt-4 !text-slate-900">
                    {query.question || "Untitled query"}
                  </Title>
                  {query.description && (
                    <Paragraph
                      className="!mb-4 !text-slate-600"
                      ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                    >
                      {query.description}
                    </Paragraph>
                  )}

                  <Space size={[18, 8]} wrap className="text-slate-500">
                    <Tooltip title="Views">
                      <Text type="secondary">
                        <EyeOutlined /> {query.totalViews || 0} views
                      </Text>
                    </Tooltip>
                    <Text type="secondary">
                      <LikeOutlined /> {query.totalLikes || 0} likes
                    </Text>
                    <Text type="secondary">
                      <DislikeOutlined /> {query.totalDislikes || 0} dislikes
                    </Text>
                    <Text type="secondary">
                      <CommentOutlined /> {query.totalComments || 0} comments
                    </Text>
                  </Space>

                  <Collapse
                    className="mt-4 overflow-hidden rounded-lg border-slate-200 bg-slate-50"
                    activeKey={
                      selectedQuery?.id === query.id ? ["comments"] : []
                    }
                    onChange={(keys) => {
                      if (keys.length === 0 && selectedQuery?.id === query.id) {
                        setSelectedQuery(null);
                        setComments([]);
                        setReplyingToId(null);
                        setReplyText("");
                      } else if (
                        keys.length > 0 &&
                        selectedQuery?.id !== query.id
                      ) {
                        openComments(query);
                      }
                    }}
                    items={[
                      {
                        key: "comments",
                        label: (
                          <Flex align="center" justify="space-between" gap={12}>
                            <Space>
                              <CommentOutlined className="text-teal-700" />
                              <Text strong>
                                Discussion ({query.totalComments || 0})
                              </Text>
                            </Space>
                            {selectedQuery?.id !== query.id && (
                              <Text type="secondary" className="text-xs">
                                View conversation
                              </Text>
                            )}
                          </Flex>
                        ),
                        children:
                          selectedQuery?.id === query.id ? (
                            commentsLoading ? (
                              <Space
                                direction="vertical"
                                className="w-full"
                                size={18}
                              >
                                {[1, 2].map((item) => (
                                  <Skeleton
                                    key={item}
                                    active
                                    avatar
                                    paragraph={{ rows: 2 }}
                                  />
                                ))}
                              </Space>
                            ) : comments.length === 0 ? (
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No comments on this query"
                              />
                            ) : (
                              <div className="community-thread-list">
                                {comments
                                  .filter(Boolean)
                                  .map((comment) => (
                                    <CommentThread
                                      key={comment.id}
                                      comment={comment}
                                      replyingToId={replyingToId}
                                      replyText={replyText}
                                      postingReply={postingReply}
                                      onReplyStart={(targetComment) => {
                                        setReplyingToId(targetComment.id);
                                        setReplyText("");
                                      }}
                                      onReplyCancel={() => {
                                        setReplyingToId(null);
                                        setReplyText("");
                                      }}
                                      onReplyTextChange={setReplyText}
                                      onReplySubmit={submitReply}
                                      deletingCommentId={deletingCommentId}
                                      onCommentDelete={removeComment}
                                    />
                                  ))}
                              </div>
                            )
                          ) : null,
                      },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}

          {total > 0 && (
            <Flex justify={screens.xs ? "center" : "flex-end"} className="mt-6">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                responsive
                hideOnSinglePage={false}
                showQuickJumper={!screens.xs}
                showSizeChanger={!screens.xs}
                pageSizeOptions={[10, 20, 50]}
                showTotal={
                  screens.xs ? undefined : (count) => `${count} queries`
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
            </Flex>
          )}
        </main>

      </ConfigProvider>
    </AdminPanelLayout>
  );
}

export default CommunityQueries;
