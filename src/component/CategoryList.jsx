import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select,Switch, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form] = Form.useForm();
  const [addItemForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const fetchCategories = async () => {
    const accessToken=localStorage.getItem('accessToken')
    setLoading(true);
    try {
      const response = await axios.get("https://meta.oxyloans.com/api/erice-service/categories/getAllcategories",{
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      });
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      message.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = categories.filter((category) => {
      const lowerCaseValue = value.toLowerCase();
      return (
        category.categoryName.toLowerCase().includes(lowerCaseValue) ||
        category.id.toString().includes(lowerCaseValue)
      );
    });
    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const openModal = (category = null) => {
    setIsModalVisible(true);
    setIsEditMode(!!category);
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        categoryName: category.categoryName,
        categoryBanner: category.categoryBanner,
        categoryLogo: category.categoryLogo,
        categoriesType: category.categoriesType,
        isActive: category.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (values) => {
    setLoading(true);
    const payload = {
      categoryBanner: values.categoryBanner,
      categoryLogo: values.categoryLogo,
      categoryName: values.categoryName,
      deleted: false,
      id: editingCategory ? editingCategory.id : 0,
      isActive: values.isActive,
    };

    try {
      if (editingCategory) {
        await axios.patch("https://meta.oxyloans.com/api/erice-service/categories/category_update", payload);
        message.success("Category updated successfully");
      } else {
        await axios.post("https://meta.oxyloans.com/api/erice-service/categories/saveCategory", payload);
        message.success("Category added successfully");
      }
      fetchCategories(); // Re-fetch categories after saving
      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Failed to save category");
    } finally {
      setLoading(false);
    }
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

  const handleAddItem = async (values) => {
    setLoading(true);
    const payload = {
      categoryId: selectedCategoryId,
      itemLogo: values.itemLogo,
      itemName: values.itemName,
      itemQty: values.itemQty,
      itemUnit: values.itemUnit,
      tag: values.tag,
    };

    try {
      await axios.post("https://meta.oxyloans.com/api/erice-service/items/itemAddAdmin", payload, {
        headers: { "Content-Type": "application/json" },
      });
      message.success("Item added successfully");
      closeAddItemModal();
    } catch (error) {
      message.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`https://meta.oxyloans.com/api/erice-service/categories/delete?id=${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      message.success("Category deleted successfully");
      fetchCategories(); // Re-fetch categories after deletion
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPanelLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 p-6 bg-gray-100">
          <div className="mb-4 flex justify-between flex-wrap">
            <Input.Search
              placeholder="Search by Category Name or ID"
              onSearch={handleSearch}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={() => openModal()} className="mb-4">
              Add New Category
            </Button>
          </div>

          <Table
            dataSource={filteredCategories.slice(
              (currentPage - 1) * entriesPerPage,
              currentPage * entriesPerPage
            )}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: entriesPerPage,
              current: currentPage,
              total: filteredCategories.length,
              onChange: handlePaginationChange,
            }}
            scroll={{ x: true }}
            size="middle" // Use a middle size for better responsiveness
          >
            <Table.Column title="S.No" render={(text, record, index) => index + 1 + (currentPage - 1) * entriesPerPage}
              align="center"/>
            <Table.Column title="Category Id" dataIndex="id" align="center"/>
            <Table.Column title="Category Name" dataIndex="categoryName" align="center"/>
            <Table.Column title="Category Type" dataIndex="categoriesType" align="center" />
            <Table.Column
              title="Category Logo"
              dataIndex="categoryLogo"
              render={(image) => <img src={image} alt="Logo" width={50}  align="center"/>}
            />
            <Table.Column
              title="Category Banner"
              dataIndex="categoryBanner"
              render={(banner) => <img src={banner} alt="Banner" width={100} align="center" />}
            />
            <Table.Column
              title="Category Status"
              dataIndex="isActive"
              render={(isActive) => (isActive ? "Yes" : "No")}align="center"
            />
            <Table.Column
              title="Action"
              render={(text, record) => (
                <span>
                  <Button icon={<EditOutlined />} onClick={() => openModal(record)} className="mr-2">
                    Edit
                  </Button>
                  <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteCategory(record.id)}>
                    Delete
                  </Button>
                  <Button onClick={() => openAddItemModal(record.id)}>
                    Add Item
                  </Button>
                </span>
              )} align="center"
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
            <Form form={form} onFinish={handleSaveCategory}>
              <Form.Item name="categoryName" label="Category Name" rules={[{ required:false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="categoryLogo" label="Category Logo" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="categoryBanner" label="Category Banner" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="categoriesType"
                label="Category Type"
                rules={[{ required: false, message: "Please select a category type" }]}
              >
                <Select placeholder="Select Category Type">
                  <Option value="RICE">RICE</Option>
                  <Option value="Service">SERVICE</Option>
                </Select>
              </Form.Item>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          </Modal>

          {/* Add Item Modal */}
          <Modal
            title="Add New Item"
            visible={isAddItemModalVisible}
            onCancel={closeAddItemModal}
            onOk={() => addItemForm.submit()}
            okText="Save"
            destroyOnClose
          >
            <Form form={addItemForm} onFinish={handleAddItem}>
              <Form.Item name="itemName" label="Item Name" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="itemLogo" label="Item Logo" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="itemQty" label="Item Quantity" rules={[{ required: false }]}>
                <Input />
              </Form.Item>
              <Form.Item name="itemUnit" label="Item Unit" rules={[{ required: false }]}>
                <Select placeholder="Select Unit">
                  <Option value="kg">kg</Option>
                  <Option value="ltr">ltr</Option>
                  <Option value="pcs">pcs</Option>
                </Select>
              </Form.Item>
              <Form.Item name="tag" label="Tag">
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default CategoryList;
