import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, Row, Col } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const PendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch(`https://meta.oxyloans.com/api/erice-service/order/cancelled-incomplete`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Log the fetched data to see its structure

        if (Array.isArray(data)) {
          setPendingOrders(data); // Set the orders directly
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleView = (orderId) => {
    console.log('View order:', orderId);
  };

  const handlePrint = (orderId) => {
    console.log('Print order:', orderId);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
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
      title: 'Delivery Fee',
      dataIndex: 'deliveryFee',
      key: 'deliveryFee',
    },
    {
      title: 'Total',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
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
      dataIndex: 'orderStatus',
      key: 'orderStatus',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            onClick={() => handleView(record.orderId)}
            className="mr-2"
          >
            View
          </Button>
          <Button
            type="default"
            onClick={() => handlePrint(record.orderId)}
          >
            Print
          </Button>
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <Row justify="center" style={{ height: '100vh', alignItems: 'flex-start' }}>
        <Col>
          <Spin tip="Loading..." />
        </Col>
      </Row>
    );
  }

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        <div className="flex-1 p-4 bg-gray-100">
          <Table
            dataSource={pendingOrders}
            columns={columns}
            rowKey="orderId"
            pagination={{ pageSize: 10 }}
            className="bg-white rounded-lg shadow-lg"
            scroll={{ x: 'max-content' }} // Enable horizontal scrolling on smaller screens
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default PendingOrders;
