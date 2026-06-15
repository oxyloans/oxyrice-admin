import axios from "axios";
import { getToken } from "../auth";

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
}

export const fetchCompanyPresentations = async (companyId) => {
  return superadminAxios.get(`${BASE_URL}/get-presentations/${companyId}`);
};

export const fetchCompanyDemos = async (companyId) => {
  return superadminAxios.get(`${BASE_URL}/company-demos/${companyId}`);
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
}