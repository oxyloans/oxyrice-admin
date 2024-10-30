import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Form, message } from 'antd';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';

const SellerItemsList = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    // Fetch initial data from API
    axios
      .get("http://182.18.139.138:8282/api/erice-service/selleritems/ItemsGetTotal", {
        headers: { accept: "*/*" }
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const columns = [
    {
      title: "S.NO",
      render: (_, __, index) => index + 1,
      key: 'serialNumber',
      align: 'center'
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => text || 'N/A',
      align: 'center'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      align: 'center'
    },
    {
      title: 'MRP',
      dataIndex: 'itemMrp',
      key: 'itemMrp',
      align: 'center'
    },
    {
      title: 'Image',
      dataIndex: 'itemImage',
      key: 'itemImage',
      align: 'center',
      render: (image) => (
        <img src={image} alt="Item" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (active ? 'Active' : 'Inactive'),
      align: 'center'
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" className="ml-2" onClick={() => handleItems(record)}>
            View
          </Button>
        </>
      ),
    },
  ];

  const openEditModal = (record) => {
    setSelectedItem(record);
    setNewPrice(record.itemMrp);
    setNewName(record.itemName);
    setIsModalVisible(true);
  };

  const handleEditSave = () => {
    if (selectedItem) {
      axios
        .patch(
          "http://182.18.139.138:8282/api/erice-service/selleritems/sellerItemPriceFix",
          {
            active: selectedItem.active,
            itemId: selectedItem.itemId,
            itemMrp: newPrice,
            itemName: newName,
            sellerId: selectedItem.sellerId
          },
          {
            headers: { accept: "*/*", "Content-Type": "application/json" }
          }
        )
        .then((response) => {
          console.log("Item updated:", response.data);
          message.success("Item updated successfully!");
          setData((prevData) =>
            prevData.map((item) =>
              item.itemId === selectedItem.itemId
                ? { ...item, itemMrp: newPrice, itemName: newName }
                : item
            )
          );
          setIsModalVisible(false);
        })
        .catch((error) => {
          console.error("Error updating item:", error);
          message.error("Failed to update item.");
        });
    }
  };

  const handleItems = (record) => {
    console.log("Show items for:", record);
  };

  return (
    <AdminPanelLayout>
      <Table columns={columns} dataSource={data} rowKey="itemId" pagination={{ pageSize: 5 }} />
      
      <Modal
        title="Edit Item"
        visible={isModalVisible}
        onOk={handleEditSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Item Name">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Form.Item>
          <Form.Item label="MRP">
            <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminPanelLayout>
  );
};

export default SellerItemsList;
