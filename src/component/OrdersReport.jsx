import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Input } from 'antd'; // Import Ant Design components
import Header from './Header'; // Import your Header component
import Sidebar from './Sidebar'; // Import your Sidebar component
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select; // Destructure Option from Select

const OrdersReport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromDate, toDate, orderStatus }),
      });

      const data = await response.json();
      setOrders(data.orders);
      // Calculate total amount
      const total = data.orders.reduce((acc, order) => acc + order.amount, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleGeneratePDF = () => {
    // Implement your PDF generation logic here
    console.log('Generating PDF...');
  };

  // Define columns for Ant Design table
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text) => new Date(text).toLocaleDateString(), // Format date
    },
    {
      title: 'Ordered By',
      dataIndex: 'orderedBy',
      key: 'orderedBy',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
    },
    {
      title: 'D F',
      dataIndex: 'df',
      key: 'df',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'P T',
      dataIndex: 'pt',
      key: 'pt',
    },
    {
      title: 'P G C',
      dataIndex: 'pgc',
      key: 'pgc',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, order) => (
        <Button 
          onClick={() => console.log('Action for order', order.id)} 
          type="primary"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
     

      <div className="flex flex-1">
       
        <div className="flex-1 p-6 bg-gray-100 flex flex-col items-center">
          <div className="mt-4 flex space-x-4 mb-6">
            <Select
              value={orderStatus}
              onChange={setOrderStatus}
              placeholder="Select Order Status"
              className="w-48"
            >
              <Option value="">Select Order Status</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Refunded">Refunded</Option>
              {/* Add more options as needed */}
            </Select>

            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded"
            />
            <Button onClick={fetchOrders} type="primary">
              Get Data
            </Button>
            <Button onClick={handleGeneratePDF} type="primary" className="bg-green-500">
              Generate PDF
            </Button>
          </div>

          <p className="mb-4 text-lg">Total value of the fetched orders: ${totalAmount}</p>

          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={false} // Set to true if you want pagination
            className="mt-4 w-full max-w-6xl"
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default OrdersReport;
