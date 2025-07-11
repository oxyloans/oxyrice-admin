// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Table,
//   Button,
//   Modal,
//   Select,
//   Form,
//   Input,
//   InputNumber,
//   message,
//   Row,
//   Col,
//   Popconfirm,
//   Tag,
// } from "antd";
// import { Link } from "react-router-dom";
// import BASE_URL from "./Config";
// import AdminPanelLayoutTest from "./AdminPanel";

// import "../ItemList.css"; // Import custom CSS for responsive styling

// const { Option } = Select;

// const ItemList = () => {
//   const [items, setItems] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
//   const [isImageViewModalVisible, setIsImageViewModalVisible] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [entriesPerPage, setEntriesPerPage] = useState(50);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [form] = Form.useForm(); // Create a form instance
//   const accessToken = localStorage.getItem("accessToken");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [offerLoading, setOfferLoading] = useState(false);
//   const [imageViewLoading, setImageViewLoading] = useState(false);
//   const [offerForm] = Form.useForm(); // Create a form instance for offers
//   const [imageViewForm] = Form.useForm();
//   useEffect(() => {
//     fetchItemsData();
//   }, []);

//   const fetchItemsData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/product-service/getItemsDataForAskOxy`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       message.success("Data Fetched Successfully");

//       // Filter data where quantity is 1 or 26 and isActive is "true"
//       // const filteredData = response.data.filter(
//       //   (item) =>
//       //     item.isActive === "true" && (item.weight === 1 || item.weight === 26)
//       // );
//       //  const filteredData = response.data.filter(
//       //    (item) =>
//       //      item.isActive === "true" &&
//       //      (item.weight === 1 ||
//       //        item.weight === 26 ||
//       //        item.weight === 5 ||
//       //        item.weight === 10)
//       //  );

//       // Sort to display items with quantity 26 first
//       // const sortedData = filteredData.sort((a, b) => b.weight - a.weight);
//       setItems(response.data);
//       console.log(response);
//       setFilteredItems(response.data); // Ensure only filtered data is stored
//     } catch (error) {
//       message.error("Error fetching items data: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files.length > 0) {
//       setSelectedFile(e.target.files[0]);
//     }
//   };

//   const handleUpdateItem = async (values) => {
//     setLoading(true);
//     if (selectedItem) {
//       try {
//         const formData = new FormData();

//         // Append file if selected
//         if (selectedFile) {
//           formData.append("multiPart", selectedFile);
//         }
//         formData.append("fileType", "document");
//         formData.append("itemName", values.itemName);
//         formData.append("quantity", values.quantity || 0);
//         formData.append("weight", values.weight || 0);
//         formData.append("itemUnit", values.itemUnit);
//         formData.append("itemDescription", values.itemDescription);
//         formData.append("tag", values.tag);

//         await axios.patch(
//           `${BASE_URL}/product-service/UpdateItems?itemId=${selectedItem.itemId}`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         message.success("Item updated successfully");
//         fetchItemsData();
//         handleCancel();
//       } catch (error) {
//         message.error(
//           "Error updating item: " +
//             (error.response?.data?.message || error.message)
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//   }; // New function to handle creating an offer
//   const handleCreateOffer = async (values) => {
//     setOfferLoading(true);
//     try {
//       if (!values.minQty || values.minQty < 1) {
//         message.error("Minimum quantity must be at least 1");
//         setOfferLoading(false);
//         return;
//       }

//       // Validate that freeQty is at least 1
//       if (!values.freeQty || values.freeQty < 1) {
//         message.error("Free quantity must be at least 1");
//         setOfferLoading(false);
//         return;
//       }
//       const requestBody = {
//         freeItemId: selectedItem.itemId,
//         freeItemName: selectedItem.itemName,
//         freeQty: values.freeQty,
//         minQty: values.minQty,
//         minQtyKg: values.minQtyKg,
//         offerName: values.offerName,
//       };

//       await axios.post(
//         `${BASE_URL}/cart-service/cart/createOffer`,
//         requestBody,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       message.success("Offer created successfully");
//       handleOfferModalCancel();
//     } catch (error) {
//       message.error(
//         "Error creating offer: " +
//           (error.response?.data?.message || error.message)
//       );
//     } finally {
//       setOfferLoading(false);
//     }
//   };

//   const handleImageViewUpload = async (values) => {
//     setImageViewLoading(true);
//     try {
//       if (!selectedFile) {
//         message.error("Please select a file to upload");
//         setImageViewLoading(false);
//         return;
//       }

//       const formData = new FormData();
//       formData.append("multiPart", selectedFile);

//       const response = await axios.post(
//         `${BASE_URL}/product-service/imageViews`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//           params: {
//             fileType: "kyc", // Fixed as kyc
//             itemId: selectedItem.itemId,
//             itemView: values.itemView, // BACK, LEFT, or RIGHT
//           },
//         }
//       );

//       message.success(
//         `image uploaded successfully for ${values.itemView} view`
//       );
//       handleImageViewModalCancel();
//       fetchItemsData(); // Refresh data if needed
//     } catch (error) {
//       message.error(
//         "Error uploading KYC image: " +
//           (error.response?.data?.message || error.message)
//       );
//     } finally {
//       setImageViewLoading(false);
//     }
//   };
//   useEffect(() => {
//     if (selectedItem) {
//       form.setFieldsValue({
//         itemName: selectedItem.itemName,
//         quantity: selectedItem.quantity || "",
//         weight: selectedItem.weight || "",
//         itemUnit: selectedItem.units,
//         tag: selectedItem.tag || "",
//         itemDescription: selectedItem.itemDescription || "",
//       });
//     }
//   }, [selectedItem]);

//   const handleViewGeneratedBarCodes = async (item) => {
//     setLoading(true);
//     try {
//       const url = `${BASE_URL}/product-service/viewGeneratedBarCodes`;

//       const response = await axios.post(
//         url,
//         {
//           catId: item.categoryId,
//           itemId: item.itemId,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200 && response.data) {
//         const downloadUrl = response.data; // The URL returned by the API

//         // Create a link and trigger the download
//         const a = document.createElement("a");
//         a.href = downloadUrl;
//         a.download = `${item.itemName}.pdf`; // Set filename
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);

//         message.success("Barcode file downloaded successfully!");
//       } else {
//         message.error("Failed to retrieve barcode download URL.");
//       }
//     } catch (error) {
//       console.error("Error fetching barcodes:", error);
//       message.error("Failed to retrieve barcodes.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToGenerateBarCodes = async (item) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${BASE_URL}/product-service/generateBarCodes`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "*/*",
//           },
//           body: JSON.stringify({
//             catId: item.categoryId,
//             itemId: item.itemId,
//           }),
//         }
//       );
//       if (response.status === 500) {
//         alert("All barcodes have already been generated up to 40");
//         return;
//       }

//       if (!response.ok) {
//         throw new Error("Failed to fetch the file");
//       }

//       const blob = await response.blob(); // Convert response to a blob
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${item.itemName}.pdf`; // Set the filename
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url); // Clean up URL object
//     } catch (error) {
//       console.error("Error downloading the file:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showUpdateModal = (item) => {
//     setSelectedItem(item);
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setSelectedItem(null);
//     setSelectedFile(null);
//   };

//   // New function to show offer creation modal
//   const showOfferModal = (item) => {
//     setSelectedItem(item);
//     setIsOfferModalVisible(true);
//   };
//   // New function to show image view modal
//   const showImageViewModal = (item) => {
//     setSelectedItem(item);
//     setIsImageViewModalVisible(true);
//   };

//   // New function to handle offer modal cancel
//   const handleOfferModalCancel = () => {
//     setIsOfferModalVisible(false);
//     offerForm.resetFields();
//   };

//   // New function to handle image view modal cancel
//   const handleImageViewModalCancel = () => {
//     setIsImageViewModalVisible(false);
//     imageViewForm.resetFields();
//     setSelectedFile(null);
//   };

//   // Pagination logic
//   const paginatedCustomers = items.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   // Handle change in the number of entries per page
//   const handleEntriesPerPageChange = (value) => {
//     setEntriesPerPage(value);
//     setCurrentPage(1);
//   };
//   const UpdateItemStatus = async (itemId, isActive) => {
//     setLoading(true);
//     try {
//       const url = `${BASE_URL}/product-service/itemActiveAndInActive`;
//       await axios.patch(
//         url,
//         {
//           itemId: itemId, // Dynamic itemId
//           status: !isActive, // Toggle status correctly
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       message.success("Item status updated successfully.");
//       fetchItemsData(); // Refresh the items list
//     } catch (error) {
//       console.error("Error updating item status:", error);
//       message.error("Failed to update item status.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     {
//       title: "S.NO",
//       key: "serialNo",
//       render: (text, record, index) =>
//         index + 1 + (currentPage - 1) * entriesPerPage,
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "Item Name",
//       dataIndex: "itemName",
//       key: "itemName",
//       align: "center",
//     },
//     {
//       title: "Category Name",
//       dataIndex: "categoryName",
//       key: "categoryName",
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "Quantity",
//       dataIndex: "quantity",
//       key: "quantity",
//       align: "center",
//     },
//     {
//       title: "Weight",
//       dataIndex: "weight",
//       key: "weight",
//       align: "center",
//     },
//     {
//       title: "Units",
//       dataIndex: "units",
//       key: "units",
//       align: "center",
//       responsive: ["md"],
//     },
//     {
//       title: "Item Logo",
//       dataIndex: "itemImage",
//       key: "itemImage",
//       align: "center",
//       render: (text) => (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <img
//             src={text}
//             alt="Item Logo"
//             style={{
//               width: 50,
//               height: 50,
//               objectFit: "cover",
//               borderRadius: 5,
//             }}
//           />
//         </div>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       align: "center",
//       render: (isActive, record) => {
//         const status = isActive === true || isActive === "true";

//         return (
//           <Popconfirm
//             title={`Are you sure you want to mark this item as ${status ? "Inactive" : "Active"}?`}
//             onConfirm={() => UpdateItemStatus(record.itemId, status)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <Button
//               style={{
//                 backgroundColor: status ? "#f44336" : "#008CBA",
//                 color: "white",
//                 border: "none",

//                 textAlign: "center",
//               }}
//             >
//               {status ? "Inactive" : "Active"}
//             </Button>
//           </Popconfirm>
//         );
//       },
//     },
//     {
//       title: "Action",
//       key: "action",
//       align: "center",
//       render: (text, item) => (
//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "10px",
//             justifyContent: "center",
//           }}
//         >
//           {/* Edit Button */}
//           <Button
//             onClick={() => showUpdateModal(item)}
//             style={{
//               minWidth: "120px",
//               padding: "8px 12px",
//               backgroundColor: "#3498db", // Blue
//               color: "#fff",
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             Edit
//           </Button>

//           {/* Create Offer Button */}
//           <Button
//             onClick={() => showOfferModal(item)}
//             style={{
//               minWidth: "120px",
//               padding: "8px 12px",
//               backgroundColor: "#f39c45", // Orange
//               color: "#fff",
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             Create Offer
//           </Button>
//           <Button
//             onClick={() => showImageViewModal(item)}
//             style={{
//               minWidth: "120px",
//               padding: "8px 12px",
//               backgroundColor: "#9b59b6", // Purple
//               color: "#fff",
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             Add Images
//           </Button>

//           {/* Barcode Info Button */}
//           <Button
//             style={{
//               minWidth: "120px",
//               padding: "8px 12px",
//               backgroundColor: "#1AB394", // Green
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             <Link
//               to={`/admin/allinformationofbarcode/${item.itemId}`}
//               style={{
//                 color: "white",
//                 textDecoration: "none",
//                 width: "100%",
//                 textAlign: "center",
//               }}
//             >
//               Barcode Info
//             </Link>
//           </Button>

//           {/* View Bar Codes Button */}
//           <Button
//             onClick={() => handleViewGeneratedBarCodes(item)}
//             style={{
//               minWidth: "140px",
//               padding: "8px 12px",
//               backgroundColor: "#2980b9", // Darker blue
//               color: "#fff",
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             View Bar Codes
//           </Button>

//           {/* Generate Bar Codes Button */}
//           <Button
//             onClick={() => handleToGenerateBarCodes(item)}
//             style={{
//               minWidth: "160px",
//               padding: "8px 12px",
//               backgroundColor: "#04AA6D", // Darker green
//               color: "#fff",
//               border: "none",
//               fontSize: "14px",
//               fontWeight: 500,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             disabled={loading}
//           >
//             Generate Bar Codes
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   const handleSearchChange = (e) => {
//     const value = e.target.value.toLowerCase(); // Normalize and trim input
//     setSearchTerm(value);

//     if (value) {
//       // Filter items based on the search term
//       const filtered = items.filter(
//         (item) =>
//           item.itemName?.toLowerCase().includes(value) || // Safe access with optional chaining
//           item.categoryName?.toLowerCase().includes(value) ||
//           item.weight?.toString().toLowerCase().includes(value) ||
//           item.quantity?.toString().toLowerCase().includes(value) ||
//           item.Units?.toLowerCase().includes(value)
//       );

//       setFilteredItems(filtered); // Update the filtered items
//     } else {
//       setFilteredItems(items); // Reset to all items when search term is empty
//     }
//   };

//   return (
//     <AdminPanelLayoutTest>
//       <Row
//         justify="space-between"
//         align="middle"
//         className="mb-4 flex flex-col sm:flex-row items-start sm:items-center"
//       >
//         <Col>
//           <h2 className="text-xl font-bold mb-2 sm:mb-0">Items List</h2>
//         </Col>
//       </Row>

//       <Row
//         justify="space-between"
//         align="middle"
//         className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0 w-full"
//       >
//         {/* Entries Per Page Dropdown */}
//         <Col className="w-full sm:w-auto">
//           Show{" "}
//           <Select
//             value={entriesPerPage}
//             onChange={handleEntriesPerPageChange}
//             style={{ width: 80 }}
//             className="w-full sm:w-[80px]"
//           >
//             <Option value={5}>5</Option>
//             <Option value={10}>10</Option>
//             <Option value={20}>20</Option>
//           </Select>{" "}
//           entries
//         </Col>

//         {/* Search Input */}
//         <Col className="w-full sm:w-auto flex items-center gap-2">
//           <span>Search:</span>
//           <Input
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="w-full sm:w-[150px]"
//             // placeholder="name, category"
//           />
//         </Col>
//       </Row>

//       <Table
//         dataSource={filteredItems}
//         columns={columns}
//         rowKey="itemId"
//         loading={loading}
//         pagination={{
//           pageSize: entriesPerPage,
//           onChange: (page) => setCurrentPage(page),
//         }}
//         scroll={{ x: "100%" }} // Enables horizontal scroll on smaller screens
//         bordered
//       />
//       {/* Update Modal */}
//       <Modal
//         title="Update Item"
//         open={isModalVisible}
//         onCancel={handleCancel}
//         footer={null}
//       >
//         {selectedItem && (
//           <Form form={form} onFinish={handleUpdateItem} layout="vertical">
//             <Row gutter={16}>
//               <Col xs={24} sm={12}>
//                 <Form.Item label="Item Name" name="itemName">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item label="Item Quantity" name="quantity">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item label="Item Weight" name="weight">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item label="Item Unit" name="itemUnit">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item label="Item Description" name="itemDescription">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item label="Tags" name="tag">
//                   <Input />
//                 </Form.Item>
//               </Col>

//               {/* File Upload */}
//               <Col xs={24} sm={12}>
//                 <Form.Item label="Upload File" name="multiPart">
//                   <Input type="file" onChange={handleFileChange} />
//                 </Form.Item>
//               </Col>
//             </Row>

//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 block
//                 loading={loading}
//                 style={{ backgroundColor: "#1C84C6", color: "white" }}
//               >
//                 Update
//               </Button>
//             </Form.Item>
//           </Form>
//         )}
//       </Modal>
//       {/* Create Offer Modal */}
//       <Modal
//         title={`Create Offer for ${selectedItem?.itemName || ""}`}
//         open={isOfferModalVisible}
//         onCancel={handleOfferModalCancel}
//         footer={null}
//       >
//         {selectedItem && (
//           <Form form={offerForm} onFinish={handleCreateOffer} layout="vertical">
//             <Row gutter={16}>
//               <Col xs={24}>
//                 <Form.Item
//                   label="Offer Name"
//                   name="offerName"
//                   rules={[
//                     { required: true, message: "Please enter an offer name" },
//                   ]}
//                 >
//                   <Input placeholder="E.g., Buy X Get Y Free" />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   label="Free Quantity"
//                   name="freeQty"
//                   rules={[
//                     { required: true, message: "Please enter free quantity" },
//                     {
//                       type: "number",
//                       min: 1,
//                       message: "Free quantity must be at least 1",
//                     },
//                   ]}
//                 >
//                   <InputNumber
//                     min={1}
//                     style={{ width: "100%" }}
//                     placeholder="Number of free items"
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   label="Minimum Quantity Required"
//                   name="minQty"
//                   rules={[
//                     {
//                       required: true,
//                       message: "Please enter minimum quantity",
//                     },
//                     {
//                       type: "number",
//                       min: 1,
//                       message: "Minimum quantity must be at least 1",
//                     },
//                   ]}
//                 >
//                   <InputNumber
//                     min={1}
//                     style={{ width: "100%" }}
//                     placeholder="Minimum quantity to qualify"
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24}>
//                 <Form.Item
//                   label="Minimum Weight Required (KG)"
//                   name="minQtyKg"
//                   rules={[
//                     { required: true, message: "Please select minimum weight" },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Select minimum weight"
//                     style={{ width: "100%" }}
//                   >
//                     <Option value={1}>1 KG</Option>
//                     <Option value={5}>5 KG</Option>
//                     <Option value={10}>10 KG</Option>
//                     <Option value={26}>26 KG</Option>
//                   </Select>
//                 </Form.Item>
//               </Col>

//               <Col xs={24}>
//                 <div className="bg-gray-100 p-4 rounded mb-4">
//                   <p className="font-bold">Selected Item Information:</p>
//                   <p>Item ID: {selectedItem.itemId}</p>
//                   <p>Item Name: {selectedItem.itemName}</p>
//                   <p>
//                     Current Weight: {selectedItem.weight || 0}{" "}
//                     {selectedItem.units}
//                   </p>
//                 </div>
//               </Col>
//             </Row>

//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 block
//                 loading={offerLoading}
//                 style={{ backgroundColor: "#f39c12", color: "white" }}
//               >
//                 Create Offer
//               </Button>
//             </Form.Item>
//           </Form>
//         )}
//       </Modal>

//       {/* Images View Modal - NEW */}
//       <Modal
//         title={
//           <span className="text-xl font-semibold">
//             Upload Images for{" "}
//             <span className="text-black">
//               {selectedItem?.itemName || "Item"}
//             </span>
//           </span>
//         }
//         open={isImageViewModalVisible}
//         onCancel={handleImageViewModalCancel}
//         footer={null}
//         width={600}
//         className="rounded-md"
//       >
//         {selectedItem && (
//           <Form
//             form={imageViewForm}
//             onFinish={handleImageViewUpload}
//             layout="vertical"
//             initialValues={{ fileType: "kyc" }}
//           >
//             <Row gutter={16}>
//               <Col xs={24}>
//                 <Form.Item
//                   label={<span className="font-medium">Item View Type</span>}
//                   name="itemView"
//                   rules={[
//                     { required: true, message: "Please select item view type" },
//                   ]}
//                 >
//                   <Select
//                     placeholder="Choose view type (e.g., BACK, LEFT)"
//                     size="large"
//                   >
//                     <Option value="BACK">Back View</Option>
//                     <Option value="LEFT">Left View</Option>
//                     <Option value="RIGHT">Right View</Option>
//                   </Select>
//                 </Form.Item>
//               </Col>

//               <Col xs={24}>
//                 <Form.Item
//                   label={<span className="font-medium">Upload File</span>}
//                   name="multiPart"
//                   rules={[{ required: true, message: "Please upload a file" }]}
//                 >
//                   <Input
//                     type="file"
//                     onChange={handleFileChange}
//                     accept="image/*,video/*,.pdf,.doc,.docx"
//                     size="large"
//                   />
//                 </Form.Item>

//                 {selectedFile && (
//                   <div className="mt-2 px-4 py-2 border border-green-200 rounded bg-green-50">
//                     <p className="text-green-700 text-sm font-medium">
//                       Selected: {selectedFile.name}
//                     </p>
//                     <p className="text-green-600 text-xs">
//                       Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                     </p>
//                   </div>
//                 )}
//               </Col>
//             </Row>

//             <Form.Item className="mt-4">
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 block
//                 loading={imageViewLoading}
//                 style={{
//                   backgroundColor: "#9b59b6",
//                   color: "#fff",
//                   fontWeight: "600",
//                   height: "40px",
//                 }}
//               >
//                 Upload Image
//               </Button>
//             </Form.Item>
//           </Form>
//         )}
//       </Modal>
//     </AdminPanelLayoutTest>
//   );
// };

// export default ItemList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Select,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Popconfirm,
  Upload,
  Tabs,
  Progress,
} from "antd";
import { Link } from "react-router-dom";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

import {
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "../ItemList.css"; // Import custom CSS for responsive styling

const { Option } = Select;
const { TabPane } = Tabs;

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [isImageViewModalVisible, setIsImageViewModalVisible] = useState(false);
  const [isComboModalVisible, setIsComboModalVisible] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comboLoading, setComboLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // New state for active tab
  const [form] = Form.useForm(); // Create a form instance
  const [comboForm] = Form.useForm();
  const accessToken = localStorage.getItem("accessToken");
  const [selectedFile, setSelectedFile] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [imageViewLoading, setImageViewLoading] = useState(false);
  const [offerForm] = Form.useForm(); // Create a form instance for offers
  const [imageViewForm] = Form.useForm();
  const [selectedComboItem, setSelectedComboItem] = useState(null);
  const [selectedIndividualItems, setSelectedIndividualItems] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); //
  useEffect(() => {
    fetchItemsData();
  }, []);

  // Apply filters whenever items, searchTerm, or activeTab changes
  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, activeTab]);

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getItemsData`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Data Fetched Successfully");

      setItems(response.data);
      console.log(response);
    } catch (error) {
      message.error("Error fetching items data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const fileType = "image"; // Fixed fileType

  const handleUpload = async (formIndex) => {
    if (fileList.length === 0) {
      message.warning("Please choose a file.");
      return;
    }

    const formData = new FormData();
    formData.append("multiPart", fileList[0]);

    try {
      setUploading(true);
      setUploadProgress(0); // Reset progress

      const response = await axios.post(
        `${BASE_URL}/product-service/uploadComboImages?fileType=${fileType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // Assuming the API returns the image URL in response.data.imageUrl
      const imageUrl =
        response.data;

      // Update the imageUrl field in the specific Form.List item
      comboForm.setFields([
        {
          name: ["items", formIndex, "imageUrl"],
          value: imageUrl,
        },
      ]);

      message.success(
        <>
          File uploaded successfully!{" "}
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        </>
      );
      setFileList([]); // Clear fileList after successful upload
    } catch (error) {
      console.error("Upload failed:", error);
      message.error(
        <>
          Upload failed.{" "}
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
        </>
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // New function to apply filters based on tab and search
  const applyFilters = () => {
    let filtered = [...items];

    // Filter by status based on active tab
    // if (activeTab === "active") {
    //   filtered = filtered.filter(item => item.isActive === true || item.isActive === "true");
    // } else if (activeTab === "inactive") {
    //   filtered = filtered.filter(item => item.isActive === false || item.isActive === "false");
    // }
    if (activeTab === "active") {
      filtered = filtered.filter(
        (item) => item.isActive === true || item.isActive === "true"
      );
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(
        (item) => item.isActive === false || item.isActive === "false"
      );
    } else if (activeTab === "all") {
      // For "all" tab, sort so active items come first, then inactive
      filtered = filtered.sort((a, b) => {
        const aIsActive = a.isActive === true || a.isActive === "true";
        const bIsActive = b.isActive === true || b.isActive === "true";

        // Sort active items first (true > false)
        if (aIsActive && !bIsActive) return -1;
        if (!aIsActive && bIsActive) return 1;
        return 0;
      });
    }
    // Apply search filter
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(searchValue) ||
          item.categoryName?.toLowerCase().includes(searchValue) ||
          item.weight?.toString().toLowerCase().includes(searchValue) ||
          item.quantity?.toString().toLowerCase().includes(searchValue) ||
          item.units?.toLowerCase().includes(searchValue)
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdateItem = async (values) => {
    setLoading(true);
    if (selectedItem) {
      try {
        const formData = new FormData();

        // Append file if selected
        if (selectedFile) {
          formData.append("multiPart", selectedFile);
        }
        formData.append("fileType", "document");
        formData.append("itemName", values.itemName);
        formData.append("quantity", values.quantity || 0);
        formData.append("weight", values.weight || 0);
        formData.append("itemUnit", values.itemUnit);
        formData.append("makingCost", values.makingCost || 0);
        formData.append("itemDescription", values.itemDescription);
        formData.append("tag", values.tag);

        await axios.patch(
          `${BASE_URL}/product-service/UpdateItems?itemId=${selectedItem.itemId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        message.success("Item updated successfully");
        fetchItemsData();
        handleCancel();
      } catch (error) {
        message.error(
          "Error updating item: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // New function to handle creating an offer
  const handleCreateOffer = async (values) => {
    setOfferLoading(true);
    try {
      if (!values.minQty || values.minQty < 1) {
        message.error("Minimum quantity must be at least 1");
        setOfferLoading(false);
        return;
      }

      // Validate that freeQty is at least 1
      if (!values.freeQty || values.freeQty < 1) {
        message.error("Free quantity must be at least 1");
        setOfferLoading(false);
        return;
      }
      const requestBody = {
        freeItemId: selectedItem.itemId,
        freeItemName: selectedItem.itemName,
        freeQty: values.freeQty,
        minQty: values.minQty,
        minQtyKg: values.minQtyKg,
        offerName: values.offerName,
      };

      await axios.post(
        `${BASE_URL}/cart-service/cart/createOffer`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Offer created successfully");
      handleOfferModalCancel();
    } catch (error) {
      message.error(
        "Error creating offer: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setOfferLoading(false);
    }
  };

  const handleImageViewUpload = async (values) => {
    setImageViewLoading(true);
    try {
      if (!selectedFile) {
        message.error("Please select a file to upload");
        setImageViewLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("multiPart", selectedFile);

      const response = await axios.post(
        `${BASE_URL}/product-service/imageViews`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
          params: {
            fileType: "kyc", // Fixed as kyc
            itemId: selectedItem.itemId,
            itemView: values.itemView, // BACK, LEFT, or RIGHT
          },
        }
      );

      message.success(
        `Image uploaded successfully for ${values.itemView} view`
      );
      handleImageViewModalCancel();
      fetchItemsData(); // Refresh data if needed
    } catch (error) {
      message.error(
        "Error uploading KYC image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setImageViewLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue({
        itemName: selectedItem.itemName,
        quantity: selectedItem.quantity || "",
        weight: selectedItem.weight || "",
        itemUnit: selectedItem.units,
        tag: selectedItem.tag || "",
        itemDescription: selectedItem.itemDescription || "",
        makingCost: selectedItem.makingCost || "",
        itemImage: selectedItem.itemImage || "",
      });
    }
  }, [selectedItem]);

  const handleViewGeneratedBarCodes = async (item) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/product-service/viewGeneratedBarCodes`;

      const response = await axios.post(
        url,
        {
          catId: item.categoryId,
          itemId: item.itemId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data) {
        const downloadUrl = response.data; // The URL returned by the API

        // Create a link and trigger the download
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${item.itemName}.pdf`; // Set filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        message.success("Barcode file downloaded successfully!");
      } else {
        message.error("Failed to retrieve barcode download URL.");
      }
    } catch (error) {
      console.error("Error fetching barcodes:", error);
      message.error("Failed to retrieve barcodes.");
    } finally {
      setLoading(false);
    }
  };

  const handleToGenerateBarCodes = async (item) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/product-service/generateBarCodes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            catId: item.categoryId,
            itemId: item.itemId,
          }),
        }
      );
      if (response.status === 500) {
        alert("All barcodes have already been generated up to 40");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob(); // Convert response to a blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.itemName}.pdf`; // Set the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up URL object
    } catch (error) {
      console.error("Error downloading the file:", error);
    } finally {
      setLoading(false);
    }
  };

  const showUpdateModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    setSelectedFile(null);
  };

  // New function to show offer creation modal
  const showOfferModal = (item) => {
    setSelectedItem(item);
    setIsOfferModalVisible(true);
  };
  // New function to show image view modal
  const showImageViewModal = (item) => {
    setSelectedItem(item);
    setIsImageViewModalVisible(true);
  };

  // New function to handle offer modal cancel
  const handleOfferModalCancel = () => {
    setIsOfferModalVisible(false);
    offerForm.resetFields();
  };

  // New function to handle image view modal cancel
  const handleImageViewModalCancel = () => {
    setIsImageViewModalVisible(false);
    imageViewForm.resetFields();
    setSelectedFile(null);
  };

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const UpdateItemStatus = async (itemId, isActive) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/product-service/itemActiveAndInActive`;
      await axios.patch(
        url,
        {
          itemId: itemId, // Dynamic itemId
          status: !isActive, // Toggle status correctly
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      message.success("Item status updated successfully.");
      fetchItemsData(); // Refresh the items list
    } catch (error) {
      console.error("Error updating item status:", error);
      message.error("Failed to update item status.");
    } finally {
      setLoading(false);
    }
  };

  // Function to show combo creation modal
  const showComboModal = (item) => {
    // Reset form fields first to avoid stale data
    comboForm.resetFields();

    // Set the new selected combo item
    setSelectedComboItem(item);

    // Set modal visibility
    setIsComboModalVisible(true);

    // Set form values for the new item
    comboForm.setFieldsValue({
      comboItemId: item.itemId,
      comboItemName: item.itemName,
      itemWeight: item.weight,
      units: item.units,
      items: [], // Ensure items list is empty initially
    });
  };

  // Function to handle combo modal cancel
  const handleComboModalCancel = () => {
    setIsComboModalVisible(false);
    setSelectedComboItem(null);
    comboForm.resetFields(); // Reset form to clear all fields
    setSelectedIndividualItems([]); // Clear selected individual items
  };

  // Function to handle combo creation
  const handleCreateCombo = async (values) => {
    if (!selectedComboItem) {
      message.error("Please select a combo item");
      return;
    }
    if (!values.items?.length) {
      message.error("Please add at least one individual item");
      return;
    }

    setComboLoading(true);
    try {
      const requestBody = {
        comboItemId: selectedComboItem.itemId,
        comboItemName: selectedComboItem.itemName,
        itemWeight: values.itemWeight,
        discountType: values.discountType,
        // imageUrl: values.imageUrl,
        units: values.units || "unit",
        minQty: values.minQty,
        items: values.items.map((item) => ({
          individualItemId: item.individualItemId,
          itemName:
            items.find((i) => i.itemId === item.individualItemId)?.itemName ||
            "",
          itemWeight: item.itemWeight,
          quantity: item.quantity,
          itemPrice: item.itemPrice,
          imageUrl: item.imageUrl,
          itemMrp: item.itemMrp,
          discountedPrice: item.discountedPrice,
          status: item.status, // Use status from form instead of hardcoding
          units: item.units,
        })),
      };

      await axios.post(`${BASE_URL}/product-service/saveCombo`, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      message.success("Combo created successfully");
      handleComboModalCancel(); // Close modal and reset state
    } catch (error) {
      message.error(
        "Error creating combo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setComboLoading(false);
    }
  };
  // NEW: Handle individual item selection
  const handleIndividualItemSelect = (itemIds) => {
    const selected = items.filter((item) => itemIds.includes(item.itemId));
    setSelectedIndividualItems(selected);
  };

  const columns = [
    {
      title: "S.NO",
      key: "serialNo",
      render: (text, record, index) =>
        index + 1 + (currentPage - 1) * entriesPerPage,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
    },
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      align: "center",
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Item Logo",
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
            alt="Item Logo"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 5,
            }}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive, record) => {
        const status = isActive === true || isActive === "true";

        return (
          <Popconfirm
            title={`Are you sure you want to mark this item as ${status ? "Inactive" : "Active"}?`}
            onConfirm={() => UpdateItemStatus(record.itemId, status)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{
                backgroundColor: status ? "#008CBA" : "#f44336",
                color: "white",
                border: "none",
                textAlign: "center",
              }}
            >
              {status ? "Active" : "Inactive"}
            </Button>
          </Popconfirm>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, item) => (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            padding: "4px",
          }}
        >
          <Button
            size="small"
            onClick={() => showUpdateModal(item)}
            style={{
              backgroundColor: "#3498db",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            Edit
          </Button>

          <Button
            size="small"
            onClick={() => showOfferModal(item)}
            style={{
              backgroundColor: "#f39c45",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            Create Offer
          </Button>

          <Button
            size="small"
            onClick={() => showImageViewModal(item)}
            style={{
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            Images
          </Button>

          <Button
            size="small"
            onClick={() => showComboModal(item)}
            style={{
              backgroundColor: "#8e44ad",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            Create Combo
          </Button>

          <Button
            size="small"
            style={{
              backgroundColor: "#1AB394",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            <Link
              to={`/admin/allinformationofbarcode/${item.itemId}`}
              style={{
                color: "white",
                textDecoration: "none",
              }}
            >
              Barcode Info
            </Link>
          </Button>

          <Button
            size="small"
            onClick={() => handleViewGeneratedBarCodes(item)}
            style={{
              backgroundColor: "#2980b9",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            View Bar Codes
          </Button>

          <Button
            size="small"
            onClick={() => handleToGenerateBarCodes(item)}
            style={{
              backgroundColor: "#04AA6D",
              color: "#fff",
              border: "none",
              fontSize: "13px",
              padding: "4px 10px",
            }}
            disabled={loading}
          >
            Generate Bar Codes
          </Button>
        </div>
      ),
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };

  // New function to handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <AdminPanelLayoutTest>
      <Row
        justify="space-between"
        align="middle"
        className="mb-4 flex flex-col sm:flex-row items-start sm:items-center"
      >
        <Col>
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Items List</h2>
        </Col>
      </Row>
      {/* Status Filter Tabs */}
      <Row className="mb-4">
        <Col span={24}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="All Items" key="all" />
            <TabPane tab="Active Items" key="active" />
            <TabPane tab="Inactive Items" key="inactive" />
          </Tabs>
        </Col>
      </Row>
      <Row
        justify="space-between"
        align="middle"
        className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0 w-full"
      >
        {/* Entries Per Page Dropdown */}
        <Col className="w-full sm:w-auto">
          Show{" "}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 80 }}
            className="w-full sm:w-[80px]"
          >
            <Option value={100}>100</Option>
            <Option value={150}>150</Option>
            <Option value={200}>200</Option>
          </Select>{" "}
          entries
        </Col>

        {/* Search Input */}
        <Col className="w-full sm:w-auto flex items-center gap-2">
          <span>Search:</span>
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-[150px]"
            placeholder="Search items..."
          />
        </Col>
      </Row>
      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="itemId"
        loading={loading}
        pagination={{
          pageSize: entriesPerPage,
          current: currentPage,
          total: filteredItems.length,
          onChange: (page) => setCurrentPage(page),
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: "100%" }} // Enables horizontal scroll on smaller screens
        bordered
      />
      {/* Update Modal */}
      <Modal
        title="Update Item"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedItem && (
          <Form form={form} onFinish={handleUpdateItem} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Item Name" name="itemName">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Item Quantity" name="quantity">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Item Weight" name="weight">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Item Unit" name="itemUnit">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Making Cost" name="makingCost">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Item Description" name="itemDescription">
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Tags" name="tag">
                  <Input />
                </Form.Item>
              </Col>

              {/* File Upload */}
              <Col xs={24} sm={12}>
                <Form.Item label="Upload File" name="multiPart">
                  <Input type="file" onChange={handleFileChange} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ backgroundColor: "#1C84C6", color: "white" }}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
      {/* Create Offer Modal */}
      <Modal
        title={`Create Offer for ${selectedItem?.itemName || ""}`}
        open={isOfferModalVisible}
        onCancel={handleOfferModalCancel}
        footer={null}
      >
        {selectedItem && (
          <Form form={offerForm} onFinish={handleCreateOffer} layout="vertical">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Offer Name"
                  name="offerName"
                  rules={[
                    { required: true, message: "Please enter an offer name" },
                  ]}
                >
                  <Input placeholder="E.g., Buy X Get Y Free" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Free Quantity"
                  name="freeQty"
                  rules={[
                    { required: true, message: "Please enter free quantity" },
                    {
                      type: "number",
                      min: 1,
                      message: "Free quantity must be at least 1",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder="Number of free items"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Minimum Quantity Required"
                  name="minQty"
                  rules={[
                    {
                      required: true,
                      message: "Please enter minimum quantity",
                    },
                    {
                      type: "number",
                      min: 1,
                      message: "Minimum quantity must be at least 1",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder="Minimum quantity to qualify"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Minimum Weight Required (KG)"
                  name="minQtyKg"
                  rules={[
                    { required: true, message: "Please select minimum weight" },
                  ]}
                >
                  <Select
                    placeholder="Select minimum weight"
                    style={{ width: "100%" }}
                  >
                    <Option value={1}>1 KG</Option>
                    <Option value={5}>5 KG</Option>
                    <Option value={10}>10 KG</Option>
                    <Option value={26}>26 KG</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <div className="bg-gray-100 p-4 rounded mb-4">
                  <p className="font-bold">Selected Item Information:</p>
                  <p>Item ID: {selectedItem.itemId}</p>
                  <p>Item Name: {selectedItem.itemName}</p>
                  <p>
                    Current Weight: {selectedItem.weight || 0}{" "}
                    {selectedItem.units}
                  </p>
                </div>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={offerLoading}
                style={{ backgroundColor: "#f39c12", color: "white" }}
              >
                Create Offer
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
      {/* Images View Modal - NEW */}
      <Modal
        title={
          <span>
            Upload Images for{" "}
            <span className="text-black">
              {selectedItem?.itemName || "Item"}
            </span>
          </span>
        }
        open={isImageViewModalVisible}
        onCancel={handleImageViewModalCancel}
        footer={null}
        width={600}
        className="rounded-md"
      >
        {selectedItem && (
          <Form
            form={imageViewForm}
            onFinish={handleImageViewUpload}
            layout="vertical"
            initialValues={{ fileType: "kyc" }}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label={<span className="font-medium">Item View Type</span>}
                  name="itemView"
                  rules={[
                    { required: true, message: "Please select item view type" },
                  ]}
                >
                  <Select
                    placeholder="Choose view type (e.g., BACK, LEFT)"
                    size="large"
                  >
                    <Option value="BACK">Back View</Option>
                    <Option value="LEFT">Left View</Option>
                    <Option value="RIGHT">Right View</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label={<span className="font-medium">Upload File</span>}
                  name="multiPart"
                  rules={[{ required: true, message: "Please upload a file" }]}
                >
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    size="large"
                  />
                </Form.Item>

                {selectedFile && (
                  <div className="mt-2 px-4 py-2 border border-green-200 rounded bg-green-50">
                    <p className="text-green-700 text-sm font-medium">
                      Selected: {selectedFile.name}
                    </p>
                    <p className="text-green-600 text-xs">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </Col>
            </Row>

            <Form.Item className="mt-4">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={imageViewLoading}
                style={{
                  backgroundColor: "#9b59b6",
                  color: "#fff",
                  fontWeight: "600",
                  height: "40px",
                }}
              >
                Upload Image
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title={
          <div className="text-xl font-semibold text-[#008CBA]">
            Create Combo for{" "}
            <span className="text-black">
              {selectedComboItem?.itemName || "Item"}
            </span>
          </div>
        }
        open={isComboModalVisible}
        onCancel={handleComboModalCancel}
        footer={null}
        width={700}
        className="rounded-md"
      >
        {selectedComboItem && (
          <Form
            form={comboForm}
            onFinish={handleCreateCombo}
            layout="vertical"
            initialValues={{
              comboItemId: selectedComboItem.itemId,
              comboItemName: selectedComboItem.itemName,
              itemWeight: selectedComboItem.weight || 0,
              items: [],
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label="Combo Item ID"
                name="comboItemId"
                rules={[
                  { required: true, message: "Combo Item ID is required" },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Combo Item Name"
                name="comboItemName"
                rules={[
                  { required: true, message: "Combo Item Name is required" },
                ]}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                label="Discount Type"
                name="discountType"
                rules={[
                  { required: true, message: "Please select a discount type" },
                ]}
              >
                <Select placeholder="Select a discount type">
                  {[
                    { value: "FIXED", label: "Fixed" },
                    { value: "DISCOUNT", label: "Discount" },
                    { value: "BULK_DISCOUNT", label: "Bulk Discount" },
                    { value: "PERCENTAGE", label: "Percentage" },
                  ].map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Combo Item Weight"
                name="itemWeight"
                rules={[{ required: true, message: "Weight is required" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Combo Item Quantity"
                name="minQty"
                rules={[{ required: true, message: "Quantity is required" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              {/* <Form.Item
                label={<span className="font-medium">Image URL</span>}
                name="imageUrl"
                rules={[
                  {
                    required: true,
                    message: "Image URL is required",
                  },
                  { type: "url", message: "Must be a valid URL" },
                ]}
              >
                <Input
                  placeholder="Image URL will be populated after upload"
                  size="large"
                  disabled // Disable manual input to ensure URL comes from upload
                />
              </Form.Item> */}
            </div>

            <div className="my-6 border-t border-gray-300" />

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      className="border border-gray-300 p-4 rounded-lg mb-6 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <Form.Item
                          {...restField}
                          label="Select Item"
                          name={[name, "individualItemId"]}
                          rules={[
                            {
                              required: true,
                              message: "Please select an item",
                            },
                          ]}
                        >
                          <Select placeholder="Select an item">
                            {items.map((item) => (
                              <Option key={item.itemId} value={item.itemId}>
                                {item.itemName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item> */}
                        <Form.Item
                          {...restField}
                          label="Select Item"
                          name={[name, "individualItemId"]}
                          rules={[
                            {
                              required: true,
                              message: "Please select an item",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select an item"
                            showSearch
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {items
                              .sort((a, b) =>
                                a.itemName.localeCompare(b.itemName)
                              )
                              .map((item) => (
                                <Select.Option
                                  key={item.itemId}
                                  value={item.itemId}
                                >
                                  {item.itemName}
                                </Select.Option>
                              ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Quantity"
                          name={[name, "quantity"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter quantity",
                            },
                            {
                              type: "number",
                              min: 1,
                              message: "Must be at least 1",
                            },
                          ]}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Discounted Price"
                          name={[name, "discountedPrice"]}
                          rules={[
                            {
                              required: true,
                              message: "Enter discounted price",
                            },
                            {
                              type: "number",
                              min: 0,
                              message: "Must be non-negative",
                            },
                          ]}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label={<span className="font-medium">Image URL</span>}
                          name={[name, "imageUrl"]}
                          rules={[
                            {
                              required: true,
                              message: "Image URL is required",
                            },
                            { type: "url", message: "Must be a valid URL" },
                          ]}
                        >
                          <Input
                            placeholder="Image URL will be populated after upload"
                            size="large"
                            disabled // Disable manual input to ensure URL comes from upload
                          />
                        </Form.Item>

                        <div className="space-y-4">
                          <Upload
                            beforeUpload={(file) => {
                              setFileList([file]); // Replace previous file with new one
                              return false; // Prevent auto-upload
                            }}
                            fileList={fileList}
                            onRemove={() => setFileList([])}
                            accept="image/*"
                            maxCount={1} // Allow only one file
                            listType="picture"
                          >
                            <Button
                              icon={<UploadOutlined />}
                              size="large"
                              style={{
                                backgroundColor: "#f0f0f0",
                                borderColor: "#d9d9d9",
                                color: "#595959",
                              }}
                            >
                              Choose Image
                            </Button>
                          </Upload>

                          {uploading && (
                            <Progress
                              percent={uploadProgress}
                              status="active"
                              strokeColor={{
                                from: "#108ee9",
                                to: "#87d068",
                              }}
                            />
                          )}

                          <Button
                            type="primary"
                            onClick={() => handleUpload(name)} // Pass form index to handleUpload
                            disabled={fileList.length === 0 || uploading}
                            loading={uploading}
                            style={{
                              backgroundColor: "#008CBA",
                              borderColor: "#008CBA",
                              color: "white",
                              width: "100%",
                              height: "40px",
                            }}
                          >
                            {uploading ? "Uploading..." : "Upload Image"}
                          </Button>
                        </div>
                      </div>

                      <Button
                        danger
                        onClick={() => remove(name)}
                        className="w-full mt-3"
                      >
                        Remove Item
                      </Button>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      onClick={() => add()}
                      block
                      icon={<i className="fas fa-plus" />}
                      style={{
                        backgroundColor: "#008CBA",
                        color: "white",
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      Add Item to Combo
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={comboLoading}
                style={{
                  backgroundColor: "#04AA6D",
                  color: "white",
                  fontWeight: "600",
                  height: "45px",
                  fontSize: "16px",
                  border: "none",
                }}
              >
                Create Combo
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AdminPanelLayoutTest>
  );
};

export default ItemList;
