import AdminPanelLayout from "./AdminPanelLayout";
import React, { useState,useRef } from 'react';
import { Table, DatePicker, Select,Row, Col,Button, message } from 'antd';
import axios from 'axios';
import moment from 'moment'; 

import jsPDF from "jspdf";
import "jspdf-autotable";

const { RangePicker } = DatePicker;
const accessToken = localStorage.getItem('accessToken');
const {Option }= Select;


const OrdersList = () => {
  const [dateRange, setDateRange] = useState([]);
  const [orderStatus, setOrderStatus] = useState('All');
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [toDate, setToDate] = useState(moment()); 
  const [fromDate, setFromDate] = useState(moment()); 

  const handleDateChange = (dates) => setDateRange(dates);
  const handleStatusChange = (value) => setOrderStatus(value);
  // Handle date change for From Date
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  // Handle date change for To Date
  const handleToDateChange = (date) => {
    setToDate(date);
  };

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

  { title: 'G T', dataIndex: 'grandTotal', key: 'grandTotal', align:'center' },
  {
    title: 'P T',
    dataIndex: 'paymentType',
    key: 'paymentType',
    align:'center',
    render: (type) => (type === 1 ? 'ONLINE' : type === 2 ? 'COD' : 'Other'),
  },
  {
    title: 'P S',
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
        <Button type="link"  style={{
              backgroundColor: "#23C6C8",
              color: 'white',
              padding:"2",
              margin:"2"
             
            }}>View</Button>
        <Button    onClick={handleDownloadPDF} type="link"  style={{
              backgroundColor: "#23C6C8",
              color: 'white',
          
            }}>Print</Button>
      </>
    ),
  },
];

const tableRef = useRef();

const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const tableColumn = ["Order ID", "Name", "Email", "Phone"];
  const tableRows = [];

  // Convert data source to rows
  orderData.forEach((item) => {
    const row = [item.orderId, item.name, item.email, item.phone];
    tableRows.push(row);
  });

  // Add the table to PDF
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  // Save the PDF
  doc.save("OrderData.pdf");
};


const fetchOrderDetails = async () => {
  if (!accessToken) {
    message.error('User not authenticated. Please log in.');
    return;
  }

  // Ensure both dates are selected
  if (!fromDate || !toDate) {
    message.error('Please select a valid date range.');
    return;
  }

  // Ensure the fromDate is before the toDate
  if (fromDate.isAfter(toDate)) {
    message.error('From date cannot be later than To date.');
    return;
  }

  const startDate = fromDate.format('YYYY-MM-DD');
  const endDate = toDate.format('YYYY-MM-DD');
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

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };
  return (
    <AdminPanelLayout>
      <div>
       
      <div className="">
      <Row gutter={16}>
        <Col span={6}>
        <label>Order Status</label>
          <Select
            style={{ width: '100%' }}
            value={orderStatus}
            onChange={handleStatusChange}
          >
            <Option value="All">All</Option>
            <Option value="0">InComplete</Option>
            <Option value="1">Order Placed</Option>
            <Option value="2">Order Accepted</Option>
            <Option value="3">Order Picked</Option>
            <Option value="4">Order Delivered</Option>
            <Option value="5">Order Rejected</Option>
            <Option value="6">Order Canceled</Option>
          </Select>
        </Col>

        <Col span={6}>
          <label
            htmlFor="from_date"
            style={{ textAlign: 'center' }}
            className="control-label"
          >
            From&nbsp;Date
          </label>
          <DatePicker
            value={fromDate}
            onChange={handleFromDateChange}
           format="YYYY-MM-DD"
            style={{ width: '100%' }}
          />
        </Col>

        <Col span={6}>
          <label
            htmlFor="to_date"
            style={{ textAlign: 'center' }}
            className="control-label"
          >
            To&nbsp;Date
          </label>
          <DatePicker
            value={toDate}
            onChange={handleToDateChange}
            format="YYYY-MM-DD"
            style={{ width: '100%' }}
          />
        </Col>

        <Col span={6} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <Button
            style={{
              backgroundColor: '#1AB394',
              color: 'white',
            }}
            onClick={fetchOrderDetails}
            loading={loading}
          >
            Get Data
          </Button>

          <Button
            style={{
              backgroundColor: '#1AB394',
              color: 'white',
            }}
            disabled
          >
            Export (Coming Soon)
          </Button>
        </Col>
      </Row>
    </div>
        <Row justify="space-between" align="middle" className="mb-4">
<Col>
<h2 className="text-xl font-bold mb-2 sm:mb-0">Orders List</h2>
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
        <Table
       
          columns={columns}
          dataSource={orderData}
          loading={loading}
          rowKey="orderId"
          scroll={{ x: '100%' }}
          pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
          // pagination={false}
        />
      </div>
    </AdminPanelLayout>
  );
};

export default OrdersList;


