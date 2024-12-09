import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // For capturing params from the URL
import axios from 'axios';
import { Button, Table, message, Row, Col, Spin,Select } from 'antd';
import AdminPanelLayout from './AdminPanelLayout'; // Your Admin Panel Layout
const {Option} = Select;
const OrdersListDetailsCustomerId = () => {
  const { id } = useParams(); // Capture the customer ID from the URL
  const [orderData, setOrderData] = useState(null); // Store order details
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = localStorage.getItem('accessToken')
  // Table columns
  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId',align:'center' },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate',align:'center' },
   
    { title: 'Total', dataIndex: 'grandTotal', key: 'grandTotal',align:'center' },

    { title: 'P T', dataIndex: 'paymentType', key: 'paymentType',align:'center', render: (type) => (type === 1 ? 'ONLINE' : type === 2 ? 'COD' : 'Other') },
    { title: 'D F', dataIndex: 'deliveryFee', key: 'deliveryFee',align:'center' },
    { title: 'Status', dataIndex: 'orderStatus', key: 'orderStatus',align:'center',render: (status) => {
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
        
      } },{
        title: 'Action',
        key: 'action',
        align:'center',
        render: () => (
          <>
            <Button    onClick={''} type="link"  style={{
                  backgroundColor: "#23C6C8",
                  color: 'white',
              
                }}>Print</Button>
          </>
        ),
      },
  ];

  // Fetch orders data based on customerId (from URL params)
  const fetchOrderData = async () => {
    if (!id) {
      message.error('Invalid customer ID.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(
        'https://meta.oxyloans.com/api/erice-service/order/getAllOrders_customerId',
        {
          customerId: id, // Passing customerId from params to the request body
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Add the Authorization header here
          },
        }
      );
  
      if (response.data && response.data.length > 0) {
        setOrderData(response.data); // Set order data if response is successful
        setError(null); // Reset error state
      } else {
        setError('No orders found.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchOrderData(); // Fetch data when component is mounted
  }, [id]); // Re-fetch data when the customer ID changes
// Handle change in the number of entries per page
const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };
  return (
    <AdminPanelLayout>
      <div>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <p 
              type="primary" 
              onClick={fetchOrderData} 
              loading={loading}
            >
              Orders List

            </p>
          </Col>
          <Col >
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
        </Row>
        
        {loading ? (
          <Spin size="medium"/>
        ) : error ? (
          <Row justify="center">
            <Col>
              <h3>{error}</h3>
            </Col>
          </Row>
        ) : (
          <Table
            columns={columns}
            dataSource={orderData}
            loading={loading}
            rowKey="orderId"
            pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
            bordered
            scroll={{ x: 'max-content' }} // Ensure table is scrollable in small screens
            responsive
          />
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default OrdersListDetailsCustomerId;
