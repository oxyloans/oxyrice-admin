// import React, { useState, useEffect } from 'react';
// import { Table, Select, DatePicker, Button, message } from 'antd';
//  // Ensure you have this component or adjust accordingly
// import axios from 'axios';
// import moment from 'moment'; // To handle date formatting

// const { Option } = Select;

// const OrderList = () => {
//   const [orders, setOrders] = useState([]);
//   const [status, setStatus] = useState('all');
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Fetch orders from API based on selected filters
//   const fetchOrders = async () => {
//     setLoading(true);  // Show loading indicator
//     try {
//       const params = {
//         orderStatus: status !== 'all' ? status : '',
//         fromDate: fromDate ? moment(fromDate).format('YYYY-MM-DD') : '',
//         toDate: toDate ? moment(toDate).format('YYYY-MM-DD') : '',
//       };

//       const response = await axios.get('https://meta.oxyloans.com/api/erice-service/order/getAllOrders',
        
//         { params });
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       // Display a user-friendly error message
//       message.error(`Error fetching orders: ${error.response?.status} - ${error.response?.statusText || 'Unknown error'}`);
//     } finally {
//       setLoading(false);  // Hide loading indicator
//     }
//   };

//   useEffect(() => {
//     fetchOrders(); // Fetch initial orders on component mount
//   }, []);

//   const handleFetchData = () => {
//     fetchOrders(); // Fetch orders when button is clicked
//   };

//   const handleExport = () => {
//     // Implement export functionality (e.g., download CSV or XLSX)
//     console.log('Exporting data...');
//   };

//   // Define columns for the Ant Design Table
//   const columns = [
//     {
//       title: 'Order ID',
//       dataIndex: 'orderId',
//       key: 'orderId',
//     },
//     {
//       title: 'Order Date',
//       dataIndex: 'orderDate',
//       key: 'orderDate',
//       render: (text) => new Date(text).toLocaleDateString(),
//     },
//     {
//       title: 'Order By',
//       dataIndex: 'orderBy',
//       key: 'orderBy',
//     },
//     {
//       title: 'Amount',
//       dataIndex: 'amount',
//       key: 'amount',
//     },
//     {
//       title: 'Discount',
//       dataIndex: 'discount',
//       key: 'discount',
//     },
//     {
//       title: 'DF',
//       dataIndex: 'df',
//       key: 'df',
//     },
//     {
//       title: 'Total',
//       dataIndex: 'total',
//       key: 'total',
//     },
//     {
//       title: 'PT',
//       dataIndex: 'pt',
//       key: 'pt',
//     },
//     {
//       title: 'PGC',
//       dataIndex: 'pgc',
//       key: 'pgc',
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <span>
//           <Button type="link" onClick={() => console.log('Editing order', record.orderId)}>Edit</Button>
//           <Button type="link" danger onClick={() => console.log('Deleting order', record.orderId)}>Delete</Button>
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
     

//       <div className="flex flex-1">
//         {/* Sidebar */}
       

//         {/* Main Content */}
//         <div className="flex-1 p-6 bg-gray-100">
//           <h2 className="text-2xl font-bold mb-4">Order List</h2>

//           {/* Filter Section */}
//           <div className="mb-4 flex items-center">
//             <label className="mr-2">Order Status:</label>
//             <Select
//               value={status}
//               onChange={(value) => setStatus(value)}
//               className="mr-4"
//               style={{ width: 150 }}
//             >
//               <Option value="all">All</Option>
//               <Option value="incomplete">Incomplete</Option>
//               <Option value="OrderPlaced">Order Placed</Option>
//               <Option value="Accepted">Accepted</Option>
//               <Option value="PickedUp">Picked Up</Option>
//               <Option value="Delivered">Delivered</Option>
//               <Option value="Rejected">Rejected</Option>
//               <Option value="Cancelled">Cancelled</Option>
//             </Select>

//             <label className="mr-2">From Date:</label>
//             <DatePicker
//               value={fromDate}
//               onChange={(date) => setFromDate(date)}
//               className="mr-4"
//             />

//             <label className="mr-2">To Date:</label>
//             <DatePicker
//               value={toDate}
//               onChange={(date) => setToDate(date)}
//               className="mr-4"
//             />

//             <Button onClick={handleFetchData} type="primary" className="mr-2" loading={loading}>
//               Get Data
//             </Button>

//             <Button onClick={handleExport} type="default">
//               Export
//             </Button>
//           </div>

//           {/* Orders Table */}
//           <Table
//             dataSource={orders}
//             columns={columns}
//             rowKey="orderId"
//             pagination={{ pageSize: 10 }}
//             loading={loading}
//             className="bg-white border border-gray-300 rounded shadow"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderList;


import React, { useState, useEffect } from 'react';
import { Table, Button, message, Input, Modal, Form, Select, DatePicker, InputNumber } from 'antd';
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
    <>
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
            style={{ width: 200 }}
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
          className="bg-white border border-gray-300 rounded shadow"
        />

        {/* Edit Order Modal */}
        <Modal
          title="Edit Order"
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveOrder}
          okText="Save"
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Order Status" name="orderStatus" rules={[{ required: true, message: 'Please select an order status' }]}>
              <Select>
                <Option value="OrderPlaced">Order Placed</Option>
                <Option value="Dispatched">Dispatched</Option>
                <Option value="Delivered">Delivered</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Order Date" name="orderDate" rules={[{ required: true, message: 'Please select a date' }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item label="Wallet Amount" name="walletAmount" rules={[{ required: true, message: 'Please enter wallet amount' }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item label="Payment Type" name="paymentType" rules={[{ required: true, message: 'Please enter payment type' }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item label="Payment Status" name="paymentStatus" rules={[{ required: true, message: 'Please enter payment status' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Payment ID" name="paymentId" rules={[{ required: true, message: 'Please enter payment ID' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default OrderList;

