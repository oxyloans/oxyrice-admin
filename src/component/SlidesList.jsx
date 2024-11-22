import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message, Layout, Row, Col } from 'antd';
import AdminPanelLayout from './AdminPanelLayout';

const { Content, Header } = Layout;

const SlidesList = () => {
  const [slides, setSlides] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(
        `https://meta.oxyloans.com/api/erice-service/user/allSlidesData`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setSlides(response.data);
    } catch (error) {
      console.error("Error fetching slides:", error);
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
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      message.success("Slide added successfully");
      fetchSlides(); // Refresh the slides list
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding slide:", error);
      message.error("Failed to add slide");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'SI. No',
      align: 'center',
      render: (_, __, index) => index + 1,
      responsive: ['md'], // Visible on medium and larger screens
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

  return (
    <AdminPanelLayout>
      <Layout className="h-full">
        <Header className="p-4 bg-gray-100">
          <Row justify="space-between" align="middle">
            <Col>
              <h1>Slides List</h1>
            </Col>
            <Col>
              <Button type="primary" onClick={showModal}>
                Add New Slide
              </Button>
            </Col>
          </Row>
        </Header>

        <Content className="p-4">
          <Table
            dataSource={slides}
            columns={columns}
            pagination={false}
            rowKey="id"
            scroll={{ x: '100%' }} // Horizontal scroll on smaller screens
          />
        </Content>

        {/* Modal for adding new slides */}
        <Modal
          title="Add New Slide"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
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
