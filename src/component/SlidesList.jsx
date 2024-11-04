import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Select, Pagination, Row, Col } from 'antd';
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
      fetchSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  const columns = [
    {
      title: 'SI. No',
      render: (_, __, index) => (currentPage - 1) * entries + index + 1,
      responsive: ['md'],  // Visible on medium and larger screens
    },
    {
      title: 'Slide Name',
      dataIndex: 'name',
      key: 'name',
      responsive: ['xs', 'sm', 'md', 'lg'],  // Visible on all screens
    },
    {
      title: 'Slide Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl, slide) => (
        <img src={imageUrl} alt={slide.name} className="h-16 w-16 object-cover mx-auto" />
      ),
      responsive: ['sm', 'md', 'lg'],  // Visible on small screens and larger
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
      responsive: ['xs', 'sm', 'md', 'lg'],  // Visible on all screens
    },
  ];

  return (
    <AdminPanelLayout>
      <div className="flex flex-col h-screen p-4 bg-gray-100">
        <Row gutter={[16, 16]} justify="space-between" align="middle" className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <label htmlFor="entries" className="mr-2">Show entries:</label>
            <Select
              id="entries"
              value={entries}
              onChange={(value) => setEntries(value)}
              style={{ width: 120 }}
            >
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={70}>70</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} className="text-right">
            <Button
              type="primary"
              onClick={() => console.log('Add New Slide')}
            >
              Add New Slide
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={slides}
          columns={columns}
          pagination={false}
          rowKey="id"
          scroll={{ x: 500 }}  // Adds horizontal scroll on smaller screens
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
            setCurrentPage(1);
          }}
          className="mt-4 text-center"
        />
      </div>
    </AdminPanelLayout>
  );
};

export default SlidesList;
