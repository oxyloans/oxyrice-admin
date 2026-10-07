import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../core/config/axiosInstance";
import dayjs from "dayjs";

import { DeleteOutlined } from "@ant-design/icons";
import {
  Table,
  Button,
  message,
  Modal,
  Tooltip,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Tag,
  Spin,
  Row,
  Col,
  Popconfirm,
} from "antd";

import { Tabs } from "antd";

import { EditOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import AdminPanelLayout from "../components/AdminPanelLayout.jsx";
import BASE_URL from "../../../core/config/Config";
import useAuth from '../../../shared/hooks/useAuth';
const { Option } = Select;

const formatOfferDate = (dateVal) => {
  if (!dateVal) return "";
  if (Array.isArray(dateVal)) {
    const [y, m, d] = dateVal;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return dayjs(dateVal).format("YYYY-MM-DD");
};

const parseOfferDateToDayjs = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [y, m, d] = dateVal;
    return dayjs(new Date(y, m - 1, d));
  }
  return dayjs(dateVal);
};

const DescriptionCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span>-</span>;
  if (text.length <= 40) return <span>{text}</span>;
  return (
    <div className="text-left text-xs max-w-[280px]">
      <span>{expanded ? text : `${text.slice(0, 40)}...`}</span>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-blue-600 hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0 text-xs inline"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [activeTab, setActiveTab] = useState("PRIVATE");
  const [items, setItems] = useState([]); // <-- Add this line
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isGoldSilverModalVisible, setIsGoldSilverModalVisible] = useState(false);
  const [goldSilverSubmitting, setGoldSilverSubmitting] = useState(false);
  const [goldSilverCategories, setGoldSilverCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [fetchedCategoryId, setFetchedCategoryId] = useState("");
  const [goldSilverForm] = Form.useForm();
  const [goldSilverOffers, setGoldSilverOffers] = useState([]);
  const [fetchingGoldSilver, setFetchingGoldSilver] = useState(false);
  const [isGoldSilverEditMode, setIsGoldSilverEditMode] = useState(false);
  const [editingGoldSilverId, setEditingGoldSilverId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const { accessToken } = useAuth();

  const fetchGoldSilverOffers = useCallback(async () => {
    setFetchingGoldSilver(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/order-service/getGoldSilverItemOffer`
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setGoldSilverOffers(data);
    } catch (error) {
      console.error("Error fetching Gold & Silver offers:", error);
      message.error("Failed to fetch Gold & Silver coupon offers.");
    } finally {
      setFetchingGoldSilver(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchGoldSilverOffers();
  }, [fetchGoldSilverOffers]);
  const tabFilteredCoupons = filteredCoupons.filter(
    (coupon) => coupon.status === activeTab,
  );
  const fetchCoupons = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/order-service/getAllCoupons`,
        {
                  },
      );
      // Sort coupons so latest ones appear first (assuming "createdAt" field is present)
      const sortedCoupons = response.data.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setCoupons(sortedCoupons);
      setFilteredCoupons(sortedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      message.error("Failed to fetch coupons.");
    } finally {
      setFetching(false);
    }
  }, [accessToken]);

  const updateCouponStatus = async (couponId, isActive) => {
    setLoading(true);
    try {
      const url = isActive
        ? `${BASE_URL}/order-service/deactivateCoupon`
        : `${BASE_URL}/order-service/activateCoupon`;

      await axiosInstance.post(
        url,
        { couponId },
        {
                  },
      );

      message.success("Coupon status updated successfully.");
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon status:", error);
      message.error("Failed to update coupon status.");
    } finally {
      setLoading(false);
    }
  };

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    fetchItemsData();
  }, []);
  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/product-service/getItemsData`,
        {
                  },
      );
      const activeItems = response.data.filter(
        (item) => item.isActive === "true",
      );

      setItems(activeItems);
      message.success("Data Fetched Successfully");
    } catch (error) {
      message.error("Error fetching items data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCoupon = async (id) => {
    try {
      setDeleteLoading(true);

      await axiosInstance.delete(`${BASE_URL}/order-service/couponDelete`, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { id }, // 👈 ID sent as query param
      });

      message.success("Coupon deleted successfully!");
      fetchCoupons(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting coupon:", error);
      message.error("Failed to delete coupon. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      key: "couponCode",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "Coupon Value",
      dataIndex: "couponValue",
      key: "couponValue",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "Min Order",
      dataIndex: "minOrder",
      key: "minOrder",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "Max Order",
      dataIndex: "maximumOrderAmount",
      key: "maximumOrderAmount",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "Max Discount",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "cAppIds",
      dataIndex: "couponApplicableItemId",
      key: "couponApplicableItemId",
      align: "center",
      className: "text-1xl",
      render: (text) => {
        if (!text) return "-";

        // Split, extract last 4 chars, and prefix with #
        const formatted = text
          .split(",")
          .map((id) => `#${id.slice(-4)}`)
          .join(", ");

        return <span style={{ color: "#333" }}>{formatted}</span>;
      },
    },
    {
      title: "Usage",
      dataIndex: "couponUsage",
      key: "couponUsage",
      align: "center",
      className: "text-1xl",
      render: (text) => {
        switch (text) {
          case 1:
            return "New User";
          case 2:
            return "One Time Per User";
          case 3:
            return "Any Time Per User";
          default:
            return "Unknown";
        }
      },
    },
    {
      title: "Discount Type",
      dataIndex: "discountType",
      key: "discountType",
      align: "center",
      className: "text-1xl",
      render: (text) => {
        switch (text) {
          case 1:
            return "Instant Discount";
          case 2:
            return "Cashback";
          default:
            return "Unknown";
        }
      },
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   align: "center",
    //   className: "text-1xl",
    //   render: (status) => (
    //     <span
    //       style={{
    //         color: status === "PUBLIC" ? "#008CBA" : "#04AA6D",
    //         fontWeight: "bold",
    //       }}
    //     >
    //       {status || "N/A"}
    //     </span>
    //   ),
    // },
    {
      title: "Start Date",
      dataIndex: "startDateTime",
      key: "startDateTime",
      align: "center",
      className: "text-1xl",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD hh:mm A") : ""),
    },
    {
      title: "End Date",
      dataIndex: "endDateTime",
      key: "endDateTime",
      align: "center",
      className: "text-1xl",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD hh:mm A") : ""),
    },

    {
      title: "Applicable",
      dataIndex: "couponApplicable",
      key: "couponApplicable",
      align: "center",
    },

    // {
    //   title: "Active Status",
    //   dataIndex: "isActive",
    //   key: "isActive",
    //   align: "center",
    //   className: "text-1xl",
    //   render: (isActive, record) => (
    //     <Popconfirm
    //       title={`Are you sure you want to mark this coupon as ${isActive ? "Inactive" : "Active"}?`}
    //       onConfirm={() => updateCouponStatus(record.couponId, isActive)}
    //       okText="Yes"
    //       cancelText="No"
    //     >
    //       <Button
    //         type="default"
    //         style={{
    //           backgroundColor: isActive ? "#1C84C6" : "#EC4758",
    //           color: "white",
    //         }}
    //         loading={loading && editingCouponId === record.couponId}
    //       >
    //         {isActive ? "Active" : "Inactive"}
    //       </Button>
    //     </Popconfirm>
    //   ),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   align: "center",
    //   className: "text-1xl",
    //   render: (_, record) => (
    //     <Button
    //       icon={<EditOutlined />}
    //       onClick={() => showModal(record)}
    //       style={{
    //         backgroundColor: "#23C6C8",
    //         color: "white",
    //       }}
    //     >
    //       Edit
    //     </Button>
    //   ),
    // },
    {
      title: "Action",
      key: "action",
      align: "center",
      className: "text-1xl",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          <Tooltip title="Edit Coupon">
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              style={{
                backgroundColor: "#23C6C8",
                color: "white",
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Coupon">
            <Popconfirm
              title="Are you sure you want to delete this coupon?"
              onConfirm={() => handleDeleteCoupon(record.couponId)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
              />
            </Popconfirm>
          </Tooltip>

          <Popconfirm
            title={`Are you sure you want to mark this coupon as ${record.isActive ? "Inactive" : "Active"}?`}
            onConfirm={() =>
              updateCouponStatus(record.couponId, record.isActive)
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="default"
              style={{
                backgroundColor: record.isActive ? "#1C84C6" : "#EC4758",
                color: "white",
              }}
              loading={loading && editingCouponId === record.couponId}
            >
              {record.isActive ? "Active" : "Inactive"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const showModal = (record = {}) => {
    setIsModalVisible(true);
    if ("couponId" in record) {
      setIsEditMode(true);
      setEditingCouponId(record.couponId);

      // Parse date strings to moment objects for DatePicker
      const startDateTime = record.startDateTime
        ? moment(record.startDateTime)
        : null;
      const endDateTime = record.endDateTime
        ? moment(record.endDateTime)
        : null;

      
      const userMobileNumbers = record.userMobileNumbers
        ? Array.isArray(record.userMobileNumbers)
          ? record.userMobileNumbers.join(",")
          : record.userMobileNumbers
        : "";

   
      form.setFieldsValue({
        couponCode: record.couponCode,
        couponValue: record.couponValue,
        minOrder: record.minOrder,
        maximumOrderAmount: record.maximumOrderAmount,
        couponApplicable: record.couponApplicable,
        maxDiscount: record.maxDiscount,
        couponUsage: record.couponUsage,
        discountType: record.discountType,
        status: record.status || "PUBLIC", 
        startDateTime: startDateTime,
        endDateTime: endDateTime,

        userMobileNumbers: userMobileNumbers,
     
        couponApplicableItemId: record.couponApplicableItemId
          ? record.couponApplicableItemId.split(",")
          : [],
      });
    } else {
      setIsEditMode(false);
      setEditingCouponId(null);
      form.resetFields();
      // Set default status for new coupons
      form.setFieldsValue({
        status: "PUBLIC",
      });
    }
  };

  const fetchGoldSilverCategories = async (catType) => {
    if (!catType) return;
    setCategoriesLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/product-service/getGoldOrSilverItems?categoryType=${catType}`
      );
      const rawCategories =
        response.data?.categories ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      setGoldSilverCategories(rawCategories);
      const firstId = rawCategories[0]?.categoryId || "";
      setFetchedCategoryId(firstId);
      goldSilverForm.setFieldsValue({
        categoryId: firstId,
      });
    } catch (error) {
      console.error("Error fetching category ID:", error);
      message.error("Failed to fetch Category ID for " + catType);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const showGoldSilverModal = () => {
    setIsGoldSilverEditMode(false);
    setEditingGoldSilverId(null);
    goldSilverForm.resetFields();
    setFetchedCategoryId("");
    goldSilverForm.setFieldsValue({
      categoryType: "GOLD",
      couponCode: "",
      couponName: "",
      description: "",
      discountType: "instnace",
      discountValue: 100,
      memberCount: 1,
      isActive: true,
      offerStartDate: dayjs(),
      offerStartTime: dayjs("10:00 AM", "h:mm A"),
      offerEndDate: dayjs(),
      offerEndTime: dayjs("7:00 AM", "h:mm A"),
    });
    setIsGoldSilverModalVisible(true);
    fetchGoldSilverCategories("GOLD");
  };

  const showGoldSilverEditModal = (record) => {
    setIsGoldSilverEditMode(true);
    setEditingGoldSilverId(record.id);
    setFetchedCategoryId(record.categoryId || "");

    const startDate = parseOfferDateToDayjs(record.offerStartDate);
    const endDate = parseOfferDateToDayjs(record.offerEndDate);
    const startTime = record.offerStartTime
      ? dayjs(record.offerStartTime, "h:mm A")
      : null;
    const endTime = record.offerEndTime
      ? dayjs(record.offerEndTime, "h:mm A")
      : null;

    goldSilverForm.setFieldsValue({
      categoryId: record.categoryId,
      categoryType: record.categoryType,
      couponCode: record.couponCode,
      couponName: record.couponName,
      description: record.description || "",
      discountType: record.discountType || "instnace",
      discountValue: record.discountValue,
      memberCount: record.memberCount || 1,
      isActive: record.active ?? record.activeNow ?? record.isActive ?? true,
      offerStartDate: startDate,
      offerStartTime: startTime,
      offerEndDate: endDate,
      offerEndTime: endTime,
    });

    setIsGoldSilverModalVisible(true);
  };

  const handleGoldSilverCancel = () => {
    setIsGoldSilverModalVisible(false);
    setIsGoldSilverEditMode(false);
    setEditingGoldSilverId(null);
    goldSilverForm.resetFields();
    setGoldSilverCategories([]);
    setFetchedCategoryId("");
  };

  const handleGoldSilverCategoryTypeChange = (value) => {
    setFetchedCategoryId("");
    goldSilverForm.setFieldsValue({ categoryId: undefined });
    fetchGoldSilverCategories(value);
  };

  const handleCreateGoldSilverCoupon = async () => {
    try {
      const values = await goldSilverForm.validateFields();
      const catId = values.categoryId || fetchedCategoryId;
      if (!catId) {
        message.error(
          "Category ID not loaded from API. Please re-select Category Type.",
        );
        return;
      }
      setGoldSilverSubmitting(true);

      const payload = {
        categoryId: catId,
        categoryType: values.categoryType,
        couponCode: values.couponCode?.trim(),
        couponName: values.couponName?.trim(),
        description: values.description?.trim() || "",
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        isActive: Boolean(values.isActive),
        memberCount: Number(values.memberCount || 0),
        offerStartDate: values.offerStartDate
          ? values.offerStartDate.format("YYYY-MM-DD")
          : "",
        offerStartTime: values.offerStartTime
          ? values.offerStartTime.format("h:mm A")
          : "",
        offerEndDate: values.offerEndDate
          ? values.offerEndDate.format("YYYY-MM-DD")
          : "",
        offerEndTime: values.offerEndTime
          ? values.offerEndTime.format("h:mm A")
          : "",
      };

      if (isGoldSilverEditMode) {
        payload.id = editingGoldSilverId;
        await axiosInstance.patch(
          `${BASE_URL}/order-service/updateGoldSilverItemOffer`,
          payload,
        );
        message.success("Gold & Silver offer coupon updated successfully!");
      } else {
        await axiosInstance.post(
          `${BASE_URL}/order-service/createGoldSilverItemOffer`,
          payload,
        );
        message.success("Gold & Silver offer coupon created successfully!");
      }

      handleGoldSilverCancel();
      fetchGoldSilverOffers();
      fetchCoupons();
    } catch (error) {
      console.error("Error creating/updating Gold/Silver coupon:", error);
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error?.message && !error?.errorFields) {
        message.error(error.message);
      }
    } finally {
      setGoldSilverSubmitting(false);
    }
  };

  const goldSilverColumns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
      width: 70,
    },
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      key: "couponCode",
      align: "center",
      className: "font-semibold",
    },
    {
      title: "Coupon Name",
      dataIndex: "couponName",
      key: "couponName",
      align: "center",
    },
    {
      title: "Category",
      dataIndex: "categoryType",
      key: "categoryType",
      align: "center",
      render: (type) => (
        <Tag color={type === "GOLD" ? "gold" : "cyan"}>
          {type || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Discount Type",
      dataIndex: "discountType",
      key: "discountType",
      align: "center",
      render: (type) => (
        <span>
          {type === "instnace" ? "Instant (instnace)" : type || "-"}
        </span>
      ),
    },
    {
      title: "Discount Value",
      dataIndex: "discountValue",
      key: "discountValue",
      align: "center",
      render: (val) => (val !== undefined && val !== null ? `₹${val}` : "-"),
    },
    {
      title: "Member Count",
      dataIndex: "memberCount",
      key: "memberCount",
      align: "center",
      render: (val) => val ?? "-",
    },
    {
      title: "Start Date & Time",
      key: "startPeriod",
      align: "center",
      render: (_, record) => {
        const dateStr = formatOfferDate(record.offerStartDate);
        const timeStr = record.offerStartTime || "";
        return dateStr || timeStr ? `${dateStr} ${timeStr}`.trim() : "-";
      },
    },
    {
      title: "End Date & Time",
      key: "endPeriod",
      align: "center",
      render: (_, record) => {
        const dateStr = formatOfferDate(record.offerEndDate);
        const timeStr = record.offerEndTime || "";
        return dateStr || timeStr ? `${dateStr} ${timeStr}`.trim() : "-";
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_, record) => {
        const isActive = record.activeNow ?? record.active ?? record.isActive;
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      width: 260,
      render: (desc) => <DescriptionCell text={desc} />,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 110,
      render: (_, record) => (
        <Button
          onClick={() => showGoldSilverEditModal(record)}
          style={{
            backgroundColor: "#23C6C8",
            color: "white",
            borderColor: "#23C6C8",
            fontWeight: 500,
          }}
          size="middle"
        >
          Update
        </Button>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAddCoupon = async () => {
    try {
      const values = await form.validateFields();

      // Format the values for the API
      const formattedValues = {
        ...values,
        startDateTime: values.startDateTime.format("YYYY-MM-DDTHH:mm:ss"),
        endDateTime: values.endDateTime.format("YYYY-MM-DDTHH:mm:ss"),
        maximumOrderAmount: values.maximumOrderAmount,
        userMobileNumbers: values.userMobileNumbers,
        status: values.status, // Include status field
        couponApplicable: values.couponApplicable,
        //  couponApplicableItemId: values.couponApplicableItemId.join(","),
        couponApplicableItemId: Array.isArray(values.couponApplicableItemId)
          ? values.couponApplicableItemId.join(",")
          : "",

        isActive: true,
      };

      setLoading(true);

      if (isEditMode) {
        await axiosInstance.put(
          `${BASE_URL}/order-service/updateCoupon`,
          { couponId: editingCouponId, ...formattedValues },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        message.success("Coupon updated successfully.");
      } else {
        await axiosInstance.post(
          `${BASE_URL}/order-service/addCoupon`,
          formattedValues,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        message.success("Coupon added successfully.");
      }

      fetchCoupons();
      handleCancel();
    } catch (error) {
      console.error("Failed to submit:", error);
      // message.error("Failed to submit coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value) {
      const filtered = coupons.filter((coupon) =>
        ["couponCode", "minOrder"].some((key) =>
          coupon[key]?.toString().toLowerCase().includes(value),
        ),
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  };
  const tabItems = [
    { key: "PRIVATE", label: "Private Coupons" },
    { key: "PUBLIC", label: "Public Coupons" },
    { key: "GOLD_SILVER", label: "Gold & Silver Coupons" },
  ];

  const filteredGoldSilverOffers = goldSilverOffers.filter((offer) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      offer.couponCode?.toLowerCase().includes(term) ||
      offer.couponName?.toLowerCase().includes(term) ||
      offer.categoryType?.toLowerCase().includes(term) ||
      offer.description?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminPanelLayout>
      <div>
        <div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
            <h2 className="text-xl font-bold">Coupon List</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                style={{ backgroundColor: "#1C84C6", color: "white" }}
                onClick={() => showModal()}
                className="flex items-center gap-2"
              >
                <FaPlus />
                Add New Coupon
              </Button>
              <Button
                style={{
                  backgroundColor: "#16a34a",
                  borderColor: "#16a34a",
                  color: "white",
                }}
                onClick={showGoldSilverModal}
                className="flex items-center gap-2"
              >
                <FaPlus />
                Create Gold & Silver Coupon
              </Button>
            </div>
          </div>

          {/* Filter & Search Section */}
          <Row
            justify="space-between"
            align="middle"
            className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full flex-wrap"
          >
            {/* Entries Per Page Dropdown */}
            <Col className="w-full sm:w-auto flex items-center gap-2">
              <span>Show</span>
              <Select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                className="w-full sm:w-[80px]"
              >
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
              <span>entries</span>
            </Col>

            {/* Search Input */}
            <Col className="w-full sm:w-auto flex items-center gap-2">
              <span>Search:</span>
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-[180px]"
                placeholder={
                  activeTab === "GOLD_SILVER"
                    ? "Search gold/silver..."
                    : "Search coupons..."
                }
              />
            </Col>
          </Row>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setCurrentPage(1);
            }}
            items={tabItems}
          />

          {activeTab === "GOLD_SILVER" ? (
            fetchingGoldSilver ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="medium" />
              </div>
            ) : (
              <Table
                dataSource={filteredGoldSilverOffers}
                columns={goldSilverColumns}
                rowKey="id"
                pagination={{
                  pageSize: entriesPerPage,
                  current: currentPage,
                  onChange: handlePageChange,
                  total: filteredGoldSilverOffers.length,
                }}
                scroll={{ x: "100%" }}
                bordered
                loading={fetchingGoldSilver}
              />
            )
          ) : fetching ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="medium" />
            </div>
          ) : (
            <Table
              dataSource={filteredCoupons.filter((c) => c.status === activeTab)}
              columns={columns}
              rowKey="couponId"
              pagination={{
                pageSize: entriesPerPage,
                current: currentPage,
                onChange: handlePageChange,
                total: filteredCoupons.filter((c) => c.status === activeTab)
                  .length,
              }}
              scroll={{ x: "100%" }}
              bordered
              loading={fetching}
            />
          )}
        </div>
      </div>
      <Modal
        title={isEditMode ? "Edit Coupon" : "Add Coupon"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleAddCoupon}
        confirmLoading={loading}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          {/* Coupon Code */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Coupon Code"
                name="couponCode"
                rules={[
                  { required: true, message: "Please enter the coupon code!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Coupon Type"
                name="couponUsage"
                rules={[
                  { required: true, message: "Please select a coupon type!" },
                ]}
              >
                <Select placeholder="Select coupon type">
                  <Option value={1}>New User</Option>
                  <Option value={2}>One Time Per User</Option>
                  <Option value={3}>Any Time Per User</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Discount Type and Status */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Discount Type"
                name="discountType"
                rules={[
                  { required: true, message: "Please select a discount type!" },
                ]}
              >
                <Select placeholder="Select discount type">
                  <Option value={1}>Instant Discount</Option>
                  <Option value={2}>Cashback</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select a status!" }]}
              >
                <Select placeholder="Select status">
                  <Option value="PRIVATE">Private</Option>
                  <Option value="PUBLIC">Public</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Coupon Value */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Value"
                name="couponValue"
                rules={[
                  { required: true, message: "Please enter the coupon value!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maxDiscount"
                label="Maximum Discount"
                rules={[
                  { required: true, message: "Please enter max discount!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          {/* Start Date and End Date */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Start Date"
                name="startDateTime"
                rules={[
                  { required: true, message: "Please select a start date!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="End Date"
                name="endDateTime"
                rules={[
                  { required: true, message: "Please select an end date!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Minimum Order */}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="minOrder"
                label="Minimum Order Value"
                rules={[
                  { required: true, message: "Please enter minimum order!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maximumOrderAmount"
                label="Maximum Order Value"
                rules={[
                  { required: true, message: "Please enter maximum order!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                label="Applicable Items"
                name="couponApplicableItemId"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please select applicable items!",
                //   },
                // ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select item IDs"
                  allowClear
                  optionFilterProp="children"
                  showSearch
                >
                  {items.map((item) => (
                    <Option key={item.itemId} value={item.itemId}>
                      {item.itemId}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row> */}
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                label="Applicable Items"
                name="couponApplicableItemId"
                // Uncomment the rule if needed
                // rules={[{ required: true, message: "Please select applicable items!" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select item IDs"
                  allowClear
                  optionFilterProp="children"
                  showSearch
                >
                  {items.map((item) => (
                    <Option key={item.itemId} value={item.itemId}>
                      {item.itemName} (#{item.itemId.slice(-4)})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Coupon Applicable Categories and User Mobile Numbers */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Coupon Applicable Categories"
                name="couponApplicable"
                rules={[
                  {
                    required: true,
                    message: "Please select applicable categories!",
                  },
                ]}
              >
                <Select
                  mode="single"
                  placeholder="Select applicable categories"
                  allowClear
                >
                  <Option value="RICE">RICE</Option>
                  <Option value="Grocery">GROCERY</Option>
                  <Option value="GOLD">GOLD</Option>
                  <Option value="SILVER">SILVER</Option>
                  <Option value="CONTAINERS">CONTAINERS</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="userMobileNumbers"
                label="User Mobile Numbers (comma separated)"
              >
                <Input placeholder="+919347967774,+919059433013,+919908636995" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Gold & Silver Item Offer Coupon Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: isGoldSilverEditMode ? "#23C6C8" : "#16a34a",
              }}
            />
            <span>
              {isGoldSilverEditMode
                ? "Update Gold / Silver Coupon Offer"
                : "Create Gold / Silver Coupon Offer"}
            </span>
          </div>
        }
        open={isGoldSilverModalVisible}
        onCancel={handleGoldSilverCancel}
        onOk={handleCreateGoldSilverCoupon}
        confirmLoading={goldSilverSubmitting}
        okText={
          isGoldSilverEditMode ? "Update Coupon Offer" : "Create Coupon Offer"
        }
        okButtonProps={{
          style: {
            backgroundColor: isGoldSilverEditMode ? "#23C6C8" : "#16a34a",
            borderColor: isGoldSilverEditMode ? "#23C6C8" : "#16a34a",
          },
        }}
        destroyOnClose
        width={750}
      >
        <Form form={goldSilverForm} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Category Type"
                name="categoryType"
                rules={[
                  { required: true, message: "Please select category type!" },
                ]}
              >
                <Select
                  placeholder="Select Category Type"
                  onChange={handleGoldSilverCategoryTypeChange}
                >
                  <Option value="GOLD">GOLD</Option>
                  <Option value="SILVER">SILVER</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Coupon Code"
                name="couponCode"
                rules={[
                  { required: true, message: "Please enter coupon code!" },
                ]}
              >
                <Input
                  placeholder="e.g. GOLD100"
                  onChange={(e) =>
                    goldSilverForm.setFieldsValue({
                      couponCode: e.target.value.toUpperCase(),
                    })
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Coupon Name"
                name="couponName"
                rules={[
                  { required: true, message: "Please enter coupon name!" },
                ]}
              >
                <Input placeholder="e.g. OXYGOLD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Discount Type"
                name="discountType"
                rules={[
                  { required: true, message: "Please select discount type!" },
                ]}
              >
                <Select placeholder="Select discount type">
                  <Option value="instnace">Instant Discount (instnace)</Option>
                  <Option value="Flat">Flat Discount (Flat)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Discount Value"
                name="discountValue"
                rules={[
                  { required: true, message: "Please enter discount value!" },
                ]}
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="e.g. 100"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Member Count"
                name="memberCount"
                rules={[
                  { required: true, message: "Please enter member count!" },
                ]}
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="e.g. 1"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Is Active"
                name="isActive"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Offer Start Date"
                name="offerStartDate"
                rules={[
                  { required: true, message: "Please select start date!" },
                ]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Offer Start Time"
                name="offerStartTime"
                rules={[
                  { required: true, message: "Please select start time!" },
                ]}
              >
                <TimePicker
                  className="w-full"
                  format="h:mm A"
                  use12Hours
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Offer End Date"
                name="offerEndDate"
                rules={[
                  { required: true, message: "Please select end date!" },
                ]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Offer End Time"
                name="offerEndTime"
                rules={[
                  { required: true, message: "Please select end time!" },
                ]}
              >
                <TimePicker
                  className="w-full"
                  format="h:mm A"
                  use12Hours
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description!" },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter offer description e.g. Special offer for gold & silver items"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </AdminPanelLayout>
  );
};

export default Coupons;
