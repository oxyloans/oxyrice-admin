import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Input, Button, message, Modal, Row, Col } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const SellerItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [sellerId, setSellerId] = useState(7); // Updated to initialize as null

  // Fetch seller details (including sellerId) from an API
  const fetchSellerDetails = async () => {
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/seller/sellerDetails');
      setSellerId(response.data.sellerId);
    } catch (error) {
      console.error('Error fetching seller details:', error);
      message.error('Failed to fetch seller details.');
    }
  };

  // Fetch item details from the API
  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/selleritems/ItemsGetTotal');
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
    if (!editingItem || sellerId === null) return;

    try {
      await axios.patch('https://meta.oxyloans.com/api/erice-service/selleritems/sellerItemPriceFix', {
        active: true,
        itemId: editingItem.itemId,
        itemMrp: values.itemMrp,
        sellerId: sellerId,
      });
      message.success('Item price updated successfully!');
      setEditingItem(null);
      fetchItemDetails();
    } catch (error) {
      console.error('Error updating item price:', error);
      message.error('Failed to update item price.');
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (item) => {
    setEditingItem(item);
  };

  useEffect(() => {
    fetchSellerDetails();
    fetchItemDetails();
  }, []);

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
    },
    {
      title: 'Current MRP',
      dataIndex: 'itemMrp',
      key: 'itemMrp',
    },
    {
      title: 'Item Image',
      dataIndex: 'itemImage',
      key: 'itemImage',
      render: (text) => <img src={text} alt="Item" style={{ width: 50, height: 50 }} />, // Displaying image
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleEditClick(record)}>
          Edit Price
        </Button>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div style={{ padding: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Table 
              dataSource={items} 
              columns={columns} 
              rowKey="itemId" 
              loading={loading} 
              pagination={{ pageSize: 10 }} // Adjust pagination for mobile
              bordered 
            />
          </Col>
        </Row>
        
        {editingItem && (
          <Modal
            title={`Update Price for ${editingItem.itemName}`}
            visible={true}
            onCancel={() => setEditingItem(null)}
            footer={null}
            width={400} // Width of modal for small screens
          >
            <Form onFinish={updateItemPrice} layout="vertical">
              <Form.Item
                label="New MRP"
                name="itemMrp"
                rules={[{ required: true, message: 'Please input the new MRP!' }]}
                initialValue={editingItem.itemMrp}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Price
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default SellerItemsList;
