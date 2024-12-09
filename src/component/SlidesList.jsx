import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message,Select, Layout, Row, Col } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';
import { useMediaQuery } from 'react-responsive';

const { Content, Header } = Layout;
const { Option } = Select;
const SlidesList = () => {
  const [slides, setSlides] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem('accessToken');
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }); // Detect mobile screen size
  const isTablet = useMediaQuery({ query: '(min-width: 768px) and (max-width: 1024px)' }); // Tablet screen size

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(
        `https://meta.oxyloans.com/api/erice-service/user/allSlidesData`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSlides(response.data);
      setFilteredSlides(response.data)
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleAddSlide = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        `https://meta.oxyloans.com/api/erice-service/user/slides`,
        values,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success('Slide added successfully');
      fetchSlides(); // Refresh the slides list
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding slide:', error);
      message.error('Failed to add slide');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleEntriesPerPageChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: 'S.NO',
      key: 'serialNo',
      render: (text, record, index) => (
        index + 1 + (currentPage - 1) * entriesPerPage
      ),
      align: 'center',
    },
    {
      title: 'Slide Name',
      align: 'center',
      dataIndex: 'slideName',
      key: 'slideName',
      responsive: ['xs', 'sm', 'md', 'lg'], // Visible on all screens
    },
    {
      title: 'Slide Image',
      dataIndex: 'slidesImage',
      align: 'center',
      key: 'slidesImage',
      render: (imageUrl, slide) => (
        <img src={imageUrl} alt={slide.name} className="h-16 w-16 object-cover mx-auto" />
      ),
      responsive: ['sm', 'md', 'lg'], // Visible on small screens and larger
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim(); // Normalize and trim input
    setSearchTerm(value);
  
    if (value) {
      // Filter slides based on the search term
      const filtered = slides.filter(slide =>
        (slide.slideName?.toLowerCase().includes(value)) || // Safe access with optional chaining
        (slide.slidesImage?.toLowerCase().includes(value))
      );
  
      setFilteredSlides(filtered); // Update the filtered slides
    } else {
      setFilteredSlides(slides); // Reset to all slides when search term is empty
    }
  };
  
  
  return (
    <AdminPanelLayout>
      <Layout className="h-full">
        <div className="p-4">
          <Row justify="space-between" align="middle">
            <Col>
            <h2 className="text-xl font-bold mb-2 sm:mb-0">Slides List</h2>
            </Col>
            <Col>
              <Button
                style={{
                  backgroundColor: '#1C84C6',
                  color: 'white',
                  marginBottom: '16px',
                }}
                onClick={showModal}
              >
                Add New Slide
              </Button>
            </Col>
          </Row>
        </div>
        <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          Show{' '}
          <Select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            style={{ width: 70 }}
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
          {' '}entries 
        </Col>

        <Col>
        Search: {' '}

          <Input
            
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 150 }}
            
          />
        </Col>
      </Row>
       
          {/* Apply mobile-specific styling for the table */}
          <Table
            dataSource={filteredSlides}
            columns={columns}
            pagination={{ pageSize: entriesPerPage, onChange: (page) => setCurrentPage(page) }}
            rowKey="id"
            scroll={{ x: isMobile ? '100%' : false }} // Horizontal scroll on smaller screens
          />
     

        {/* Modal for adding new slides */}
        <Modal title="Add New Slide" visible={isModalVisible} onCancel={handleCancel} footer={null}>
          <Form layout="vertical" onFinish={handleAddSlide}>
            <Form.Item
              name="slideName"
              label="Slide Name"
              rules={[{ required: true, message: 'Please input the slide name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="slidesImage"
              label="Slide Image URL"
              rules={[{ required: true, message: 'Please input the slide image URL!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item className="text-right">
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Slide
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </AdminPanelLayout>
  );
};

export default SlidesList;
