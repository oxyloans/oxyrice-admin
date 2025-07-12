import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";

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
  Popconfirm,
} from "antd";

import { Tabs } from "antd";


import { EditOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import AdminPanelLayout from "./AdminPanel.jsx";
import BASE_URL from "./Config.jsx";
const { Option } = Select;
const { TabPane } = Tabs;
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
  const [activeTab, setActiveTab] = useState("PUBLIC");
  const [items, setItems] = useState([]); // <-- Add this line

  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchCoupons();
  }, []);
  const tabFilteredCoupons = filteredCoupons.filter(
    (coupon) => coupon.status === activeTab
  );
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
      // Sort coupons so latest ones appear first (assuming "createdAt" field is present)
    const sortedCoupons = response.data.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
      // setCoupons(response.data);
      // setFilteredCoupons(response.data);


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
   useEffect(() => {
      fetchItemsData();
    }, []);
   const fetchItemsData = async () => {
     setLoading(true);
     try {
       const response = await axios.get(
         `${BASE_URL}/product-service/getItemsData`,
         {
           headers: {
             Authorization: `Bearer ${accessToken}`,
           },
         }
       );
       const activeItems = response.data.filter(
         (item) => item.isActive === "true"
       );

       setItems(activeItems);
       message.success("Data Fetched Successfully");
     } catch (error) {
       message.error("Error fetching items data: " + error.message);
     } finally {
       setLoading(false);
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
      render: (date) =>
        date
          ? dayjs.utc(date).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
          : "",
    },
    {
      title: "End Date",
      dataIndex: "endDateTime",
      key: "endDateTime",
      align: "center",
      className: "text-1xl",
      render: (date) =>
        date
          ? dayjs.utc(date).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
          : "",
    },
    {
      title: "CouponApplicable",
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
      const endDateTime = record.endDateTime ? moment(record.endDateTime) : null;

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
        maximumOrderAmount: record.maximumOrderAmount,
        couponApplicable: record.couponApplicable,  
        maxDiscount: record.maxDiscount,
        couponUsage: record.couponUsage,
        discountType: record.discountType,
        status: record.status || "PUBLIC", // Default to PUBLIC if not set
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        userMobileNumbers: userMobileNumbers,
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
        couponApplicableItemId:values.couponApplicableItemId,
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
    const value = e.target.value.toLowerCase();
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
                className="w-full sm:w-[150px]"
                placeholder="Search coupons..."
              />
            </Col>
          </Row>

          {/* {fetching ? (
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
          )} */}

          {fetching ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="medium" />
            </div>
          ) : (
            <>
              <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
                <TabPane tab="Public Coupons" key="PUBLIC" />
                <TabPane tab="Private Coupons" key="PRIVATE" />
              </Tabs>

              <Table
                dataSource={filteredCoupons.filter(
                  (c) => c.status === activeTab
                )}
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
            </>
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
                rules={[
                  {
                    required: true,
                    message: "Please select applicable items!",
                  },
                ]}
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
    </AdminPanelLayout>
  );
};

export default Coupons;
