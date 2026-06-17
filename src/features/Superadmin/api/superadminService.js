import axios from "axios";
import { getToken, refreshAccessToken, clearSession } from "../auth";
import { Modal } from "antd";

const BASE_URL = 'https://meta.oxyloans.com/api/user-service/write';

const superadminAxios = axios.create();

superadminAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

superadminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return superadminAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
      
      // If we got here, refresh token failed or returned null
      clearSession();
      Modal.error({
        title: 'Session Expired',
        content: 'Your session has expired. Please log in again to continue.',
        okText: 'Login',
        onOk() {
          window.location.href = "/superadmin/login";
        }
      });
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// ---------- Write (POST) ----------
export const addCompany = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/add-company`, payload);
};

export const addBank = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/add-company`, payload);
};

export const addEmployee = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/add-employee`, payload);
};

export const addPresentation = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/add-presentation`, payload);
};

export const addDemo = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/update-demo`, payload);
};

export const addBankInfo = async (payload) => {
  return superadminAxios.post(`${BASE_URL}/bank`, payload);
};

// ---------- Read (GET) ----------
export const fetchDashboardStats = async () => {
  return superadminAxios.get(`${BASE_URL}/dashboard`);
};

export const fetchCompanies = async (page = 0, size = 10) => {
  return superadminAxios.get(`${BASE_URL}/get-all-companies?page=${page}&size=${size}`);
};

export const fetchBanks = async (page = 0, size = 10) => {
  return superadminAxios.get(`${BASE_URL}/get-all-banks?page=${page}&size=${size}`);
};

export const fetchAllEmployees = async () => {
  return superadminAxios.get(`${BASE_URL}/get-all-company-employees-data`);
};

export const fetchCompanyEmployees = async (companyId) => {
  return superadminAxios.get(`${BASE_URL}/company-employees/${companyId}`);
};

export const fetchBankEmployees = async (bankId) => {
  return superadminAxios.get(`${BASE_URL}/bank-employees/${bankId}`);
};

export const fetchCompanyPresentations = async (companyId) => {
  return superadminAxios.get(`${BASE_URL}/get-presentations/${companyId}`);
};

export const fetchCompanyDemos = async (companyId) => {
  return superadminAxios.get(`${BASE_URL}/company-demos/${companyId}`);
};

// ---------- Delete ----------
export const deleteEmployee = async (employeeId) => {
  return superadminAxios.delete(`${BASE_URL}/delete-employee/${employeeId}`);
};

export const deleteDemo = async (companyId, demoId) => {
  return superadminAxios.delete(`${BASE_URL}/delete-demo/${companyId}`);
};

// --------- Upload File --------
export const uploadFile = async (companyId, file) => {
  console.log("Inside the Upload file method");
  const formData = new FormData();
  formData.append('file', file);

  const res = await superadminAxios.post(
    `https://meta.oxyloans.com/api/upload-service/upload?id=${companyId}&fileType=aadhar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
};