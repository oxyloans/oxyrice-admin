import React, { useState, useEffect } from "react";
import {
  Table,
  Select,
  Button,
  Row,
  Col,
  Input,
  message,
  Pagination,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axios from "axios";
import AdminPanelLayout from "./AdminPanel.jsx";
import { Link } from "react-router-dom";

const { Option } = Select;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customer data from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://meta.oxyglobal.tech/api/erice-service/user/allCustomerData",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Data fetched successfully");
      setCustomers(response.data);
      setFilteredCustomer(response.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // // Pagination logic
  // const paginatedCustomers = customers.slice(
  //   (currentPage - 1) * entriesPerPage,
  //   currentPage * entriesPerPage
  // );

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  // Export table data as XLSX
  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const xlsxBlob = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([xlsxBlob]), "customers.xlsx");
  };
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize input and remove extra spaces
    setSearchTerm(value);

    if (value) {
      // Filter customers based on the search term
      const filtered = customers.filter(
        (customer) =>
          customer.customerName?.toLowerCase().includes(value) || // Safe access with optional chaining
          customer.mobileNumber?.toLowerCase().includes(value) ||
          customer.customerEmail?.toLowerCase().includes(value)
      );

      setFilteredCustomer(filtered); // Update the filtered results
    } else {
      setFilteredCustomer(customers); // Reset to all customers when the search term is empty
    }
  };

  return (
    <AdminPanelLayout>
      <div className="p-4 ">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h2 className="text-xl font-bold mb-2 sm:mb-0">Customers List</h2>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadXLSX}
              style={{
                backgroundColor: "#1C84C6",
                color: "white",
                marginBottom: "16px",
              }}
            >
              Download XLSX
            </Button>
          </Col>
        </Row>

        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
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

          <Col>
            Search:{" "}
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: 150 }}
            />
          </Col>
        </Row>
        <Table
          dataSource={filteredCustomer}
          loading={loading}
          pagination={{
            pageSize: entriesPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          rowKey="id"
          scroll={{ x: "100%" }}
          bordered
        >
          <Table.Column
            title="S.No"
            render={(text, record, index) =>
              index + 1 + (currentPage - 1) * entriesPerPage
            }
            align="center"
          />
          <Table.Column
            title="Customer Name"
            dataIndex="customerName"
            align="center"
          />
          <Table.Column
            title="Email"
            dataIndex="customerEmail"
            align="center"
          />
          <Table.Column
            title="Mobile Number"
            dataIndex="mobileNumber"
            align="center"
          />
          <Table.Column
            title="Mobile Verify"
            align="center"
            render={(text, record) => (
              <p
                size="small"
                style={{
                  backgroundColor: record.verifyMobile ? "#1C84C6" : "#EC4758",
                  color: "white",
                  width: "75px", // Adjust the width as needed
                  textAlign: "center", // Center text horizontally
                  padding: "1px 0", // Add vertical spacing for better alignment
                  margin: "0 auto", // Center the element horizontally within its cell
                  borderRadius: "1px", // Add rounded corners
                  lineHeight: "1.5", // Adjust line height for better text vertical alignment
                }}
              >
                {record.verifyMobile ? "Verified" : "Verify"}
              </p>
            )}
          />
          <Table.Column
            title="Subscriptions"
            align="center"
            render={(text, record) => (
              <Link
                to={`/admin/subscription-plans-list/${record.id}`}
                size="small"
                style={{
                  backgroundColor: "#1C84C6",
                  color: "white",
                }}
              >
                View
              </Link>
            )}
          />
          <Table.Column
            title="Orders"
            align="center"
            render={(text, record) => (
              <Link
                to={`/admin/orders-details/${record.id}  `}
                size="small"
                style={{
                  backgroundColor: "#1C84C6",
                  color: "white",
                }}
              >
                View
              </Link>
            )}
          />
        </Table>

        {/* <Row justify="end" className="mt-4">
          <Pagination
            current={currentPage}
            total={customers.length}
            pageSize={entriesPerPage}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </Row> */}
      </div>
    </AdminPanelLayout>
  );
};

export default Customers;
