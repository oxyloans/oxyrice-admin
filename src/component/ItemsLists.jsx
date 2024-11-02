import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchItemsData();
  }, []);

  // Fetch items data from the API
  const fetchItemsData = async () => {
    try {
      const response = await axios.get("https://meta.oxyloans.com/api/erice-service/items/getItemsData");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items data:", error);
    }
  };

  // Handle updating the item data
  const handleUpdateItem = async (values) => {
    if (selectedItem) {
      try {
        await axios.patch("https://meta.oxyloans.com/api/erice-service/items/updateData", {
          itemId: selectedItem.itemId,
          itemName: values.itemName,
          itemPrice: values.itemPrice,
          itemQty: values.itemQty,
          itemUnit: values.itemUnit,
          tags: values.tags,
        });
        fetchItemsData(); // Refresh items after update
        alert.message("Updated successfully item data");
        setIsModalVisible(false); // Close the modal
      } catch (error) {
        console.error("Error updating item:", error);
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
      align:'center'
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
       align:'center'
    },
    {
      title: 'Category Name',
      dataIndex: 'categoryName',
      key: 'categoryName',
       align:'center'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
       align:'center'
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
       align:'center'
    },
    {
      title: 'Item Logo',
      dataIndex: 'itemImage',
      key: 'itemImage',
       align:'center',
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
       align:'center',
      render: (text, item) => (
        <Button onClick={() => showUpdateModal(item)}>Update</Button>
      ),
    },
  ];

  return (
    <div>
      <AdminPanelLayout>
        <Table dataSource={items} columns={columns} rowKey="itemId" />
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
                itemPrice: 0, // Default value for item price
                itemQty: selectedItem.quantity,
                itemUnit: selectedItem.units,
                tags: '', // Default value for tags
              }}
              onFinish={handleUpdateItem}
            >
              <Form.Item
                label="Item Name"
                name="itemName"
                rules={[{ required: false, message: 'Please input the item name!' }]}
              >
                <Input />
              </Form.Item>
              {/* Uncomment if you want to include item price */}
              {/* <Form.Item
                label="Item Price"
                name="itemPrice"
                rules={[{ required: false, message: 'Please input the item price!' }]}
              >
                <Input type="number" />
              </Form.Item> */}
              <Form.Item
                label="Item Quantity"
                name="itemQty"
                rules={[{ required: false, message: 'Please input the item quantity!' }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="Item Unit"
                name="itemUnit"
                rules={[{ required: false, message: 'Please input the item unit!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tags"
                name="tags"
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </AdminPanelLayout>
    </div>
  );
};

export default ItemList;
