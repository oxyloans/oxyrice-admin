import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Spin,Row, Col } from 'antd';
import axios from 'axios';
import AdminPanelLayout from './AdminPanelLayout';
const accessToken=localStorage.getItem('accessToken')
const SettingsForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      id: values.id,
      cashbackForReference: values.cashbackForReference,
      customerContactNumber: values.customerContactNumber,
      deliveryApplicableMinimumBillingAmount: values.deliveryApplicableMinimumBillingAmount,
      deliveryFee: values.deliveryFee,
      paymentGateway: values.paymentGateway,
      paymentGatewayCharge: values.paymentGatewayCharge,
      walletMaxTransactionAmount: values.walletMaxTransactionAmount,
    };
  
    try {
      const response = await axios.patch(
        'https://meta.oxyloans.com/api/erice-service/user/settings',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
  
      if (response.status === 200) {
        message.success('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (

    <>
  <AdminPanelLayout>
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        cashbackForReference: 1000,
        customerContactNumber: '8686545986',
        deliveryApplicableMinimumBillingAmount: 500,
        deliveryFee: 40,
        paymentGateway: 'NO',
        paymentGatewayCharge: 1,
        walletMaxTransactionAmount: 200,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Cashback for Reference" name="cashbackForReference">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Customer Contact Number" name="customerContactNumber">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Delivery Applicable Minimum Billing Amount" name="deliveryApplicableMinimumBillingAmount">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Delivery Fee" name="deliveryFee">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Payment Gateway" name="paymentGateway">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Payment Gateway Charge (%)" name="paymentGatewayCharge">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Wallet Max Transaction Amount" name="walletMaxTransactionAmount">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Settings
        </Button>
      </Form.Item>
    </Form>
    </AdminPanelLayout>
    </>
  );
};

export default SettingsForm;
