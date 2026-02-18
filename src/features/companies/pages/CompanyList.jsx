import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  DatePicker,
  Select,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../../core/config/Config";
import CompaniesLayout from "../components/CompaniesLayout";

const { Text, Link } = Typography;
const { Option } = Select;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [jobForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return;
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const fetchCompanies = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const validPage = Math.max(0, parseInt(page) || 0);
      const validSize = Math.min(1000, Math.max(1, parseInt(size) || 10));
      const response = await axios.get(
        `${BASE_URL}/marketing-service/campgin/all-companies?page=${validPage}&size=${validSize}`
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
      message.error(error.message);
    }
    setLoading(false);
  };

  const fetchAllCompanies = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/marketing-service/campgin/getallcompanies`
      );
      setAllCompanies(res.data || []);
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    fetchCompanies(0, pagination.pageSize);
    fetchAllCompanies();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = companies.filter((item) =>
      item.companyName?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const openModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      form.setFieldsValue(company);
    } else {
      setEditingCompany(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setEditingCompany(null);
    setIsModalVisible(false);
  };

  const handleCloseJobModal = () => {
    jobForm.resetFields();
    setIsJobModalVisible(false);
  };

  const handleCompanySelect = (value) => {
    const selectedCompany = allCompanies.find((c) => c.id === value);
    if (selectedCompany) {
      jobForm.setFieldsValue({
        companyLogo: selectedCompany.logoUrl,
        companyWebsiteUrl: selectedCompany.websiteUrl,
        companyName: selectedCompany.companyName,
      });
    }
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

  const handleAddJob = async () => {
    try {
      const values = await jobForm.validateFields();

      const payload = {
        applicationDeadLine: values.applicationDeadLine
          ? values.applicationDeadLine.toISOString()
          : null,
        benefits: values.benefits,
        companyAddress: values.companyAddress,
        companyEmail: values.companyEmail,
        companyHeadQuarterLocation: values.companyHeadQuarterLocation,
        companyId: values.companyId,
        companyLogo: values.companyLogo,
        companyName: values.companyName,
        companyWebsiteUrl: values.companyWebsiteUrl,
        contactNumber: values.contactNumber,
        countryCode: values.countryCode,
        createdAt: new Date().toISOString(),
        description: values.description,
        experience: values.experience,
        industry: values.industry,
        jobDesignation: values.jobDesignation,
        jobLocations: values.jobLocations,
        jobSource: values.jobSource,
        jobStatus: true,
        jobTitle: values.jobTitle,
        jobType:
          values.jobType === "full-time"
            ? "fulltime"
            : values.jobType === "part-time"
              ? "parttime"
              : values.jobType,
        qualifications: values.qualifications,
        salaryMax: values.salaryMax,
        salaryMin: values.salaryMin,
        skills: values.skills,
        updatedAt: new Date().toISOString(),
        userId,
        workMode: values.workMode,
        companyLinkedinUrl: values.companyLinkedinUrl,
      };

      await axios.post(
        `${BASE_URL}/marketing-service/campgin/postajob`,
        payload
      );

      message.success("Job posted successfully!");
      handleCloseJobModal();
    } catch (error) {
      console.error("Error posting job:", error);
      message.error("Failed to post job");
    }
  };

  const columns = [
    {
      title: "S.NO",
      key: "serial",
      align: "center",
      render: (_, __, index) => (
        <div style={{ textAlign: "center" }}>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
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
          <Image width={50} src={url} alt="company logo" />
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
          {text}
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
      render: (url) => {
        const sanitizeUrl = (rawUrl) => {
          try {
            const parsed = new URL(rawUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
            return parsed.href;
          } catch {
            return '#';
          }
        };
        return (
          <div style={{ textAlign: "center" }}>
            <Link href={sanitizeUrl(url)} target="_blank">
              Visit
            </Link>
          </div>
        );
      },
    },
    {
      title: "LinkedIn",
      dataIndex: "linkedinUrl",
      key: "linkedin",
      render: (url) => {
        const sanitizeUrl = (rawUrl) => {
          try {
            const parsed = new URL(rawUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
            return parsed.href;
          } catch {
            return '#';
          }
        };
        return (
          <div style={{ textAlign: "center" }}>
            {url && url !== "string" ? (
              <Link href={sanitizeUrl(url)} target="_blank">
                View
              </Link>
            ) : (
              <Text type="secondary">N/A</Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      align: "center",
      key: "createdAt",
      render: (timestamp) => (
        <Text style={{ display: "block", textAlign: "center" }}>
          {formatDate(timestamp)}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{
              backgroundColor: "#008cba",
              color: "white",
              border: "none",
            }}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>{" "}
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{
              backgroundColor: "#1ab394",
              color: "white",
              border: "none",
              marginTop: 2,
            }}
            onClick={() =>
              navigate("/admin/jobsmanage", { state: { company: record } })
            }
          >
            Add Jobs
          </Button>
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
            <Space>
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
            </Space>
          </Col>
        </Row>

        <Row
          gutter={[8, 8]}
          className="mt-4 mb-3"
          align="middle"
          justify="space-between"
        >
          <Col xs={24} sm={12} md={10}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Show</span>
              <Select
                value={pagination.pageSize}
                onChange={(value) => {
                  fetchCompanies(0, value);
                }}
                style={{ width: 120 }}
              >
                {[50, 100, 200, 250].map((num) => (
                  <Option key={num} value={num}>
                    {num}
                  </Option>
                ))}
              </Select>
              <span>entries</span>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by company name..."
              value={searchText}
              allowClear
              onChange={(e) => {
                const val = e.target.value;
                setSearchText(val);
                const filtered = companies.filter((item) =>
                  item.companyName?.toLowerCase().includes(val.toLowerCase())
                );
                setFilteredCompanies(filtered);
              }}
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
              showTotal: (t, range) =>
                `${range[0]}-${range[1]} of ${t} records`,
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: false,
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
          okButtonProps={{
            style: {
              backgroundColor: editingCompany ? "#1ab394" : "#008cba",
              color: "white",
              border: "none",
            },
          }}
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
