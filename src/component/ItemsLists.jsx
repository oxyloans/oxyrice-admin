import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message,Row,Col } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';
import '../ItemList.css'; // Import custom CSS for responsive styling

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchItemsData();
  }, []);

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://meta.oxyloans.com/api/erice-service/items/getItemsData", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
   message.success('Data Fetched Successfully')
      setItems(response.data);
    } catch (error) {
      message.error("Error fetching items data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (values) => {
    if (selectedItem) {
      try {
        await axios.patch(
          "https://meta.oxyloans.com/api/erice-service/items/updateData",
          {
            itemId: selectedItem.itemId,
            itemName: values.itemName,
            itemPrice: values.itemPrice,
            itemQty: values.itemQty,
            itemUnit: values.itemUnit,
            tags: values.tags,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        message.success("Item data updated successfully");
        fetchItemsData();
        handleCancel();
      } catch (error) {
        message.error("Error updating item: " + error.message);
      }
    }
  };

  const showUpdateModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      title: 'S.NO',
      key: 'serialNo',
      render: (text, record, index) => (
        index + 1 + (currentPage - 1) * entriesPerPage
      ),
      align: 'center',
      responsive: ['md'],
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
      responsive: ['md'],
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
      responsive: ['md'],
    },
    {
      title: 'Item Logo',
      dataIndex: 'itemImage',
      key: 'itemImage',
      align: 'center',
      render: (text) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={text}
            alt="Item Logo"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
        </div>
      ),
    }
    
,    
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
        pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
        scroll={{ x: '100%' }} // Enables horizontal scroll on smaller screens
      />
      <Modal
        title="Update Item"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="responsive-modal"
      >
        {selectedItem && (
          <Form
            initialValues={{
              itemName: selectedItem.itemName,
              itemImage: selectedItem.itemImage || '',
              itemPrice: selectedItem.itemPrice || 0,
              itemQty: selectedItem.quantity || 0,
              itemUnit: selectedItem.units || '',
              tags: selectedItem.tags || '',
            }}
            onFinish={handleUpdateItem}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Name"
                  name="itemName"
                  rules={[{ required: true, message: 'Please input the item name!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Item Image URL" name="itemImage">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Price"
                  name="itemPrice"
                  rules={[{ required: true, message: 'Please input the item price!' }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Item Quantity"
                  name="itemQty"
                  rules={[{ required: true, message: 'Please input the item quantity!' }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Item Unit" name="itemUnit">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Tags" name="tags">
                  <Input placeholder="Comma-separated tags" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>Update</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AdminPanelLayout>
  );
};

export default ItemList;
