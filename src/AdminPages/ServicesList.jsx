import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  message,
  InputNumber,
} from "antd";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanel";
import BASE_URL from "./Config";

const { Option } = Select;

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedCaCsEntityId, setSelectedCaCsEntityId] = useState(null);
  const [addItemForm] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/product-service/getAllCasCs`);
      setCategories(res.data);
    } catch (err) {
      message.error("Failed to fetch categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (values) => {
    const newCategory = {
      ...values,
      createdAt: new Date().toISOString(),
    };

    try {
      await axios.post(
        `${BASE_URL}/product-service/saveCaCsCategory`,
        newCategory
      );
      message.success("Category added successfully");
      form.resetFields();
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error("Failed to add category");
    }
  };

  const handleAddItem = async (values) => {
    const payload = {
      ...values,
      caCsEntityId: selectedCaCsEntityId,
      createdAt: new Date().toISOString(),
      id: selectedCaCsEntityId
    };

    try {
      await axios.post(
        `${BASE_URL}/product-service/saveCaCaAgreements`,
        payload
      );
      message.success("Agreement added successfully");
      addItemForm.resetFields();
      setAddItemModalOpen(false);
    } catch (err) {
      message.error("Failed to add agreement");
    }
  };

  const getColumns = () => [
    {
      title: "S.No",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => (currentPage - 1) * entriesPerPage + index + 1,
    },
    {
      title: "ID (Last 4)",
      dataIndex: "id",
      align: "center",
      render: (id) => `#${id?.slice(-4)}`,
    },
    {
      title: "Category Name",
      dataIndex: "categoryName",
      align: "center",
    },
    {
      title: "Category Type",
      dataIndex: "categoryType",
      align: "center",
    },
    {
      title: "Category Image",
      dataIndex: "categoryUrl",
      align: "center",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Category"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      render: (val) => (val === "true" ? "Active" : "Inactive"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button
            type="link"
            style={{ backgroundColor: "#1AB394", color: "white" }}
            onClick={() => {
              setSelectedCaCsEntityId(record.id);
              setAddItemModalOpen(true);
            }}
          >
            Add Item
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPanelLayoutTest>
      <div className="p-4">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-xl font-bold mb-2 md:mb-0">Service Management</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              style={{ backgroundColor: "#1C84C6", color: "white" }}
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Add New Services
            </Button>
          </div>
        </div>

        <Row
          justify="space-between"
          align="middle"
          className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
        >
          <Col className="w-full sm:w-auto">
            Show{" "}
            <Select
              value={entriesPerPage}
              onChange={setEntriesPerPage}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 150 }}
            />
          </Col>
        </Row>

        <Table
          dataSource={filteredCategories}
          loading={loading}
          rowKey="id"
          columns={getColumns()}
          pagination={{
            pageSize: entriesPerPage,
            current: currentPage,
            onChange: setCurrentPage,
          }}
          scroll={{ x: true }}
          size="middle"
          bordered
        />

        {/* Add Service Modal */}
        <Modal
          title="Add New Service"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Submit"
        >
          <Form form={form} layout="vertical" onFinish={handleAddCategory}>
            <Form.Item
              label="Category Name"
              name="categoryName"
              rules={[
                { required: true, message: "Please enter category name" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Category Type"
              name="categoryType"
              rules={[
                { required: true, message: "Please enter category type" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Category URL" name="categoryUrl">
              <Input />
            </Form.Item>

            <Form.Item
              label="Is Active"
              name="isActive"
              rules={[
                { required: true, message: "Please select active status" },
              ]}
            >
              <Select placeholder="Select status">
                <Option value="true">Active</Option>
                <Option value="false">Inactive</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Agreement Modal */}
        <Modal
          title="Add Agreement Item"
          open={addItemModalOpen}
          onCancel={() => setAddItemModalOpen(false)}
          onOk={() => addItemForm.submit()}
          okText="Add"
        >
          <Form form={addItemForm} layout="vertical" onFinish={handleAddItem}>
            <Form.Item
              label="Agreement Name"
              name="agreementName"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Agreement Description"
              name="agreementDescription"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Price A"
              name="agreementPriceA"
              rules={[{ required: true, message: "Enter Price A" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Price B"
              name="agreementPriceB"
              rules={[{ required: true, message: "Enter Price B" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Price C"
              name="agreementPriceC"
              rules={[{ required: true, message: "Enter Price C" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default Services;
