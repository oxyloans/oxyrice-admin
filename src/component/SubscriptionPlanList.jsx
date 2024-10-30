import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select, Form, Dropdown, Menu, Pagination, message } from "antd";
import axios from "axios"; // For API integration
import Header from "./Header";
import Sidebar from "./Sidebar";
import AdminPanelLayout from "./AdminPanelLayout";

const { Option } = Select;

const SubscriptionPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState(25); // Dropdown for showing entries
  const [searchValue, setSearchValue] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Fetch subscription plans from the API
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/subscription-plans"); // Replace with your API endpoint
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

  // Function to filter plans based on search input
  const handleSearch = (value) => {
    setSearchValue(value.toLowerCase());
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.payAmount.toString().includes(searchValue) ||
      plan.getAmount.toString().includes(searchValue) ||
      plan.limitAmount.toString().includes(searchValue)
  );

  // Handle edit action
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setEditModalVisible(true);
  };

  // Handle update after editing
  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/subscription-plans/${editingPlan.id}`, values); // Update API call
      message.success("Plan updated successfully.");
      fetchPlans(); // Reload the plans after update
      setEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update plan.");
    }
  };

  // Handle add new plan
  const handleAdd = async (values) => {
    try {
      await axios.post("/api/subscription-plans", values); // Add new plan API call
      message.success("Plan added successfully.");
      fetchPlans(); // Reload plans after adding a new plan
      setAddModalVisible(false);
    } catch (error) {
      message.error("Failed to add plan.");
    }
  };

  // Table columns
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
    },
    {
      title: "Get Amount",
      dataIndex: "getAmount",
      key: "getAmount",
    },
    {
      title: "Limit Amount",
      dataIndex: "limitAmount",
      key: "limitAmount",
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

  // Entries dropdown menu
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
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     

      <div className="flex flex-1">
        {/* Sidebar */}
      

        <div className="container mx-auto mt-5 flex-1">
          <div className="flex justify-between mb-4">
            <Dropdown overlay={menu}>
              <Button>Show {entries} Entries</Button>
            </Dropdown>

            <Input.Search
              placeholder="Search plans"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />

            <Button type="primary" onClick={() => setAddModalVisible(true)}>
              Add New Plan
            </Button>
          </div>

          <Table
            dataSource={filteredPlans}
            columns={columns}
            pagination={{ pageSize: entries }}
            rowKey="id"
            loading={loading}
          />

          {/* Edit Modal */}
          <Modal
            title="Edit Subscription Plan"
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={null}
          >
            <Form
              layout="vertical"
              initialValues={editingPlan}
              onFinish={handleUpdate}
            >
              <Form.Item
                label="Pay Amount"
                name="payAmount"
                rules={[{ required: true, message: "Please enter pay amount" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Get Amount"
                name="getAmount"
                rules={[{ required: true, message: "Please enter get amount" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Limit Amount"
                name="limitAmount"
                rules={[{ required: true, message: "Please enter limit amount" }]}
              >
                <Input />
              </Form.Item>

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
          >
            <Form layout="vertical" onFinish={handleAdd}>
              <Form.Item
                label="Pay Amount"
                name="payAmount"
                rules={[{ required: true, message: "Please enter pay amount" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Get Amount"
                name="getAmount"
                rules={[{ required: true, message: "Please enter get amount" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Limit Amount"
                name="limitAmount"
                rules={[{ required: true, message: "Please enter limit amount" }]}
              >
                <Input />
              </Form.Item>

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
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default SubscriptionPlanList;
