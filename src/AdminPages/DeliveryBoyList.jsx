import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminPanelLayout from "./AdminPanel.jsx";
import {
  Form,
  Input,
  Button,
  Table,
  Select,
  message,
  Switch,
  Upload,
  Modal,
  Row,
  Col,
} from "antd";
import { MdModeEditOutline } from "react-icons/md";

const { Option } = Select;

// **Request Body Model for Add Delivery Boy**
const createAddDeliveryBoyRequest = (formValues) => {
  return {
    deliveryBoyName: formValues.deliveryBoyName,
    deliveryBoyMobile: formValues.deliveryBoyMobile,
    deliveryBoyEmail: formValues.deliveryBoyEmail,
    deliveryBoyAltContact: formValues.deliveryBoyAltContact,
    deliveryBoyAddress: formValues.deliveryBoyAddress,
    isActive: formValues.isActive,
    deliveryBoyPhoto: formValues.deliveryBoyPhoto
      ? formValues.deliveryBoyPhoto.fileList[0]?.originFileObj
      : null,
  };
};

// **Request Body Model for Update Delivery Boy**
const createUpdateDeliveryBoyRequest = (formValues, userId) => {
  return {
    id: userId,
    deliveryBoyName: formValues.deliveryBoyName,
    deliveryBoyMobile: formValues.deliveryBoyMobile,
    deliveryBoyEmail: formValues.deliveryBoyEmail,
    deliveryBoyAltContact: formValues.deliveryBoyAltContact,
    deliveryBoyAddress: formValues.deliveryBoyAddress,
    isActive: formValues.isActive,
    deliveryBoyPhoto: formValues.deliveryBoyPhoto
      ? formValues.deliveryBoyPhoto.fileList[0]?.originFileObj
      : null,
  };
};

// API function to save a new delivery boy
const saveDeliveryBoy = async (requestBody, accessToken) => {
  try {
    await axios.post(
      "https://meta.oxyloans.com/api/erice-service/deliveryboy/save",
      requestBody,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    message.success("Delivery boy details saved successfully!");
  } catch (error) {
    throw new Error("Failed to save delivery boy details");
  }
};

// API function to update an existing delivery boy
const updateDeliveryBoy = async (requestBody, accessToken) => {
  try {
    await axios.patch(
      "https://meta.oxyglobal.tech/api/user-service/update",
      requestBody,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    message.success("Delivery boy details updated successfully!");
  } catch (error) {
    throw new Error("Failed to update delivery boy details");
  }
};

const DeliveryBoy = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();
  const accessToken = localStorage.getItem("accessToken");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDeliveryBoys, setFilteredDeliveryBoys] = useState([]);

  // API function to fetch delivery boys
  const fetchDeliveryBoys = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://meta.oxyglobal.tech/api/user-service/deliveryBoyList",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch delivery boys");
    }
  };

  // Fetch delivery boys data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchDeliveryBoys(accessToken);
        setDeliveryBoys(data);
        message.success("Data fetched successfully");
        setFilteredDeliveryBoys(data);
      } catch (error) {
        message.error("Error fetching delivery boys");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  // Show Add Modal
  const showAddModal = () => {
    form.resetFields();
    setIsAddModalOpen(true);
  };

  // Show Edit Modal with the selected record data
  const showEditModal = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  // Handle Modal Cancel (close)
  const handleCancel = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    form.resetFields();
  };
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };
  // Handle form submit for adding or updating delivery boy
  const onFinish = async (values) => {
    setLoading(true);
    try {
      let requestBody;

      if (currentRecord) {
        // Update request body with userId for updating existing delivery boy
        requestBody = createUpdateDeliveryBoyRequest(
          values,
          currentRecord.userId
        );
        await updateDeliveryBoy(requestBody, accessToken);
      } else {
        // Save new delivery boy request
        requestBody = createAddDeliveryBoyRequest(values);
        await saveDeliveryBoy(requestBody, accessToken);
      }

      handleCancel();
      // Refresh the delivery boys list after adding/updating
      const data = await fetchDeliveryBoys(accessToken);
      setDeliveryBoys(data);
    } catch (error) {
      message.error(
        error.message || "Failed to save or update delivery boy details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Table columns for displaying delivery boys
  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "deliveryBoyName",
      key: "deliveryBoyName",
      align: "center",
    },
    {
      title: "Mobile",
      dataIndex: "deliveryBoyMobile",
      key: "deliveryBoyMobile",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "deliveryBoyEmail",
      key: "deliveryBoyEmail",
      align: "center",
    },
    {
      title: "Alt Contact",
      dataIndex: "deliveryBoyAltContact",
      key: "deliveryBoyAltContact",
      align: "center",
    },
    {
      title: "Address",
      dataIndex: "deliveryBoyAddress",
      key: "deliveryBoyAddress",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <p
          type="default"
          style={{
            backgroundColor: isActive ? "#1C84C6" : "#ec4758",
            color: "white",
            marginBottom: "16px",
          }}
        >
          {isActive ? "Active" : "Inactive"}
        </p>
      ),
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          style={{
            backgroundColor: "#1AB394",
            color: "white",
            marginBottom: "16px",
          }}
          onClick={() => showEditModal(record)}
        >
          <MdModeEditOutline />
          Edit
        </Button>
      ),
      align: "center",
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input for clean matching
    setSearchTerm(value);

    if (value) {
      // Filter deliveryBoys based on the search term
      const filtered = deliveryBoys.filter(
        (deliveryBoy) =>
          deliveryBoy.deliveryBoyName?.toLowerCase().includes(value) || // Safe access with optional chaining
          deliveryBoy.deliveryBoyEmail?.toLowerCase().includes(value) ||
          deliveryBoy.deliveryBoyMobile?.toLowerCase().includes(value) ||
          deliveryBoy.deliveryBoyAddress?.toLowerCase().includes(value)
      );

      setFilteredDeliveryBoys(filtered); // Update the filtered results
    } else {
      setFilteredDeliveryBoys(deliveryBoys); // Reset to all delivery boys when search term is empty
    }
  };

  return (
    <AdminPanelLayout>
      <div className="flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">
              Delivery Boys List
            </h2>
            {/* <Button
              onClick={showAddModal}
              disabled
              style={{
                backgroundColor: '#1C84C6',
                color: 'white',
                marginBottom: '16px',
              }}
            >
              Add Delivery Boy
            </Button> */}
          </div>

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

          {/* Ant Design Table */}
          <Table
            columns={columns}
            dataSource={
              filteredDeliveryBoys

              //   .slice(
              //   (currentPage - 1) * entriesPerPage,
              //   currentPage * entriesPerPage
              // )
            }
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: entriesPerPage,
              onChange: (page) => setCurrentPage(page),
            }} // Change the page size to 5
            scroll={{ x: true }}
            bordered
          />

          {/* Add/Edit Modal */}
          <Modal
            title={currentRecord ? "Edit Delivery Boy" : "Add Delivery Boy"}
            visible={isAddModalOpen || isEditModalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ isActive: false }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Name"
                    name="deliveryBoyName"
                    rules={[{ required: true, message: "Please enter name" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mobile"
                    name="deliveryBoyMobile"
                    rules={[
                      { required: true, message: "Please enter mobile number" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="deliveryBoyEmail"
                    rules={[{ required: true, message: "Please enter email" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Alt Contact" name="deliveryBoyAltContact">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Address" name="deliveryBoyAddress">
                <Input.TextArea />
              </Form.Item>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Status"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Upload Photo" name="deliveryBoyPhoto">
                    <Upload listType="picture">
                      <Button>Click to Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  backgroundColor: "#1C84C6",
                  color: "white",
                }}
              >
                {currentRecord ? "Update" : "Add"} Delivery Boy
              </Button>
            </Form>
          </Modal>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default DeliveryBoy;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AdminPanelLayout from "./AdminPanelLayout";
// import { Form, Input, Button, Table, message, Switch, Upload, Modal, Row, Col } from 'antd';

// // API function to fetch delivery boys
// const fetchDeliveryBoys = async (accessToken) => {
//   try {
//     const response = await axios.get(
//       "https://meta.oxyloans.com/api/erice-service/deliveryboy/list",
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error("Failed to fetch delivery boys");
//   }
// };

// // **Request Body Model for Add Delivery Boy**
// const createAddDeliveryBoyRequest = (formValues) => {
//   return {
//     deliveryBoyName: formValues.deliveryBoyName,
//     deliveryBoyMobile: formValues.deliveryBoyMobile,
//     deliveryBoyEmail: formValues.deliveryBoyEmail,
//     deliveryBoyAltContact: formValues.deliveryBoyAltContact,
//     deliveryBoyAddress: formValues.deliveryBoyAddress,
//     isActive: formValues.isActive,
//     deliveryBoyPhoto: formValues.deliveryBoyPhoto ? formValues.deliveryBoyPhoto.fileList[0]?.originFileObj : null,
//   };
// };

// // **Request Body Model for Update Delivery Boy**
// const createUpdateDeliveryBoyRequest = (formValues, userId) => {
//   return {
//     id: userId,
//     deliveryBoyName: formValues.deliveryBoyName,
//     deliveryBoyMobile: formValues.deliveryBoyMobile,
//     deliveryBoyEmail: formValues.deliveryBoyEmail,
//     deliveryBoyAltContact: formValues.deliveryBoyAltContact,
//     deliveryBoyAddress: formValues.deliveryBoyAddress,
//     isActive: formValues.isActive,
//     deliveryBoyPhoto: formValues.deliveryBoyPhoto ? formValues.deliveryBoyPhoto.fileList[0]?.originFileObj : null,
//   };
// };

// // API function to save a new delivery boy
// const saveDeliveryBoy = async (requestBody, accessToken) => {
//   try {
//     await axios.post(
//       'https://meta.oxyloans.com/api/erice-service/deliveryboy/save',
//       requestBody,
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );
//     message.success('Delivery boy details saved successfully!');
//   } catch (error) {
//     throw new Error('Failed to save delivery boy details');
//   }
// };

// // API function to update an existing delivery boy
// const updateDeliveryBoy = async (requestBody, accessToken) => {
//   try {
//     await axios.patch(
//       'https://meta.oxyloans.com/api/erice-service/deliveryboy/update',
//       requestBody,
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );
//     message.success('Delivery boy details updated successfully!');
//   } catch (error) {
//     throw new Error('Failed to update delivery boy details');
//   }
// };

// const DeliveryBoyList = () => {
//   const [deliveryBoys, setDeliveryBoys] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [currentRecord, setCurrentRecord] = useState(null);
//   const [form] = Form.useForm();
//   const accessToken = localStorage.getItem("accessToken");
//   const [currentPage, setCurrentPage] = useState(1);
//   const entriesPerPage = 5;

//   // Fetch delivery boys data on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const data = await fetchDeliveryBoys(accessToken);
//         setDeliveryBoys(data);
//         message.success('Data fetched successfully');
//       } catch (error) {
//         message.error('Error fetching delivery boys');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [accessToken]);

//   // Show Add Modal
//   const showAddModal = () => {
//     form.resetFields();
//     setIsAddModalOpen(true);
//   };

//   // Show Edit Modal with the selected record data
//   const showEditModal = (record) => {
//     setCurrentRecord(record);
//     form.setFieldsValue(record);
//     setIsEditModalOpen(true);
//   };
//     // Sort data by deliveryBoyName or another key to maintain a consistent order
//     const sortedDeliveryBoys = [...deliveryBoys].sort((a, b) => {
//       return a.deliveryBoyName.localeCompare(b.deliveryBoyName);
//     });

//   // Handle Modal Cancel (close)
//   const handleCancel = () => {
//     setIsAddModalOpen(false);
//     setIsEditModalOpen(false);
//     form.resetFields();
//   };
//  // Handle pagination change
//  const handlePaginationChange = (page) => {
//   setCurrentPage(page);
// };

//   // Handle form submit for adding or updating delivery boy
//   const onFinish = async (values) => {
//     setLoading(true);
//     try {
//       let requestBody;

//       if (currentRecord) {
//         // Update request body with userId for updating existing delivery boy
//         requestBody = createUpdateDeliveryBoyRequest(values, currentRecord.userId);
//         await updateDeliveryBoy(requestBody, accessToken);
//       } else {
//         // Save new delivery boy request
//         requestBody = createAddDeliveryBoyRequest(values);
//         await saveDeliveryBoy(requestBody, accessToken);
//       }

//       handleCancel();
//       // Refresh the delivery boys list after adding/updating
//       const data = await fetchDeliveryBoys(accessToken);
//       setDeliveryBoys(data);
//     } catch (error) {
//       message.error(error.message || 'Failed to save or update delivery boy details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Table columns for displaying delivery boys
//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "deliveryBoyName",
//       key: "deliveryBoyName",
//       align: "center",
//     },
//     {
//       title: "Mobile",
//       dataIndex: "deliveryBoyMobile",
//       key: "deliveryBoyMobile",
//       align: "center",
//     },
//     {
//       title: "Email",
//       dataIndex: "deliveryBoyEmail",
//       key: "deliveryBoyEmail",
//       align: "center",
//     },
//     {
//       title: "Alt Contact",
//       dataIndex: "deliveryBoyAltContact",
//       key: "deliveryBoyAltContact",
//       align: "center",
//     },
//     {
//       title: "Address",
//       dataIndex: "deliveryBoyAddress",
//       key: "deliveryBoyAddress",
//       align: "center",
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (isActive) => (
//         <Button
//           type="default"
//           style={{
//             backgroundColor: isActive ? '#1C84C6' : '#ec4758',
//             color: 'white',
//             marginBottom: '16px',
//           }}
//         >
//           {isActive ? 'Active' : 'Inactive'}
//         </Button>
//       ),
//       align: "center",
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Button
//           style={{
//             backgroundColor: "#1AB394",
//             color: "white",
//             marginBottom: "16px",
//           }}
//           onClick={() => showEditModal(record)}
//         >
//           Edit
//         </Button>
//       ),
//       align: "center",
//     },
//   ];

//   return (
//     <AdminPanelLayout>
//       <div className="flex flex-col h-screen">
//         <div className="flex-1 p-6 bg-gray-100">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-1xl">Delivery Boys List</h2>
//             <Button
//               onClick={showAddModal}
//               style={{
//                 backgroundColor: '#1C84C6',
//                 color: 'white',
//                 marginBottom: '16px',
//               }}
//             >
//               Add Delivery Boy
//             </Button>
//           </div>

//           {/* Ant Design Table */}
//           <Table
//             columns={columns}
//             dataSource={sortedDeliveryBoys.slice(
//               (currentPage - 1) * entriesPerPage,
//               currentPage * entriesPerPage
//             )}
//             rowKey="id"
//             loading={loading}
//             pagination={{
//               pageSize: entriesPerPage,
//               current: currentPage,
//               total: sortedDeliveryBoys.length,
//               onChange: handlePaginationChange,
//             }}
//             scroll={{ x: true }}
//           />

//           {/* Add/Edit Modal */}
//           <Modal
//             title={currentRecord ? "Edit Delivery Boy" : "Add Delivery Boy"}
//             visible={isAddModalOpen || isEditModalOpen}
//             onCancel={handleCancel}
//             footer={null}
//           >
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinish}
//               initialValues={{ isActive: false }}
//             >
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Name"
//                     name="deliveryBoyName"
//                     rules={[{ required: true, message: "Please enter name" }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Mobile"
//                     name="deliveryBoyMobile"
//                     rules={[{ required: true, message: "Please enter mobile number" }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Email"
//                     name="deliveryBoyEmail"
//                     rules={[{ required: true, message: "Please enter email" }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     label="Alt Contact"
//                     name="deliveryBoyAltContact"
//                     rules={[{ required: true, message: "Please enter alternate contact" }]}
//                   >
//                     <Input />
//                   </Form.Item>
//                 </Col>
//               </Row>
//               <Form.Item
//                 label="Address"
//                 name="deliveryBoyAddress"
//                 rules={[{ required: true, message: "Please enter address" }]}
//               >
//                 <Input.TextArea rows={4} />
//               </Form.Item>
//               <Form.Item label="Status" name="isActive" valuePropName="checked">
//                 <Switch />
//               </Form.Item>
//               <Form.Item
//                 label="Photo"
//                 name="deliveryBoyPhoto"
//                 valuePropName="fileList"
//               >
//                 <Upload beforeUpload={() => false}>
//                   <Button>Select File</Button>
//                 </Upload>
//               </Form.Item>
//               <Form.Item>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   style={{
//                     backgroundColor: "#1C84C6",
//                     color: "white",
//                   }}
//                 >
//                   Submit
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>
//         </div>
//       </div>
//     </AdminPanelLayout>
//   );
// };

// export default DeliveryBoyList;
