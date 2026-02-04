import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Input, Row, Col, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons"; 
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "../components/AdminPanel";

const { Title } = Typography;

const StudentRegistrations = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user-service/student/getAllStudentRegistrations`
      );
      // Sort descending by createdAt (newest first)
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setData(sortedData);
      setFilteredData(sortedData);
    } catch (err) {
      setError("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setSearchTerm(value);

    const filtered = data.filter((item) => {
      const last4Id = item.id?.slice(-4).toLowerCase();
      const mobile = `${item.countryCode}${item.mobileNumber}`?.toLowerCase();
      const whatsapp =
        `${item.countryCode}${item.whatsappNumber}`?.toLowerCase();

      return (
        (last4Id && last4Id.includes(value)) ||
        (mobile && mobile.includes(value)) ||
        (whatsapp && whatsapp.includes(value))
      );
    });

    setFilteredData(filtered);
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      render: (text, record, index) => index + 1,
      align: "center",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span>{`#${id.slice(-4)}`}</span>,
      align: "center",
    },

    {
      title: "WhatsApp Number",
      key: "whatsappNumber",
      render: (record) =>
        record.whatsappNumber
          ? `${record.countryCode}${record.whatsappNumber}`
          : "",
      align: "center",
    },
    {
      title: "Mobile Number",
      key: "mobileNumber",
      render: (record) =>
        record.mobileNumber
          ? `${record.countryCode}${record.mobileNumber}`
          : "",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "",
      align: "center",
    },
    {
      title: "Email Verified",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (verified) => (verified ? "Yes" : "No"),
      align: "center",
    },
    {
      title: "Mobile Verified",
      dataIndex: "mobileVerified",
      key: "mobileVerified",
      render: (verified) => (verified ? "Yes" : "No"),
      align: "center",
    },
    {
      title: "Type",
      dataIndex: "primaryType",
      key: "primaryType",
      align: "center",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) => {
        const date = new Date(timestamp);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const day = String(date.getDate()).padStart(2, "0");
        const time = date.toTimeString().slice(0, 8); // hh:mm:ss
        return `${month}-${year}-${day} ${time}`;
      },
      align: "center",
    },
    {
      title: "Test User",
      dataIndex: "testUser",
      key: "testUser",
      render: (test) => (test ? "Yes" : "No"),
      align: "center",
    },
  ];



 return (
   <AdminPanelLayoutTest>
     <div style={{ padding: "16px" }}>
       <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
         <Col>
           <Title level={4}>Registered Users</Title>
         </Col>
         <Col>
           <Input
             placeholder="Search by ID (last 4), mobile or WhatsApp"
             value={searchTerm}
             onChange={handleSearch}
             style={{ width: 300 }}
             allowClear
             prefix={<SearchOutlined />}
           />
         </Col>
       </Row>

       {loading && (
         <div
           style={{
             display: "flex",
             justifyContent: "center",
             alignItems: "center",
             height: "100px", // adjust as needed
             margin: "20px 0",
           }}
         >
           <Spin tip="Loading student data..." />
         </div>
       )}

       {error && <Alert message={error} type="error" showIcon />}

       {!loading && !error && (
         <Table
           rowKey="id"
           columns={columns}
           dataSource={filteredData}
           pagination={{ pageSize: 10 }}
           bordered
           scroll={{ x: "max-content" }}
           size="middle"
         />
       )}
     </div>
   </AdminPanelLayoutTest>
 );

};

export default StudentRegistrations;
