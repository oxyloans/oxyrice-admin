import AdminPanelLayout from "./AdminPanelLayout";
import React, { useState } from 'react';
import { Table, DatePicker, Select, Button, message } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;
const accessToken = localStorage.getItem('accessToken');

// Define table columns
const columns = [
  { title: 'Order Id', dataIndex: 'orderId', key: 'orderId',align:'center' },
  { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate',align:'center' },
  // {
  //   title: 'Customer Id',
  //   dataIndex: 'customerId',
  //   key: 'customerId',
  //   render: (text) => text || 'N/A',align:'center'
  // },

  { title: 'Grand Total', dataIndex: 'grandTotal', key: 'grandTotal', align:'center' },
  {
    title: 'Payment Type',
    dataIndex: 'paymentType',
    key: 'paymentType',
    align:'center',
    render: (type) => (type === 1 ? 'ONLINE' : type === 2 ? 'COD' : 'Other'),
  },
  {
    title: 'Payment Status',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: (status) => status || 'Pending',
    align:'center'
  },
  {
    title: 'Status',
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    align:'center',
    render: (status) => {
      const statusMap = {
        '0': 'Incomplete',
        '1': 'Order Placed',
        '2': 'Order Accepetd',
        '3': 'Order Picked',
        '4': 'Order Delivered',
        '5': 'Order Rejected',
        '6': 'Order Canceled',
      };
      return statusMap[status] || 'Pending';
      
    },
  },
  {
    title: 'Action',
    key: 'action',
    align:'center',
    render: () => (
      <>
        <Button type="link">View</Button>
        <Button type="link">Print</Button>
      </>
    ),
  },
];

const OrdersList = () => {
  const [dateRange, setDateRange] = useState([]);
  const [orderStatus, setOrderStatus] = useState('All');
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (dates) => setDateRange(dates);
  const handleStatusChange = (value) => setOrderStatus(value);

  const fetchOrderDetails = async () => {
    if (!accessToken) {
      message.error('User not authenticated. Please log in.');
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.warning('Please select a valid date range.');
      return;
    }

    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    const statusValue = orderStatus !== 'All' ? orderStatus : undefined;

    try {
      setLoading(true);
      const response = await axios.get(`https://meta.oxyloans.com/api/erice-service/order/date-range`, {
        params: { startDate, endDate, status: statusValue },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log('API Response:', response.data); // Confirm the structure of response data

      if (response.status === 200) {
        let orders = response.data;

        // Filter results based on status if specified
        if (statusValue) {
          orders = orders.filter(order => order.orderStatus === statusValue);
        }

        setOrderData(orders);
        message.success('Data fetched successfully');
      } else {
        message.error('No data found');
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      message.error('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdminPanelLayout>
      <div>
        <h2>Orders List</h2>
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Select
            style={{ width: 150 }}
            value={orderStatus}
            onChange={handleStatusChange}
          >
            <Select.Option value="All">All</Select.Option>
            <Select.Option value="0">InComplete</Select.Option>
            <Select.Option value="1">Order Placed</Select.Option>
            <Select.Option value="2">Order Accepetd</Select.Option>
            <Select.Option value="3">Order Picked</Select.Option>
            <Select.Option value="4">Order Delivered</Select.Option>
            <Select.Option value="5">Order Rejected</Select.Option>
            <Select.Option value="6">Order Canceled</Select.Option>
          </Select>
          <RangePicker onChange={handleDateChange} style={{ flex: 1 }} />
          <Button type="primary" onClick={fetchOrderDetails} loading={loading}>
            Get Data
          </Button>
          <Button type="default" disabled>
            Export (Coming Soon)
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          scroll={{ x: '100%' }}
        />
      </div>
    </AdminPanelLayout>
  );
};

export default OrdersList;
