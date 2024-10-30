import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Ensure you have axios installed: npm install axios
import Header from './Header'; // Import your Header component
import Sidebar from './Sidebar'; // Import your Sidebar component
import { Table, Button, Select, Pagination } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const SlidesList = () => {
  const [slides, setSlides] = useState([]);
  const [entries, setEntries] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    fetchSlides();
  }, [entries, currentPage]);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(`/api/slides?limit=${entries}&page=${currentPage}`);
      setSlides(response.data.slides);
      setTotalSlides(response.data.total);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/slides/${id}`);
      fetchSlides(); // Refresh the slides list after deletion
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  const columns = [
    {
      title: 'SI. No',
      render: (_, __, index) => (currentPage - 1) * entries + index + 1,
    },
    {
      title: 'Slide Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slide Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl, slide) => (
        <img src={imageUrl} alt={slide.name} className="h-16 w-16 object-cover mx-auto" />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, slide) => (
        <div className="flex justify-center">
          <Button
            type="primary"
            onClick={() => console.log('Edit slide', slide.id)}
            className="mr-2"
          >
            Edit
          </Button>
          <Button
            type="danger"
            onClick={() => handleDelete(slide.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     

      <div className="flex flex-1">
        {/* Sidebar */}
       
        <div className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <label htmlFor="entries" className="mr-2">Show entries:</label>
              <Select
                id="entries"
                value={entries}
                onChange={(value) => setEntries(value)}
                className="border border-gray-300 rounded"
                style={{ width: 100 }}
              >
                <Option value={25}>25</Option>
                <Option value={50}>50</Option>
                <Option value={70}>70</Option>
              </Select>
            </div>
            <Button
              type="primary"
              onClick={() => console.log('Add New Slide')}
            >
              Add New Slide
            </Button>
          </div>

          <Table
            dataSource={slides}
            columns={columns}
            pagination={false}
            rowKey="id"
          />

          <Pagination
            current={currentPage}
            pageSize={entries}
            total={totalSlides}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger
            pageSizeOptions={[25, 50, 70]}
            onShowSizeChange={(current, size) => {
              setEntries(size);
              setCurrentPage(1); // Reset to first page on entry change
            }}
            className="mt-4"
          />
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default SlidesList;
