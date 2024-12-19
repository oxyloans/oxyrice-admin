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

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Form,
  Input,
  Button,
  message,
  Select,
  Pagination,
  Modal,
  Row,
  Col,
  Spin,
} from "antd";
import AdminPanelLayout from "./AdminPanelLayout";
import { useParams } from "react-router-dom";
const { Option } = Select;

const accessToken = localStorage.getItem("accessToken");

const SellerItemsList = () => {
  const { sellerId } = useParams(); // Get sellerId from URL params
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm(); // Initialize the form instance
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellerItems, setFilteredSellerItems] = useState([]);

  // Pagination logic
  const paginatedCustomers = items.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
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
      message.success("Data fetched successfully");
      setItems(response.data);
      setFilteredSellerItems(response.data);
    } catch (error) {
      console.error("Error fetching item details:", error);
      message.error("Failed to fetch item details.");
    } finally {
      setLoading(false);
    }
  };

  // Update item price using the PATCH API
  const updateItemPrice = async (values) => {
    if (!editingItem) return; // Ensure editingItem is available

    try {
      await axios.patch(
        "https://meta.oxyloans.com/api/erice-service/selleritems/sellerItemPriceFix",
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

      message.success("Item price updated successfully!");
      form.resetFields(); // Reset form fields
      setEditingItem(null);
      fetchItemDetails(); // Refresh item details after the update
    } catch (error) {
      console.error("Error updating item price:", error);
      message.error("Failed to update item price.");
    }
  };

  // Load items when the component mounts or sellerId changes
  useEffect(() => {
    fetchItemDetails();
  }, [sellerId]);

  const columns = [
    {
      title: "S.No",
      dataIndex: "key",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      align: "center",
    },
    {
      title: "Current MRP",
      dataIndex: "itemMrp",
      key: "itemMrp",
      align: "center",
    },
    {
      title: "Item Image",
      dataIndex: "itemImage",
      key: "itemImage",
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={text}
            alt="Item"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <Button
          onClick={() => {
            setEditingItem(record);
            form.setFieldsValue({ itemMrp: record.itemMrp });
          }}
          style={{
            backgroundColor: "#1AB394",
            color: "white",
            marginBottom: "16px",
          }}
        >
          Edit Price
        </Button>
      ),
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
    setSearchTerm(value);

    if (value) {
      // Filter items based on the search term
      const filtered = items.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(value) || // Safe access with optional chaining
          item.categoryName?.toLowerCase().includes(value) ||
          item.quantity?.toString().toLowerCase().includes(value) ||
          item.units?.toLowerCase().includes(value) ||
          item.itemMrp?.toString().toLowerCase().includes(value)
      );

      setFilteredSellerItems(filtered); // Update the filtered items
    } else {
      setFilteredSellerItems(items); // Reset to all items when the search term is empty
    }
  };

  return (
    <AdminPanelLayout>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="text-xl font-bold mb-2 sm:mb-0">SellerItems List</h2>
        </Col>
      </Row>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          Show{" "}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 70 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>{" "}
          entries
        </Col>

        <Col>
          Search:{" "}
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
          />
        </Col>
      </Row>

      <div style={{ padding: "20px", marginTop: "20px" }}>
        {loading ? (
          <Spin
            tip="Loading items..."
            style={{ display: "block", margin: "auto", marginTop: "50px" }}
          />
        ) : (
          <>
            <Table
              dataSource={
                filteredSellerItems
                //   .slice(
                //   (currentPage - 1) * entriesPerPage,
                //   currentPage * entriesPerPage
                // )
              }
              columns={columns}
              rowKey="itemId"
              bordered
              pagination={{
                pageSize: entriesPerPage,
                onChange: (page) => setCurrentPage(page),
              }}
              scroll={{ x: "100%" }} // Enables horizontal scroll on smaller screens
              // Allow horizontal scrolling
            />
            {/* <Row justify="end" className="mt-4">
              <Pagination
                current={currentPage}
                total={items.length}
                pageSize={entriesPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </Row> */}
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
                  rules={[{ required: true, message: "Please enter item MRP" }]}
                >
                  <Input />
                </Form.Item>
                <Row justify="center">
                  <Col>
                    <Button
                      style={{
                        backgroundColor: "#1c84c6",
                        color: "white",
                        marginBottom: "16px",
                      }}
                      htmlType="submit"
                    >
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
