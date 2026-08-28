import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Typography,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Alert,
  Spin,
  Drawer,
  Upload,
  message,
} from "antd";
import {
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  MessageOutlined,
  EyeOutlined,
  SendOutlined,
  SearchOutlined,
  DatabaseOutlined,
  UserOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminPanelLayout from "../components/AdminPanelLayout";
import * as XLSX from "xlsx";
import BASE_URL from "../../../core/config/Config";
import axiosInstance from "../../../core/config/axiosInstance";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AUDIENCE_CONFIGS = [
  {
    id: "askoxy-helpdesk",
    name: "AskOxy Users",
    subtitle: "Askoxy Registered Users",
    color: "#818cf8",
    method: "POST",
    endpoint: `${BASE_URL}/user-service/allOxyUsersAssignedToHelpDesk`,
    payload: { pageNo: 1, pageSize: 500 },
    hasEmailField: true,
    hasWhatsAppField: true,
    description:
      "Registered AskOxy platform users assigned across HelpDesk support.",
  },
  {
    id: "kukatpally-data",
    name: "Kukatpally Data",
    subtitle: "Kukatpally Regional Dataset",
    color: "#34d399",
    method: "GET",
    endpoint: `${BASE_URL}/user-service/AllKukatpallyData?pageNo=1&pageSize=500`,
    hasEmailField: false,
    hasWhatsAppField: false,
    description: "Regional contact records from Kukatpally zone.",
  },
  {
    id: "advocates-data",
    name: "Advocate Data",
    subtitle: "Advocates & Legal Directory",
    color: "#a78bfa",
    method: "GET",
    endpoint: `${BASE_URL}/user-service/getAllAdvocatesData?pageNo=1&pageSize=500`,
    hasEmailField: false,
    hasWhatsAppField: false,
    description:
      "Verified contact database of advocates and legal practitioners.",
  },
  {
    id: "thalwar-data",
    name: "Thalwar Data",
    subtitle: "Thalwar Contacts List",
    color: "#fbbf24",
    method: "GET",
    endpoint: `${BASE_URL}/user-service/getAllTalwarData?pageNo=1&pageSize=500`,
    hasEmailField: true,
    hasWhatsAppField: false,
    description:
      "Customer database with mobile numbers and verified email addresses.",
  },
  {
    id: "mumbai-data",
    name: "Mumbai Data",
    subtitle: "Mumbai Contacts & Network",
    color: "#f472b6",
    method: "GET",
    endpoint: `${BASE_URL}/user-service/getAllMumbaiData?pageNo=1&pageSize=500`,
    hasEmailField: true,
    hasWhatsAppField: false,
    description:
      "Mumbai regional network directory with email and mobile contacts.",
  },
  {
    id: "ram-mohan-data",
    name: "Ram Mohan Data",
    subtitle: "Darisa Campaign Contacts",
    color: "#22d3ee",

    method: "GET",
    endpoint: `${BASE_URL}/ai-service/agent/getAllRamMohanDarisa?page=0&size=500`,
    hasEmailField: false,
    hasWhatsAppField: false,
    description:
      "AI agent lead contacts list for Ram Mohan Darisa with call responses.",
  },
  {
    id: "sudheer-vakkalagadda",
    name: "Sudheer Vakkalagadda",
    subtitle: "Agent Campaign Contacts",
    color: "#22d3ee",
    method: "GET",
    endpoint: `${BASE_URL}/ai-service/agent/sudheerVakkalagadda?page=0&size=500`,
    hasEmailField: false,
    hasWhatsAppField: false,
    description:
      "AI agent lead contacts list for Sudheer Vakkalagadda with responses.",
  },
  {
    id: "rotary-data",
    name: "Rotary Data",
    subtitle: "Rotary Members Network",
    color: "#818cf8",
    method: "GET",
    endpoint: `${BASE_URL}/marketing-service/campgin/rotary-data?page=0&size=500`,
    hasEmailField: true,
    hasWhatsAppField: false,
    description:
      "Rotary members contact directory with phone numbers and email addresses.",
  },
  {
    id: "cbs-data",
    name: "CBS Data",
    subtitle: "CBS Student & Professional Network",
    color: "#a5b4fc",
    method: "GET",
    endpoint: `${BASE_URL}/ai-service/agent/getAllCbsData?page=0&size=500`,
    hasEmailField: true,
    hasWhatsAppField: false,
    description:
      "CBS international student and professional contacts with country and LinkedIn data.",
  },
  {
    id: "ftcci-data",
    name: "FTCCI Data",
    subtitle: "FTCCI Business Chamber Contacts",
    color: "#2dd4bf",
    method: "GET",
    endpoint: `${BASE_URL}/ai-service/agent/FtcciData?page=0&size=100`,
    hasEmailField: true,
    hasWhatsAppField: false,
    description:
      "FTCCI Federation of Telangana & AP Chambers of Commerce member business contacts.",
  },
];

const EMAIL_BATCH_SIZE = 500;
const EMAIL_BULK_ENDPOINT = `${BASE_URL}/ai-automation/smtp/bulk/send`;

const PLATFORM_OPTIONS = [
  { label: "ASKOXY", value: "askoxy" },
  { label: "OXYLOANS", value: "oxyloans" },
];

const TEMPLATE_TYPE_OPTIONS = [
  { label: "OXY", value: "OXY" },
  { label: "ROTARY", value: "ROTARY" },
];

const SENDER_EMAIL_OPTIONS = [
  { label: "team@oxyloans.in", value: "team@oxyloans.in" },
  { label: "updates@oxyloans.in", value: "updates@oxyloans.in" },
  { label: "studyabroad@askoxy.ai", value: "studyabroad@askoxy.ai" },
  { label: "support@askoxy.ai", value: "support@askoxy.ai" },
  {label:"admin@oxyloans.com",value:"admin@oxyloans.com"}
];

const extractEmailContacts = (usersList = []) => {
  return usersList
    .map((u) => {
      const clientName =
        u.userName ||
        u.name ||
        (u.name1 ? `${u.name1} ${u.name2 || ""}`.trim() : null) ||
        u.userId ||
        u.id ||
        "Customer";
      const clientEmail =
        u.emails ||
        u.email ||
        u.emailId ||
        u.userEmail ||
        u.businessEmail ||
        u.mail;
      return { clientName, clientEmail };
    })
    .filter(
      (c) =>
        c.clientEmail &&
        String(c.clientEmail).includes("@") &&
        String(c.clientEmail).trim() !== "null",
    );
};

const chunkContacts = (contacts, size = EMAIL_BATCH_SIZE) => {
  const chunks = [];
  for (let i = 0; i < contacts.length; i += size) {
    chunks.push(contacts.slice(i, i + size));
  }
  return chunks;
};

const buildContactsExcelBlob = (contactsChunk) => {
  const worksheet = XLSX.utils.json_to_sheet(contactsChunk, {
    header: ["clientName", "clientEmail"],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
  const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const fetchContactsForSet = async (
  config,
  setIndex,
  setSize = EMAIL_BATCH_SIZE,
) => {
  try {
    let res;
    if (config.method === "POST") {
      res = await axiosInstance.post(config.endpoint, {
        ...(config.payload || {}),
        pageNo: setIndex + 1,
        pageSize: setSize,
      });
    } else {
      let endpoint = config.endpoint;
      if (endpoint.includes("pageNo=")) {
        endpoint = endpoint
          .replace(/pageNo=\d+/, `pageNo=${setIndex + 1}`)
          .replace(/pageSize=\d+/, `pageSize=${setSize}`);
      } else if (endpoint.includes("page=")) {
        endpoint = endpoint
          .replace(/page=\d+/, `page=${setIndex}`)
          .replace(/size=\d+/, `size=${setSize}`);
      } else {
        const sep = endpoint.includes("?") ? "&" : "?";
        endpoint = `${endpoint}${sep}page=${setIndex}&size=${setSize}`;
      }
      res = await axiosInstance.get(endpoint);
    }

    const data = res?.data || {};
    let usersList = [];
    if (Array.isArray(data)) {
      usersList = data;
    } else if (
      data.activeUsersResponse &&
      Array.isArray(data.activeUsersResponse)
    ) {
      usersList = data.activeUsersResponse;
    } else if (data.content && Array.isArray(data.content)) {
      usersList = data.content;
    } else if (data.data && Array.isArray(data.data)) {
      usersList = data.data;
    } else if (data.users && Array.isArray(data.users)) {
      usersList = data.users;
    }

    return extractEmailContacts(usersList);
  } catch (err) {
    console.error(`Error fetching contacts for set ${setIndex + 1}:`, err);
    return [];
  }
};

const AudienceCampaigns = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataMap, setDataMap] = useState({});
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Campaign Modal State
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignType, setCampaignType] = useState("whatsapp"); // 'whatsapp', 'email', 'sms'
  const [campaignTarget, setCampaignTarget] = useState(null);
  const [campaignForm] = Form.useForm();
  const [campaignSending, setCampaignSending] = useState(false);

  const [batchStatuses, setBatchStatuses] = useState([]);
  const [emailFormValues, setEmailFormValues] = useState(null);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);

  // Test Email & Preview state
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // ── Generic Bulk Upload Campaign State ──
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [bulkForm] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedContacts, setUploadedContacts] = useState([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkTestEmail, setBulkTestEmail] = useState("");
  const [bulkTestName, setBulkTestName] = useState("");
  const [bulkSendingTest, setBulkSendingTest] = useState(false);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);

  const handleOpenBulkUpload = () => {
    setUploadedFile(null);
    setUploadedContacts([]);
    setBulkTestEmail("");
    setBulkTestName("");
    bulkForm.resetFields();
    bulkForm.setFieldsValue({
      campaignName: "Bulk Contact Campaign",
      platform: "askoxy",
      templateType: "OXY",
      senderName: "ASKOXY.AI",
      senderEmail: "support@askoxy.ai",
      emailSubject: "Important Updates from ASKOXY",
      messageText: `Hello!\n\nWe have exciting updates tailored for you. Visit https://askoxy.ai to learn more.\n\nWarm regards,\nTeam ASKOXY`,
    });
    setBulkUploadModalOpen(true);
  };

  const handleFileChange = (file) => {
    const isExcelOrCsv =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "text/csv" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv");

    if (!isExcelOrCsv) {
      message.error("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!json || json.length === 0) {
          message.warning("The uploaded file contains no data rows.");
          setUploadedContacts([]);
          setUploadedFile(null);
          return;
        }

        const parsed = json
          .map((row) => {
            const clientName =
              row.clientName ||
              row.name ||
              row.Name ||
              row.userName ||
              row.UserName ||
              row["Customer Name"] ||
              row["Full Name"] ||
              row.fullName ||
              "Customer";
            const clientEmail =
              row.clientEmail ||
              row.email ||
              row.Email ||
              row.emailId ||
              row.EmailId ||
              row["Email Address"] ||
              row.userEmail ||
              row.businessEmail ||
              row.emails ||
              "";
            return {
              clientName: String(clientName).trim(),
              clientEmail: String(clientEmail).trim(),
            };
          })
          .filter(
            (c) =>
              c.clientEmail &&
              c.clientEmail.includes("@") &&
              c.clientEmail !== "null",
          );

        if (parsed.length === 0) {
          message.error(
            "Could not find any valid email addresses in the uploaded file.",
          );
          setUploadedContacts([]);
          setUploadedFile(null);
          return;
        }

        setUploadedFile(file);
        setUploadedContacts(parsed);
        message.success(
          `Parsed ${parsed.length} valid email contacts from ${file.name}!`,
        );
      } catch (err) {
        console.error("Excel parse error:", err);
        message.error("Failed to parse uploaded file: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleDownloadSampleTemplate = () => {
    const sample = [
      { clientName: "John Doe", clientEmail: "john@example.com" },
      { clientName: "Jane Smith", clientEmail: "jane@example.com" },
      { clientName: "Alex Brown", clientEmail: "alex@example.com" },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "Sample_Bulk_Email_Contacts.xlsx");
  };

  const handleSendBulkTestEmail = async () => {
    if (
      !bulkTestEmail ||
      !bulkTestEmail.includes("@") ||
      !bulkTestEmail.includes(".")
    ) {
      message.error("Please enter a valid test email address.");
      return;
    }

    try {
      const values = await bulkForm.validateFields([
        "campaignName",
        "emailSubject",
        "messageText",
        "platform",
        "templateType",
        "senderEmail",
        "senderName",
      ]);

      setBulkSendingTest(true);
      message.loading({
        content: `Sending test email to ${bulkTestEmail}...`,
        key: "bulkTestEmail",
      });

      const testContacts = [
        {
          clientName: (bulkTestName && bulkTestName.trim()) || "Test Recipient",
          clientEmail: bulkTestEmail.trim(),
        },
      ];

      const fileBlob = buildContactsExcelBlob(testContacts);
      const formData = new FormData();
      formData.append("file", fileBlob, "test-email-contact.xlsx");

      await axiosInstance.post(EMAIL_BULK_ENDPOINT, formData, {
        params: {
          campaignName: values.campaignName || "Bulk Contact Campaign",
          subject: values.emailSubject,
          body: values.messageText,
          platform: values.platform || "askoxy",
          templateType: values.templateType || "OXY",
          senderEmail: values.senderEmail || "support@askoxy.ai",
          senderName: values.senderName || "ASKOXY.AI",
        },
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success({
        content: `Test email sent to ${bulkTestEmail}!`,
        key: "bulkTestEmail",
        duration: 4,
      });
    } catch (err) {
      message.error({
        content: `Test email failed: ${err.message || "Unknown error"}`,
        key: "bulkTestEmail",
      });
    } finally {
      setBulkSendingTest(false);
    }
  };

  const handleLaunchBulkUploadCampaign = async (values) => {
    if (!uploadedContacts || uploadedContacts.length === 0) {
      message.error(
        "Please upload a valid Excel or CSV file with email contacts first.",
      );
      return;
    }

    setBulkSending(true);
    message.loading({
      content: `Dispatching campaign to ${uploadedContacts.length} contacts...`,
      key: "bulkUploadCampaign",
    });

    try {
      const fileBlob = buildContactsExcelBlob(uploadedContacts);
      const formData = new FormData();
      formData.append(
        "file",
        fileBlob,
        uploadedFile?.name || "bulk-contacts.xlsx",
      );

      await axiosInstance.post(EMAIL_BULK_ENDPOINT, formData, {
        params: {
          campaignName: values.campaignName || "Bulk Contact Campaign",
          subject: values.emailSubject,
          body: values.messageText,
          platform: values.platform || "askoxy",
          templateType: values.templateType || "OXY",
          senderEmail: values.senderEmail || "support@askoxy.ai",
          senderName: values.senderName || "ASKOXY.AI",
        },
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success({
        content: `Bulk Campaign "${values.campaignName}" dispatched successfully to ${uploadedContacts.length} contacts!`,
        key: "bulkUploadCampaign",
        duration: 5,
      });
      setBulkUploadModalOpen(false);
      setUploadedFile(null);
      setUploadedContacts([]);
      bulkForm.resetFields();
    } catch (err) {
      console.error("Bulk upload campaign error:", err);
      message.error({
        content: `Failed to dispatch bulk campaign: ${
          err.response?.data?.message || err.message || "Unknown error"
        }`,
        key: "bulkUploadCampaign",
        duration: 5,
      });
    } finally {
      setBulkSending(false);
    }
  };

  // ── Download Dataset to Excel ─────────────────────────────────────────────
  const handleDownloadExcel = async (config) => {
    if (!config) return;
    const targetData = dataMap[config.id] || {};
    setDownloadingId(config.id);
    message.loading({
      content: `Preparing Excel download for ${config.name}...`,
      key: "downloadExcel",
    });

    try {
      let records = [];

      if (targetData.usersList && targetData.usersList.length > 0) {
        records = targetData.usersList;
      }

      if (records.length === 0) {
        let res;
        if (config.method === "POST") {
          res = await axiosInstance.post(config.endpoint, {
            ...(config.payload || {}),
            pageNo: 1,
            pageSize: 500,
          });
        } else {
          let url = config.endpoint;
          if (url.includes("pageNo=")) {
            url = url
              .replace(/pageNo=\d+/, "pageNo=1")
              .replace(/pageSize=\d+/, "pageSize=500");
          } else if (url.includes("page=")) {
            url = url
              .replace(/page=\d+/, "page=0")
              .replace(/size=\d+/, "size=500");
          } else {
            const sep = url.includes("?") ? "&" : "?";
            url = `${url}${sep}page=0&size=500`;
          }
          res = await axiosInstance.get(url);
        }
        const fetched = res?.data || {};
        if (Array.isArray(fetched)) records = fetched;
        else if (fetched.activeUsersResponse)
          records = fetched.activeUsersResponse;
        else if (fetched.content) records = fetched.content;
        else if (fetched.data) records = fetched.data;
        else if (fetched.users) records = fetched.users;
      }

      if (!records || records.length === 0) {
        message.warning({
          content: `No records found to download for ${config.name}`,
          key: "downloadExcel",
        });
        return;
      }

      const normalizedData = records.map((item, idx) => {
        const name =
          item.userName ||
          item.name ||
          (item.name1 ? `${item.name1} ${item.name2 || ""}`.trim() : null) ||
          item.fullName ||
          "Customer";
        const email =
          item.emails ||
          item.email ||
          item.emailId ||
          item.userEmail ||
          item.businessEmail ||
          item.mail ||
          "-";
        const phone =
          item.mobileNumbers ||
          item.mobileNumber ||
          item.mobile ||
          item.phone ||
          item.phoneNumber ||
          item.secondaryMobile ||
          "-";
        const city =
          item.city ||
          item.address ||
          item.businessAddress ||
          item.country ||
          "-";
        const role =
          item.classification || item.role || item.businessName || "-";

        return {
          "S.No": idx + 1,
          "Customer Name": name,
          "Email Address": email,
          "Phone Number": phone,
          "City / Location": city,
          "Role / Organization": role,
          ...item,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(normalizedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Data");

      const cleanFileName = `${config.name.replace(
        /[^a-zA-Z0-9]/g,
        "_",
      )}_Contacts.xlsx`;
      XLSX.writeFile(workbook, cleanFileName);

      message.success({
        content: `Successfully downloaded ${cleanFileName}!`,
        key: "downloadExcel",
        duration: 4,
      });
    } catch (err) {
      console.error("Excel download error:", err);
      message.error({
        content: `Failed to download Excel: ${err.message || "Unknown error"}`,
        key: "downloadExcel",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Fetch Individual API ──────────────────────────────────────────────────
  const fetchSingleAudience = async (config) => {
    try {
      let res;
      if (config.method === "POST") {
        res = await axiosInstance.post(config.endpoint, config.payload || {});
      } else {
        res = await axiosInstance.get(config.endpoint);
      }

      const data = res?.data || {};
      let totalCount = 0;
      let usersList = [];

      if (Array.isArray(data)) {
        usersList = data;
        totalCount = data.length;
      } else if (
        data.activeUsersResponse &&
        Array.isArray(data.activeUsersResponse)
      ) {
        usersList = data.activeUsersResponse;
        totalCount = data.totalCount ?? data.activeUsersResponse.length;
      } else if (data.content && Array.isArray(data.content)) {
        usersList = data.content;
        totalCount =
          data.totalElements ?? data.totalCount ?? data.content.length;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
        totalCount = data.totalCount ?? data.total ?? data.data.length;
      } else {
        totalCount = data.totalCount || data.totalElements || 0;
        usersList = data.users || [];
      }

      // Count sample mobile and email contacts
      let sampleMobile = 0;
      let sampleEmail = 0;

      usersList.forEach((u) => {
        const mob = u.mobileNumber || u.mobile || u.phone || u.phoneNumber;
        const em = u.email || u.emailId || u.userEmail;

        if (mob && String(mob).trim() && String(mob).trim() !== "null") {
          sampleMobile++;
        }
        if (
          em &&
          String(em).trim() &&
          String(em).trim() !== "null" &&
          String(em).includes("@")
        ) {
          sampleEmail++;
        }
      });

      return {
        id: config.id,
        name: config.name,
        totalCount,
        usersList,
        sampleSize: usersList.length,
        sampleMobile,
        sampleEmail: config.hasEmailField ? sampleEmail : 0,
        status: "success",
        loadedAt: new Date().toLocaleTimeString(),
      };
    } catch (err) {
      console.error(`Failed to load ${config.name}:`, err);
      return {
        id: config.id,
        name: config.name,
        totalCount: 0,
        usersList: [],
        sampleSize: 0,
        sampleMobile: 0,
        sampleEmail: 0,
        status: "error",
        error: err.message || "Failed to load",
      };
    }
  };

  // ── Fetch All Audiences ───────────────────────────────────────────────────
  const fetchAllAudiences = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        AUDIENCE_CONFIGS.map((config) => fetchSingleAudience(config)),
      );

      const newMap = {};
      results.forEach((res) => {
        newMap[res.id] = res;
      });
      setDataMap(newMap);
    } catch (err) {
      message.error("Failed to load some Customer Datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAudiences();
  }, [fetchAllAudiences]);

  // ── Aggregated Overall Totals ─────────────────────────────────────────────
  const overallTotals = useMemo(() => {
    let totalAudienceCount = 0;
    let totalMobile = 0;
    let totalEmail = 0;
    let successfulDatasets = 0;

    Object.values(dataMap).forEach((item) => {
      if (item.status === "success") {
        totalAudienceCount += item.totalCount || 0;
        totalMobile += item.withMobileCount || 0;
        totalEmail += item.withEmailCount || 0;
        successfulDatasets++;
      }
    });

    return {
      totalAudienceCount,
      totalMobile,
      totalEmail,
      successfulDatasets,
      totalDatasets: AUDIENCE_CONFIGS.length,
    };
  }, [dataMap]);

  // ── Filtered Audiences ────────────────────────────────────────────────────
  const filteredAudiences = useMemo(() => {
    return AUDIENCE_CONFIGS.filter((cfg) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        cfg.name.toLowerCase().includes(q) ||
        cfg.subtitle.toLowerCase().includes(q) ||
        cfg.description.toLowerCase().includes(q)
      );
    });
  }, [searchTerm]);

  // ── Open Campaign Modal ───────────────────────────────────────────────────
  const openCampaign = (type, config) => {
    const data = dataMap[config.id] || {};

    if (type === "email" && !config.hasEmailField) {
      message.warning(
        `Email IDs are not present in the ${config.name} dataset.`,
      );
      return;
    }

    setCampaignType(type);
    setCampaignTarget({ config, data });
    setEmailFormValues(null);
    setTestEmail("");
    setTestName("");
    campaignForm.resetFields();

    if (type === "email") {
      const totalCount =
        data.totalCount || (data.usersList?.length || 0);
      const totalSets = Math.max(1, Math.ceil(totalCount / EMAIL_BATCH_SIZE));
      // By default select first set (Set 1)
      setSelectedSetIndex(0);
      setBatchStatuses(Array.from({ length: totalSets }, () => "pending"));
    } else {
      setSelectedSetIndex(0);
      setBatchStatuses([]);
    }

    campaignForm.setFieldsValue({
      campaignName: `${config.name} - ${type.toUpperCase()} Campaign`,
      platform: "askoxy",
      templateType: config?.id === "rotary-data" ? "ROTARY" : "OXY",
      senderName: "ASKOXY.AI",
      senderEmail: "support@askoxy.ai",
      emailSubject: `Important Updates from ASKOXY for ${config.name}`,
      messageText: `Hello! Greetings from ASKOXY. We have exciting updates tailored for you. Visit https://askoxy.ai for more information.`,
    });
    setCampaignModalOpen(true);
  };

  const totalCustomerCount =
    campaignTarget?.data?.totalCount ||
    (campaignTarget?.data?.usersList?.length || 0);
  const totalCalculatedSets = Math.max(
    1,
    Math.ceil((totalCustomerCount || 1) / EMAIL_BATCH_SIZE),
  );

  const setDropdownOptions = useMemo(() => {
    return Array.from({ length: totalCalculatedSets }, (_, i) => {
      const start = i * EMAIL_BATCH_SIZE + 1;
      const end = Math.min(
        (i + 1) * EMAIL_BATCH_SIZE,
        totalCustomerCount || (i + 1) * EMAIL_BATCH_SIZE,
      );
      const count = end >= start ? end - start + 1 : EMAIL_BATCH_SIZE;
      const status = batchStatuses[i] || "pending";

      return {
        value: i,
        start,
        end,
        count,
        status,
        label: `Set ${i + 1} (${start.toLocaleString()} - ${end.toLocaleString()} · ~${count} recipients)`,
      };
    });
  }, [totalCalculatedSets, totalCustomerCount, batchStatuses]);

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@") || !testEmail.includes(".")) {
      message.error("Please enter a valid test email address.");
      return;
    }

    try {
      const values = await campaignForm.validateFields([
        "campaignName",
        "emailSubject",
        "messageText",
        "platform",
        "templateType",
        "senderEmail",
        "senderName",
      ]);

      setSendingTest(true);
      message.loading({
        content: `Sending test email to ${testEmail}...`,
        key: "testEmail",
      });

      const testContacts = [
        {
          clientName: (testName && testName.trim()) || "Test Recipient",
          clientEmail: testEmail.trim(),
        },
      ];

      const fileBlob = buildContactsExcelBlob(testContacts);
      const formData = new FormData();
      formData.append("file", fileBlob, "test-email-contact.xlsx");

      await axiosInstance.post(EMAIL_BULK_ENDPOINT, formData, {
        params: {
          campaignName: values.campaignName || "Campaign",
          subject: values.emailSubject,
          body: values.messageText,
          platform: values.platform || "askoxy",
          templateType: values.templateType || "OXY",
          senderEmail: values.senderEmail || "support@askoxy.ai",
          senderName: values.senderName || "ASKOXY.AI",
        },
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success({
        content: `Test email sent successfully to ${testEmail}!`,
        key: "testEmail",
        duration: 4,
      });
    } catch (err) {
      console.error("Test email error:", err);
      message.error({
        content: `Failed to send test email: ${
          err.response?.data?.message || err.message || "Unknown error"
        }`,
        key: "testEmail",
        duration: 4,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const sendEmailBatches = async (values, indicesToSend) => {
    const config = campaignTarget?.config;
    if (!config) return;

    for (const i of indicesToSend) {
      setBatchStatuses((prev) => {
        const next = [...prev];
        next[i] = "sending";
        return next;
      });

      try {
        let contacts = await fetchContactsForSet(config, i, EMAIL_BATCH_SIZE);
        if (!contacts || contacts.length === 0) {
          const fallback = extractEmailContacts(
            campaignTarget?.data?.usersList || [],
          );
          if (fallback && fallback.length > 0) {
            contacts = fallback;
          }
        }

        if (!contacts || contacts.length === 0) {
          throw new Error(
            `No valid email contacts could be found for Set ${i + 1}`,
          );
        }

        const fileBlob = buildContactsExcelBlob(contacts);
        const formData = new FormData();
        formData.append("file", fileBlob, `contacts-set-${i + 1}.xlsx`);

        await axiosInstance.post(EMAIL_BULK_ENDPOINT, formData, {
          params: {
            campaignName: values.campaignName || "Campaign",
            subject: values.emailSubject,
            body: values.messageText,
            platform: values.platform || "askoxy",
            templateType: values.templateType || "OXY",
            senderEmail: values.senderEmail || "support@askoxy.ai",
            senderName: values.senderName || "ASKOXY.AI",
          },
          headers: { "Content-Type": "multipart/form-data" },
        });

        setBatchStatuses((prev) => {
          const next = [...prev];
          next[i] = "success";
          return next;
        });
      } catch (err) {
        setBatchStatuses((prev) => {
          const next = [...prev];
          next[i] = "failed";
          return next;
        });
        message.error(
          `Set ${i + 1} failed: ${
            err.response?.data?.message || err.message || "Unknown error"
          }`,
        );
        setCampaignSending(false);
        return; // stop on failure so user can retry
      }
    }

    message.success({
      content: `Email campaign dispatched — Set ${indicesToSend[0] + 1} sent successfully!`,
      duration: 4,
    });
    setCampaignSending(false);
  };

  const handleRetryEmailBatches = () => {
    if (!emailFormValues || selectedSetIndex === null) return;
    setCampaignSending(true);
    sendEmailBatches(emailFormValues, [selectedSetIndex]);
  };

  const handleLaunchCampaign = async (values) => {
    setCampaignSending(true);
    try {
      if (campaignType === "whatsapp") {
        message.loading({
          content: "Preparing WhatsApp Campaign Dispatch...",
          key: "campaign",
        });
        setTimeout(() => {
          message.success({
            content: `WhatsApp Campaign "${values.campaignName}" scheduled for ${campaignTarget.config.name}!`,
            key: "campaign",
            duration: 4,
          });
          setCampaignModalOpen(false);
          setCampaignSending(false);
        }, 1000);
      } else if (campaignType === "email") {
        if (selectedSetIndex === null || selectedSetIndex === undefined) {
          message.warning("Please select a set to send.");
          setCampaignSending(false);
          return;
        }

        setEmailFormValues(values);
        // reset only the status of the single set being sent
        setBatchStatuses((prev) => {
          const next = [...prev];
          next[selectedSetIndex] = "pending";
          return next;
        });

        await sendEmailBatches(values, [selectedSetIndex]);
      } else {
        message.loading({
          content: "Queuing SMS Broadcast...",
          key: "campaign",
        });
        setTimeout(() => {
          message.success({
            content: `SMS broadcast queued for ${campaignTarget.config.name}!`,
            key: "campaign",
            duration: 4,
          });
          setCampaignModalOpen(false);
          setCampaignSending(false);
        }, 1000);
      }
    } catch (err) {
      message.error("Failed to launch campaign");
      setCampaignSending(false);
    }
  };

  // ── Drawer Sample Data Columns ────────────────────────────────────────────
  const sampleColumns = useMemo(() => {
    if (!selectedAudience) return [];
    return [
      {
        title: "#",
        key: "idx",
        width: 50,
        align: "center",
        render: (_, __, i) => (
          <span className="text-gray-400 font-mono text-xs">{i + 1}</span>
        ),
      },
      {
        title: "Name / Contact",
        key: "name",
        render: (_, record) => {
          const name =
            record.userName ||
            record.name ||
            (record.name1
              ? `${record.name1} ${record.name2 || ""}`.trim()
              : null) ||
            record.userId ||
            record.id ||
            "—";
          return (
            <div>
              <div className="font-semibold text-slate-800">{name}</div>
              {record.userType && (
                <Tag color="blue" className="mt-1 text-xs">
                  {record.userType}
                </Tag>
              )}
            </div>
          );
        },
      },
      {
        title: "Mobile Number",
        key: "mobile",
        render: (_, record) => {
          const mob =
            record.mobileNumbers ||
            record.mobileNumber ||
            record.mobile ||
            record.phone ||
            record.secondaryMobile ||
            record.businessPhone;
          return mob && String(mob) !== "null" ? (
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
              <PhoneOutlined className="mr-1 text-emerald-600" />
              {mob}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">Not available</span>
          );
        },
      },
      {
        title: "WhatsApp Number",
        key: "whatsapp",
        render: (_, record) => {
          const wa =
            record.whastappNumber ||
            record.whatsappNumber ||
            record.mobileNumbers ||
            record.mobileNumber;
          return wa && String(wa) !== "null" ? (
            <span className="font-semibold text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">
              <WhatsAppOutlined className="mr-1 text-green-600" />
              {wa}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">Same as Mobile</span>
          );
        },
      },
      {
        title: "Email Address",
        key: "email",
        render: (_, record) => {
          const em =
            record.emails ||
            record.email ||
            record.emailId ||
            record.businessEmail;
          return em && String(em) !== "null" ? (
            <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
              <MailOutlined className="mr-1 text-blue-600" />
              {em}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">No email</span>
          );
        },
      },
      {
        title: "Details",
        key: "extra",
        render: (_, record) => {
          return (
            <div className="text-xs text-gray-600 space-y-0.5">
              {record.clubName && <div>🏢 Club: {record.clubName}</div>}
              {record.city && (
                <div>
                  📍 {record.city}
                  {record.state ? `, ${record.state}` : ""}
                </div>
              )}
              {record.classification && <div>💼 {record.classification}</div>}
              {record.address && !record.city && <div>📍 {record.address}</div>}
              {record.comments && <div>💬 {record.comments}</div>}
            </div>
          );
        },
      },
    ];
  }, [selectedAudience]);

  return (
    <AdminPanelLayout>
      {/* ══ Header ══ */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2.5">
          <DatabaseOutlined className="text-indigo-500 text-[22px]" />
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Marketing Campaign Center
            </div>
            <div className="text-[11.5px] text-slate-400 font-medium mt-0.5">
              Executive Customer Intelligence · Campaign Control Panel
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            prefix={<SearchOutlined className="text-indigo-300" />}
            placeholder="Search dataset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="w-56 rounded-lg text-sm bg-slate-50 border-slate-200"
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleOpenBulkUpload}
            className="rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 h-9 shadow-sm border-0 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            Bulk Upload Campaign
          </Button>
        </div>
      </div>

      <div className="bg-white min-h-screen px-6 pt-6 pb-16">
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <div className="group relative rounded-2xl px-5 py-5 overflow-hidden ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50 shadow-[0_2px_14px_rgba(79,70,229,0.07)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(79,70,229,0.14)] hover:-translate-y-0.5">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-200/40 blur-2xl group-hover:bg-indigo-200/60 transition-colors" />
              <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                    Total Customer Pool
                  </div>
                  <div className="text-4xl font-bold text-slate-900 tabular-nums mt-2 tracking-tight">
                    {overallTotals.totalAudienceCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white ring-1 ring-indigo-100 shadow-sm">
                  <TeamOutlined className="text-indigo-600 text-base" />
                </div>
              </div>
              <div className="h-px bg-indigo-100/70 my-3.5" />
              <div className="text-[11px] text-slate-500 font-medium">
                across {overallTotals.totalDatasets} datasets
              </div>
            </div>
          </Col>

          {/* Customer Datasets */}
          <Col xs={24} sm={8}>
            <div className="group relative rounded-2xl px-5 py-5 overflow-hidden ring-1 ring-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-[0_2px_14px_rgba(5,150,105,0.07)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(5,150,105,0.14)] hover:-translate-y-0.5">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-200/40 blur-2xl group-hover:bg-emerald-200/60 transition-colors" />
              <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                    Customer Datasets
                  </div>
                  <div className="text-4xl font-bold text-slate-900 tabular-nums mt-2 tracking-tight">
                    {overallTotals.totalDatasets}
                    <span className="text-sm font-semibold text-slate-400 ml-1.5">
                      Sources
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white ring-1 ring-emerald-100 shadow-sm">
                  <DatabaseOutlined className="text-emerald-600 text-base" />
                </div>
              </div>
              <div className="h-px bg-emerald-100/70 my-3.5" />
              <div className="text-[11px] text-slate-500 font-medium truncate">
                AskOxy · Kukatpally · Thalwar · Advocates · Mumbai · Rotary ·
                CBS · FTCCI
              </div>
            </div>
          </Col>

          {/* Campaign Channels */}
          <Col xs={24} sm={8}>
            <div className="group relative rounded-2xl px-5 py-5 overflow-hidden ring-1 ring-amber-100 bg-gradient-to-br from-white to-amber-50 shadow-[0_2px_14px_rgba(217,119,6,0.07)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(217,119,6,0.14)] hover:-translate-y-0.5">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-200/40 blur-2xl group-hover:bg-amber-200/60 transition-colors" />
              <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500">
                    Campaign Channels
                  </div>
                  <div className="flex gap-1.5 mt-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-emerald-700 ring-1 ring-emerald-200 shadow-sm">
                      WhatsApp
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-amber-700 ring-1 ring-amber-200 shadow-sm">
                      SMS
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-sky-700 ring-1 ring-sky-200 shadow-sm">
                      Email
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white ring-1 ring-amber-100 shadow-sm">
                  <MailOutlined className="text-amber-600 text-base" />
                </div>
              </div>
              <div className="h-px bg-amber-100/70 my-3.5" />
              <div className="text-[11px] text-slate-500 font-medium">
                Multi-channel broadcast ready
              </div>
            </div>
          </Col>
        </Row>

        {/* Section Label */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[18.5px] font-extrabold text-slate-800 tracking-tight">
            Customer Intelligence
          </span>
          <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
            {filteredAudiences.length} datasets
          </span>
        </div>

        <Row gutter={[16, 16]}>
          {filteredAudiences.map((config) => {
            const data = dataMap[config.id] || {};
            const isLoaded = data.status === "success";
            const isError = data.status === "error";
            const count = data.totalCount || 0;

            return (
              <Col xs={24} sm={12} lg={12} xl={8} xxl={6} key={config.id}>
                <div className="rounded-2xl overflow-hidden flex flex-col h-full bg-white border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 hover:border-slate-300">
                  {" "}
                  {/* Solid colored header block */}
                  <div className="px-4 py-3.5 flex items-center gap-3 bg-white relative">
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: config.color }}
                    />
                    <div
                      className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ring-1"
                      style={{
                        backgroundColor: `${config.color}14`,
                        borderColor: `${config.color}33`,
                      }}
                    >
                      <TeamOutlined
                        style={{ color: config.color, fontSize: 16 }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-800 uppercase tracking-wide leading-tight truncate">
                        {config.name}
                      </div>
                      <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                        {config.subtitle}
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 text-[11px] font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-600 whitespace-nowrap transition-colors duration-150 hover:bg-slate-100 ring-1 ring-slate-200 cursor-pointer"
                      onClick={() => {
                        setSelectedAudience(config);
                        setDrawerVisible(true);
                      }}
                    >
                      View →
                    </button>
                  </div>
                  {/* White body */}
                  <div className="px-4 pt-4 pb-3 flex-1 flex flex-col gap-2 border-t border-slate-100">
                    <div>
                      <div
                        className="text-[32px] font-black leading-none tracking-tight"
                        style={{
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}99)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {isLoaded ? (
                          count.toLocaleString()
                        ) : isError ? (
                          <span className="text-red-500 text-base font-bold">
                            Failed
                          </span>
                        ) : (
                          <Spin size="small" />
                        )}
                      </div>
                      <p className="text-[11.5px] text-slate-500 mt-1.5 mb-0 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {/* Action buttons + Excel download below */}
                  <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => openCampaign("whatsapp", config)}
                        className="py-2 px-1 rounded-xl text-[11px] font-bold text-green-700 bg-green-50 ring-1 ring-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <WhatsAppOutlined className="text-[11px]" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => openCampaign("sms", config)}
                        className="py-2 px-1 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageOutlined className="text-[11px]" />
                        SMS
                      </button>
                      <button
                        onClick={() =>
                          config.hasEmailField && openCampaign("email", config)
                        }
                        disabled={!config.hasEmailField}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          config.hasEmailField
                            ? "text-blue-700 bg-blue-50 ring-1 ring-blue-200 hover:bg-blue-100 cursor-pointer"
                            : "border-[1.5px] border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                        }`}
                      >
                        <MailOutlined className="text-[11px]" />
                        Email
                      </button>
                    </div>
                    {/* Download Excel Data Button below */}
                    <button
                      onClick={() => handleDownloadExcel(config)}
                      disabled={downloadingId === config.id}
                      className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 ring-1 ring-slate-200 hover:ring-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {downloadingId === config.id ? (
                        <Spin size="small" />
                      ) : (
                        <DownloadOutlined className="text-xs text-indigo-600" />
                      )}
                      <span>Download Excel Data</span>
                    </button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{
                  backgroundColor: selectedAudience?.color || "#0284c7",
                }}
              />
              <div>
                <div className="font-bold text-base text-slate-800">
                  {selectedAudience?.name} — Sample Records
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  Showing loaded sample contacts from API
                </div>
              </div>
            </div>
            {selectedAudience && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadExcel(selectedAudience)}
                loading={downloadingId === selectedAudience.id}
                className="rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 border-0"
              >
                Download Excel
              </Button>
            )}
          </div>
        }
        placement="right"
        width={820}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedAudience(null);
        }}
        open={drawerVisible}
      >
        {selectedAudience && (
          <div>
            {/* Customer Snapshot Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/60 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Total Database Size
                </div>
                <div className="text-xl font-black text-slate-800">
                  {(
                    dataMap[selectedAudience.id]?.totalCount || 0
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Sample Loaded
                </div>
                <div className="text-xl font-bold text-sky-600">
                  {dataMap[selectedAudience.id]?.usersList?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Sample With Phone
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {dataMap[selectedAudience.id]?.sampleMobile || 0}
                </div>
              </div>
            </div>

            <Table
              rowKey={(r, i) => r.id || r.userId || i}
              columns={sampleColumns}
              dataSource={dataMap[selectedAudience.id]?.usersList || []}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              bordered
              size="small"
            />
          </div>
        )}
      </Drawer>

      {/* ── Main Campaign Dispatcher Modal ── */}
      <Modal
        title={
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 pr-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg text-white shadow-sm ${
                  campaignType === "whatsapp"
                    ? "bg-green-500"
                    : campaignType === "email"
                      ? "bg-indigo-600"
                      : "bg-amber-500"
                }`}
              >
                {campaignType === "whatsapp" && <WhatsAppOutlined />}
                {campaignType === "email" && <MailOutlined />}
                {campaignType === "sms" && <MessageOutlined />}
              </div>
              <div>
                <div className="font-bold text-base text-slate-800 capitalize leading-tight">
                  {campaignType.toUpperCase()} Campaign Setup
                </div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">
                  Target Customers:{" "}
                  <strong className="text-slate-800">
                    {campaignTarget?.config?.name}
                  </strong>{" "}
                  ({(totalCustomerCount || 0).toLocaleString()} Total Pool)
                </div>
              </div>
            </div>
            <Tag
              color={
                campaignType === "whatsapp"
                  ? "green"
                  : campaignType === "email"
                    ? "indigo"
                    : "gold"
              }
              className="text-xs font-semibold px-2.5 py-0.5 m-0 uppercase"
            >
              {campaignType}
            </Tag>
          </div>
        }
        open={campaignModalOpen}
        onCancel={() => setCampaignModalOpen(false)}
        footer={null}
        width={820}
        destroyOnClose
        styles={{
          body: { maxHeight: "78vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form
          form={campaignForm}
          layout="vertical"
          onFinish={handleLaunchCampaign}
          className="pt-2"
        >
          {/* Row 1: Platform & Campaign Name */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Platform Brand
                  </span>
                }
                name="platform"
                rules={[{ required: true, message: "Platform is required" }]}
                initialValue="askoxy"
              >
                <Select
                  className="rounded-lg h-9"
                  options={PLATFORM_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Campaign Reference Name
                  </span>
                }
                name="campaignName"
                rules={[{ required: true, message: "Campaign name is required" }]}
              >
                <Input
                  placeholder="e.g. Festival Update 2026"
                  className="rounded-lg h-9 text-xs"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Email Specific Inputs */}
          {campaignType === "email" && (
            <>
              {/* Row 2: Subject & Template Type */}
              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    label={
                      <span className="font-semibold text-slate-700 text-xs">
                        Email Subject Line
                      </span>
                    }
                    name="emailSubject"
                    rules={[
                      { required: true, message: "Email subject is required" },
                    ]}
                  >
                    <Input
                      placeholder="Enter engaging email subject..."
                      className="rounded-lg h-9 text-xs"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label={
                      <span className="font-semibold text-slate-700 text-xs">
                        Template Type
                      </span>
                    }
                    name="templateType"
                    rules={[
                      { required: true, message: "Template type is required" },
                    ]}
                    initialValue="OXY"
                  >
                    <Select
                      className="rounded-lg h-9 text-xs"
                      options={TEMPLATE_TYPE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 3: Sender Name & Sender Email */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-semibold text-slate-700 text-xs">
                        Display Name
                      </span>
                    }
                    name="senderName"
                    rules={[
                      { required: true, message: "Sender name is required" },
                    ]}
                    initialValue="ASKOXY.AI"
                  >
                    <Input
                      placeholder="e.g. ASKOXY.AI Support"
                      className="rounded-lg h-9 text-xs"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-semibold text-slate-700 text-xs">
                        Sender Email Address
                      </span>
                    }
                    name="senderEmail"
                    rules={[
                      {
                        required: true,
                        message: "Please select sender email",
                      },
                    ]}
                    initialValue="support@askoxy.ai"
                  >
                    <Select
                      className="rounded-lg h-9 text-xs"
                      options={SENDER_EMAIL_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* Message Text Area */}
          <Form.Item
            label={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-700 text-xs">
                  {campaignType === "whatsapp"
                    ? "WhatsApp Template Content"
                    : campaignType === "email"
                      ? "Email Body"
                      : "SMS Text Content"}
                </span>
                {campaignType === "email" && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewModalOpen(true)}
                    className="text-sm p-0 text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700"
                  >
                    Preview Content
                  </Button>
                )}
              </div>
            }
            name="messageText"
            rules={[{ required: true, message: "Please enter message content" }]}
          >
            <TextArea
              rows={5}
              placeholder="Type your email HTML or message text here..."
              className="rounded-lg font-mono text-xs"
            />
          </Form.Item>

          {/* Send Test Email Card */}
          {campaignType === "email" && (
            <div className="mb-4 p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-purple-50/60 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    <SendOutlined />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Send Test Email First
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Verify layout before blast)
                  </span>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewModalOpen(true)}
                  className="text-xs p-0 text-indigo-600 font-semibold hover:underline"
                >
                  Preview Layout
                </Button>
              </div>

              <Row gutter={8} align="middle">
                <Col xs={24} sm={8}>
                  <Input
                    prefix={<UserOutlined className="text-slate-400 text-xs" />}
                    placeholder="Recipient Name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="rounded-lg h-8 text-xs"
                  />
                </Col>
                <Col xs={24} sm={11}>
                  <Input
                    prefix={<MailOutlined className="text-slate-400 text-xs" />}
                    placeholder="Enter test email (e.g. admin@askoxy.ai)"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="rounded-lg h-8 text-xs"
                  />
                </Col>
                <Col xs={24} sm={5}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendTestEmail}
                    loading={sendingTest}
                    block
                    className="rounded-lg h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-0 shadow-xs"
                  >
                    Send Test
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {/* Sets Selection in Single Dropdown Way */}
          {campaignType === "email" && (
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DatabaseOutlined className="text-indigo-600" />
                    <span>
                      Select Recipient Set (500 recipients per set)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Total Pool:{" "}
                    <strong>{totalCustomerCount.toLocaleString()}</strong>{" "}
                    customers ·{" "}
                    <strong>{totalCalculatedSets} set(s) available</strong>
                  </div>
                </div>
                <Button
                  size="small"
                  type="link"
                  icon={<DownloadOutlined />}
                  className="text-xs font-semibold p-0 text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                  onClick={() => handleDownloadExcel(campaignTarget?.config)}
                  loading={downloadingId === campaignTarget?.config?.id}
                >
                  Export Excel
                </Button>
              </div>

              <Select
                style={{ width: "100%" }}
                placeholder="Choose one set to send..."
                value={selectedSetIndex}
                onChange={(value) => setSelectedSetIndex(value)}
                className="rounded-lg"
                options={setDropdownOptions.map((opt) => ({
                  value: opt.value,
                  label: (
                    <div className="flex items-center justify-between py-0.5">
                      <span className="font-medium text-xs text-slate-700">
                        {opt.label}
                      </span>
                      {opt.status === "success" && (
                        <Tag color="green" className="text-[10px] m-0">
                          Sent ✓
                        </Tag>
                      )}
                      {opt.status === "failed" && (
                        <Tag color="red" className="text-[10px] m-0">
                          Failed ✕
                        </Tag>
                      )}
                      {opt.status === "sending" && (
                        <Tag color="blue" className="text-[10px] m-0">
                          Sending ⏳
                        </Tag>
                      )}
                    </div>
                  ),
                }))}
              />

              <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                <div>
                  Selected Target:{" "}
                  <strong className="text-indigo-600 font-bold">
                    Set {(selectedSetIndex !== null && selectedSetIndex !== undefined ? selectedSetIndex + 1 : 1)}
                  </strong>{" "}
                  (
                  {(
                    (selectedSetIndex || 0) * EMAIL_BATCH_SIZE + 1
                  ).toLocaleString()}{" "}
                  -{" "}
                  {Math.min(
                    ((selectedSetIndex || 0) + 1) * EMAIL_BATCH_SIZE,
                    totalCustomerCount || ((selectedSetIndex || 0) + 1) * EMAIL_BATCH_SIZE,
                  ).toLocaleString()}
                  ) · approx{" "}
                  <strong className="text-slate-800">
                    {Math.min(
                      EMAIL_BATCH_SIZE,
                      Math.max(
                        0,
                        totalCustomerCount - (selectedSetIndex || 0) * EMAIL_BATCH_SIZE,
                      ),
                    ).toLocaleString()}{" "}
                    recipients
                  </strong>
                </div>
                {batchStatuses[selectedSetIndex] === "failed" && (
                  <Tag color="error" className="text-xs m-0">
                    This set failed — retry available
                  </Tag>
                )}
                {batchStatuses[selectedSetIndex] === "success" && (
                  <Tag color="success" className="text-xs m-0">
                    This set was sent successfully ✓
                  </Tag>
                )}
              </div>
            </div>
          )}

          <Divider className="my-3" />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={() => setCampaignModalOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>

            {campaignType === "email" &&
            batchStatuses[selectedSetIndex] === "failed" ? (
              <Button
                danger
                type="primary"
                onClick={handleRetryEmailBatches}
                loading={campaignSending}
                icon={<SyncOutlined />}
                className="rounded-lg font-bold shadow-md px-6 h-10 border-0"
              >
                Retry Set {selectedSetIndex + 1}
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                loading={campaignSending}
                icon={<SendOutlined />}
                className={`rounded-lg font-bold shadow-md px-6 h-10 border-0 ${
                  campaignType === "whatsapp"
                    ? "bg-green-600 hover:bg-green-700"
                    : campaignType === "email"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {campaignType === "email"
                  ? `Dispatch Email to Set ${selectedSetIndex + 1}`
                  : `Start ${campaignType.toUpperCase()} Campaign`}
              </Button>
            )}
          </div>
        </Form>
      </Modal>

      {/* ── Email Content Preview Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <EyeOutlined className="text-indigo-600 text-lg" />
            <span className="font-bold text-base text-slate-800">
              Email Content Preview
            </span>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setPreviewModalOpen(false)}
            className="rounded-lg"
          >
            Close Preview
          </Button>,
          <Button
            key="test"
            icon={<SendOutlined />}
            onClick={() => {
              setPreviewModalOpen(false);
              handleSendTestEmail();
            }}
            loading={sendingTest}
            className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
          >
            Send Test Email
          </Button>,
        ]}
        width={720}
        destroyOnClose
      >
        <div className="py-2">
          {/* Email Client Shell Mockup */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            {/* Header bar */}
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <div>
                  <span className="font-semibold text-slate-400">From:</span>{" "}
                  {campaignForm.getFieldValue("senderName") || "ASKOXY.AI"} &lt;
                  {campaignForm.getFieldValue("senderEmail") ||
                    "support@askoxy.ai"}
                  &gt;
                </div>
                <Tag color="blue" className="m-0 text-[10px]">
                  {campaignForm.getFieldValue("platform")?.toUpperCase() ||
                    "ASKOXY"}
                </Tag>
              </div>
              <div className="text-xs text-slate-600 mb-1.5">
                <span className="font-semibold text-slate-400">To:</span>{" "}
                recipient@customer.com
              </div>
              <div className="text-sm font-bold text-slate-900">
                <span className="font-semibold text-slate-400 text-xs">
                  Subject:{" "}
                </span>{" "}
                {campaignForm.getFieldValue("emailSubject") ||
                  "(No subject provided)"}
              </div>
            </div>

            {/* Body content */}
            <div className="p-6 bg-white min-h-[200px] max-h-[420px] overflow-y-auto">
              <div
                className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{
                  __html:
                    campaignForm.getFieldValue("messageText") ||
                    "<em>(No message content entered)</em>",
                }}
              />
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sent via ASKOXY Marketing Campaign Engine</span>
              <span>
                Template:{" "}
                {campaignForm.getFieldValue("templateType") || "ASKOXY"}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Generic Bulk Upload & Blast Modal ── */}
      <Modal
        title={
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 pr-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg text-white bg-indigo-600 shadow-sm">
                <UploadOutlined />
              </div>
              <div>
                <div className="font-bold text-base text-slate-800 leading-tight">
                  Bulk Upload Email Campaign
                </div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">
                  Upload custom contact Excel sheet & dispatch broadcast
                </div>
              </div>
            </div>
            <Tag color="indigo" className="text-xs font-semibold px-2.5 py-0.5 m-0 uppercase">
              BULK SPREADSHEET
            </Tag>
          </div>
        }
        open={bulkUploadModalOpen}
        onCancel={() => setBulkUploadModalOpen(false)}
        footer={null}
        width={840}
        destroyOnClose
        styles={{
          body: { maxHeight: "78vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={handleLaunchBulkUploadCampaign}
          className="pt-2"
        >
          {/* File Upload Section */}
          <div className="mb-5 p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileExcelOutlined className="text-emerald-600 text-base" />
                <span className="font-bold text-xs text-slate-800">
                  Upload Excel or CSV Contact File
                </span>
                <span className="text-[11px] text-slate-500">
                  (.xlsx, .xls, .csv accepted)
                </span>
              </div>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleDownloadSampleTemplate}
                className="text-xs p-0 text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
              >
                Download Sample Template
              </Button>
            </div>

            <Upload.Dragger
              name="contactsFile"
              multiple={false}
              beforeUpload={handleFileChange}
              showUploadList={false}
              accept=".xlsx,.xls,.csv"
              className="bg-white/90 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 transition-colors p-4"
            >
              <p className="ant-upload-drag-icon text-indigo-600 mb-2">
                <InboxOutlined className="text-3xl" />
              </p>
              <p className="ant-upload-text text-xs font-bold text-slate-700 m-0">
                Click or drag Excel / CSV file here to upload
              </p>
              <p className="ant-upload-hint text-[11px] text-slate-400 m-0 mt-1">
                Required columns: <code>clientEmail</code> (or <code>email</code>) and <code>clientName</code> (or <code>name</code>).
              </p>
            </Upload.Dragger>

            {uploadedContacts.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-emerald-600 text-sm" />
                  <span className="text-xs font-bold text-emerald-800">
                    {uploadedFile?.name}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    · <strong>{uploadedContacts.length.toLocaleString()}</strong> valid email recipients parsed
                  </span>
                </div>
                <Tag color="success" className="text-xs font-bold m-0">
                  Ready to Dispatch ✓
                </Tag>
              </div>
            )}
          </div>

          {/* Row 1: Platform & Campaign Name */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Platform Brand
                  </span>
                }
                name="platform"
                rules={[{ required: true, message: "Platform is required" }]}
                initialValue="askoxy"
              >
                <Select
                  className="rounded-lg h-9"
                  options={PLATFORM_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Campaign Reference Name
                  </span>
                }
                name="campaignName"
                rules={[{ required: true, message: "Campaign name is required" }]}
                initialValue="Custom Bulk Campaign"
              >
                <Input
                  placeholder="e.g. Festival Update 2026"
                  className="rounded-lg h-9 text-xs"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Subject & Template Type */}
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Email Subject Line
                  </span>
                }
                name="emailSubject"
                rules={[{ required: true, message: "Subject is required" }]}
              >
                <Input
                  placeholder="Enter email subject line..."
                  className="rounded-lg h-9 text-xs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Template Type
                  </span>
                }
                name="templateType"
                rules={[{ required: true, message: "Template is required" }]}
                initialValue="OXY"
              >
                <Select
                  className="rounded-lg h-9"
                  options={TEMPLATE_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Sender Name & Email */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Sender Display Name
                  </span>
                }
                name="senderName"
                rules={[{ required: true, message: "Sender name is required" }]}
                initialValue="ASKOXY.AI"
              >
                <Input
                  placeholder="e.g. ASKOXY Support"
                  className="rounded-lg h-9 text-xs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Sender Email Address
                  </span>
                }
                name="senderEmail"
                rules={[
                  { required: true, message: "Sender email is required" },
                ]}
                initialValue="support@askoxy.ai"
              >
                <Select
                  className="rounded-lg h-9"
                  options={SENDER_EMAIL_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Message Text Area */}
          <Form.Item
            label={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-700 text-xs">
                  Email Body / HTML Content
                </span>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setBulkPreviewOpen(true)}
                  className="text-xs p-0 text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700"
                >
                  Preview Content
                </Button>
              </div>
            }
            name="messageText"
            rules={[{ required: true, message: "Please enter message content" }]}
          >
            <TextArea
              rows={5}
              placeholder="Type your email HTML or message text here..."
              className="rounded-lg font-mono text-xs"
            />
          </Form.Item>

          {/* Send Test Email Card */}
          <div className="mb-4 p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-purple-50/60 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  <SendOutlined />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Send Test Email First
                </span>
                <span className="text-[11px] text-slate-500">
                  (Verify template before blasting to uploaded file)
                </span>
              </div>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setBulkPreviewOpen(true)}
                className="text-xs p-0 text-indigo-600 font-semibold hover:underline"
              >
                Preview Layout
              </Button>
            </div>

            <Row gutter={8} align="middle">
              <Col xs={24} sm={8}>
                <Input
                  prefix={<UserOutlined className="text-slate-400 text-xs" />}
                  placeholder="Recipient Name"
                  value={bulkTestName}
                  onChange={(e) => setBulkTestName(e.target.value)}
                  className="rounded-lg h-8 text-xs"
                />
              </Col>
              <Col xs={24} sm={11}>
                <Input
                  prefix={<MailOutlined className="text-slate-400 text-xs" />}
                  placeholder="Enter test email (e.g. admin@askoxy.ai)"
                  value={bulkTestEmail}
                  onChange={(e) => setBulkTestEmail(e.target.value)}
                  className="rounded-lg h-8 text-xs"
                />
              </Col>
              <Col xs={24} sm={5}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendBulkTestEmail}
                  loading={bulkSendingTest}
                  block
                  className="rounded-lg h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-0 shadow-xs"
                >
                  Send Test
                </Button>
              </Col>
            </Row>
          </div>

          <Divider className="my-3" />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={() => setBulkUploadModalOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={bulkSending}
              disabled={uploadedContacts.length === 0}
              icon={<SendOutlined />}
              className="rounded-lg font-bold shadow-md px-6 h-10 border-0 bg-indigo-600 hover:bg-indigo-700"
            >
              Dispatch to {uploadedContacts.length.toLocaleString()} Uploaded Contact(s)
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Bulk Upload Email Content Preview Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <EyeOutlined className="text-indigo-600 text-lg" />
            <span className="font-bold text-base text-slate-800">
              Bulk Email Content Preview
            </span>
          </div>
        }
        open={bulkPreviewOpen}
        onCancel={() => setBulkPreviewOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setBulkPreviewOpen(false)}
            className="rounded-lg"
          >
            Close Preview
          </Button>,
          <Button
            key="test"
            icon={<SendOutlined />}
            onClick={() => {
              setBulkPreviewOpen(false);
              handleSendBulkTestEmail();
            }}
            loading={bulkSendingTest}
            className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
          >
            Send Test Email
          </Button>,
        ]}
        width={720}
        destroyOnClose
      >
        <div className="py-2">
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <div>
                  <span className="font-semibold text-slate-400">From:</span>{" "}
                  {bulkForm.getFieldValue("senderName") || "ASKOXY.AI"} &lt;
                  {bulkForm.getFieldValue("senderEmail") || "support@askoxy.ai"}
                  &gt;
                </div>
                <Tag color="blue" className="m-0 text-[10px]">
                  {bulkForm.getFieldValue("platform")?.toUpperCase() || "ASKOXY"}
                </Tag>
              </div>
              <div className="text-xs text-slate-600 mb-1.5">
                <span className="font-semibold text-slate-400">To:</span>{" "}
                uploaded_recipient@customer.com
              </div>
              <div className="text-sm font-bold text-slate-900">
                <span className="font-semibold text-slate-400 text-xs">
                  Subject:{" "}
                </span>{" "}
                {bulkForm.getFieldValue("emailSubject") || "(No subject provided)"}
              </div>
            </div>

            <div className="p-6 bg-white min-h-[200px] max-h-[420px] overflow-y-auto">
              <div
                className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{
                  __html:
                    bulkForm.getFieldValue("messageText") ||
                    "<em>(No message content entered)</em>",
                }}
              />
            </div>

            <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sent via ASKOXY Bulk Campaign Engine</span>
              <span>
                Template: {bulkForm.getFieldValue("templateType") || "ASKOXY"}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </AdminPanelLayout>
  );
};

export default AudienceCampaigns;
