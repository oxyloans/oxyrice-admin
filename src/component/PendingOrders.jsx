// import React, { useEffect, useState } from 'react';
// import { Table, Button, Spin, Row, Col } from 'antd';
// import AdminPanelLayout from './AdminPanelLayout';

// const PendingOrders = () => {
//   const [pendingOrders, setPendingOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPendingOrders = async () => {
//       setLoading(true); // Start loading when fetching begins
//       try {
//         const response = await fetch(`https://meta.oxyloans.com/api/erice-service/order/cancelled-incomplete`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setPendingOrders(data);
//         } else {
//           console.error('Fetched data is not an array:', data);
//         }
//       } catch (error) {
//         console.error('Error fetching pending orders:', error);
//       } finally {
//         setLoading(false); // Stop loading after the fetching is done
//       }
//     };

//     fetchPendingOrders();
//   }, []);

//   const handleView = (orderId) => {
//     console.log('View order:', orderId);
//   };

//   const handlePrint = (orderId) => {
//     console.log('Print order:', orderId);
//   };

//   const columns = [
//     {
//       title: 'Order ID',
//       dataIndex: 'orderId',
//       key: 'orderId',
//       responsive: ['lg'], // Show on large screens and up
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
//       responsive: ['lg'], // Show on large screens and up
//     },
//     {
//       title: 'Delivery Fee',
//       dataIndex: 'deliveryFee',
//       key: 'deliveryFee',
//     },
//     {
//       title: 'Total',
//       dataIndex: 'grandTotal',
//       key: 'grandTotal',
//     },
//     {
//       title: 'PT',
//       dataIndex: 'pt',
//       key: 'pt',
//       responsive: ['lg'], // Show on large screens and up
//     },
//     {
//       title: 'PGC',
//       dataIndex: 'pgc',
//       key: 'pgc',
//       responsive: ['lg'], // Show on large screens and up
//     },
//     {
//       title: 'Status',
//       dataIndex: 'orderStatus',
//       key: 'orderStatus',
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <span>
//           <Button
//             type="primary"
//             onClick={() => handleView(record.orderId)}
//             className="mr-2"
//             size="small"
//           >
//             View
//           </Button>
//           <Button
//             type="default"
//             onClick={() => handlePrint(record.orderId)}
//             size="small"
//           >
//             Print
//           </Button>
//         </span>
//       ),
//     },
//   ];

//   if (loading) {
//     return (
//       <Row justify="center" style={{ height: '100vh', alignItems: 'center' }}>
//         <Col>
//           <Spin tip="Loading..." />
//         </Col>
//       </Row>
//     );
//   }

//   return (
//     <AdminPanelLayout>
//       <Row justify="center">
//         <Col xs={24} md={22} lg={20} style={{ padding: '20px' }}>
//           <Table
//             dataSource={pendingOrders}
//             columns={columns}
//             rowKey="orderId"
//             pagination={{ pageSize: 5 }}
//             className="bg-white rounded-lg shadow-lg"
//             scroll={{ x: 'max-content' }} // Enable horizontal scrolling for smaller screens
//           />
//         </Col>
//       </Row>
//     </AdminPanelLayout>
//   );
// };

// export default PendingOrders;





import AdminPanelLayout
 from "./AdminPanelLayout";   
   const PendingOrders = () =>
   {
    return(
      <>
      <AdminPanelLayout>
      </AdminPanelLayout>
      </>
    )
   }
export default PendingOrders;
