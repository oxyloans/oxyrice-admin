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
  Tabs,
} from "antd";
import axios from "axios";
import AdminPanelLayoutTest from "./AdminPanel";
import BASE_URL from "./Config";

const { Option } = Select;
const { TabPane } = Tabs;

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("CA SERVICES");

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

  // Map tab to actual categoryType
  const tabToTypeMap = {
    "CA SERVICES": "CA SERVICE",
    "CS SERVICES": "CS SERVICE",
  };

  const filteredCategories = categories
    .filter((category) => category.categoryType === tabToTypeMap[activeTab])
    .filter((category) =>
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
      id: selectedCaCsEntityId,
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
    // {
    //   title: "Category Type",
    //   dataIndex: "categoryType",
    //   align: "center",
    // },
    {
      title: "Category SubType",
      dataIndex: "categorySubType",
      align: "center",
    },
    {
      title: "Category SubType1",
      dataIndex: "categorySubType1",
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
            >
              Add New Services
            </Button>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="CA SERVICES" key="CA SERVICES" />
          <TabPane tab="CS SERVICES" key="CS SERVICES" />
        </Tabs>

        <Row
          justify="space-between"
          align="middle"
          className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-0"
        >
          <Col>
            Show{" "}
            <Select
              value={entriesPerPage}
              onChange={setEntriesPerPage}
              style={{ width: 70 }}
            >
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
              <Option value={200}>200</Option>
            </Select>{" "}
            entries
          </Col>
          <Col className="flex items-center gap-2">
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
            <Form.Item label="Category Name" name="categoryName">
              <Input />
            </Form.Item>
            <Form.Item label="Category Type" name="categoryType">
              <Input />
            </Form.Item>
            <Form.Item label="Category SubType" name="categorySubType">
              <Input />
            </Form.Item>
            <Form.Item label="Category SubType1" name="categorySubType1">
              <Input />
            </Form.Item>
            <Form.Item label="Category URL" name="categoryUrl">
              <Input />
            </Form.Item>
            <Form.Item
              label="Is Active"
              name="isActive"
              // rules={[{ required: true, message: "Please select status" }]}
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
            <Form.Item label="Price A" name="agreementPriceA">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Price B" name="agreementPriceB">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Price C" name="agreementPriceC">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
};

export default Services;
