import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, notification } from 'antd';
import { addDemo } from '../api/superadminService';
import styles from '../styles/glass.module.css';

// Simple validation
const validate = (values) => {
  const errors = {};
  if (!values.companyId) errors.companyId = 'Company ID is required';
  if (values.momNotes && !values.momNotes.trim()) errors.momNotes = 'Notes cannot be empty';
  return errors;
};

const AddDemo = ({ companyId, onSuccess, isModal = false, initialValues = null }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({ ...initialValues, companyId: initialValues.companyId || companyId });
    } else if (companyId) {
      form.setFieldsValue({ companyId });
    }
  }, [companyId, initialValues, form]);

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
      await addDemo(values);
      notification.success({ message: 'Success', description: 'Demo information added successfully' });
      form.resetFields();
      if (companyId) {
        form.setFieldsValue({ companyId });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to add demo information';
      notification.error({ message: 'Error', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="companyId" label="Company ID" rules={[{ required: true, message: 'Please enter Company ID' }]}> 
        <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" disabled={!!companyId} />
      </Form.Item>
      <Form.Item name="demoDone" label="Demo Completed" valuePropName="checked"> 
        <Switch checkedChildren="Done" unCheckedChildren="Pending" />
      </Form.Item>
      <Form.Item name="momNotes" label="MoM Notes" rules={[ { required: true, message: 'Pleaes enter MoM notes'}]}>
        <Input.TextArea rows={4} placeholder="Meeting notes, follow‑ups, etc." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          Submit Demo
        </Button>
      </Form.Item>
    </Form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className={styles.glassCard} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add Demo Details</h2>
      {formContent}
    </div>
  );
};

export default AddDemo;
