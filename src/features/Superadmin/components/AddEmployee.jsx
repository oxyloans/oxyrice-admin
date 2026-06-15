import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { addEmployee } from '../api/superadminService';
import styles from '../styles/glass.module.css';

const { Option } = Select;

// Simple JS validation for employee fields
const validate = (values) => {
  const errors = {};
  if (!values.companyId) errors.companyId = 'Company/Bank ID is required';
  if (!values.email) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) errors.email = 'Invalid email format';
  }
  if (!values.employeeType) errors.employeeType = 'Employee type is required';
  if (!values.name) errors.name = 'Name is required';
  if (!values.position) errors.position = 'Position is required';
  // optional URL fields validation
  if (values.linkdinUrl) {
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i;
    if (!urlRegex.test(values.linkdinUrl)) errors.linkdinUrl = 'Invalid LinkedIn URL';
  }
  if (values.presentationUrl) {
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i;
    if (!urlRegex.test(values.presentationUrl)) errors.presentationUrl = 'Invalid URL';
  }
  if (values.mobileNumber) {
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(values.mobileNumber)) errors.mobileNumber = 'Invalid phone number';
  }
  return errors;
};

/**
 * AddEmployee component
 * Props:
 *   entityType: "COMPANY" | "BANK" (determines classification sent to backend)
 *   companyId: Optional ID of the parent company/bank to prefill
 *   onSuccess: Callback on successful creation
 *   isModal: Renders inside a Modal container if true
 */
const AddEmployee = ({ entityType = 'COMPANY', companyId, onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companyId) {
      form.setFieldsValue({ companyId });
    }
  }, [companyId, form]);

  const onFinish = async (values) => {
    const errors = validate(values);
    if (Object.keys(errors).length) {
      form.setFields(
        Object.entries(errors).map(([name, error]) => ({ name, errors: [error] }))
      );
      return;
    }
    setSubmitting(true);
    try {
      // payload includes classification based on page context
      const payload = { ...values };
      await addEmployee(payload);
      message.success('Employee added successfully');
      form.resetFields();
      if (companyId) {
        form.setFieldsValue({ companyId });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to add employee';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="companyId" label="Company/Bank ID" rules={[{ required: true, message: 'Please enter ID' }]}> 
        <Input placeholder="e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6" disabled={!!companyId} />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }]}> 
        <Input placeholder="employee@example.com" />
      </Form.Item>
      <Form.Item name="employeeType" label="Employee Type" rules={[{ required: true, message: 'Select employee type' }]}> 
        <Select placeholder="Select type">
          <Option value="COMPANY">COMPANY</Option>
          <Option value="BANK">BANK</Option>
        </Select>
      </Form.Item>
      <Form.Item name="exCompanyName" label="Previous Company Name" rules={[{required: true, message: 'Please enter Previous company Name'}]}>
        <Input placeholder="Previous Co." />
      </Form.Item>
      <Form.Item name="linkdinUrl" label="LinkedIn URL" rules={[{ required: true, pattern: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i, message: 'Please enter a valid URL' }]}>
        <Input placeholder="https://linkedin.com/in/username" />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter location' }]}>
        <Input placeholder="City, Country" />
      </Form.Item>
      <Form.Item name="mobileNumber" label="Mobile Number" rules={[{ required: true, message: 'Please enter mobile number'}]}>
        <Input placeholder="+1234567890" />
      </Form.Item>
      <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter name' }]}> 
        <Input placeholder="John Doe" />
      </Form.Item>
      <Form.Item name="position" label="Position" rules={[{ required: true, message: 'Please enter position' }]}> 
        <Input placeholder="Software Engineer" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          Add Employee
        </Button>
      </Form.Item>
    </Form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className={styles.glassCard} style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add New {entityType === 'BANK' ? 'Bank' : 'Company'} Employee</h2>
      {formContent}
    </div>
  );
};

export default AddEmployee;
