import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Ensure you have axios installed: npm install axios
import { Table, Select, DatePicker, Button } from 'antd'; // Import Ant Design components
import Header from './Header'; // Import your Header component
import Sidebar from './Sidebar'; // Import your Sidebar component
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const ItemRequirements = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories'); // Adjust this endpoint to fetch categories
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items', {
        params: {
          category: selectedCategory,
          fromDate: fromDate ? fromDate.format('YYYY-MM-DD') : '',
          toDate: toDate ? toDate.format('YYYY-MM-DD') : '',
        },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleGeneratePDF = () => {
    // Logic to generate PDF goes here
    console.log("Generating PDF...");
  };

  // Define columns for Ant Design table
  const columns = [
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Item Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      render: (logoUrl, item) => <img src={logoUrl} alt={item.name} className="h-16 w-16 object-cover" />,
    },
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Item Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
    },
    {
      title: 'Required Quantity',
      dataIndex: 'requiredQuantity',
      key: 'requiredQuantity',
    },
  ];

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     
      <div className="flex flex-1">
        {/* Sidebar */}
      

        <div className="flex-1 p-8 bg-gray-100">
          <div className="mt-4">
            <div className="flex space-x-4 mb-6">
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                className="w-1/4"
                placeholder="Select Category"
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>

              <DatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                className="w-1/4"
                placeholder="From Date"
              />
              <DatePicker
                value={toDate}
                onChange={(date) => setToDate(date)}
                className="w-1/4"
                placeholder="To Date"
              />

              <Button
                onClick={fetchItems}
                type="primary"
              >
                Get Data
              </Button>
              <Button
                onClick={handleGeneratePDF}
                type="default"
                className="bg-green-500 text-white"
              >
                Generate PDF
              </Button>
            </div>
          </div>

          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false} // Set to true if you want pagination
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default ItemRequirements;
