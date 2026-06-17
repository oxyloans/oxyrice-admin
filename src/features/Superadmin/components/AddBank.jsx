import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { addBank } from '../api/superadminService';
import styles from '../styles/glass.module.css';

// Simple JS validation (same as AddCompany)
const validate = (values) => {
  const errors = {};
  if (!values.companyName) errors.companyName = 'Company name is required';
  if (!values.location) errors.location = 'Location is required';
  if (!values.website) {
    errors.website = 'Website is required';
  } else {
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i;
    if (!urlRegex.test(values.website)) errors.website = 'Invalid URL';
  }
  return errors;
};

const AddBank = ({ onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    const errors = validate(values);
    if (Object.keys(errors).length) {
      form.setFields(Object.entries(errors).map(([name, error]) => ({ name, errors: [error] })));
      return;
    }
    setSubmitting(true);
    try {
      await addBank({ ...values, classification: "BANK" });
      notification.success({ message: 'Success', description: 'Bank added successfully' });
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to add bank';
      notification.error({ message: 'Error', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="companyName" label="Bank Name" rules={[{ required: true, message: 'Please enter bank name' }]}>
        <Input placeholder="Bank of XYZ" />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter location' }]}>
        <Input placeholder="Mumbai, India" />
      </Form.Item>
      <Form.Item name="website" label="Website" rules={[{ required: true, message: 'Please enter website URL' }]}>
        <Input placeholder="https://bankexample.com" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          Add Bank
        </Button>
      </Form.Item>
    </Form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className={styles.glassCard} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add New Bank</h2>
      {formContent}
    </div>
  );
};

export default AddBank;
