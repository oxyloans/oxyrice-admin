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

let refreshPromise = null;

const refreshTokens = async () => {
  const refreshToken = localStorage.getItem("adminRefreshToken");
  const response = await axios.post(
    `${BASE_URL}/user-service/refresh-token`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  const { mobileOtpSession: newAccess, mobileNumber: newRefresh } = response.data;
  if (newAccess) localStorage.setItem("adminAccessToken", newAccess);
  if (newRefresh) localStorage.setItem("adminRefreshToken", newRefresh);
  return newAccess;
};

axiosInstance.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem("adminAccessToken");
  if (!accessToken) return config;

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

  config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
});

export default axiosInstance;
