import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Pagination } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const SubscriberDetails = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch subscriber data from API
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/subscribers'); // Replace with your API endpoint
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscriber data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     

      <div className="flex flex-1">
        {/* Sidebar */}
       

        {/* Main Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search by Customer Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }} // Adjust width as needed
            />
            <Select
              defaultValue={10}
              onChange={value => setEntriesPerPage(value)}
              style={{ width: '120px' }} // Adjust width as needed
            >
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={30}>30</Option>
            </Select>
          </div>

          <Table
            dataSource={paginatedSubscribers}
            loading={loading}
            pagination={false}
            rowKey="transactionId" // Assuming transactionId is unique
          >
            <Table.Column title="SI. No" render={(text, record, index) => (currentPage - 1) * entriesPerPage + index + 1} />
            <Table.Column title="Customer Name" dataIndex="customerName" />
            <Table.Column title="Customer Mobile" dataIndex="customerMobile" />
            <Table.Column title="Transaction ID" dataIndex="transactionId" />
            <Table.Column title="Amount" dataIndex="amount" />
            <Table.Column title="Wallet Balance" dataIndex="walletBalance" />
            <Table.Column title="Date" dataIndex="date" render={(date) => new Date(date).toLocaleDateString()} />
          </Table>

          <Pagination
            current={currentPage}
            pageSize={entriesPerPage}
            total={filteredSubscribers.length}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: 16 }}
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default SubscriberDetails;
