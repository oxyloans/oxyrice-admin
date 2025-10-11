import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  message,
  Typography,
  Spin,
} from "antd";
import axios from "axios";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import BASE_URL from "../../AdminPages/Config";
import AgentsAdminLayout from "../Components/AgentsAdminLayout";

const { Title } = Typography;

const GPTStore = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const accessToken = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${accessToken}` };

  const API_GET = `${BASE_URL}/ai-service/agent/getAllUrls`;
  const API_PATCH = `${BASE_URL}/ai-service/agent/urlsUpdate`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_GET, { headers });
      if (Array.isArray(response.data)) {
        setData(response.data);
        setFilteredData(response.data);
      } else {
        message.warning("Unexpected response format from API");
      }
    } catch (err) {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values };
      if (editingRecord?.id) {
        payload.id = editingRecord.id;
        await axios.patch(API_PATCH, payload, { headers });
        message.success("Agent updated successfully!");
      } else {
        await axios.patch(API_PATCH, payload, { headers });
        message.success("Agent added successfully!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to save agent");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 70,
      responsive: ["sm"],
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (text) => (text ? `#${text.slice(-4)}` : "-"),
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
      align: "center",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            textAlign: "center",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Agent Category Type",
      dataIndex: "categoryType",
      key: "categoryType",
      align: "center",
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      align: "center",
      render: (text) => (
        <a
          href={text}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record); // fill form for editing
              setIsModalOpen(true);
            }}
            style={{
              backgroundColor: "#1AB394",
              color: "white",
              border: "none",
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(
      (item) =>
        item.agentName?.toLowerCase().includes(value.toLowerCase()) ||
        item.url?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <AgentsAdminLayout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <Title level={3}>GPT Store</Title>
          <Space wrap>
            <Input
              placeholder="Search by Name or URL"
              value={searchText}
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields(); // reset form for new record
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              style={{
                backgroundColor: "#1c84c6",
                color: "white",
                border: "none",
              }}
            >
              Add GPT Agent
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowKey={(r) => r.id || r.url}
            dataSource={filteredData}
            columns={columns}
            bordered
            scroll={{ x: true }}
            pagination={{ pageSize: 50 }}
          />
        )}

        <Modal
          title={
            <span style={{ color: "#1AB394" }}>
              {editingRecord ? "Edit GPT Agent" : "Add GPT Agent"}
            </span>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setEditingRecord(null);
          }}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Agent Name"
              name="agentName"
              rules={[{ required: true, message: "Please enter agent name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter description" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const wordCount = value.trim().split(/\s+/).length;
                    if (wordCount > 500)
                      return Promise.reject(
                        new Error("Description cannot exceed 500 words")
                      );
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
            <Form.Item
              label="Agent Category Type"
              name="categoryType"
            
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="URL"
              name="url"
              rules={[
                { required: true, message: "Please enter URL" },
                {
                  pattern: /^https:\/\/.*/,
                  message: "URL must start with https://",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingRecord(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#1c84c6",
                    color: "white",
                    border: "none",
                  }}
                  htmlType="submit"
                  loading={saving}
                >
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AgentsAdminLayout>
  );
};

export default GPTStore;
