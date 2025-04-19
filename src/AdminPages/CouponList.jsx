import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Spin,
  Row,
  Col,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import AdminPanelLayout from "./AdminPanel.jsx";
import BASE_URL from "./Config.jsx";
const { Option } = Select;

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
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/getAllCoupons`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCoupons(response.data);
      setFilteredCoupons(response.data);
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

      await axios.post(
        url,
        { couponId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
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
      title: "Minimum Order",
      dataIndex: "minOrder",
      key: "minOrder",
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
    {
      title: "Start Date",
      dataIndex: "startDateTime",
      key: "startDateTime",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "End Date",
      dataIndex: "endDateTime",
      key: "endDateTime",
      align: "center",
      className: "text-1xl",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      className: "text-1xl",
      render: (isActive, record) => (
        <Button
          type="default"
          onClick={() => updateCouponStatus(record.couponId, isActive)}
          style={{
            backgroundColor: isActive ? "#1C84C6" : "#EC4758",
            color: "white",
          }}
          loading={loading && editingCouponId === record.couponId}
        >
          {isActive ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      className: "text-1xl",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => showModal(record)}
          style={{
            backgroundColor: "#23C6C8",
            color: "white",
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const showModal = (record = {}) => {
    setIsModalVisible(true);
    if ("couponId" in record) {
      setIsEditMode(true);
      setEditingCouponId(record.couponId);

      // Parse date strings to moment objects for DatePicker
      const startDate = record.startDateTime
        ? moment(record.startDateTime)
        : null;
      const endDate = record.endDateTime ? moment(record.endDateTime) : null;

      // Format user mobile numbers if they exist
      const userMobileNumbers = record.userMobileNumbers
        ? Array.isArray(record.userMobileNumbers)
          ? record.userMobileNumbers.join(",")
          : record.userMobileNumbers
        : "";

      // Set form values with properly formatted fields
      form.setFieldsValue({
        couponCode: record.couponCode,
        couponValue: record.couponValue,
        minOrder: record.minOrder,
        maxDiscount: record.maxDiscount,
        couponUsage: record.couponUsage,
        discountType: record.discountType,
        startDate: startDate,
        endDate: endDate,
        userMobileNumbers: userMobileNumbers,
      });
    } else {
      setIsEditMode(false);
      setEditingCouponId(null);
      form.resetFields();
    }
  };

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
        startDate: values.startDate.format("YYYY-MM-DDTHH:mm:ss"),
        endDate: values.endDate.format("YYYY-MM-DDTHH:mm:ss"),
        userMobileNumbers: values.userMobileNumbers,
        isActive: true,
      };

      setLoading(true);

      if (isEditMode) {
        await axios.put(
          `${BASE_URL}/order-service/updateCoupon`,
          { couponId: editingCouponId, ...formattedValues },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        message.success("Coupon updated successfully.");
      } else {
        await axios.post(
          `${BASE_URL}/order-service/addCoupon`,
          formattedValues,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        message.success("Coupon added successfully.");
      }

      fetchCoupons();
      handleCancel();
    } catch (error) {
      console.error("Failed to submit:", error);
      message.error("Failed to submit coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchTerm(value);

    if (value) {
      const filtered = coupons.filter((coupon) =>
        ["couponCode", "minOrder"].some((key) =>
          coupon[key]?.toString().toLowerCase().includes(value)
        )
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  };

  return (
    <AdminPanelLayout>
      <div>
        <div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
            <h2 className="text-xl font-bold">Coupon List</h2>
            <Button
              style={{ backgroundColor: "#1C84C6", color: "white" }}
              onClick={() => showModal()}
              className="flex items-center gap-2"
            >
              <FaPlus />
              Add New Coupon
            </Button>
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
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
              </Select>
              <span>entries</span>
            </Col>

            {/* Search Input */}
            <Col className="w-full sm:w-auto flex items-center gap-2">
              <span>Search:</span>
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-[150px]"
                placeholder="Search coupons..."
              />
            </Col>
          </Row>

          {fetching ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="medium" />
            </div>
          ) : (
            <Table
              dataSource={filteredCoupons}
              columns={columns}
              rowKey="couponId"
              pagination={{
                pageSize: entriesPerPage,
                current: currentPage,
                onChange: handlePageChange,
                total: filteredCoupons.length,
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
        visible={isModalVisible}
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

          {/* Discount Type */}
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
                label="Value"
                name="couponValue"
                rules={[
                  { required: true, message: "Please enter the coupon value!" },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          {/* Start Date */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Start Date"
                name="startDate"
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
                name="endDate"
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

          {/* End Date */}
          <Row gutter={16}>
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
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
    </AdminPanelLayout>
  );
};

export default Coupons;
