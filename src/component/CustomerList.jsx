import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Row, Col, message, Pagination } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';
import { Link } from 'react-router-dom';

const { Option } = Select;

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const accessToken = localStorage.getItem('accessToken');

  // Fetch customer data from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/user/allCustomerData', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      message.success('Data fetched successfully');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Pagination logic
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handle change in the number of entries per page
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Export table data as XLSX
  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const xlsxBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([xlsxBlob]), 'customers.xlsx');
  };

  return (
    <AdminPanelLayout>
      <div className="p-4 ">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h2>Customer List</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadXLSX}
            >
              Download XLSX
            </Button>
          </Col>
        </Row>

        <Row justify="start" className="mb-4">
          <Col>
            <Select
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
              style={{ width: 120 }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={paginatedCustomers}
          loading={loading}
          pagination={false}
          rowKey="id"
          scroll={{ x: '100%' }}
          bordered
        >
          <Table.Column
            title="SI. No"
            render={(text, record, index) => (currentPage - 1) * entriesPerPage + index + 1}
            align="center"
          />
          <Table.Column title="Customer Name" dataIndex="customerName" align="center" />
          <Table.Column title="Email" dataIndex="customerEmail" align="center" />
          <Table.Column title="Mobile Number" dataIndex="mobileNumber" align="center" />
          <Table.Column
            title="Mobile Verify"
            align="center"
            render={(text, record) => (
              <Button type={record.verifyMobile ? 'primary' : 'default'} size="small">
                {record.verifyMobile ? 'Verified' : 'Verify'}
              </Button>
            )}
          />
          <Table.Column
            title="Subscriptions"
            align="center"
            render={(text, record) => (
              <Button type="link" onClick={() => alert(`Viewing subscriptions for ${record.customerName}`)}>
                View
              </Button>
            )}
          />
          <Table.Column
            title="Orders"
            align="center"
            render={(text, record) => <Link to="/orderslist">View</Link>}
          />
        </Table>

        <Row justify="end" className="mt-4">
          <Pagination
            current={currentPage}
            total={customers.length}
            pageSize={entriesPerPage}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </Row>
      </div>
    </AdminPanelLayout>
  );
};

export default CustomerList;
