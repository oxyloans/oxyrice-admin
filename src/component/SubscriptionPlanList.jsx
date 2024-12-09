import React, { useState, useEffect } from "react";
import { Table, Modal, Button, Form, Select, Row, Col, Input, notification } from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";
const { Option } = Select;

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const accessToken  = localStorage.getItem('accessToken');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPlans, setFilteredPlans] = useState([]);

  // Fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyloans.com/api/erice-service/wallet/getAllPlans",{
          headers:{
            Authorization:`Bearer ${accessToken}`
          }
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
        active: true,
        getAmount: values.getAmount,
        limitAmount: values.limitAmount ,
        payAmount: values.payAmount,
      };
      await axios.post(
        "https://meta.oxyloans.com/api/erice-service/wallet/subscriptionPlans",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle change in the number of entries per page
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
    const filtered = plans.filter(plan =>
      ['planId', 'getAmount', 'limitAmount', 'amount'].some(key =>
        plan[key]?.toString().toLowerCase() === value // Exact match for each field
      )
    );

    setFilteredPlans(filtered); // Update with filtered plans
  } else {
    setFilteredPlans(plans); // Show all plans when search term is empty
  }
};



  
  // Table columns
  const columns = [
    {
      title: 'S.NO',
      key: 'serialNo',
      render: (text, record, index) => (
        index + 1 + (currentPage - 1) * entriesPerPage
      ),
      align: 'center',
    },
    {
      title: "Plan ID",
      dataIndex: "planId",
      key: "planId",
      align: 'center',
    },
    {
      title: "Pay Amount",
      dataIndex: "amount",
      key: "amount",
      align: 'center',
    },
    {
      title: "Get Amount",
      dataIndex: "getAmount",
      key: "getAmount",
      align: 'center',
    },
    {
      title: "Limit Amount",
      dataIndex: "limitAmount",
      key: "limitAmount",
      align: 'center',
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      align: 'center',
      render: (isActive, record) => (
        <p
          style={{
            backgroundColor: isActive ? '#EC4758' : '#1C84C6',
            color: 'white',
            width: '75px',
            textAlign: 'center',
            padding: '1px 0',
            margin: '0 auto',
            borderRadius: '1px',
            lineHeight: '1.5',
            cursor: 'pointer',
          }}
          // onClick={() => updatePlanStatus(record.planId, isActive)}
        >
          {isActive ? 'Inactive' : 'Active'}
        </p>
      ),
    },
  ];

  // Toggle plan status (Active/Inactive)
  const updatePlanStatus = async (planId, isActive) => {
    try {
      const payload = { active: !isActive };
      await axios.patch(
        `https://meta.oxyloans.com/api/erice-service/wallet/subscriptionPlans/${planId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      notification.success({
        message: `Plan ${isActive ? 'deactivated' : 'activated'} successfully!`,
      });
      fetchPlans(); // Refresh the table
    } catch (error) {
      notification.error({
        message: "Failed to update plan status",
        description: error.message,
      });
    }
  };

  return (
    <AdminPanelLayout>
      <div className="container">
        <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Subscription Plans</h2>
      </div>
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{
              backgroundColor: '#1C84C6',
              color: 'white',
              marginBottom: '16px',
            }}
          >
            Add New Plan
          </Button>
        </div>

        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            Show{' '}
            <Select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              style={{ width: 70 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
            </Select>
            {' '}entries
          </Col>

          <Col>
            Search:{' '}
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
          title="Add New Plan"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          okText="Add Plan"
        >
          <Form form={form} onFinish={addPlan} layout="vertical">
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

export default SubscriptionPlans;
