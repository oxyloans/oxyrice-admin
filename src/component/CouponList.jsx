import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Form, Input, Select, DatePicker, Spin } from 'antd';
import { EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import moment from 'moment';
import AdminPanelLayout from './AdminPanelLayout';

const { Option } = Select;

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [form] = Form.useForm();
  const [searchCouponCode, setSearchCouponCode] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch all coupons
  const fetchCoupons = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axios.get('https://meta.oxyloans.com/api/erice-service/coupons/get_all_coupons');
      setCoupons(response.data);
      setFilteredCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.error('Failed to fetch coupons.');
    } finally {
      setFetching(false);
    }
  }, []);

  // Check coupon availability
  const checkCouponAvailability = useCallback(async () => {
    if (!searchCouponCode) {
      message.warning('Please enter a coupon code to search.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/coupons/check_coupon_available', {
        couponCode: searchCouponCode,
        couponId: coupons.find(coupon => coupon.couponCode === searchCouponCode)?.couponId || 0,
      });

      if (response.data) {
        const matchedCoupon = coupons.find(coupon => coupon.couponCode === searchCouponCode);
        if (matchedCoupon) {
          setFilteredCoupons([matchedCoupon]);
          setSearchResult(`Coupon "${searchCouponCode}" is available!`);
          message.success(`Coupon "${searchCouponCode}" is available!`);
        }
      } else {
        setFilteredCoupons([]);
        setSearchResult(`Coupon "${searchCouponCode}" is not available.`);
        message.warning(`Coupon "${searchCouponCode}" is not available.`);
      }
    } catch (error) {
      console.error('Error checking coupon availability:', error);
      message.error('Failed to check coupon availability.');
    } finally {
      setLoading(false);
    }
  }, [searchCouponCode, coupons]);

  // Update coupon status
  const updateCouponStatus = async (couponId, isActive) => {
    setLoading(true);
    try {
      await axios.patch('https://meta.oxyloans.com/api/erice-service/coupons/update_status_couponid', {
        couponId,
        status: isActive ? 0 : 1, // Toggle status
      });
      message.success('Coupon status updated successfully.');
      fetchCoupons(); // Refresh the list
    } catch (error) {
      console.error('Error updating coupon status:', error);
      message.error('Failed to update coupon status.');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { title: 'CouponId', dataIndex: 'couponId', key: 'couponId' },
    { title: 'Coupon Code', dataIndex: 'couponCode', key: 'couponCode' },
    { title: 'Coupon Value', dataIndex: 'couponValue', key: 'couponValue' },
    { title: 'Minimum Order', dataIndex: 'minOrder', key: 'minOrder' },
    { title: 'Max Discount', dataIndex: 'maxDiscount', key: 'maxDiscount' },
    { title: 'Usage', dataIndex: 'couponUsage', key: 'couponUsage' },
    { title: 'Discount Type', dataIndex: 'discountType', key: 'discountType' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: text => moment(text).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: text => moment(text).format('YYYY-MM-DD') },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Button
          type={isActive ? 'danger' : 'primary'}
          icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
          onClick={() => updateCouponStatus(record.couponId, isActive)}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>Edit</Button>
      ),
    },
  ];

  // Modal handling
  const showModal = (record = {}) => {
    setIsModalVisible(true);
    if (record.couponId) {
      setIsEditMode(true);
      setEditingCouponId(record.couponId);
      form.setFieldsValue({
        ...record,
        startDate: moment(record.startDate),
        endDate: moment(record.endDate),
      });
    } else {
      setIsEditMode(false);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Add or edit coupon
  const handleAddCoupon = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        couponCode: values.couponCode,
        couponDesc: values.couponDesc,
        couponType: values.couponType === 'Discount' ? 1 : 2,
        discountType: values.discountType,
        couponValue: values.couponValue,
        minOrder: values.minOrder,
        maxDiscount: values.maxDiscount,
        couponUsage: values.couponUsage === 'New User' ? 1 : values.couponUsage === 'One Time' ? 2 : 3,
        startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
        isActive: true,
      };

      if (isEditMode) {
        // Update existing coupon
        await axios.patch('https://meta.oxyloans.com/api/erice-service/coupons/update_coupon', {
          couponId: editingCouponId,
          ...formattedValues,
        });
        message.success('Coupon updated successfully.');
      } else {
        // Add new coupon
        await axios.post('https://meta.oxyloans.com/api/erice-service/coupons/add_coupon', formattedValues);
        message.success('Coupon added successfully.');
      }

      fetchCoupons();
      handleCancel();
    } catch (errorInfo) {
      console.log('Failed to submit:', errorInfo);
      message.error('Failed to submit coupon. Please try again.');
    }
  };

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Coupon List</h2>
          <Button type="primary" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={showModal}>
            Add New Coupon
          </Button>
        </div>

        <div className="flex mb-4 space-x-4">
          <Input className="w-1/5" placeholder="Enter coupon code" value={searchCouponCode} onChange={e => setSearchCouponCode(e.target.value)} />
          <Button type="primary" onClick={checkCouponAvailability} loading={loading}>Check Coupon</Button>
        </div>

        {searchResult && <p className="text-lg font-semibold">{searchResult}</p>}

        {fetching ? (
          <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
        ) : (
          <Table columns={columns} dataSource={filteredCoupons} rowKey="couponId" pagination={{ pageSize: 5 }} />
        )}
      </div>

      <Modal
        title={isEditMode ? 'Edit Coupon' : 'Add Coupon'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddCoupon}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="couponCode" label="Coupon Code" rules={[{ required: true, message: 'Please enter the coupon code' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="couponDesc" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="couponType" label="Coupon Type" rules={[{ required: true, message: 'Please select coupon type' }]}>
            <Select placeholder="Select coupon type">
              <Option value="Discount">Discount</Option>
              <Option value="Cashback">Cashback</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountType" label="Discount Type" rules={[{ required: true, message: 'Please select discount type' }]}>
            <Select placeholder="Select discount type">
              <Option value="Percentage">Percentage</Option>
              <Option value="Flat">Flat</Option>
            </Select>
          </Form.Item>
          <Form.Item name="couponValue" label="Coupon Value" rules={[{ required: true, message: 'Please enter coupon value' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="minOrder" label="Minimum Order" rules={[{ required: true, message: 'Please enter minimum order' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="maxDiscount" label="Max Discount" rules={[{ required: true, message: 'Please enter max discount' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="couponUsage" label="Usage" rules={[{ required: true, message: 'Please select usage' }]}>
            <Select placeholder="Select usage">
              <Option value="New User">New User</Option>
              <Option value="One Time">One Time</Option>
              <Option value="Unlimited">Unlimited</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]}>
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'Please select end date' }]}>
            <DatePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default CouponList;
