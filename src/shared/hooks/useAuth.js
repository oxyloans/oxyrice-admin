import axiosInstance from "../../core/config/axiosInstance";

const useAuth = () => {
  const accessToken = localStorage.getItem("adminAccessToken");
  const userId = localStorage.getItem("userId");
  return { accessToken, userId, axiosInstance };
};

export default useAuth;
