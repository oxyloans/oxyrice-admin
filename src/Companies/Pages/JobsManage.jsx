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

const JobsManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
 
  const [form] = Form.useForm();
  

 
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const fetchCompanies = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/marketing-service/campgin/getallcompanies`
      );
      const data = response.data;
      setCompanies(data || []);
      setFilteredCompanies(data || []);
     
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = companies.filter((item) =>
      item.companyName?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };



 

  const columns = [
    {
      title: "S.No",
      key: "serial",
      align: "center",
     
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
         
          >
            {" "}
            Add Job{" "}
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
              
              pageSizeOptions: ["50", "100", "200", "250"],
            }}
            bordered
            scroll={{ x: true }}
            onChange={(pag) => fetchCompanies(pag.current - 1, pag.pageSize)}
          />
        )}

      </div>
    </CompaniesLayout>
  );
};

export default JobsManagement;
