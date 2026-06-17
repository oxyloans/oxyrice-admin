import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, notification } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, LinkedinOutlined,
  EnvironmentOutlined, BuildOutlined, BankOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { addEmployee, fetchCompanies, fetchBanks } from '../api/superadminService';

const { Option } = Select;

const AddEmployee = ({ entityType = 'COMPANY', companyId, onSuccess, isModal = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [employeeType, setEmployeeType] = useState(entityType);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Sync props to state/form
  useEffect(() => {
    if (entityType) {
      setEmployeeType(entityType);
      form.setFieldsValue({ employeeType });
    }
  }, [entityType, form]);

  useEffect(() => {
    if (companyId) {
      form.setFieldsValue({ companyId });
    }
  }, [companyId, form]);

  // Fetch all companies and banks on mount to populate search dropdowns
  useEffect(() => {
    const loadEntities = async () => {
      setLoadingEntities(true);
      try {
        const [compRes, bankRes] = await Promise.all([
          fetchCompanies(0, 1000),
          fetchBanks(0, 1000)
        ]);
        setCompanies(compRes.data?.content || []);
        setBanks(bankRes.data?.content || []);
      } catch (err) {
        console.error('Failed to load companies/banks', err);
        notification.error({ message: 'Error', description: 'Failed to load companies or banks list.' });
      } finally {
        setLoadingEntities(false);
      }
    };
    loadEntities();
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      employeeType: employeeType
    };
    
    try {
      await addEmployee(payload);
      notification.success({ message: 'Success', description: 'Employee added successfully' });
      form.resetFields();
      setEmployeeType(entityType);
      form.setFieldsValue({ employeeType: entityType });
      if (companyId) form.setFieldsValue({ companyId });
      if (onSuccess) onSuccess();
    } catch (err) {
      notification.error({ message: 'Error', description: err?.response?.data?.message || 'Failed to add employee' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── shared input style ── */
  const inputStyle = {
    borderRadius: 10,
    fontSize: 13.5,
    height: 42,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '0.01em',
    marginBottom: 6,
    display: 'inline-block'
  };

  /* ── section header ── */
  const SectionHead = ({ icon, title }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '28px 0 16px',
      paddingBottom: 10,
      borderBottom: '1.5px solid #f1f5f9',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 13, flexShrink: 0,
        boxShadow: '0 2px 6px rgba(79,70,229,0.2)'
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
  );

  /* ── row of 2 side-by-side fields ── */
  const Row = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
      {children}
    </div>
  );

  const matchedEntityName = (() => {
    if (!companyId) return null;
    const list = employeeType === 'BANK' ? banks : companies;
    const found = list.find(x => x.id === companyId);
    return found ? found.companyName : 'Loading...';
  })();

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      initialValues={{ employeeType, companyId }}
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
    >
      {/* Hidden Fields */}
      <Form.Item name="employeeType" noStyle>
        <Input type="hidden" value={employeeType} />
      </Form.Item>

      {companyId && (
        <Form.Item name="companyId" noStyle>
          <Input type="hidden" />
        </Form.Item>
      )}

      {/* ── Organization Context / Selection ── */}
      {companyId ? (
        // Context banner when pre-filled via modal
        <div style={{
          background: 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 2px 8px rgba(79,70,229,0.05)'
        }}>
          <span style={{ fontSize: 26 }}>
            {employeeType === 'BANK' ? '🏦' : '🏢'}
          </span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Target {employeeType === 'BANK' ? 'Bank' : 'Company'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b', marginTop: 2 }}>
              {matchedEntityName || 'Loading organization info...'}
            </div>
          </div>
        </div>
      ) : (
        // Type Selector + Search dropdown when added standalone
        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={labelStyle}>Select Employee Organization Type <span style={{ color: '#ef4444' }}>*</span></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>
              <div
                onClick={() => {
                  setEmployeeType('COMPANY');
                  form.setFieldsValue({ companyId: undefined });
                }}
                style={{
                  padding: '20px 16px',
                  borderRadius: 12,
                  border: employeeType === 'COMPANY' ? '2.5px solid #4f46e5' : '1.5px solid #cbd5e1',
                  background: employeeType === 'COMPANY' ? '#ffffff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: employeeType === 'COMPANY' ? '0 4px 16px rgba(79,70,229,0.12)' : 'none'
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: employeeType === 'COMPANY' ? '#e0e7ff' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <BuildOutlined style={{ fontSize: 20, color: employeeType === 'COMPANY' ? '#4f46e5' : '#64748b' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: employeeType === 'COMPANY' ? '#1e1b4b' : '#475569' }}>Company Employee</div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>Corporate partner portal</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setEmployeeType('BANK');
                  form.setFieldsValue({ companyId: undefined });
                }}
                style={{
                  padding: '20px 16px',
                  borderRadius: 12,
                  border: employeeType === 'BANK' ? '2.5px solid #4f46e5' : '1.5px solid #cbd5e1',
                  background: employeeType === 'BANK' ? '#ffffff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: employeeType === 'BANK' ? '0 4px 16px rgba(79,70,229,0.12)' : 'none'
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: employeeType === 'BANK' ? '#e0e7ff' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <BankOutlined style={{ fontSize: 20, color: employeeType === 'BANK' ? '#4f46e5' : '#64748b' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: employeeType === 'BANK' ? '#1e1b4b' : '#475569' }}>Bank Employee</div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>Financial partner contact</div>
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="companyId"
            label={<span style={labelStyle}>{employeeType === 'BANK' ? 'Select Partner Bank' : 'Select Company'} <span style={{ color: '#ef4444' }}>*</span></span>}
            rules={[{ required: true, message: 'Please select an organization' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              showSearch
              placeholder={employeeType === 'BANK' ? 'Search and select bank...' : 'Search and select company...'}
              optionFilterProp="children"
              style={{ height: 42, fontSize: 13.5 }}
              dropdownStyle={{ borderRadius: 10 }}
              loading={loadingEntities}
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {(employeeType === 'BANK' ? banks : companies).map(item => (
                <Option key={item.id} value={item.id}>
                  {item.companyName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      )}

      {/* ── Basic Info ── */}
      <SectionHead icon={<UserOutlined />} title="Basic Information" />
      <Row>
        <Form.Item
          name="name"
          label={<span style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="John Doe"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="position"
          label={<span style={labelStyle}>Position <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[{ required: true, message: 'Position is required' }]}
        >
          <Input
            prefix={<IdcardOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="Software Engineer"
            style={inputStyle}
          />
        </Form.Item>
      </Row>

      <Row>
        <Form.Item
          name="location"
          label={<span style={labelStyle}>Location <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[{ required: true, message: 'Location is required' }]}
        >
          <Input
            prefix={<EnvironmentOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="Bengaluru, India"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="exCompanyName"
          label={<span style={labelStyle}>Previous Company <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[{ required: true, message: 'Previous company is required' }]}
        >
          <Input
            prefix={<BankOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="Infosys"
            style={inputStyle}
          />
        </Form.Item>
      </Row>

      {/* ── Contact ── */}
      <SectionHead icon={<MailOutlined />} title="Contact Details" />
      <Row>
        <Form.Item
          name="email"
          label={<span style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' }
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="employee@example.com"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="mobileNumber"
          label={<span style={labelStyle}>Mobile Number <span style={{ color: '#ef4444' }}>*</span></span>}
          rules={[
            { required: true, message: 'Mobile number is required' },
            { pattern: /^\+?\d{7,15}$/, message: 'Invalid phone number format' }
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: '#9ca3af', fontSize: 13 }} />}
            placeholder="+91 9876543210"
            style={inputStyle}
          />
        </Form.Item>
      </Row>

      <Form.Item
        name="linkdinUrl"
        label={<span style={labelStyle}>LinkedIn URL <span style={{ color: '#ef4444' }}>*</span></span>}
        rules={[
          { required: true, message: 'LinkedIn URL is required' },
          { pattern: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w .-]*)*\/?$/i, message: 'Invalid LinkedIn URL' }
        ]}
      >
        <Input
          prefix={<LinkedinOutlined style={{ color: '#0a66c2', fontSize: 13 }} />}
          placeholder="https://linkedin.com/in/username"
          style={inputStyle}
        />
      </Form.Item>

      {/* ── Submit ── */}
      <div style={{ marginTop: 32 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          block
          style={{
            height: 46,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14.5,
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
            letterSpacing: '0.02em',
          }}
        >
          {submitting ? 'Adding Employee…' : `Add ${employeeType === 'BANK' ? 'Bank' : 'Company'} Employee`}
        </Button>
      </div>
    </Form>
  );

  if (isModal) {
    return (
      <div style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: 4,
      }}>
        {formContent}
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 820,
      width: '100%',
      margin: '24px auto',
      background: '#ffffff',
      borderRadius: 20,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* card header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2a4a 0%, #162040 100%)',
        padding: '28px 40px',
        display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserOutlined style={{ color: '#818cf8', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 17, letterSpacing: '0.01em' }}>
            Add New Employee
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 3 }}>
            Register a new employee for a company or partner bank
          </div>
        </div>
      </div>

      {/* form body */}
      <div style={{ padding: '40px' }}>
        {formContent}
      </div>
    </div>
  );
};

export default AddEmployee;