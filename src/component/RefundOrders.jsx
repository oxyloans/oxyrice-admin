import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to install axios using npm install axios
import { Table, Button, DatePicker } from 'antd'; // Import Ant Design components
import Sidebar from './Sidebar';
import Header from './Header';
import AdminPanelLayout from './AdminPanelLayout';

const { RangePicker } = DatePicker; // Import RangePicker for date selection

const RefundOrders = () => {
  const [refundOrders, setRefundOrders] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]); // Array to hold from and to dates

  useEffect(() => {
    // Fetch refund orders when the component mounts
    fetchRefundOrders();
  }, []);

  const fetchRefundOrders = async () => {
    const [fromDate, toDate] = dateRange;
    try {
      const response = await axios.get('/api/refund-orders', {
        params: { 
          fromDate: fromDate ? fromDate.format('YYYY-MM-DD') : '', 
          toDate: toDate ? toDate.format('YYYY-MM-DD') : '' 
        },
      });
      setRefundOrders(response.data); // Assuming the response data is an array of orders
    } catch (error) {
      console.error("Error fetching refund orders:", error);
    }
  };

  const handleGetData = () => {
    fetchRefundOrders(); // Fetch orders based on selected date range
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
      render: (text) => new Date(text).toLocaleDateString(),
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
      title: 'Refund Status',
      dataIndex: 'refundStatus',
      key: 'refundStatus',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, order) => (
        <Button 
          onClick={() => console.log('Refund Action for order', order.id)}
          type="primary"
        >
          Process Refund
        </Button>
      ),
    },
  ];

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     

      <div className="flex flex-1">
        {/* Sidebar */}
        
        <div className="flex-1 p-6 bg-gray-100 flex flex-col items-center">
          <div className="mt-4 flex space-x-4 mb-6">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              className="p-2 border border-gray-300 rounded"
              format="YYYY-MM-DD"
            />
            <Button onClick={handleGetData} type="primary">
              Get Data
            </Button>
          </div>

          <Table
            dataSource={refundOrders}
            columns={columns}
            rowKey="id"
            pagination={false} // Set to true if you want pagination
            className="w-full max-w-6xl"
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default RefundOrders;
