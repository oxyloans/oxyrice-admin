import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Spin,
  Table,
  Typography,
  Tag,
} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import CompaniesLayout from "../components/CompaniesLayout";

const { Title, Text } = Typography;

const GET_API = `${BASE_URL}/marketing-service/campgin/system-configuration/get-all`;
const PATCH_API = `${BASE_URL}/marketing-service/campgin/save-system-configuration`;

const SystemConfiguration = () => {
  const [form] = Form.useForm();

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(GET_API, {
        headers: { accept: "*/*" },
      });

      const result = res.data;

      if (result?.status) {
        setConfigs(result.data || []);
      } else {
        message.error(result?.message || "Failed to fetch configurations");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Something went wrong while fetching configurations",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const openEditModal = (record) => {
    setSelectedConfig(record);
    setModalOpen(true);

    form.setFieldsValue({
      configKey: record.configKey,
      configValue: record.configValue,
      description: record.description,
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedConfig?.id) {
        message.error("Configuration id not found");
        return;
      }

      setSaving(true);

      const payload = {
        id: selectedConfig.id,
        configKey: selectedConfig.configKey,
        configValue: Number(values.configValue),
        description: values.description,
      };

      const res = await axiosInstance.patch(PATCH_API, payload, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      const result = res.data;

      if (result?.status) {
        message.success(`${selectedConfig.configKey} updated successfully`);
        setModalOpen(false);
        setSelectedConfig(null);
        form.resetFields();
        fetchConfigs();
      } else {
        message.error(result?.message || "Update failed");
      }
    } catch (error) {
      if (error?.errorFields) return;

      message.error(
        error?.response?.data?.message || "Something went wrong while updating",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedConfig(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Config Key",
      dataIndex: "configKey",
      key: "configKey",
      width: 220,
      align: "center",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Config Value",
      dataIndex: "configValue",
      key: "configValue",
      width: 160,
      align: "center",
      render: (value) => (
        <Tag color="blue" style={{ fontSize: 14, padding: "4px 10px" }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 520,
      render: (value) => <Text>{value}</Text>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 120,
      align: "center",
      render: (active) =>
        active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
    
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
          style={{
            background: "#008cab",
            borderColor: "#008cab",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <CompaniesLayout>
      <div style={{ padding: "8px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <Title
              level={3}
              style={{
                margin: 0,
             
                fontWeight: 600,
              }}
            >
              System Configuration
            </Title>

            <Text type="secondary">
              Manage ATS and Exam minimum score settings
            </Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchConfigs}
            loading={loading}
            style={{
              borderColor: "#008cba",
              color: "#008cba",
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Reload
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={configs}
            bordered
            size="middle"
            scroll={{ x: true }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} configurations`,
            }}
          />
        </Spin>

        <Modal
          title={`Edit ${selectedConfig?.configKey || "Configuration"}`}
          open={modalOpen}
          onCancel={handleModalClose}
          onOk={handleUpdate}
          confirmLoading={saving}
          okText="Update"
          cancelText="Cancel"
          okButtonProps={{
            style: {
              background: "#008cab",
              borderColor: "#008cab",
            },
          }}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Config Key" name="configKey">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Config Value"
              name="configValue"
              rules={[
                {
                  required: true,
                  message: "Please enter config value",
                },
              ]}
            >
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Please enter description",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CompaniesLayout>
  );
};

export default SystemConfiguration;
