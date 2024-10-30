import React, { useState } from "react";
import { Form, Input, InputNumber, Button, message, Upload, Switch, Row, Col } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import axios from "axios";
import Sidebar from './Sidebar';
import Header from './Header'; // Ensure Header component is imported
import AdminPanelLayout from "./AdminPanelLayout";

const SettingsForm = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const onFinish = async (values) => {
    try {
      // Make an API call to save the settings
      const response = await axios.post("http://your-api-url.com/settings", values);
      message.success(response.data.message || "Settings updated successfully!");
      form.resetFields(); // Optionally reset fields after submission
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update settings");
    }
  };

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
     
      <div className="flex flex-1">
       
        <div className="settings-form-container" style={{ padding: 20, flex: 1 }}>
          <Form
            form={form}
            name="settings"
            onFinish={onFinish}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Delivery Applicable Minimum Billing Amount"
                  name="minBillingAmount"
                  rules={[{ required: true, message: "Please input the minimum billing amount!" }]}
                >
                  <InputNumber min={0} placeholder="Enter minimum billing amount" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Delivery Charges"
                  name="deliveryCharges"
                  rules={[{ required: true, message: "Please input the delivery charges!" }]}
                >
                  <InputNumber min={0} placeholder="Enter delivery charges" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Payment Gateway"
                  name="paymentGateway"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Payment Gateway Charge (%)"
                  name="paymentGatewayCharge"
                  rules={[{ required: true, message: "Please input the payment gateway charge!" }]}
                >
                  <InputNumber min={0} placeholder="Enter payment gateway charge (%)" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Wallet Max Transaction Amount"
                  name="walletMaxTransaction"
                  rules={[{ required: true, message: "Please input the max transaction amount!" }]}
                >
                  <InputNumber min={0} placeholder="Enter max transaction amount" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Cashback For Reference"
                  name="cashbackForReference"
                  rules={[{ required: true, message: "Please input the cashback for reference!" }]}
                >
                  <InputNumber min={0} placeholder="Enter cashback amount" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Customer Contact Number"
                  name="customerContact"
                  rules={[{ required: true, message: "Please input the customer contact number!" }]}
                >
                  <Input placeholder="Enter customer contact number" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Subscribe Banner"
                  name="subscribeBanner"
                >
                  <Upload
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false} // Prevent automatic upload
                  >
                    <Button icon={<UploadOutlined />}>Upload File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save Settings
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default SettingsForm;
