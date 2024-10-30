import React, { useEffect, useState } from 'react';
import { Table, Button, Spin } from 'antd';
import Header from './Header'; // Import your Header component
import Sidebar from './Sidebar'; // Import your Sidebar component
import AdminPanelLayout from './AdminPanelLayout';

const ReturnList = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch('/api/orders/pending'); // Adjust API endpoint as needed
        const data = await response.json();
        setPendingOrders(data);
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleView = (orderId) => {
    // Handle view action
    console.log('View order:', orderId);
    // Navigate to order details page or display modal
  };

  const handlePrint = (orderId) => {
    // Handle print action
    console.log('Print order:', orderId);
    // Implement print functionality (e.g., window.print())
  };

  // Define columns for the Ant Design Table
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
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Order By',
      dataIndex: 'orderBy',
      key: 'orderBy',
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
      title: 'DF',
      dataIndex: 'df',
      key: 'df',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'PT',
      dataIndex: 'pt',
      key: 'pt',
    },
    {
      title: 'PGC',
      dataIndex: 'pgc',
      key: 'pgc',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            onClick={() => handleView(record.id)}
            className="mr-2"
          >
            View
          </Button>
          <Button
            type="default"
            onClick={() => handlePrint(record.id)}
          >
            Print
          </Button>
        </span>
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Loading..." />; // Loading state using Ant Design Spinner
  }

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
    
      <div className="flex flex-1">
        {/* Sidebar */}
       
        <div className="flex-1 p-6 bg-gray-100">
          {/* Orders Table using Ant Design Table */}
          <Table
            dataSource={pendingOrders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }} // Pagination settings
            className="bg-white rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default ReturnList;
