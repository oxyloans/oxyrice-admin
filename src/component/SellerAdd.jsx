import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, message, Row, Col } from 'antd';

const SellerAdd = () => {
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.patch('http://182.18.139.138:8282/api/erice-service/user/saveSellerDetails', values);
      message.success('Seller details saved successfully!');
      console.log(response.data); // Handle success response as needed
    } catch (error) {
      message.error('Failed to save seller details. Please try again.');
      console.error(error); // Handle error response as needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="sellerDetails"
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="Sellerid"
            label="Seller,ID"
            rules={[{ required: true, message: 'Please enter your ID' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="sellerAddress"
            label="Address"
            rules={[{ required: true, message: 'Please enter your address' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sellerEmail"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="sellerMobile"
            label="Mobile"
            rules={[{ required: true, message: 'Please enter your mobile number' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sellerName"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="sellerStoreName"
            label="Store Name"
            rules={[{ required: true, message: 'Please enter your store name' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sellerLat"
            label="Latitude"
            rules={[{ required: true, message: 'Please enter latitude' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="sellerLng"
            label="Longitude"
            rules={[{ required: true, message: 'Please enter longitude' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sellerRadious"
            label="Radius"
            rules={[{ required: true, message: 'Please enter the radius' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SellerAdd;
