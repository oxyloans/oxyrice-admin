import React, { useState, useEffect } from "react";
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
} from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";
const { Option } = Select;

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [file, setFile] = useState(null);
  const [addItemForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFile, setPreviousFile] = useState(null);
  const accessToken = localStorage.getItem("accessToken");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyloans.com/api/erice-service/categories/getAllcategories",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCategories(response.data);
      setFilteredCategories(response.data)
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
  
  // Log categories to confirm data is loaded
  useEffect(() => {
    console.log(categories);
  }, [categories]);

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
      categoryLogo:category.categoryLogo,
      categoryBanner:category.categoryBanner
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleAddCategory = async (values) => {
    const { categoryName, file } = values;
  
    // Check if a file is selected in the fileList
    if (!file || file.length === 0) {
      message.error("Please upload a category image!");
      return;
    }
  
    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("fileType", "document"); // Specify file type (e.g., document)
    
    // Ensure you're accessing the file correctly (first file in the file list)
    const uploadedFile = file[0]?.originFileObj;
  
    if (!uploadedFile) {
      message.error("Uploaded file is not valid.");
      return;
    }
  
    formData.append("multiPart", uploadedFile); // Append the actual file object
  
    // Log FormData to ensure the file is appended correctly
    console.log("FormData:", formData);
  
    try {
      setLoading(true);
      const response = await axios.post(
        "https://meta.oxyloans.com/api/erice-service/categories/saveCategoryWithImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      // Handle successful response
      message.success("Category added successfully!");
      fetchCategories();
      closeModal();
    } catch (error) {
      message.error("Failed to add category.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleEditCategory = async (values) => {
    const { categoryName, categoriesType, isActive } = values;
    const payload = {
      id: editingCategory.id,
      categoryName,
      categoriesType,
      isActive,
    };

    try {
      setLoading(true);
      await axios.patch(
        "https://meta.oxyloans.com/api/erice-service/categories/category_update",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Category updated successfully!");
      fetchCategories();
      closeModal();
    } catch (error) {
      message.error("Failed to update category.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
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
    if (!values.itemName || !values.itemQty || !values.itemUnit) {
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
    formData.append("itemQty", values.itemQty || 0); // Default to 0 if quantity is not provided
    formData.append("itemUnit", values.itemUnit || ""); // Default to empty string if unit is not selected
    formData.append("tag", values.tag || ""); // Default to empty string if tag is undefined

    try {
      // API call to add the item
      const response = await axios.post(
        "https://meta.oxyloans.com/api/erice-service/items/ItemAddAndImageUpload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Item added successfully");
        closeAddItemModal(); // Close the modal after successful submission
      } else {
        message.error(`Failed to add item: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item");
    } finally {
      setLoading(false); // Ensure loading state is always set to false
    }
  };


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    // Filter categories based on search term, ensuring `category.name` is valid
    const filtered = categories.filter(category =>
      category.categoryName && category.categoryName.toLowerCase().includes(value.toLowerCase()) ||(  category.categoriesType && category.categoriesType.toLowerCase().includes(value.toLowerCase())
    ));
    setFilteredCategories(filtered);
  };

  return (
   < AdminPanelLayout>
    <div className="p-4">
     <div className="mb-2 flex justify-between flex-wrap">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Category List</h2>
      </div>
            <Button  style={{
          backgroundColor: '#1C84C6',
          color: 'white',
          marginBottom: '16px',
        }} onClick={openAddCategoryModal} className="mb-4">
              Add New Category
            </Button>
          </div>
          <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          Show{' '}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 70 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
          {' '}entries 
        </Col>

        <Col>
        Search: {' '}

          <Input
            
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
            
          />
        </Col>
      </Row>
      <Table
           dataSource={filteredCategories
            //   .slice(
            //   (currentPage - 1) * entriesPerPage,
            //   currentPage * entriesPerPage
            // )
          }
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
            scroll={{ x: 1000 }}
            size="middle" // Use a middle size for better responsiveness
            bordered
          >
            <Table.Column title="S.No" render={(text, record, index) => index + 1 + (currentPage - 1) * entriesPerPage}
              align="center"/>
            {/* <Table.Column title="Category Id" dataIndex="id" align="center"/> */}
            <Table.Column title="Category Type" dataIndex="categoriesType" align="center" />
            <Table.Column title="Category Name"  align="center" dataIndex="categoryName" />
       
            <Table.Column
            title="Category Logo"
            dataIndex="categoryLogo"
            align="center"
            render={(image) => (
           <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={image} alt="Logo" style={{ width: 50, height: 50, objectFit: 'cover' }} />
          </div>
  )}
/>
<Table.Column
  title="Category Banner"
  dataIndex="categoryBanner"
  align="center"
  render={(banner) => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img src={banner} alt="Banner" style={{ width: 50, height: 50, objectFit: 'cover' }} />
    </div>
  )}
/>

            <Table.Column
             title="Category Status"
             dataIndex="isActive"
             align="center"
             render={(isActive) => (
               <p
                 style={{
                   backgroundColor: isActive ? '#1C84C6' : '#1C84C6',
                   color: 'white',
                   width: '75px', // Adjust the width as needed
                   textAlign: 'center', // Center text horizontally
                   padding: '1px 0', // Add vertical spacing for better alignment
                   margin: '0 auto', // Center the element horizontally within its cell
                   borderRadius: '2px', // Add rounded corners
                   lineHeight: '1.5', // Adjust line height for better text vertical alignment
                 }}
               >
                 {isActive ? "Active" : "Inactive"}
               </p>
             )}
             
              
            />
            <Table.Column
          title="Action"
           align="center"
          render={(text, record) => (
            <span>
            
<Button onClick={() => openEditCategoryModal(record)}    style={{
    backgroundColor: '#1C84C6',
    color: 'white',
    
  }}>
             Edit
            </Button>

            <Button
        onClick={() => openAddItemModal(record.id)}
        style={{
          backgroundColor: "#1C84C6",
          color: "white",
        }}
      >
        Add Item
      </Button>
          </span>
          )}
        />
          </Table>

      {/* Add/Edit Category Modal */}
      <Modal
        title={isEditMode ? "Edit Category" : "Add New Category"}
        visible={isModalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={isEditMode ? "Update" : "Save"}
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
        rules={[{ required: true, message: "Please enter the category name" }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>
      <Form.Item
        name="categoryLogo"
        label="Category Logo"
        rules={[
          {
            required: true,
            message: "Please enter a valid URL for the Category Logo.",
          },
        ]}
      >
        <Input placeholder="Enter a valid URL for the logo (e.g., https://example.com/logo.png)" />
      </Form.Item>
      <Form.Item
        name="categoryBanner"
        label="Category Banner"
        rules={[
          {
            required: true,
            message: "Please enter a valid URL for the Category Banner.",
          },
        ]}
      >
        <Input placeholder="Enter a valid URL for the banner (e.g., https://example.com/banner.png)" />
      </Form.Item>
    </>
  ) : (
    <>
      {/* Fields for Adding */}
      <Form.Item
        label="Category Name"
        name="categoryName"
        rules={[{ required: true, message: "Please enter the category name!" }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>

      <Form.Item
  label="Category Image"
  name="file"
  valuePropName="fileList"
  getValueFromEvent={({ fileList }) => fileList} // Get fileList, not just the file
  rules={[{ required: true, message: "Please upload a category image!" }]}
>
  <Upload
    beforeUpload={() => false} // Prevent automatic upload
    listType="picture"
    maxCount={1}
    showUploadList={{ showRemoveIcon: true }}
  >
    <Button icon={<UploadOutlined />}>Upload Category Image</Button>
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
          rules={[{ required: true, message: "Please enter the item name." }]}
        >
          <Input placeholder="Enter the item name" />
        </Form.Item>

        <Form.Item
  label="Item Logo"
  name="itemLogo"
  rules={[
    { 
      required: true, 
      message: "Please upload the item logo." 
    }
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
          name="itemQty"
          label="Item Quantity"
          rules={[{ required: true, message: "Please enter the item quantity." }]}
        >
          <Input placeholder="Enter item quantity" />
        </Form.Item>

        <Form.Item
          name="itemUnit"
          label="Item Unit"
          rules={[{ required: true, message: "Please select an item unit." }]}
        >
          <Select placeholder="Select Unit">
            <Select.Option value="kgs">kgs</Select.Option>
            <Select.Option value="ltr">ltr</Select.Option>
            <Select.Option value="pcs">pcs</Select.Option>
          </Select>
        </Form.Item>

        {/* <Form.Item name="tag" label="Tag">
          <Input />
        </Form.Item> */}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Item
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    </div>
    </AdminPanelLayout>
  );
};

export default CategoryList;
