import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Form,
  Dropdown,
  Menu,
  Pagination,
  message,
  Row,
  Col,
} from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";

const { Option } = Select;

const SubscriptionPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState(25);
  const [searchValue, setSearchValue] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/subscription-plans");
      setPlans(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Failed to load plans.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSearch = (value) => {
    setSearchValue(value.toLowerCase());
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.payAmount.toString().includes(searchValue) ||
      plan.getAmount.toString().includes(searchValue) ||
      plan.limitAmount.toString().includes(searchValue)
  );

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/subscription-plans/${editingPlan.id}`, values);
      message.success("Plan updated successfully.");
      fetchPlans();
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update plan.");
    }
  };

  const handleAdd = async (values) => {
    try {
      await axios.post("/api/subscription-plans", values);
      message.success("Plan added successfully.");
      fetchPlans();
      setAddModalVisible(false);
    } catch (error) {
      message.error("Failed to add plan.");
    }
  };

  const columns = [
    {
      title: "SI. NO",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Pay Amount",
      dataIndex: "payAmount",
      key: "payAmount",
      responsive: ["md"],
    },
    {
      title: "Get Amount",
      dataIndex: "getAmount",
      key: "getAmount",
      responsive: ["md"],
    },
    {
      title: "Limit Amount",
      dataIndex: "limitAmount",
      key: "limitAmount",
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (text === "active" ? "Active" : "Inactive"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const menu = (
    <Menu>
      {[25, 50, 75].map((entry) => (
        <Menu.Item key={entry} onClick={() => setEntries(entry)}>
          {entry} Entries
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <AdminPanelLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 container mx-auto p-4">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <Dropdown overlay={menu}>
              <Button>Show {entries} Entries</Button>
            </Dropdown>

            <Input.Search
              placeholder="Search plans"
              onSearch={handleSearch}
              style={{ width: "100%", maxWidth: 300, marginTop: "8px" }}
            />

            <Button
              type="primary"
              onClick={() => setAddModalVisible(true)}
              style={{ marginTop: "8px" }}
            >
              Add New Plan
            </Button>
          </div>

          <Table
            dataSource={filteredPlans}
            columns={columns}
            pagination={{ pageSize: entries }}
            rowKey="id"
            loading={loading}
            scroll={{ x: 600 }} // Add horizontal scrolling for small screens
          />

          {/* Edit Modal */}
          <Modal
            title="Edit Subscription Plan"
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={null}
            width="90%"
          >
            <Form
              layout="vertical"
              initialValues={editingPlan}
              onFinish={handleUpdate}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Pay Amount"
                    name="payAmount"
                    rules={[{ required: true, message: "Please enter pay amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Get Amount"
                    name="getAmount"
                    rules={[{ required: true, message: "Please enter get amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Limit Amount"
                    name="limitAmount"
                    rules={[{ required: true, message: "Please enter limit amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: "Please select status" }]}
                  >
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
                <Button onClick={() => setEditModalVisible(false)} style={{ marginLeft: 8 }}>
                  Close
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Add Modal */}
          <Modal
            title="Add New Subscription Plan"
            visible={addModalVisible}
            onCancel={() => setAddModalVisible(false)}
            footer={null}
            width="50%"
          >
            <Form layout="vertical" onFinish={handleAdd}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Pay Amount"
                    name="payAmount"
                    rules={[{ required: true, message: "Please enter pay amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Get Amount"
                    name="getAmount"
                    rules={[{ required: true, message: "Please enter get amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Limit Amount"
                    name="limitAmount"
                    rules={[{ required: true, message: "Please enter limit amount" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: "Please select status" }]}
                  >
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add Plan
                </Button>
                <Button onClick={() => setAddModalVisible(false)} style={{ marginLeft: 8 }}>
                  Close
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default SubscriptionPlanList;
