import adminApi from "../../../core/config/axiosInstance";

const toCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
};

export const PRODUCT_COUNTS = [
  {
    key: "askoxy",
    fetchCount: async () => {
      const res = await adminApi.get("/user-service/counts");
      return toCount(res.data?.totalUsers);
    },
  },
  {
    key: "oxybricks",
    fetchCount: async () => {
      const res = await adminApi.get("/auth-service/user/registered-users1", {
        params: {
          pageIndex: 0,
          pageSize: 1,
          sortBy: "id",
          sortOrder: "DESC",
          status: "live",
        },
      });
      return toCount(res.data?.count);
    },
  },
  {
    key: "oxygold",
    fetchCount: async () => {
      const res = await adminApi.get("/oxygold-api/auth/viewAllUsers", {
        params: { page: 0, size: 1 },
      });
      const pagination = res.data?.data ?? res.data ?? {};
      return toCount(pagination.totalElements);
    },
  },
  {
    key: "interested",
    fetchCount: async () => {
      const res = await adminApi.get(
        "/marketing-service/campgin/getAllInterestedUsres",
      );
      return Array.isArray(res.data) ? res.data.length : null;
    },
  },
];
