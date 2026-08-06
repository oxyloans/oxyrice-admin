import axiosInstance from "../../../core/config/axiosInstance";

const COMMUNITY_DASHBOARD_PATH = "/user-service/admin/community/dashboard";

export const getCommunityDashboard = () =>
  axiosInstance.get(COMMUNITY_DASHBOARD_PATH);
