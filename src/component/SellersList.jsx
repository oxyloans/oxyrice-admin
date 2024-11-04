import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Table, Modal, Row, Col, Spin } from 'antd';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';
import { Link } from 'react-router-dom';

const SellerList = () => {
  const [sellerDetails, setSellerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSeller, setEditingSeller] = useState(null);
  const [form] = Form.useForm();

  // Fetch seller details on mount
  useEffect(() => {
    fetchSellerDetails();
  }, []);

  // Function to fetch seller details
  const fetchSellerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/user/sellerDetails');
      setSellerDetails(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch seller details');
      setLoading(false);
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    
    try {
      await axios.patch('https://meta.oxyloans.com/api/erice-service/user/saveSellerDetails', {
        id: editingSeller.sellerId,
        sellerAddress: values.sellerAddress,
        sellerEmail: values.sellerEmail,
        sellerLat: values.sellerLat,
        sellerLng: values.sellerLng,
        sellerMobile: values.sellerMobile,
        sellerName: values.sellerName,
        sellerRadious: values.sellerRadious,
        sellerStoreName: values.sellerStoreName,
      });
      message.success('Seller details updated successfully');
      setEditingSeller(null);
      form.resetFields();
      await fetchSellerDetails();
    } catch (error) {
      message.error('Failed to update seller details');
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    form.setFieldsValue({
      sellerStoreName: seller.sellerStoreName,
      sellerName: seller.sellerName,
      sellerEmail: seller.sellerEmail,
      sellerMobile: seller.sellerMobile,
      sellerAddress: seller.sellerAddress,
      sellerLat: seller.sellerLat,
      sellerLng: seller.sellerLng,
      sellerRadious: seller.sellerRadious,
    });
  };


  const columns = [
    {
      title: 'Store Name',
      dataIndex: 'sellerStoreName',
      key: 'sellerStoreName',
      align: 'center',
    },
    {
      title: 'Seller Name',
      dataIndex: 'sellerName',
      key: 'sellerName',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'sellerEmail',
      key: 'sellerEmail',
      align: 'center',
    },
    {
      title: 'Mobile',
      dataIndex: 'sellerMobile',
      key: 'sellerMobile',
      align: 'center',
    },
    {
      title: 'Address',
      dataIndex: 'sellerAddress',
      key: 'sellerAddress',
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (text, record) => (
        <Row gutter={16} justify="center">
          <Col>
            <Button onClick={() => handleEdit(record)} type="primary">
              Edit
            </Button>
          </Col>
          <Col>
            <Link to={`/selleritems`}>
              <Button>Items</Button>
            </Link>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <AdminPanelLayout>
      <div style={{ padding: '20px', marginTop: '20px' }}>
        {loading ? (
          <Spin tip="Loading seller details..." style={{ display: 'block', margin: 'auto', marginTop: '50px' }} />
        ) : (
          <>
            <Table
              dataSource={sellerDetails}
              columns={columns}
              rowKey="sellerId"
              pagination={false}
              scroll={{ x: 'max-content' }} // Allow horizontal scrolling
            />

            <Modal
              title="Edit Seller Details"
              visible={!!editingSeller}
              onCancel={() => {
                setEditingSeller(null);
                form.resetFields();
              }}
              footer={null}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Store Name" name="sellerStoreName" rules={[{ required: true, message: 'Please enter store name' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Seller Name" name="sellerName" rules={[{ required: true, message: 'Please enter your name' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Email" name="sellerEmail" rules={[{ required: true, message: 'Please enter your email' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Mobile" name="sellerMobile" rules={[{ required: true, message: 'Please enter your mobile number' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Address" name="sellerAddress" rules={[{ required: true, message: 'Please enter your address' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Latitude" name="sellerLat">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Longitude" name="sellerLng">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Radius" name="sellerRadious">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="center">
                  <Col>
                    <Button type="primary" htmlType="submit">
                      Update
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </AdminPanelLayout>
  );
};

export default SellerList;
