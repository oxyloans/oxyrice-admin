import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsData();
  }, []);

  // Fetch items data from the API
  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://meta.oxyloans.com/api/erice-service/items/getItemsData");
      setItems(response.data);
    } catch (error) {
      message.error("Error fetching items data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle updating the item data
  const handleUpdateItem = async (values) => {
    if (selectedItem) {
      try {
        await axios.patch("https://meta.oxyloans.com/api/erice-service/items/updateData", {
          itemId: selectedItem.itemId,
          itemName: values.itemName,
          itemPrice: values.itemPrice, // Ensure itemPrice is included if needed
          itemQty: values.itemQty,
          itemUnit: values.itemUnit,
          tags: values.tags,
        });
        message.success("Item data updated successfully");
        fetchItemsData(); // Refresh items after update
        handleCancel(); // Close the modal
      } catch (error) {
        message.error("Error updating item: " + error.message);
      }
    }
  };

  // Show the modal for updating an item
  const showUpdateModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // Define columns for the Ant Design Table
  const columns = [
    {
      title: 'Item Id',
      dataIndex: 'itemId',
      key: 'itemId',
      align: 'center',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Category Name',
      dataIndex: 'categoryName',
      key: 'categoryName',
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
      title: 'Item Logo',
      dataIndex: 'itemImage',
      key: 'itemImage',
      align: 'center',
      render: (text) => (
        <img
          src={text}
          alt="Item Logo"
          style={{ width: 50, height: 50, objectFit: 'cover' }} // Style the image
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (text, item) => (
        <Button onClick={() => showUpdateModal(item)} type="primary">Update</Button>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="itemId"
        loading={loading}
        pagination={{ pageSize: 5 }} // Adjust pagination as necessary
      />
      <Modal
        title="Update Item"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedItem && (
       <Form
       initialValues={{
         itemName: selectedItem.itemName,
         itemImage: selectedItem.itemImage || '', // Default value for item image
         itemPrice: selectedItem.itemPrice || 0, // Default value for item price
         itemQty: selectedItem.quantity || 0, // Default value for item quantity
         itemUnit: selectedItem.units || '', // Default value for item unit
         tags: selectedItem.tags || '', // Default value for tags
       }}
       onFinish={handleUpdateItem}
     >
       <Form.Item
         label="Item Name"
         name="itemName"
         rules={[{ required: false, message: 'Please input the item name!' }]} // Changed to required
       >
         <Input />
       </Form.Item>
     
       <Form.Item
         label="Item Image URL"
         name="itemImage"
         rules={[{ required: false, message: 'Please input the item image URL!' }]} // Updated validation message
       >
         <Input />
       </Form.Item>
     
       <Form.Item
         label="Item Price"
         name="itemPrice"
         rules={[{ required: false, message: 'Please input the item price!' }]} // Changed to required
       >
         <Input type="number" />
       </Form.Item>
     
       <Form.Item
         label="Item Quantity"
         name="itemQty"
         rules={[{ required: false, message: 'Please input the item quantity!' }]} // Changed to required
       >
         <Input type="number" />
       </Form.Item>
     
       <Form.Item
         label="Item Unit"
         name="itemUnit"
         rules={[{ required: false, message: 'Please input the item unit!' }]} // Changed to required
       >
         <Input />
       </Form.Item>
     
       <Form.Item
         label="Tags"
         name="tags"
       >
         <Input placeholder="Comma-separated tags" />
       </Form.Item>
     
       <Form.Item>
         <Button type="primary" htmlType="submit">Update</Button>
       </Form.Item>
     </Form>
     
        )}
      </Modal>
    </AdminPanelLayout>
  );
};

export default ItemList;
