// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Table, Form, Input, Button, message, Modal, Row, Col } from 'antd';
// import AdminPanelLayout from './AdminPanelLayout';

// const SellerItemsList = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingItem, setEditingItem] = useState(null);
//   const [sellerId, setSellerId] = useState(7); // Updated to initialize as null

//   // Fetch seller details (including sellerId) from an API
//   const fetchSellerDetails = async () => {
//     try {
//       const response = await axios.get('https://meta.oxyloans.com/api/erice-service/seller/sellerDetails');
//       setSellerId(response.data.sellerId);
//     } catch (error) {
//       console.error('Error fetching seller details:', error);
//       message.error('Failed to fetch seller details.');
//     }
//   };

//   // Fetch item details from the API
//   const fetchItemDetails = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get('https://meta.oxyloans.com/api/erice-service/selleritems/ItemsGetTotal');
//       setItems(response.data);
//     } catch (error) {
//       console.error('Error fetching item details:', error);
//       message.error('Failed to fetch item details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update item price using the PATCH API
//   const updateItemPrice = async (values) => {
//     if (!editingItem || sellerId === null) return;

//     try {
//       await axios.patch('https://meta.oxyloans.com/api/erice-service/selleritems/sellerItemPriceFix', {
//         active: true,
//         itemId: editingItem.itemId,
//         itemMrp: values.itemMrp,
//         sellerId: sellerId,
//       });
//       message.success('Item price updated successfully!');
//       setEditingItem(null);
//       fetchItemDetails();
//     } catch (error) {
//       console.error('Error updating item price:', error);
//       message.error('Failed to update item price.');
//     }
//   };

//   // Handle Edit Button Click
//   const handleEditClick = (item) => {
//     setEditingItem(item);
//   };

//   useEffect(() => {
//     fetchSellerDetails();
//     fetchItemDetails();
//   }, []);

//   const columns = [
//     {
//       title: 'Item Name',
//       dataIndex: 'itemName',
//       key: 'itemName',
//     },
//     {
//       title: 'Quantity',
//       dataIndex: 'quantity',
//       key: 'quantity',
//     },
//     {
//       title: 'Units',
//       dataIndex: 'units',
//       key: 'units',
//     },
//     {
//       title: 'Current MRP',
//       dataIndex: 'itemMrp',
//       key: 'itemMrp',
//     },
//     {
//       title: 'Item Image',
//       dataIndex: 'itemImage',
//       key: 'itemImage',
//       render: (text) => <img src={text} alt="Item" style={{ width: 50, height: 50 }} />, // Displaying image
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (text, record) => (
//         <Button type="primary" onClick={() => handleEditClick(record)}>
//           Edit Price
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <AdminPanelLayout>
//       <div style={{ padding: '20px' }}>
//         <Row gutter={[16, 16]}>
//           <Col span={24}>
//             <Table 
//               dataSource={items} 
//               columns={columns} 
//               rowKey="itemId" 
//               loading={loading} 
//               pagination={{ pageSize: 10 }} // Adjust pagination for mobile
//               bordered 
//             />
//           </Col>
//         </Row>
        
//         {editingItem && (
//           <Modal
//             title={`Update Price for ${editingItem.itemName}`}
//             visible={true}
//             onCancel={() => setEditingItem(null)}
//             footer={null}
//             width={400} // Width of modal for small screens
//           >
//             <Form onFinish={updateItemPrice} layout="vertical">
//               <Form.Item
//                 label="New MRP"
//                 name="itemMrp"
//                 rules={[{ required: true, message: 'Please input the new MRP!' }]}
//                 initialValue={editingItem.itemMrp}
//               >
//                 <Input type="number" />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Update Price
//                 </Button>
//                 <Button style={{ marginLeft: 8 }} onClick={() => setEditingItem(null)}>
//                   Cancel
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>
//         )}
//       </div>
//     </AdminPanelLayout>
//   );
// };

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Input, Button, message, Modal, Row, Col, Spin } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';
import { useParams } from 'react-router-dom';

const accessToken = localStorage.getItem('accessToken');

const SellerItemsList = () => {
  const { sellerId } = useParams(); // Get sellerId from URL params
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm(); // Initialize the form instance

  // Fetch item details from the API
  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://meta.oxyloans.com/api/erice-service/selleritems/ItemsGetTotal?sellerId=${sellerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success('Data fetched successfully');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching item details:', error);
      message.error('Failed to fetch item details.');
    } finally {
      setLoading(false);
    }
  };

  // Update item price using the PATCH API
  const updateItemPrice = async (values) => {
    if (!editingItem) return; // Ensure editingItem is available

    try {
      await axios.patch(
        'https://meta.oxyloans.com/api/erice-service/selleritems/sellerItemPriceFix',
        {
          active: true,
          itemId: editingItem.itemId,
          itemMrp: values.itemMrp,
          sellerId: sellerId, // Use the sellerId from the URL
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      message.success('Item price updated successfully!');
      form.resetFields(); // Reset form fields
      setEditingItem(null);
      fetchItemDetails(); // Refresh item details after the update
    } catch (error) {
      console.error('Error updating item price:', error);
      message.error('Failed to update item price.');
    }
  };

  // Load items when the component mounts or sellerId changes
  useEffect(() => {
    fetchItemDetails();
  }, [sellerId]);

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'key', // Use a unique key for the row (you may need to generate this if not available)
      render: (text, record, index) => index + 1, // This will generate a serial number
    },
    
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      align: 'center',
    },
    {
      title: 'Current MRP',
      dataIndex: 'itemMrp',
      key: 'itemMrp',
      align: 'center',
    },
    {
      title: 'Item Image',
      dataIndex: 'itemImage',
      key: 'itemImage',
      align: 'center',
      render: (text) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={text}
            alt="Item"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
        </div>
      ),
    }
    ,
    {
      title: 'Actions',
      key: 'actions',
      align:'center',
      render: (text, record) => (
        <Button onClick={() => {
          setEditingItem(record);
          form.setFieldsValue({ itemMrp: record.itemMrp });
        }}>
          Edit Price
        </Button>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div style={{ padding: '20px', marginTop: '20px' }}>
        {loading ? (
          <Spin tip="Loading items..." style={{ display: 'block', margin: 'auto', marginTop: '50px' }} />
        ) : (
          <>
            <Table
              dataSource={items}
              columns={columns}
              rowKey="itemId"
              pagination={{ pageSize: 5 }} // Set pagination with a page size of 5
              scroll={{ x: 'max-content' }} // Allow horizontal scrolling
            />
            <Modal
              title="Edit Item Price"
              visible={!!editingItem}
              onCancel={() => {
                setEditingItem(null);
                form.resetFields(); // Reset the form when modal is closed
              }}
              footer={null}
            >
              <Form form={form} layout="vertical" onFinish={updateItemPrice}>
                <Form.Item
                  label="Item MRP"
                  name="itemMrp"
                  rules={[{ required: true, message: 'Please enter item MRP' }]}
                >
                  <Input />
                </Form.Item>
                <Row justify="center">
                  <Col>
                    <Button type="primary" htmlType="submit">
                      Update Price
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default SellerItemsList;
