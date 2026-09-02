import axios from "axios";
import BASE_URL from "./Config";

const axiosInstance = axios.create({ baseURL: BASE_URL });

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // ms
  } catch {
    return null;
  }
};

const getPreferredAccessToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("adminAccessToken") ||
  localStorage.getItem("askoxyAccessToken") ||
  localStorage.getItem("askoxyToken") ||
  "";

const getPreferredRefreshToken = () =>
  localStorage.getItem("refreshToken") ||
  localStorage.getItem("adminRefreshToken") ||
  localStorage.getItem("askoxyRefreshToken") ||
  localStorage.getItem("askoxyRefresh") ||
  "";

let refreshPromise = null;

const refreshTokens = async () => {
  const refreshToken = getPreferredRefreshToken();
  const response = await axios.post(
    `${BASE_URL}/user-service/refresh-token`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  const { mobileOtpSession: newAccess, mobileNumber: newRefresh } = response.data;

  if (newAccess) {
    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("adminAccessToken", newAccess);
    localStorage.setItem("askoxyAccessToken", newAccess);
  }
  if (newRefresh) {
    localStorage.setItem("refreshToken", newRefresh);
    localStorage.setItem("adminRefreshToken", newRefresh);
    localStorage.setItem("askoxyRefreshToken", newRefresh);
  }

  return newAccess || getPreferredAccessToken();
};

export const ensureFreshAccessToken = async () => {
  let accessToken = getPreferredAccessToken();
  if (!accessToken) return "";

  const expiry = getTokenExpiry(accessToken);
  const fiveMinutes = 5 * 60 * 1000;

  if (expiry && expiry - Date.now() < fiveMinutes) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }
    accessToken = await refreshPromise;
  }

  return accessToken;
};

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await ensureFreshAccessToken();
  if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
});

export default axiosInstance;