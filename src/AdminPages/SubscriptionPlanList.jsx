import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Form,
  Input,
  notification,
  message,
  Select,
  Row,
  Col,
} from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanel.jsx";
import { MdModeEditOutline } from "react-icons/md";
import BASE_URL from "./Config.jsx";
const { Option } = Select;

const SubscriptionPlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const accessToken = localStorage.getItem("accessToken");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null); // Track selected plan for update

  // Fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/order-service/getAllPlans`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setPlans(response.data || []);
      setFilteredPlans(response.data || []); // Initially set filtered plans
    } catch (error) {
      notification.error({
        message: "Failed to fetch plans",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new plan
  const addPlan = async (values) => {
    try {
      const payload = {
        active: values.active,
        getAmount: values.getAmount,
        limitAmount: values.limitAmount,
        payAmount: values.payAmount,
      };
      await axios.post(`${BASE_URL}/order-service/subscriptionPlans`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      notification.success({
        message: "Plan added successfully!",
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchPlans(); // Refresh the table
    } catch (error) {
      notification.error({
        message: "Failed to add plan",
        description: error.message,
      });
    }
  };

  // Update plan
  const updatePlan = async (values) => {
    if (selectedSubscription) {
      try {
        await axios.patch(
          `${BASE_URL}/order-service/updatePlansBasedOnId`,
          {
            planId: selectedSubscription.planId,
            getAmount: values.getAmount,
            limitAmount: values.limitAmount,
            payAmount: values.payAmount,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        message.success("Subscription Plan data updated successfully");
        fetchPlans();
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        message.error("Error updating item: " + error.message);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize input
    setSearchTerm(value);

    if (value) {
      // Filter plans where the search term matches specific fields
      const filtered = plans.filter((plan) =>
        ["planId", "getAmount", "limitAmount", "amount"].some(
          (key) => plan[key]?.toString().toLowerCase().includes(value) // Exact match for each field
        )
      );

      setFilteredPlans(filtered); // Update with filtered plans
    } else {
      setFilteredPlans(plans); // Show all plans when search term is empty
    }
  };

  const showUpdateModal = (item) => {
    setSelectedSubscription(item);
    form.setFieldsValue({
      getAmount: item.getAmount,
      limitAmount: item.limitAmount,
      payAmount: item.amount,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);

    setSelectedSubscription(null); // Clear selected subscription on modal close
    form.resetFields(); // Reset form fields on cancel
  };

  const updateSubscriptionStatus = async (planId, isActive) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/order-service/activeOrInactive`;
      const response = await axios.patch(
        url,
        {
          id: planId,
          active: !isActive, // Toggle the status (active -> inactive, inactive -> active)
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      message.success("Subscription status updated successfully.");
      fetchPlans(); // Fetch updated categories
    } catch (error) {
      console.error("Error updating category status:", error);
      message.error("Failed to update category status.");
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
      title: "Plan ID",
      dataIndex: "planId",
      key: "planId",
      align: "center",
      render: (planId) => (
        <span className="text-gray-500 font-mono text-xs">
          #{planId?.substring(planId.length - 4) || "N/A"}
        </span>
      ),
    },
    {
      title: "Pay Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
    },
    {
      title: "Get Amount",
      dataIndex: "getAmount",
      key: "getAmount",
      align: "center",
    },
    {
      title: "Limit Amount Per Month",
      dataIndex: "limitAmount",
      key: "limitAmount",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (isActive, record) => (
        <Button
          type="default"
          onClick={() => updateSubscriptionStatus(record.planId, isActive)}
          loading={loading}
          style={{
            backgroundColor: isActive ? "#1C84C6" : "#EC4758",
            color: "white",
          }}
        >
          {isActive ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, item) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Button
            onClick={() => showUpdateModal(item)}
            style={{
              backgroundColor: "#1AB394",
              color: "white",
            }}
          >
            <MdModeEditOutline />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl font-bold mb-2 md:mb-0">Subscription Plans</h2>
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{ backgroundColor: "#1C84C6", color: "white" }}
            className="w-full sm:w-auto"
          >
            Add New Plan
          </Button>
        </div>

        <Row
          justify="space-between"
          align="middle"
          className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
        >
          <Col className="w-full sm:w-auto">
            Show{" "}
            <Select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              style={{ width: 70 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
            </Select>{" "}
            entries
          </Col>

          <Col className="w-full sm:w-auto flex items-center gap-2">
            <span>Search:</span>
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: 150 }}
            />
          </Col>
        </Row>

        <Table
          dataSource={filteredPlans}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
        />

        <Modal
          title={selectedSubscription ? "Update Plan" : "Add New Plan"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              htmlType="submit"
              loading={loading}
              onClick={() => form.submit()}
            >
              {selectedSubscription ? "Update Plan" : "Add Plan"}
            </Button>,
          ]}
        >
          <Form
            form={form}
            onFinish={selectedSubscription ? updatePlan : addPlan}
            layout="vertical"
          >
            <Form.Item
              label="Get Amount"
              name="getAmount"
              rules={[{ required: true, message: "Please enter get amount" }]}
            >
              <Input type="number" placeholder="Enter get amount" />
            </Form.Item>
            <Form.Item
              label="Limit Amount"
              name="limitAmount"
              rules={[{ required: true, message: "Please enter limit amount" }]}
            >
              <Input type="number" placeholder="Enter limit amount" />
            </Form.Item>
            <Form.Item
              label="Pay Amount"
              name="payAmount"
              rules={[{ required: true, message: "Please enter pay amount" }]}
            >
              <Input type="number" placeholder="Enter pay amount" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayout>
  );
};

export default SubscriptionPlansList;
