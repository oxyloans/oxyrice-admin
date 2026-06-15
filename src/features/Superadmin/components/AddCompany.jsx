import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { addCompany } from '../api/superadminService';
import styles from '../styles/glass.module.css';

// Yup validation schema (pure JS) – simple manual validation
const validate = (values) => {
  const errors = {};
  if (!values.companyName) errors.companyName = 'Company name is required';
  if (!values.location) errors.location = 'Location is required';
  if (values.website) {
    // simple URL regex
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i;
    if (!urlRegex.test(values.website)) errors.website = 'Invalid URL';
  }
  return errors;
};

const AddCompany = ({ onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    const errors = validate(values);
    if (Object.keys(errors).length) {
      // set form errors manually
      form.setFields(
        Object.entries(errors).map(([name, error]) => ({ name, errors: [error] }))
      );
      return;
    }
    setSubmitting(true);
    try {
      // add company classification
      await addCompany({ ...values, classification: "COMPANY" });
      message.success('Company added successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to add company';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="companyName"
        label="Company Name"
        rules={[{ required: true, message: 'Please enter company name' }]}>
        <Input placeholder="Acme Corp" />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        rules={[{ required: true, message: 'Please enter location' }]}>
        <Input placeholder="Delhi, India" />
      </Form.Item>
      <Form.Item
        name="website"
        label="Website"
        rules={[{ pattern: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i, message: 'Please enter a valid URL' }]}>
        <Input placeholder="https://example.com" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          Add Company
        </Button>
      </Form.Item>
    </Form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className={styles.glassCard} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add New Company</h2>
      {formContent}
    </div>
  );
};

export default AddCompany;
