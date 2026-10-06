import adminApi from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import axios from "axios";
import dayjs from "dayjs";
import { regDayKey } from "./registrationDates";
import {
  OXYLOANS_API_KEY,
  OXYLOANS_CONTACT_URLS,
  loadContactsSince,
} from "./oxyloansContacts";

const toCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
};

const todayStr = () => dayjs().format("YYYY-MM-DD");

const OXYLOANS_LENDER_URL = OXYLOANS_CONTACT_URLS.lender;
const OXYLOANS_BORROWER_URL = OXYLOANS_CONTACT_URLS.borrower;
const OXYLOANS_PARTNER_URL = OXYLOANS_CONTACT_URLS.partner;

const fetchOxyLoansCount = async (url) => {
  const res = await axios.post(
    url,
    { pageNo: 1, pageSize: 10 },
    { headers: { "X-Api-Key": OXYLOANS_API_KEY } }
  );
  const d = res.data ?? {};
  return toCount(d.totalCount ?? d.total ?? d.count);
};

// Same local-day bucketing as the Lender/Borrower/Partner pages, paging
// back far enough to cover all of today rather than a fixed first page.
const fetchOxyLoansTodayCount = async (url) => {
  const t = todayStr();
  const rows = await loadContactsSince(url, dayjs());
  return rows.filter((r) => r._day === t).length;
};

export const PRODUCT_COUNTS = [
  {
    key: "lender",
    fetchCount: () => fetchOxyLoansCount(OXYLOANS_LENDER_URL),
    fetchTodayCount: () => fetchOxyLoansTodayCount(OXYLOANS_LENDER_URL),
  },
  {
    key: "borrower",
    fetchCount: () => fetchOxyLoansCount(OXYLOANS_BORROWER_URL),
    fetchTodayCount: () => fetchOxyLoansTodayCount(OXYLOANS_BORROWER_URL),
  },
  {
    key: "askoxy",
    fetchCount: async () => {
      const res = await adminApi.get("/user-service/counts");
      return toCount(res.data?.totalUsers);
    },
    fetchTodayCount: async () => {
      const res = await adminApi.get("/user-service/counts");
      return toCount(res.data?.todayUsers);
    },
  },
  {
    key: "oxybricks",
    fetchCount: async () => {
      const res = await axios.get(`${BASE_URL}/auth-service/auth/oxybricks-registered-users`, {
        params: { pageIndex: 0, pageSize: 1, sortBy: "createdAt", sortOrder: "DESC" },
      });
      return toCount(res.data?.count);
    },
    fetchTodayCount: async () => {
      const res = await axios.get(`${BASE_URL}/auth-service/auth/oxybricks-registered-users`, {
        params: { pageIndex: 0, pageSize: 200, sortBy: "createdAt", sortOrder: "DESC" },
      });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const t = todayStr();
      // registeredDate comes back as "DD/MM/YYYY", not ISO.
      return rows.filter((r) => regDayKey(r.registeredDate) === t).length;
    },
  },
  {
    key: "oxygold",
    fetchCount: async () => {
      const res = await axios.get(
        "https://meta.oxyloans.com/api/oxygold-api/auth/viewAllUsers",
        { params: { page: 0, size: 1 }, headers: { "X-Api-Key": "bwjpL6+95jM2BFkBQfHteyT7eSVNQpLKBPuHQihGzNo=" } }
      );
      const pagination = res.data?.data ?? res.data ?? {};
      return toCount(pagination.totalElements ?? pagination.totalCount);
    },
    fetchTodayCount: async () => {
      const first = await axios.get(
        "https://meta.oxyloans.com/api/oxygold-api/auth/viewAllUsers",
        { params: { page: 0, size: 100 }, headers: { "X-Api-Key": "bwjpL6+95jM2BFkBQfHteyT7eSVNQpLKBPuHQihGzNo=" } }
      );
      const pagination = first.data?.data ?? {};
      const totalPages = Number(pagination.totalPages) || 1;
      let rows = Array.isArray(pagination.content) ? [...pagination.content] : [];
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            axios.get("https://meta.oxyloans.com/api/oxygold-api/auth/viewAllUsers", {
              params: { page: i + 1, size: 100 },
              headers: { "X-Api-Key": "bwjpL6+95jM2BFkBQfHteyT7eSVNQpLKBPuHQihGzNo=" },
            }).then((r) => Array.isArray(r.data?.data?.content) ? r.data.data.content : [])
          )
        );
        rows = rows.concat(rest.flat());
      }
      const t = todayStr();
      return rows.filter((r) => regDayKey(r.createdAt) === t).length;
    },
  },
  {
    key: "partnerlender",
    fetchCount: () => fetchOxyLoansCount(OXYLOANS_PARTNER_URL),
    fetchTodayCount: () => fetchOxyLoansTodayCount(OXYLOANS_PARTNER_URL),
  },
  {
    key: "interested",
    fetchCount: async () => {
      const res = await adminApi.get("/marketing-service/campgin/getAllInterestedUsres");
      return Array.isArray(res.data) ? res.data.length : null;
    },
    fetchTodayCount: async () => {
      const res = await adminApi.get("/marketing-service/campgin/getAllInterestedUsres");
      if (!Array.isArray(res.data)) return null;
      const t = todayStr();
      return res.data.filter((r) => regDayKey(r.createdAt || r.registeredDate) === t).length;
    },
  },
];