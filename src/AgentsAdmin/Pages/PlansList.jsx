import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Switch,
  message,
  Input,
  Tooltip,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Option } = Select;
const { Search } = Input;
const PlansList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const accessToken = localStorage.getItem("accessToken");

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/ai-service/agent/getAllPlans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      const normalized = Array.isArray(json) ? json : json ? [json] : [];
      setData(normalized.reverse());
    } catch (err) {
      console.error("Error fetching plans:", err);
      message.error("Failed to load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Open Modal (for Add/Edit)
  const openModal = (plan = null) => {
    setCurrentPlan(plan);
    form.setFieldsValue({
      planAmount: plan?.planAmount || "",
      planType: plan?.planType || "",
      status: plan?.status ?? true,
    });
    setModalVisible(true);
  };

const handleSave = async () => {
  try {
    const values = await form.validateFields();
    const payload = currentPlan ? { id: currentPlan.id, ...values } : values;

    const res = await fetch(`${BASE_URL}/ai-service/agent/promptPlan`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok || result.status === "error" || result.success === false) {
      throw new Error(result.message || "Server returned an error");
    }

    message.success(
      currentPlan ? "Plan updated successfully!" : "Plan added successfully!"
    );

    setModalVisible(false);
    form.resetFields();
    fetchPlans();
  } catch (err) {
    console.error("Save error:", err);
    // message.error(
    //   err.message || "Error saving plan. Please try again."
    // );
  }
};

  // Filtered Data
  const filteredData = data.filter((plan) => {
    const matchesSearch =
      plan.planType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planAmount?.toString().includes(searchTerm);
    if (activeTab === "active") return plan.status && matchesSearch;
    if (activeTab === "inactive") return !plan.status && matchesSearch;
    return matchesSearch;
  });

  // Pagination slice
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Table Columns
  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_, __, index) => startIndex + index + 1,
      align: "center",
    },
    {
      title: "Plan ID",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.slice(-4)}`,
      align: "center",
    },
    {
      title: "Plan Amount",
      dataIndex: "planAmount",
      key: "planAmount",
      render: (amount) => `₹ ${amount}`,
      align: "center",
    },
    {
      title: "Plan Type",
      dataIndex: "planType",
      key: "planType",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status ? (
          <span style={{ color: "#008cba", fontWeight: "bold" }}>Active</span>
        ) : (
          <span style={{ color: "red", fontWeight: "bold" }}>Inactive</span>
        ),
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Edit Plan">
          <Button
            icon={<EditOutlined />}
            type="link"
            style={{ color: "#008cba" }}
            onClick={() => openModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card className="shadow-md rounded-lg">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h1 style={{ margin: 0, fontWeight: "700" }}>Plans Management</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              borderRadius: 6,
            }}
            onClick={() => openModal()}
          >
            Add Plan
          </Button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 20,
            borderBottom: "1px solid #eee",
            marginBottom: 10,
          }}
        >
          {["all", "active", "inactive"].map((tab) => (
            <span
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                cursor: "pointer",
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? "#008cba" : "#555",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #008cba"
                    : "2px solid transparent",
                paddingBottom: 8,
              }}
            >
              {tab === "all"
                ? "All Plans"
                : tab === "active"
                  ? "Active Plans"
                  : "Inactive Plans"}
            </span>
          ))}
        </div>

        {/* Search + Page Size */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Show</span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              style={{ width: 100 }}
            >
              {[20, 30, 40, 50].map((num) => (
                <Option key={num} value={num}>
                  {num}
                </Option>
              ))}
            </Select>
            <span>entries</span>
          </div>

            <Search
            placeholder="Search Plan amount or type"
            value={searchTerm}
            allowClear
            prefix={<i className="fas fa-search" />}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 250 }}
          />
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={paginatedData}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} plans`,
          }}
          bordered
          scroll={{ x: true }}
          style={{ textAlign: "center" }}
        />

        {/* Add/Edit Modal */}
        <Modal
          title={currentPlan ? "Edit Plan" : "Add New Plan"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          onOk={handleSave}
          okText="Save"
          okButtonProps={{
            style: {
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            },
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Plan Amount"
              name="planAmount"
              rules={[{ required: true, message: "Please enter plan amount" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Enter amount"
              />
            </Form.Item>
            <Form.Item
              label="Plan Type"
              name="planType"
              rules={[{ required: true, message: "Please select plan type" }]}
            >
              <Select placeholder="Select plan type">
                <Option value="MONTHLY">MONTHLY</Option>
                <Option value="QUARTERLY">QUARTERLY</Option>
                <Option value="HALF_YEARLY">HALF_YEARLY</Option>
                <Option value="YEARLY">YEARLY</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </AgentsAdminLayout>
  );
};

export default PlansList;
