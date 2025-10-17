import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Image,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import CompaniesLayout from "../Components/CompaniesLayout";

const { Text, Link } = Typography;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("userId");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const fetchCompanies = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/marketing-service/campgin/all-companies?page=${page}&size=${size}`
      );
      const data = response.data;
      setCompanies(data.companies || []);
      setFilteredCompanies(data.companies || []);
      setPagination({
        current: data.currentPage + 1,
        pageSize: size,
        total: data.totalItems,
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies(0, pagination.pageSize);
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = companies.filter((item) =>
      item.companyName?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const openModal = (company = null) => {
    setEditingCompany(company);
    if (company) form.setFieldsValue(company);
    else form.resetFields();
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setEditingCompany(null);
    setIsModalVisible(false);
  };

  const handleLogoUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("fileType", "company");
    formData.append("userId", userId);
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/marketing-service/campgin/upload-company-logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data && response.data.documentPath) {
        message.success("Logo uploaded successfully!");
        form.setFieldsValue({ logoUrl: response.data.documentPath });
      } else message.error("Logo upload failed!");
    } catch (error) {
      message.error("Error uploading logo");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        id: editingCompany ? editingCompany.id : undefined,
        createdAt: editingCompany
          ? editingCompany.createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await axios.post(
        `${BASE_URL}/marketing-service/campgin/save-or-update-company`,
        payload
      );

      message.success(
        editingCompany
          ? "Company updated successfully!"
          : "Company added successfully!"
      );

      handleCloseModal();
      fetchCompanies(pagination.current - 1, pagination.pageSize);
    } catch {
      message.error("Failed to save company details");
    }
  };

const columns = [
  {
    title: "S.No",
        key: "serial",
    align: "center",
    render: (_, __, index) => (
      <div style={{ textAlign: "center" }}>
        {" "}
        {(pagination.current - 1) * pagination.pageSize + index + 1}{" "}
      </div>
    ),
  },
  {
    title: "Logo",
    dataIndex: "logoUrl",
      key: "logo",
    align: "center",
    render: (url) => (
      <div style={{ textAlign: "center" }}>
        {" "}
        <Image width={50} src={url} alt="company logo" />{" "}
      </div>
    ),
  },
  {
    title: "Company Name",
      dataIndex: "companyName",
    align: "center",
    key: "name",
    render: (text) => (
      <Text style={{ display: "block", textAlign: "center" }} strong>
        {" "}
        {text}{" "}
      </Text>
    ),
  },
  {
    title: "Description",
    dataIndex: "companyDescription",
      key: "description",
    align: "center",
    render: (text) => (
      <Text style={{ display: "block", textAlign: "center" }}>{text}</Text>
    ),
  },
  {
    title: "Locations",
    dataIndex: "locations",
    key: "locations",
    align: "center",
    render: (text) => (
      <Text style={{ display: "block", textAlign: "center" }}>{text}</Text>
    ),
  },
  {
    title: "Website",
    dataIndex: "websiteUrl",
    key: "website",
    render: (url) => (
      <div style={{ textAlign: "center" }}>
        {" "}
        <Link href={url} target="_blank">
          {" "}
          Visit{" "}
        </Link>{" "}
      </div>
    ),
  },
  {
    title: "LinkedIn",
    dataIndex: "linkedinUrl",
    key: "linkedin",
    render: (url) => (
      <div style={{ textAlign: "center" }}>
        {" "}
        {url && url !== "string" ? (
          <Link href={url} target="_blank">
            {" "}
            View{" "}
          </Link>
        ) : (
          <Text type="secondary">N/A</Text>
        )}{" "}
      </div>
    ),
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (timestamp) => (
      <Text style={{ display: "block", textAlign: "center" }}>
        {" "}
        {formatDate(timestamp)}{" "}
      </Text>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <div style={{ textAlign: "center" }}>
        {" "}
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => openModal(record)}
        >
          {" "}
          Edit{" "}
        </Button>{" "}
      </div>
    ),
  },
];

  return (
    <CompaniesLayout>
      <div className="p-4">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
              Company List
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{
                backgroundColor: "#008cba",
                color: "white",
                border: "none",
              }}
            >
              Add Company
            </Button>
          </Col>
        </Row>

        <Row gutter={[8, 8]} className="mt-4 mb-3">
          <Col xs={24} sm={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by company name..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="medium" />
          </div>
        ) : (
          <Table
            dataSource={filteredCompanies}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["50", "100", "200", "250"],
            }}
            bordered
            scroll={{ x: true }}
            onChange={(pag) => fetchCompanies(pag.current - 1, pag.pageSize)}
          />
        )}

        <Modal
          title={editingCompany ? "Edit Company" : "Add Company"}
          open={isModalVisible}
          onCancel={handleCloseModal}
          onOk={handleSave}
          okText={editingCompany ? "Update" : "Save"}
          destroyOnClose
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              name="companyDescription"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea placeholder="Enter description" />
            </Form.Item>

            <Form.Item
              name="locations"
              label="Locations"
              rules={[{ required: true, message: "Please enter locations" }]}
            >
              <Input placeholder="Enter locations" />
            </Form.Item>

            <Form.Item
              name="websiteUrl"
              label="Website URL"
              rules={[
                { required: true, message: "Please enter website URL" },
                {
                  validator: (_, value) =>
                    value && !value.startsWith("https://")
                      ? Promise.reject("Website URL must start with https://")
                      : Promise.resolve(),
                },
              ]}
            >
              <Input placeholder="Enter website URL" />
            </Form.Item>

            <Form.Item name="linkedinUrl" label="LinkedIn URL">
              <Input placeholder="Enter LinkedIn URL" />
            </Form.Item>

            <Form.Item
              name="logoUrl"
              label="Company Logo"
              rules={[{ required: true, message: "Please upload logo" }]}
            >
              <Upload
                name="logo"
                customRequest={handleLogoUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
              {form.getFieldValue("logoUrl") && (
                <Image
                  src={form.getFieldValue("logoUrl")}
                  alt="Company Logo"
                  width={100}
                  style={{ marginTop: 10, borderRadius: 8 }}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

export default CompanyList;
