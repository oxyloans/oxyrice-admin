import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Spin,
  Empty,
  Typography,
  message,
  Row,
  Col,
  Select,
  Input,
  Button,
  Modal,
  Form,
  Switch,
  Space,
} from "antd";
import axios from "axios";
import BASE_URL from "./Config";
import dayjs from "dayjs";
import AdminPanelLayoutTest from "./AdminPanel";
import { SearchOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { Option } = Select;

const API_URL = `${BASE_URL}/order-service/getAllUpdatePincodes`;

const PincodesData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // toolbar
  const [search, setSearch] = useState("");

  // pagination (antd is 1-based)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });

  // Modal and Form states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [switchStatus, setSwitchStatus] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const accessToken = localStorage.getItem("accessToken") || "";
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        // Remove duplicates based on ID to ensure unique records
        const uniqueData = data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        // ✅ latest first by createdAt
        const sorted = [...uniqueData].sort((a, b) => {
          const da = new Date(a?.createdAt || 0).getTime();
          const db = new Date(b?.createdAt || 0).getTime();
          return db - da;
        });

        setRows(sorted);
        console.log(
          "Initial data loaded:",
          sorted.map((item) => ({
            id: item.id,
            pinCode: item.pinCode,
            status: item.status,
            statusType: typeof item.status,
          }))
        ); // Debug log
      } catch (err) {
        console.error(err);
        message.error("Failed to load Pincode data");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal handlers
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      // Edit mode - populate form with existing data
      const statusValue = Boolean(
        record.status === true ||
          record.status === "true" ||
          record.status === 1 ||
          record.status === "1"
      );
      setSwitchStatus(statusValue);
      form.setFieldsValue({
        pinCode: record.pinCode,
        minimumVale: record.minimumVale,
        status: statusValue,
      });
      console.log(
        "Editing record with status:",
        statusValue,
        "original:",
        record.status
      ); // Debug log
    } else {
      // Add mode - reset form
      setSwitchStatus(true); // Default to active
      form.resetFields();
      form.setFieldsValue({ status: true });
      console.log("Add mode - setting status to true"); // Debug log
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    setSwitchStatus(true);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Form values received:", values); // Debug log
      const accessToken = localStorage.getItem("accessToken") || "";
      // Ensure status is properly converted to boolean
      const statusValue = Boolean(
        values.status === true ||
          values.status === "true" ||
          values.status === 1
      );

      const payload = {
        pinCode: parseInt(values.pinCode),
        minimumVale: parseFloat(values.minimumVale),
        status: statusValue, // Explicit boolean conversion
      };

      console.log("Final payload being sent:", payload); // Debug log

      if (editingRecord) {
        // Update existing record
        payload.id = editingRecord.id;
        await axios.patch(`${BASE_URL}/order-service/updatePincodes`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        message.success("Pincode updated successfully");
      } else {
        // Create new record
        await axios.patch(`${BASE_URL}/order-service/updatePincodes`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        message.success("Pincode added successfully");
      }

      // Refresh data
      setIsModalVisible(false);
      setEditingRecord(null);
      setSwitchStatus(true);
      form.resetFields();

      // Refetch data with fresh call
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = Array.isArray(res.data) ? res.data : [];

        // Ensure unique records by ID
        const uniqueData = data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        const sorted = [...uniqueData].sort((a, b) => {
          const da = new Date(a?.createdAt || 0).getTime();
          const db = new Date(b?.createdAt || 0).getTime();
          return db - da;
        });

        setRows(sorted);
        console.log(
          "Refreshed data:",
          sorted.map((item) => ({
            id: item.id,
            pinCode: item.pinCode,
            status: item.status,
            statusType: typeof item.status,
          }))
        ); // Debug log
      } catch (refreshError) {
        console.error("Error refreshing data:", refreshError);
        // Still close modal even if refresh fails
      }
    } catch (error) {
      console.error("Error saving pincode:", error);
      message.error("Failed to save pincode data");
    }
  };

  // ✅ client-side filter
  const filteredRows = useMemo(() => {
    const val = (search || "").trim().toLowerCase();
    if (!val) return rows;

    return rows.filter((r) =>
      String(r?.pinCode || "")
        .toLowerCase()
        .includes(val)
    );
  }, [rows, search]);

  const total = filteredRows.length;

  const columns = [
    {
      title: "S.No.",
      key: "serial",
      align: "center",

      render: (_text, _record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (text) => `#${text.slice(-4)}`,
    },
    {
      title: "Pin Code",
      dataIndex: "pinCode",
      key: "pinCode",
      align: "center",
      render: (val) => val,
    },
    {
      title: "Minimum Value",
      dataIndex: "minimumVale", // keeping your API field name
      key: "minimumVale",
      align: "center",

      render: (val) =>
        val !== null && val !== undefined && val !== "" ? `${val}` : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",

      render: (status) => {
        const isActive =
          status === true ||
          status === "true" ||
          status === 1 ||
          status === "1";

        return (
          <span
            style={{ color: isActive ? "#1ab394" : "#ff4d4f", fontWeight: 600 }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",

      render: (createdAt) =>
        createdAt ? dayjs(createdAt).format("YYYY-MM-DD") : "N/A",
      sorter: (a, b) =>
        new Date(a?.createdAt || 0).getTime() -
        new Date(b?.createdAt || 0).getTime(),
      sortDirections: ["descend", "ascend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            style={{ color: "#008cba" }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div style={{ padding: 16, minHeight: "100vh" }}>
        {/* Heading */}
        <div style={{ maxWidth: 1200, margin: "0 auto 10px auto" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Pincode-wise Orders
              </Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
              >
                Add New Pincode
              </Button>
            </Col>
          </Row>
        </div>

        {/* ✅ Toolbar: Left Show entries | Right Search */}
        <div style={{ maxWidth: 1200, margin: "0 auto 12px auto" }}>
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            {/* LEFT */}
            <Col xs={24} sm={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span>Show</span>
                <Select
                  value={pagination.pageSize}
                  onChange={(value) =>
                    setPagination({ current: 1, pageSize: value })
                  }
                  style={{ width: 120 }}
                >
                  {[5, 10, 15, 20, 25].map((num) => (
                    <Option key={num} value={num}>
                      {num}
                    </Option>
                  ))}
                </Select>
                <span>entries</span>
              </div>
            </Col>

            {/* RIGHT */}
            <Col xs={24} sm={12}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Input
                  placeholder="Search by pin code..."
                  value={search}
                  prefix={<SearchOutlined />}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination((p) => ({ ...p, current: 1 })); // ✅ reset page on search
                  }}
                  allowClear
                  style={{ width: 280, maxWidth: "100%" }}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Data */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <Spin size="large" tip="Loading..." />
          </div>
        ) : (
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Table
              columns={columns}
              dataSource={filteredRows}
              rowKey={(record) => record?.id || record?.pinCode}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total,
                showSizeChanger: false, // Select controls it
                showQuickJumper: true,
                showTotal: (t, range) =>
                  `${range[0]}-${range[1]} of ${t} records`,
                onChange: (page) =>
                  setPagination((p) => ({ ...p, current: page })),
              }}
              scroll={{ x: true }} // ✅ responsive table
              bordered
            />
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          title={editingRecord ? "Edit Pincode" : "Add New Pincode"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: true,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Pin Code"
                  name="pinCode"
                  rules={[
                    { required: true, message: "Please enter pin code" },
                    {
                      pattern: /^[0-9]{6}$/,
                      message: "Pin code must be 6 digits",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter 6-digit pin code"
                    maxLength={6}
                    onKeyPress={(e) => {
                      // Allow only numbers
                      if (
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Prevent paste of non-numeric content
                      const paste = e.clipboardData.getData("text");
                      if (!/^[0-9]*$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Minimum Value"
                  name="minimumVale"
                  rules={[
                    { required: true, message: "Please enter minimum value" },
                    {
                      pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                      message: "Please enter a valid number",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter minimum value"
                    onKeyPress={(e) => {
                      // Allow numbers, decimal point, and control keys
                      const charCode = e.which ? e.which : e.keyCode;
                      const charStr = String.fromCharCode(charCode);

                      // Allow control keys (backspace, delete, tab, enter, arrows, etc.)
                      if (
                        [8, 9, 13, 27, 37, 38, 39, 40, 46].includes(charCode)
                      ) {
                        return;
                      }

                      // Allow only one decimal point
                      const currentValue = e.target.value;
                      if (charStr === "." && currentValue.includes(".")) {
                        e.preventDefault();
                        return;
                      }

                      // Allow only numbers and decimal point
                      if (!/[0-9.]/.test(charStr)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Prevent paste of non-numeric content (allow decimal point)
                      const paste = e.clipboardData.getData("text");
                      if (!/^[0-9]*\.?[0-9]*$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                style={{
                  backgroundColor: switchStatus ? "#1ab394" : "#ff4d4f",
                }}
                onChange={(checked) => {
                  setSwitchStatus(checked);
                  form.setFieldsValue({ status: checked });
                }}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: "#1ab394", borderColor: "#1ab394" }}
                >
                  {editingRecord ? "Update" : "Save"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default PincodesData;
