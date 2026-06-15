import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { addPresentation, uploadFile } from '../api/superadminService';
import styles from '../styles/glass.module.css';

const validate = (values) => {
  const errors = {};
  if (!values.companyId) errors.companyId = 'Company ID is required';
  if (!values.description) errors.description = 'Description is required';
  if (!values.presentationName) errors.presentationName = 'Presentation name is required';
  if (!values.presentationUrl) errors.presentationUrl = 'Please upload a presentation file';
  return errors;
};

const AddPresentation = ({ companyId, onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    if (companyId) form.setFieldsValue({ companyId });
  }, [companyId, form]);

  const handleUpload = async ({ file, onSuccess: onUploadSuccess, onError }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const id="45880e62-acaf-4645-a83e-d1c8498e923e"
      const res = await uploadFile(id, file);
      console.log(res);
      form.setFieldsValue({ presentationUrl: res.documentPath });
      setUploadedFileName(file.name);
      message.success('File uploaded successfully');
      onUploadSuccess?.('ok');
    } catch (e) {
      message.error('File upload failed');
      onError?.(e);
    } finally {
      setUploading(false);
    }
  };

  const onFinish = async (values) => {
    const errors = validate(values);
    if (Object.keys(errors).length) {
      form.setFields(Object.entries(errors).map(([name, error]) => ({ name, errors: [error] })));
      return;
    }
    setSubmitting(true);
    try {
      await addPresentation(values);
      message.success('Presentation added successfully');
      form.resetFields();
      setUploadedFileName('');
      if (companyId) form.setFieldsValue({ companyId });
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to add presentation');
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="companyId" label="Company ID" rules={[{ required: true, message: 'Please enter Company ID' }]}>
        <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" disabled={!!companyId} />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
        <Input placeholder="Brief description of the presentation" />
      </Form.Item>
      <Form.Item name="presentationName" label="Presentation Name" rules={[{ required: true, message: 'Please enter presentation name' }]}>
        <Input placeholder="Product Demo" />
      </Form.Item>
      {/* Hidden field to store the uploaded URL */}
      <Form.Item name="presentationUrl" hidden><Input /></Form.Item>
      <Form.Item label="Presentation File" required>
        <Upload customRequest={handleUpload} showUploadList={false} accept=".pdf,.ppt,.pptx,.doc,.docx">
          <Button icon={<UploadOutlined />} loading={uploading} block>
            {uploading ? 'Uploading...' : 'Upload Presentation File'}
          </Button>
        </Upload>
        {uploadedFileName && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <CheckCircleOutlined />
            <span className="truncate">{uploadedFileName}</span>
          </div>
        )}
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} disabled={uploading} block>
          Add Presentation
        </Button>
      </Form.Item>
    </Form>
  );

  if (isModal) return formContent;

  return (
    <div className={styles.glassCard} style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add New Presentation</h2>
      {formContent}
    </div>
  );
};

export default AddPresentation;
