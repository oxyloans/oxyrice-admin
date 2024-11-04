import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Row, Col } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';  // Corrected import
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch customer data from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/customers'); // Replace with your API endpoint
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
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
      <div className="flex flex-col h-screen">
        <div className="flex-1 p-4">
          <Row gutter={[16, 16]} justify="space-between" align="middle" className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Select
                defaultValue={25}
                onChange={value => setEntriesPerPage(value)}
                style={{ width: '100%' }}
              >
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
                <Option value={75}>75</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadXLSX}
                style={{ width: '100%' }}
              >
                Download XLSX
              </Button>
            </Col>
          </Row>

          <Table
            dataSource={paginatedCustomers}
            loading={loading}
            pagination={false}
            rowKey="id"
            scroll={{ x: true }}  // Enable horizontal scrolling for mobile
            responsive  // Enable responsive table
          >
            <Table.Column
              title="SI. No"
              render={(text, record, index) => (currentPage - 1) * entriesPerPage + index + 1}
              responsive={['sm']}
            />
            <Table.Column title="Customer Name" dataIndex="customerName" />
            <Table.Column title="Email" dataIndex="email" />
            <Table.Column title="Mobile Number" dataIndex="mobileNumber" responsive={['md']} />
            <Table.Column title="Wallet Balance" dataIndex="walletBalance" responsive={['lg']} />
            <Table.Column 
              title="Mobile Verify" 
              render={(text, record) => (
                <Button type={record.isMobileVerified ? "primary" : "default"} size="small">
                  {record.isMobileVerified ? "Verified" : "Verify"}
                </Button>
              )}
              responsive={['md']}
            />
            <Table.Column 
              title="Subscriptions" 
              render={(text, record) => (
                <Button type="link" onClick={() => console.log(`Viewing subscriptions for ${record.customerName}`)}>
                  View
                </Button>
              )}
              responsive={['sm']}
            />
            <Table.Column 
              title="Orders" 
              render={(text, record) => (
                <Button type="link" onClick={() => console.log(`Viewing orders for ${record.customerName}`)}>
                  View
                </Button>
              )}
              responsive={['sm']}
            />
          </Table>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default CustomerList;
