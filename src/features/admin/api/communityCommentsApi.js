import axiosInstance from "../../../core/config/axiosInstance";

const COMMENTS_PATH = "/user-service/admin/community/comments";

export const getCommunityComments = ({
  pageNumber = 0,
  pageSize = 10,
} = {}) =>
  axiosInstance.get(COMMENTS_PATH, {
    params: { page: pageNumber, size: pageSize },
  });

export const replyToCommunityComment = (commentId, comment) =>
  axiosInstance.post(`${COMMENTS_PATH}/${commentId}/reply`, { comment });

export const deleteCommunityComment = (commentId) =>
  axiosInstance.delete(`${COMMENTS_PATH}/${commentId}`);

const QUERIES_PATH = "/user-service/admin/community/queries";

export const getCommunityQueries = ({
  categoryId,
  pageNumber = 0,
  pageSize = 10,
} = {}) =>
  axiosInstance.get(QUERIES_PATH, {
    params: {
      ...(categoryId ? { categoryId } : {}),
      page: pageNumber,
      size: pageSize,
    },
  });

export const deleteCommunityQuery = (queryId) =>
  axiosInstance.delete(`${QUERIES_PATH}/${queryId}`);

export const getCommunityQueryComments = (queryId) =>
  axiosInstance.get(`${QUERIES_PATH}/${queryId}/comments`);
