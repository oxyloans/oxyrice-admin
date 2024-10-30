import React, { useState, useEffect } from 'react';
import { Table, Select, Button } from 'antd';
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
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
    

      <div className="flex flex-1">
        {/* Sidebar */}
       
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Dropdown to select entries */}
  
            <Select
              defaultValue={25}
              onChange={value => setEntriesPerPage(value)}
              style={{ width: 120 }}
            >
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={75}>75</Option>
            </Select>

            {/* Download XLSX button */}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadXLSX}
            >
              Download XLSX
            </Button>
          </div>

          {/* Table */}
          <Table
            dataSource={paginatedCustomers}
            loading={loading}
            pagination={false}
            rowKey="id" // Assuming each customer has a unique ID
          >
            <Table.Column title="SI. No" render={(text, record, index) => (currentPage - 1) * entriesPerPage + index + 1} />
            <Table.Column title="Customer Name" dataIndex="customerName" />
            <Table.Column title="Email" dataIndex="email" />
            <Table.Column title="Mobile Number" dataIndex="mobileNumber" />
            <Table.Column title="Wallet Balance" dataIndex="walletBalance" />
            <Table.Column 
              title="Mobile Verify" 
              render={(text, record) => (
                <Button type={record.isMobileVerified ? "primary" : "default"}>
                  {record.isMobileVerified ? "Verified" : "Verify"}
                </Button>
              )}
            />
            <Table.Column 
              title="Subscriptions" 
              render={(text, record) => (
                <Button type="link" onClick={() => console.log(`Viewing subscriptions for ${record.customerName}`)}>
                  View
                </Button>
              )}
            />
            <Table.Column 
              title="Orders" 
              render={(text, record) => (
                <Button type="link" onClick={() => console.log(`Viewing orders for ${record.customerName}`)}>
                  View
                </Button>
              )}
            />
          </Table>
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default CustomerList;
