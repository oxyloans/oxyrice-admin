import React, { useState, useEffect } from 'react';
import { Table, Button, message, Input, Modal, Form, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const OrderList = () => {
  const [orders, setOrders] = useState([]); // Orders state
  const [loading, setLoading] = useState(false); // Loading state
  const [searchOrderId, setSearchOrderId] = useState(''); // Search field state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for editing

  const [form] = Form.useForm(); // Ant Design Form instance

  // Fetch all orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/order/getAllOrders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error(`Error fetching orders: ${error.response?.status} - ${error.response?.statusText || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific order by Order ID
  const fetchOrderById = async () => {
    if (!searchOrderId) {
      message.warning('Please enter an Order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`https://meta.oxyloans.com/api/erice-service/order/getOrdersByOrderId/${searchOrderId}`);
      setOrders(response.data); // Set the single order into the table
      message.success('Order details fetched successfully');
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      message.error(`Error fetching order: ${error.response?.status} - ${error.response?.statusText || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Fetch all orders initially
  }, []);

  // Handle the "Edit" button click
  const handleEdit = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      walletAmount: order.walletAmount,
      paymentType: order.paymentType,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
    });
    setIsModalOpen(true);
  };

  // Handle form submission to save the edited order
  const handleSaveOrder = async () => {
    try {
      const updatedOrder = await form.validateFields(); // Validate form fields
      const payload = {
        ...updatedOrder,
        customerId: selectedOrder.customerId,
      };

      await axios.post('https://meta.oxyloans.com/api/erice-service/order/Saveorders', payload);
      message.success('Order saved successfully!');
      setIsModalOpen(false);
      fetchOrders(); // Refresh the order list
    } catch (error) {
      console.error('Error saving order:', error);
      message.error(`Error saving order: ${error.response?.status} - ${error.response?.statusText || 'Unknown error'}`);
    }
  };

  // Define columns for the Ant Design Table with centered text
  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId', align: 'center' },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate', align: 'center', render: (text) => new Date(text).toLocaleDateString() },
    { title: 'Order By', dataIndex: 'orderBy', key: 'orderBy', align: 'center' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'center' },
    { title: 'Discount', dataIndex: 'discount', key: 'discount', align: 'center' },
    { title: 'Delivery Fee', dataIndex: 'df', key: 'df', align: 'center' },
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'center' },
    { title: 'Order Status', dataIndex: 'orderStatus', key: 'orderStatus', align: 'center' },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
        </span>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 p-6 bg-gray-100">
          <h2 className="text-2xl font-bold mb-4">Order List</h2>

          {/* Search Order by ID */}
          <div className="mb-4 flex items-center">
            <Input
              placeholder="Enter Order ID"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="mr-4"
              style={{ width: 'auto', maxWidth: 200 }}
            />
            <Button onClick={fetchOrderById} type="primary" loading={loading}>
              Search Order
            </Button>
          </div>

          {/* Orders Table */}
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="orderId"
            pagination={{ pageSize: 6 }}
            loading={loading}
            scroll={{ x: 'max-content' }} 
            className="bg-white border border-gray-300 rounded shadow"
          />

          {/* Edit Order Modal */}
          <Modal
            title="Edit Order"
            visible={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleSaveOrder}
            okText="Save"
            width={600} // Adjust modal width as needed
            bodyStyle={{ padding: '24px' }} // Add padding to modal body
          >
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Order Status" name="orderStatus" rules={[{ required: true, message: 'Please select an order status' }]}>
                    <Select>
                      <Option value="OrderPlaced">Order Placed</Option>
                      <Option value="Dispatched">Dispatched</Option>
                      <Option value="Delivered">Delivered</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Order Date" name="orderDate" rules={[{ required: true, message: 'Please select a date' }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Wallet Amount" name="walletAmount" rules={[{ required: true, message: 'Please enter wallet amount' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Payment Type" name="paymentType" rules={[{ required: true, message: 'Please enter payment type' }]}>
                    <Input style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Payment Status" name="paymentStatus" rules={[{ required: true, message: 'Please enter payment status' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Payment ID" name="paymentId" rules={[{ required: true, message: 'Please enter payment ID' }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default OrderList;
