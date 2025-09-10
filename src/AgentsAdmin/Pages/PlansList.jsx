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
  Space,
} from "antd";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Option } = Select;

const PlansList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [form] = Form.useForm();

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
      setData(normalized);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Open Modal for Add or Update Plan
  const openModal = (plan = null) => {
    setCurrentPlan(plan);
    form.setFieldsValue({
      planAmount: plan?.planAmount,
      planType: plan?.planType ,
      status: plan?.status ?? true,
    });
    setModalVisible(true);
  };

  // Handle Modal Submit
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

      if (!res.ok) throw new Error("Failed to save plan");
      message.success(`Plan saved successfully!`);
      setModalVisible(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      message.error("Error saving plan");
    }
  };

  // Table Columns (center-aligned)
  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (_text, _record, index) => index + 1,
      align: "center",
    },
    {
      title: "Plan ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (id) => `#${id.slice(-4)}`,
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
          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
        ) : (
          <span style={{ color: "red", fontWeight: "bold" }}>Inactive</span>
        ),
      align: "center",
    },
  ];

  return (
    <AgentsAdminLayout>
      <Card
        className="shadow-md rounded-lg"
        title={
          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, textAlign: "center", flex: 1 }}>
              Available Plans
            </h3>
            <Button
              type="primary"
              style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
              onClick={() => openModal()}
            >
              Add Plan
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
          scroll={{ x: true }}
          style={{ textAlign: "center" }}
        />

        <Modal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSave}
          okText="Save"
          okButtonProps={{
            style: {
              backgroundColor: "#008cba",
              borderColor: "#008cba",
              color: "#fff",
            },
          }}
          cancelButtonProps={{
            style: {
              backgroundColor: "#f0f0f0",
              borderColor: "#d9d9d9",
              color: "#000",
            },
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Plan Amount"
              name="planAmount"
              rules={[{ required: true, message: "Please enter plan amount" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Plan Type"
              name="planType"
              rules={[{ required: true, message: "Please select plan type" }]}
            >
              <Select>
                <Option value="MONTHLY">MONTHLY</Option>
                <Option value="QUARTERLY">QUARTERLY</Option>
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
