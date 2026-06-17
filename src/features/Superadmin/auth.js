import { Modal } from 'antd';

const SESSION_KEY = "admin_session";
const BASE = "https://meta.oxyloans.com";

export const saveSession = (data) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));

export const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getToken = () => {
  const s = getSession();
  return s?.accessToken ?? s?.token ?? null;
};

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

let isRefreshing = false;
let refreshQueue = [];

const drainQueue = (token) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

export const refreshAccessToken = async () => {
  const session = getSession();
  if (!session?.refreshToken) return null;

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push((token) => resolve(token));
    });
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${BASE}/api/user-service/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    const newToken = data.accessToken ?? data.token;
    saveSession({ ...session, accessToken: newToken, token: newToken });
    drainQueue(newToken);
    return newToken;
  } catch {
    clearSession();
    Modal.error({
      title: 'Session Expired',
      content: 'Your session has expired. Please log in again to continue.',
      okText: 'Login',
      onOk() {
        window.location.href = "/superadmin/login";
      }
    });
    return null;
  } finally {
    isRefreshing = false;
  }
};

const forceLogout = () => {
  clearSession();
  Modal.error({
    title: 'Session Expired',
    content: 'Your session has expired. Please log in again to continue.',
    okText: 'Login',
    onOk() {
      window.location.href = "/superadmin/login";
    }
  });
};

export const fetchWithAuth = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${getToken()}` },
  });

  if (res.status !== 401) return res;

  const newToken = await refreshAccessToken();
  if (!newToken) { forceLogout(); throw new Error("Session expired"); }

  const retried = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
  });

  if (retried.status === 401) { forceLogout(); throw new Error("Session expired"); }

  return retried;
};
