// import React, { useState, useEffect } from "react";
// import BASE_URL from "./Config";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Upload,
//   Row,
//   Col,
//   Select,
//   message,
//   Popconfirm,
// } from "antd";
// import { EditOutlined, UploadOutlined } from "@ant-design/icons";
// import axios from "axios";
// import AdminPanelLayoutTest from "./AdminPanel";
// import { MdModeEditOutline } from "react-icons/md";
// const { Option } = Select;

// const Categories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
//   const [form] = Form.useForm();
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);
//   const [file, setFile] = useState(null);
//   const [addItemForm] = Form.useForm();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [entriesPerPage, setEntriesPerPage] = useState(20);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [previousFile, setPreviousFile] = useState(null);
//   const accessToken = localStorage.getItem("accessToken");
//   const [selectedFile, setSelectedFile] = useState(null);
// const fetchCategories = async () => {
//   setLoading(true);
//   try {
//     const response = await axios.get(
//       `${BASE_URL}/product-service/getAllcategories`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // Filter only active categories
//     const activeCategories = response.data.filter(
//       (category) => category.isActive === true
//     );

//     setCategories(activeCategories);
//     setFilteredCategories(activeCategories);
//     message.success("Categories fetched successfully");
//   } catch (error) {
//     message.error("Failed to fetch categories");
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const openAddCategoryModal = () => {
//     setIsModalVisible(true);
//     setIsEditMode(false);
//     form.resetFields();
//   };

//   const openEditCategoryModal = (category) => {
//     setIsModalVisible(true);
//     setIsEditMode(true);
//     setEditingCategory(category);
//     form.setFieldsValue({
//       categoryName: category.categoryName,
//       categoriesType: category.categoriesType,
//       isActive: category.isActive,
//       categoryLogo: category.categoryLogo,
//       categoryBanner: category.categoryBanner,
//     });
//   };

//   const closeModal = () => {
//     setIsModalVisible(false);
//     setEditingCategory(null);
//     form.resetFields(); // Reset form fields after closing
//   };

//   const handleAddCategory = async (values) => {
//     const { categoryName, file } = values;

//     // Check if a file is selected
//     if (!file || file.length === 0) {
//       message.error("Please upload a category image!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("categoryName", categoryName);
//     formData.append("fileType", "document"); // Specify file type

//     // Ensure valid file selection
//     const uploadedFile = file[0]?.originFileObj;
//     if (!uploadedFile) {
//       message.error("Uploaded file is not valid.");
//       return;
//     }

//     formData.append("multiPart", uploadedFile); // Append file

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         `${BASE_URL}/product-service/saveCategoryWithImage`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       // Success Message & Modal Close
//       message.success("Category added successfully!");
//       fetchCategories();
//       closeModal(); // **Directly close the modal after success**
//     } catch (error) {
//       if (error.response?.status === 500) {
//         message.error(
//           "Category already exists. Please choose a different name."
//         );
//         closeModal(); // **Directly close the modal after success**
//       } else {
//         message.error("Failed to add category.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditCategory = async (values) => {
//     const { categoryName, multiPart } = values;

//     // Ensure file is selected
//     if (!multiPart?.fileList?.length) {
//       message.error("Please upload a category image!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("categoryName", categoryName);
//     formData.append("fileType", "document"); // Specify file type

//     // Extract the uploaded file
//     const uploadedFile = multiPart.fileList[0].originFileObj;

//     if (!uploadedFile) {
//       message.error("Uploaded file is not valid.");
//       return;
//     }

//     formData.append("multiPart", uploadedFile); // Append actual file object

//     try {
//       setLoading(true);

//       const response = await axios.patch(
//         `${BASE_URL}/product-service/UpdateCategories?categoryId=${editingCategory.id}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         message.success("Category updated successfully!");
//         fetchCategories();
//         closeModal();
//         form.resetFields();
//       } else {
//         message.error("Failed to update category.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       message.error("Error updating category. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEntriesPerPageChange = (value) => {
//     setEntriesPerPage(value);
//     setCurrentPage(1);
//   };

//   const openAddItemModal = (categoryId) => {
//     setSelectedCategoryId(categoryId);
//     setIsAddItemModalVisible(true);
//     addItemForm.resetFields();
//   };

//   const closeAddItemModal = () => {
//     setIsAddItemModalVisible(false);
//     setSelectedCategoryId(null);
//   };
//   const handleFileChange = (fileList) => {
//     setFile(fileList); // Update the file state
//   };

//   const handleAddItem = async (values) => {
//     setLoading(true);

//     // Validate form fields
//     if (!values.itemName || !values.weight || !values.itemUnit) {
//       message.error("Please fill in all the required fields.");
//       setLoading(false);
//       return;
//     }

//     // Prepare the FormData object
//     const formData = new FormData();
//     formData.append("categoryId", selectedCategoryId);

//     // Handle file upload (if any file is selected)
//     if (file && file.length > 0) {
//       const uploadedFile = file[0]?.originFileObj; // Get the file object
//       formData.append("fileType", "kyc"); // Specify the file type
//       formData.append("multiPart", uploadedFile); // Attach the uploaded file
//     }

//     // Add other form fields
//     formData.append("itemName", values.itemName || ""); // Ensure no undefined value
//     formData.append("weight", values.weight || 0); // Default to 0 if quantity is not provided
//     formData.append("itemUnit", values.itemUnit || ""); // Default to empty string if unit is not selected
//     formData.append("tag", values.tag || "");
//     formData.append("quantity", values.quantity || "");
//     // Default to empty string if tag is undefined
//     formData.append("itemDescription", values.itemDescription || "");

//     try {
//       // API call to add the item
//       const response = await axios.post(
//         // "https://meta.oxyloans.com/api/erice-service/items/ItemAddAndImageUpload",
//         `${BASE_URL}/product-service/ItemAddAndImageUpload`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         message.success("Item added successfully");
//         closeAddItemModal(); // Close the modal after successful submission
//       } else {
//         message.error(`Failed to add item: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error adding item:", error);
//       message.error("Failed to add item");
//     } finally {
//       setLoading(false); // Ensure loading state is always set to false
//     }
//   };

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);

//     // Filter categories based on search term, ensuring `category.name` is valid
//     const filtered = categories.filter(
//       (category) =>
//         (category.categoryName &&
//           category.categoryName.toLowerCase().includes(value.toLowerCase())) ||
//         (category.categoriesType &&
//           category.categoriesType.toLowerCase().includes(value.toLowerCase()))
//     );
//     setFilteredCategories(filtered);
//   };
//   const updateCategoryStatus = async (categoryId, isActive) => {
//     setLoading(true);
//     try {
//       const url =
//         // "https://meta.oxyloans.com/api/erice-service/categories/activeOrInactive";
//         `${BASE_URL}/product-service/activeOrInactive`;
//       const response = await axios.patch(
//         url,
//         {
//           id: categoryId,
//           isActive: !isActive, // Toggle the status (active -> inactive, inactive -> active)
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       message.success("Category status updated successfully.");
//       fetchCategories(); // Fetch updated categories
//     } catch (error) {
//       console.error("Error updating category status:", error);
//       message.error("Failed to update category status.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AdminPanelLayoutTest>
//       <div className="p-4">
//         <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
//           <h2 className="text-xl font-bold mb-2 md:mb-0">Category List</h2>
//           <Button
//             style={{ backgroundColor: "#1C84C6", color: "white" }}
//             onClick={openAddCategoryModal}
//             className="w-full sm:w-auto"
//           >
//             Add New Category
//           </Button>
//         </div>

//         <Row
//           justify="space-between"
//           align="middle"
//           className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
//         >
//           <Col className="w-full sm:w-auto">
//             Show{" "}
//             <Select
//               value={entriesPerPage}
//               onChange={handleEntriesPerPageChange}
//               style={{ width: 70 }}
//             >
//               <Option value={5}>5</Option>
//               <Option value={10}>10</Option>
//               <Option value={20}>20</Option>
//             </Select>{" "}
//             entries
//           </Col>

//           <Col className="w-full sm:w-auto flex items-center gap-2">
//             <span>Search:</span>
//             <Input
//               value={searchTerm}
//               onChange={handleSearchChange}
//               style={{ width: 150 }}
//             />
//           </Col>
//         </Row>

//         <Table
//           dataSource={filteredCategories}
//           loading={loading}
//           rowKey="id"
//           pagination={{
//             pageSize: entriesPerPage,
//             onChange: (page) => setCurrentPage(page),
//           }}
//           scroll={{ x: true }}
//           size="middle"
//           bordered
//         >
//           <Table.Column
//             title="S.No"
//             render={(text, record, index) =>
//               index + 1 + (currentPage - 1) * entriesPerPage
//             }
//             align="center"
//           />
//           <Table.Column
//             title="Category Type"
//             dataIndex="categoriesType"
//             align="center"
//           />
//           <Table.Column
//             title="Category Name"
//             dataIndex="categoryName"
//             align="center"
//           />

//           <Table.Column
//             title="Category Image"
//             dataIndex="categoryLogo"
//             align="center"
//             render={(image) => (
//               <div style={{ display: "flex", justifyContent: "center" }}>
//                 <img
//                   src={image}
//                   alt="Category Logo"
//                   style={{ width: 50, height: 50, objectFit: "cover" }}
//                 />
//               </div>
//             )}
//           />
//           <Table.Column
//             title="Category Banner"
//             dataIndex="categoryBanner"
//             align="center"
//             render={(banner) => (
//               <div style={{ display: "flex", justifyContent: "center" }}>
//                 <img
//                   src={banner}
//                   alt="Banner"
//                   style={{ width: 50, height: 50, objectFit: "cover" }}
//                 />
//               </div>
//             )}
//           />

//           <Table.Column
//             title="Status"
//             dataIndex="isActive"
//             align="center"
//             render={(isActive, record) => (
//               <Popconfirm
//                 title={`Are you sure you want to mark this category as ${isActive ? "Inactive" : "Active"}?`}
//                 onConfirm={() => updateCategoryStatus(record.id, isActive)}
//                 okText="Yes"
//                 cancelText="No"
//               >
//                 <Button
//                   type="default"
//                   loading={loading}
//                   style={{
//                     backgroundColor: isActive ? "#1C84C6" : "#EC4758",
//                     color: "white",
//                   }}
//                 >
//                   {isActive ? "Active" : "Inactive"}
//                 </Button>
//               </Popconfirm>
//             )}
//           />

//           <Table.Column
//             title="Action"
//             align="center"
//             render={(text, record) => (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   gap: "8px",
//                 }}
//               >
//                 <Button
//                   onClick={() => openEditCategoryModal(record)}
//                   style={{ backgroundColor: "#1AB394", color: "white" }}
//                 >
//                   <MdModeEditOutline /> Edit
//                 </Button>

//                 <Button
//                   onClick={() => openAddItemModal(record.id)}
//                   style={{ backgroundColor: "#1C84C6", color: "white" }}
//                 >
//                   Add Item
//                 </Button>
//               </div>
//             )}
//           />
//         </Table>

//         {/* Add/Edit Category Modal */}
//         <Modal
//           title={isEditMode ? "Edit Category" : "Add New Category"}
//           visible={isModalVisible}
//           onCancel={closeModal}
//           onOk={() => form.submit()}
//           okText={isEditMode ? "Update" : "Save"}
//           okButtonProps={{
//             type: "primary",
//             htmlType: "submit",
//             loading: loading,
//           }}
//           destroyOnClose
//         >
//           <Form
//             form={form}
//             onFinish={isEditMode ? handleEditCategory : handleAddCategory}
//             layout="vertical"
//           >
//             {/* Render this field for both Add and Edit modes */}
//             {isEditMode ? (
//               <>
//                 {/* Fields for Editing */}
//                 <Form.Item
//                   label="Category Name"
//                   name="categoryName"
//                   rules={[
//                     { required: true, message: "Please enter category name" },
//                   ]}
//                 >
//                   <Input placeholder="Enter category name" />
//                 </Form.Item>

//                 {/* File Upload */}
//                 <Form.Item
//                   label="Upload File"
//                   name="multiPart"
//                   valuePropName="file"
//                   rules={[{ required: true, message: "Please upload a file" }]}
//                 >
//                   <Upload beforeUpload={() => false} maxCount={1}>
//                     <Button icon={<UploadOutlined />}>Click to Upload</Button>
//                   </Upload>
//                 </Form.Item>
//               </>
//             ) : (
//               <>
//                 {/* Fields for Adding */}
//                 <Form.Item
//                   label="Category Name"
//                   name="categoryName"
//                   rules={[
//                     {
//                       required: true,
//                       message: "Please enter the category name!",
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Enter category name" />
//                 </Form.Item>

//                 <Form.Item
//                   label="Category Image"
//                   name="file"
//                   valuePropName="fileList"
//                   getValueFromEvent={({ fileList }) => fileList} // Get fileList, not just the file
//                   rules={[
//                     {
//                       required: true,
//                       message: "Please upload a category image!",
//                     },
//                   ]}
//                 >
//                   <Upload
//                     beforeUpload={() => false} // Prevent automatic upload
//                     listType="picture"
//                     maxCount={1}
//                     showUploadList={{ showRemoveIcon: true }}
//                   >
//                     <Button icon={<UploadOutlined />}>
//                       Upload Category Image
//                     </Button>
//                   </Upload>
//                 </Form.Item>
//               </>
//             )}
//           </Form>
//         </Modal>

//         {/* Add Item Modal */}
//         <Modal
//           title="Add New Item"
//           visible={isAddItemModalVisible}
//           onCancel={closeAddItemModal}
//           footer={null}
//           destroyOnClose
//         >
//           <Form onFinish={handleAddItem} layout="vertical">
//             <Form.Item
//               name="itemName"
//               label="Item Name"
//               rules={[
//                 { required: true, message: "Please enter the item name." },
//               ]}
//             >
//               <Input placeholder="Enter the item name" />
//             </Form.Item>

//             <Form.Item
//               label="Item Logo"
//               name="itemLogo"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please upload the item logo.",
//                 },
//               ]}
//             >
//               <Upload
//                 beforeUpload={() => false} // Prevent automatic upload
//                 listType="picture"
//                 maxCount={1}
//                 onChange={({ fileList }) => handleFileChange(fileList)} // Handle file change
//               >
//                 <Button icon={<UploadOutlined />}>Upload Logo</Button>
//               </Upload>
//             </Form.Item>

//             <Form.Item
//               name="weight"
//               label="Item Weight"
//               rules={[
//                 { required: true, message: "Please enter the item weight." },
//                 {
//                   validator: (_, value) => {
//                     if (value <= 0) {
//                       return Promise.reject(
//                         new Error("Weight must be greater than 0.")
//                       );
//                     }
//                     return Promise.resolve();
//                   },
//                 },
//               ]}
//             >
//               <Input placeholder="Enter item weight" />
//             </Form.Item>

//             <Form.Item
//               name="quantity"
//               label="Item Quantity"
//               rules={[
//                 { required: true, message: "Please enter the item quantity." },
//                 {
//                   validator: (_, value) => {
//                     if (value <= 0) {
//                       return Promise.reject(
//                         new Error("Quantity must be greater than 0.")
//                       );
//                     }
//                     return Promise.resolve();
//                   },
//                 },
//               ]}
//             >
//               <Input placeholder="Enter item quantity" />
//             </Form.Item>

//             <Form.Item
//               name="itemUnit"
//               label="Item Unit"
//               rules={[
//                 { required: true, message: "Please select an item unit." },
//               ]}
//             >
//               <Select placeholder="Select Units Like (Kgs, Ltr, Pcs,Grams)">
//                 <Select.Option value="kgs">kgs</Select.Option>
//                 <Select.Option value="ltr">ltr</Select.Option>
//                 <Select.Option value="pcs">pcs</Select.Option>
//                 <Select.Option value="grams">grams</Select.Option>
//               </Select>
//             </Form.Item>

//             <Form.Item
//               name="tag"
//               label="Tag"
//               rules={[{ required: true, message: "Enter the tags" }]}
//             >
//               <Input />
//             </Form.Item>
//             <Form.Item
//               name="itemDescription"
//               label="ItemDescription"
//               rules={[
//                 { required: true, message: "Enter the item description" },
//               ]}
//             >
//               <Input />
//             </Form.Item>

//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 loading={loading}
//                 style={{
//                   backgroundColor: "#1C84C6",
//                   color: "white",
//                 }}
//               >
//                 Add Item
//               </Button>
//             </Form.Item>
//           </Form>
//         </Modal>
//       </div>
//     </AdminPanelLayoutTest>
//   );
// };

// export default Categories;

import React, { useState, useEffect } from "react";
import BASE_URL from "./Config";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Row,
  Col,
  Select,
  message,
  Popconfirm,
  Tabs,
} from "antd";
import {  UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanel";
import { MdModeEditOutline } from "react-icons/md";
const { Option } = Select;
const { TabPane } = Tabs;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [inactiveCategories, setInactiveCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [file, setFile] = useState(null);
  const [addItemForm] = Form.useForm();
 
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [inactiveSearchTerm, setInactiveSearchTerm] = useState("");
  const [filteredActiveCategories, setFilteredActiveCategories] = useState([]);
  const [filteredInactiveCategories, setFilteredInactiveCategories] = useState(
    []
  );
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [currentInactivePage, setCurrentInactivePage] = useState(1);

  const accessToken = localStorage.getItem("accessToken");

  const [activeTabKey, setActiveTabKey] = useState("1");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/product-service/getAllcategories`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Set all categories
      setCategories(response.data);

      // Separate active and inactive categories
      const active = response.data.filter(
        (category) => category.isActive === true
      );
      const inactive = response.data.filter(
        (category) => category.isActive === false
      );

      setActiveCategories(active);
      setInactiveCategories(inactive);
      setFilteredActiveCategories(active);
      setFilteredInactiveCategories(inactive);

      message.success("Categories fetched successfully");
    } catch (error) {
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddCategoryModal = () => {
    setIsModalVisible(true);
    setIsEditMode(false);
    form.resetFields();
  };

  const openEditCategoryModal = (category) => {
    setIsModalVisible(true);
    setIsEditMode(true);
    setEditingCategory(category);
    form.setFieldsValue({
      categoryName: category.categoryName,
      categoriesType: category.categoriesType,
      isActive: category.isActive,
      categoryLogo: category.categoryLogo,
      categoryBanner: category.categoryBanner,
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields(); // Reset form fields after closing
  };

  const handleAddCategory = async (values) => {
    const { categoryName, file, categoryType } = values;

    // Check if a file is selected
    if (!file || file.length === 0) {
      message.error("Please upload a category image!");
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("fileType", "document"); // Specify file type
    formData.append("categoryType", categoryType); // Append category type

    // Ensure valid file selection
    const uploadedFile = file[0]?.originFileObj;
    if (!uploadedFile) {
      message.error("Uploaded file is not valid.");
      return;
    }

    formData.append("multiPart", uploadedFile); // Append file

    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/product-service/saveCategoryWithImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Success Message & Modal Close
      message.success("Category added successfully!");
      fetchCategories();
      closeModal(); // **Directly close the modal after success**
    } catch (error) {
      if (error.response?.status === 500) {
        message.error(
          "Category already exists. Please choose a different name."
        );
        closeModal(); // **Directly close the modal after success**
      } else {
        message.error("Failed to add category.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (values) => {
    const { categoryName, multiPart } = values;

    // Ensure file is selected
    if (!multiPart?.fileList?.length) {
      message.error("Please upload a category image!");
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("fileType", "document"); // Specify file type

    // Extract the uploaded file
    const uploadedFile = multiPart.fileList[0].originFileObj;

    if (!uploadedFile) {
      message.error("Uploaded file is not valid.");
      return;
    }

    formData.append("multiPart", uploadedFile); // Append actual file object

    try {
      setLoading(true);

      const response = await axios.patch(
        `${BASE_URL}/product-service/UpdateCategories?categoryId=${editingCategory.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Category updated successfully!");
        fetchCategories();
        closeModal();
        form.resetFields();
      } else {
        message.error("Failed to update category.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Error updating category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentActivePage(1);
    setCurrentInactivePage(1);
  };

  const openAddItemModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsAddItemModalVisible(true);
    addItemForm.resetFields();
  };

  const closeAddItemModal = () => {
    setIsAddItemModalVisible(false);
    setSelectedCategoryId(null);
  };

  const handleFileChange = (fileList) => {
    setFile(fileList); // Update the file state
  };

  const handleAddItem = async (values) => {
    setLoading(true);

    // Validate form fields
    if (!values.itemName || !values.weight || !values.itemUnit) {
      message.error("Please fill in all the required fields.");
      setLoading(false);
      return;
    }

    // Prepare the FormData object
    const formData = new FormData();
    formData.append("categoryId", selectedCategoryId);

    // Handle file upload (if any file is selected)
    if (file && file.length > 0) {
      const uploadedFile = file[0]?.originFileObj; // Get the file object
      formData.append("fileType", "kyc"); // Specify the file type
      formData.append("multiPart", uploadedFile); // Attach the uploaded file
    }

    // Add other form fields
    formData.append("itemName", values.itemName || ""); // Ensure no undefined value
    formData.append("weight", values.weight || 0); // Default to 0 if quantity is not provided
    formData.append("itemUnit", values.itemUnit || ""); // Default to empty string if unit is not selected
    formData.append("tag", values.tag || "");
    formData.append("quantity", values.quantity || "");
    // Default to empty string if tag is undefined
    formData.append("itemDescription", values.itemDescription || "");

    try {
      // API call to add the item
      await axios.post(
        `${BASE_URL}/product-service/ItemAddAndImageUpload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      message.success("Item added successfully");
      closeAddItemModal(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item");
    } finally {
      setLoading(false); // Ensure loading state is always set to false
    }
  };

  const handleActiveSearchChange = (e) => {
    const value = e.target.value;
    setActiveSearchTerm(value);

    // Filter active categories based on search term
    const filtered = activeCategories.filter(
      (category) =>
        (category.categoryName &&
          category.categoryName.toLowerCase().includes(value.toLowerCase())) ||
        (category.categoriesType &&
          category.categoriesType.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredActiveCategories(filtered);
  };

  const handleInactiveSearchChange = (e) => {
    const value = e.target.value;
    setInactiveSearchTerm(value);

    // Filter inactive categories based on search term
    const filtered = inactiveCategories.filter(
      (category) =>
        (category.categoryName &&
          category.categoryName.toLowerCase().includes(value.toLowerCase())) ||
        (category.categoriesType &&
          category.categoriesType.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredInactiveCategories(filtered);
  };

  const updateCategoryStatus = async (categoryId, isActive) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/product-service/activeOrInactive`;
      const response = await axios.patch(
        url,
        {
          id: categoryId,
          isActive: !isActive, // Toggle the status (active -> inactive, inactive -> active)
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      message.success("Category status updated successfully.");
      fetchCategories(); // Fetch updated categories
    } catch (error) {
      console.error("Error updating category status:", error);
      message.error("Failed to update category status.");
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration - reused for both active and inactive tables
  const getColumns = () => [
    {
      title: "S.No",
      render: (text, record, index) => {
        if (activeTabKey === "1") {
          return index + 1 + (currentActivePage - 1) * entriesPerPage;
        } else {
          return index + 1 + (currentInactivePage - 1) * entriesPerPage;
        }
      },
      align: "center",
    },
    {
      title: "Category Type",
      dataIndex: "categoriesType",
      align: "center",
    },
    {
      title: "Category Name",
      dataIndex: "categoryName",
      align: "center",
    },
    {
      title: "Category Image",
      dataIndex: "categoryLogo",
      align: "center",
      render: (image) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={image}
            alt="Category Logo"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Category Banner",
      dataIndex: "categoryBanner",
      align: "center",
      render: (banner) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={banner}
            alt="Banner"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      align: "center",
      render: (isActive, record) => (
        <Popconfirm
          title={`Are you sure you want to mark this category as ${isActive ? "Inactive" : "Active"}?`}
          onConfirm={() => updateCategoryStatus(record.id, isActive)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="default"
            loading={loading}
            style={{
              backgroundColor: isActive === false ? "#1C84C6" : "#EC4758",
              color: "white",
            }}
          >
            {isActive === false ? "Active" : "Inactive"}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: "Action",
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Button
            onClick={() => openEditCategoryModal(record)}
            style={{ backgroundColor: "#1AB394", color: "white" }}
          >
            <MdModeEditOutline /> Edit
          </Button>

          <Button
            onClick={() => openAddItemModal(record.id)}
            style={{ backgroundColor: "#1C84C6", color: "white" }}
          >
            Add Item
          </Button>
        </div>
      ),
    },
  ];

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-xl font-bold mb-2 md:mb-0">
            Category Management
          </h2>
          <Button
            style={{ backgroundColor: "#1C84C6", color: "white" }}
            onClick={openAddCategoryModal}
            className="w-full sm:w-auto"
          >
            Add New Category
          </Button>
        </div>

        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane tab="Active Categories" key="1">
            <Row
              justify="space-between"
              align="middle"
              className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
            >
              <Col className="w-full sm:w-auto">
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

              <Col className="w-full sm:w-auto flex items-center gap-2">
                <span>Search:</span>
                <Input
                  value={inactiveSearchTerm}
                  onChange={handleInactiveSearchChange}
                  style={{ width: 150 }}
                />
              </Col>
            </Row>

            <Table
              dataSource={filteredInactiveCategories}
              loading={loading}
              rowKey="id"
              columns={getColumns()}
              pagination={{
                pageSize: entriesPerPage,
                current: currentInactivePage,
                onChange: (page) => setCurrentInactivePage(page),
              }}
              scroll={{ x: true }}
              size="middle"
              bordered
            />
          </TabPane>
          <TabPane tab="Inactive Categories" key="2">
            <Row
              justify="space-between"
              align="middle"
              className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
            >
              <Col className="w-full sm:w-auto">
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

              <Col className="w-full sm:w-auto flex items-center gap-2">
                <span>Search:</span>
                <Input
                  value={activeSearchTerm}
                  onChange={handleActiveSearchChange}
                  style={{ width: 150 }}
                />
              </Col>
            </Row>

            <Table
              dataSource={filteredActiveCategories}
              loading={loading}
              rowKey="id"
              columns={getColumns()}
              pagination={{
                pageSize: entriesPerPage,
                current: currentActivePage,
                onChange: (page) => setCurrentActivePage(page),
              }}
              scroll={{ x: true }}
              size="middle"
              bordered
            />
          </TabPane>
        </Tabs>

        {/* Add/Edit Category Modal */}
        <Modal
          title={isEditMode ? "Edit Category" : "Add New Category"}
          visible={isModalVisible}
          onCancel={closeModal}
          onOk={() => form.submit()}
          okText={isEditMode ? "Update" : "Save"}
          okButtonProps={{
            type: "primary",
            htmlType: "submit",
            loading: loading,
          }}
          destroyOnClose
        >
          <Form
            form={form}
            onFinish={isEditMode ? handleEditCategory : handleAddCategory}
            layout="vertical"
          >
            {/* Render this field for both Add and Edit modes */}
            {isEditMode ? (
              <>
                {/* Fields for Editing */}
                <Form.Item
                  label="Category Name"
                  name="categoryName"
                  rules={[
                    { required: true, message: "Please enter category name" },
                  ]}
                >
                  <Input placeholder="Enter category name" />
                </Form.Item>

                {/* File Upload */}
                <Form.Item
                  label="Upload File"
                  name="multiPart"
                  valuePropName="file"
                  rules={[{ required: true, message: "Please upload a file" }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              </>
            ) : (
              <>
                {/* Fields for Adding */}
                <Form.Item
                  label="Category Name"
                  name="categoryName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the category name!",
                    },
                  ]}
                >
                  <Input placeholder="Enter category name" />
                </Form.Item>
                <Form.Item
                  label="Category Type"
                  name="categoryType"
                  rules={[
                    {
                      required: true,
                      message: "Please select a category type!",
                    },
                  ]}
                >
                  <Select placeholder="Select category type" size="large">
                    <Option value="RICE">RICE</Option>
                    <Option value="Grocery">GROCERY</Option>
                    <Option value="GOLD">GOLD</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Category Image"
                  name="file"
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }) => fileList} // Get fileList, not just the file
                  rules={[
                    {
                      required: true,
                      message: "Please upload a category image!",
                    },
                  ]}
                >
                  <Upload
                    beforeUpload={() => false} // Prevent automatic upload
                    listType="picture"
                    maxCount={1}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload Category Image
                    </Button>
                  </Upload>
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Add Item Modal */}
        <Modal
          title="Add New Item"
          visible={isAddItemModalVisible}
          onCancel={closeAddItemModal}
          footer={null}
          destroyOnClose
        >
          <Form onFinish={handleAddItem} layout="vertical">
            <Form.Item
              name="itemName"
              label="Item Name"
              rules={[
                { required: true, message: "Please enter the item name." },
              ]}
            >
              <Input placeholder="Enter the item name" />
            </Form.Item>

            <Form.Item
              label="Item Logo"
              name="itemLogo"
              rules={[
                {
                  required: true,
                  message: "Please upload the item logo.",
                },
              ]}
            >
              <Upload
                beforeUpload={() => false} // Prevent automatic upload
                listType="picture"
                maxCount={1}
                onChange={({ fileList }) => handleFileChange(fileList)} // Handle file change
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="weight"
              label="Item Weight"
              rules={[
                { required: true, message: "Please enter the item weight." },
                {
                  validator: (_, value) => {
                    if (value <= 0) {
                      return Promise.reject(
                        new Error("Weight must be greater than 0.")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Enter item weight" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Item Quantity"
              rules={[
                { required: true, message: "Please enter the item quantity." },
                {
                  validator: (_, value) => {
                    if (value <= 0) {
                      return Promise.reject(
                        new Error("Quantity must be greater than 0.")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Enter item quantity" />
            </Form.Item>

            <Form.Item
              name="itemUnit"
              label="Item Unit"
              rules={[
                { required: true, message: "Please select an item unit." },
              ]}
            >
              <Select placeholder="Select Units Like (Kgs, Ltr, Pcs,Grams)">
                <Select.Option value="kgs">kgs</Select.Option>
                <Select.Option value="ltr">ltr</Select.Option>
                <Select.Option value="pcs">pcs</Select.Option>
                <Select.Option value="grams">grams</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="tag"
              label="Tag"
              rules={[{ required: true, message: "Enter the tags" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="itemDescription"
              label="ItemDescription"
              rules={[
                { required: true, message: "Enter the item description" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#1C84C6",
                  color: "white",
                }}
              >
                Add Item
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default Categories;
