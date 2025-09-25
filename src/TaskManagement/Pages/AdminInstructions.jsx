
import React, { useEffect, useState } from "react";
import { Table, Spin, message,Space, Form, Input, Button, Upload, Modal } from "antd";
import { UploadOutlined, MessageOutlined } from "@ant-design/icons";
import { MdModeEditOutline } from "react-icons/md";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

import { useNavigate } from "react-router-dom";
import { MdForum } from "react-icons/md"; // Forum/chat related icon
const AdminInstructions = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [formAdd] = Form.useForm(); // ✅ Add form instance for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
      const [searchText, setSearchText] = useState("");
  const [formEdit] = Form.useForm();
  const [formInteraction] = Form.useForm();
  const adminUserId = localStorage.getItem("userId");
    const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
     const [filteredData, setFilteredData] = useState([]);
  const [interactionRecord, setInteractionRecord] = useState(null);
  const API_URL = `${BASE_URL}/user-service/write/getAdminUserId?adminUserId=${adminUserId}`;
  const SAVE_API = `${BASE_URL}/user-service/write/radhaInstructions`;
  const UPLOAD_API = `${BASE_URL}/user-service/write/uploadRadhaFiles?fileType=kyc&userId=${adminUserId}`;
    const INTERACTION_API = `${BASE_URL}/user-service/write/radhaInteractions`;
     // 🔎 Search handler
 
  // Fetch admin instructions
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
     if (Array.isArray(response.data)) {
       // ✅ sort by updatedDate (if exists) else createdDate
       const sortedData = response.data.sort((a, b) => {
         const dateA = new Date(
           a.radhaUpdateDate || a.radhaInstructeddate
         ).getTime();
         const dateB = new Date(
           b.radhaUpdateDate || b.radhaInstructeddate
         ).getTime();
         return dateB - dateA; // descending
       });
       setData(sortedData);
       setFilteredData(sortedData);
     } else {
       message.warning("Unexpected response format");
     }
    } catch (err) {
      message.error("Failed to fetch Admin Instructions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setFilteredData(data);
  }, [data]);
  // Upload file for Add modal
  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const uploadResp = await axios.post(UPLOAD_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return uploadResp.data?.id || null;
  };

  // Add new instruction
  const handleAddSave = async (values) => {
    setSaving(true);
    try {
      const imageUploadedId = await uploadFile();

      const payload = {
        adminUserId,
        instructionHeader: values.instructionHeader,
        instructions: values.instructions,
        ...(imageUploadedId && { imageUploadedId }),
      };

      await axios.patch(SAVE_API, payload);
      message.success("Instruction added successfully!");
      fetchData();
        setIsAddModalOpen(false);
            formAdd.resetFields();
      setFile(null);
    } catch (err) {
      message.error("Failed to save instruction");
    } finally {
      setSaving(false);
    }
  };

  // Edit instruction (no file upload)
  const handleEditSave = async (values) => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      const payload = {
        instructionHeader: values.instructionHeader,
        instructions: values.instructions,
        radhaInstructionsId: editingRecord.radhaInstructionsId,
      };

      await axios.patch(SAVE_API, payload);
      message.success("Instruction updated successfully!");
      fetchData();
      setIsEditModalOpen(false);
        setEditingRecord(null);
           formEdit.resetFields();
    } catch (err) {
      message.error("Failed to update instruction");
    } finally {
      setSaving(false);
    }
  };
  // Save interaction
  const handleInteractionSave = async (values) => {
    if (!interactionRecord) return;
    setSaving(true);
    try {
      const payload = {
        employeeConversation: values.employeeConversation,
        radhaInstructionsId: interactionRecord.radhaInstructionsId,
        type: "RADHA",
        userid: adminUserId,
      };

      await axios.patch(INTERACTION_API, payload);
      message.success("Interaction saved successfully!");
      setIsInteractionModalOpen(false);
        setInteractionRecord(null);
            formInteraction.resetFields();
    } catch (err) {
      message.error("Failed to save interaction");
    } finally {
      setSaving(false);
    }
  };

  const formatDateIST = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toLocaleString("en-IN", { hour12: true });
};
  // Table columns
  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1, align: "center" },
    {
      title: "Admin User ID",
      dataIndex: "adminUserId",
      align: "center",
      render: (text) => (text ? `#${text.slice(-4)}` : "-"),
    },
    {
      title: "Instruction ID",
      dataIndex: "radhaInstructionsId",
      align: "center",
      render: (text) => (text ? `#${text.slice(-4)}` : "-"),
    },
    {
      title: "Instruction Header",
      dataIndex: "instructionHeader",
      align: "center",
    },
    { title: "Instructions", dataIndex: "radhaInstructions", align: "center" },
  // ✅ Table columns
{
  title: "Created Date",
  dataIndex: "radhaInstructeddate",
  align: "center",
  render: (text) => formatDateIST(text),
},
{
  title: "Updated Date",
  dataIndex: "radhaUpdateDate",
  align: "center",
  render: (text) => formatDateIST(text),
},
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space align="center" size="middle">
          {/* Edit Button */}
          <Button
            onClick={() => {
              setEditingRecord(record);
              setIsEditModalOpen(true);
            }}
            style={{
              backgroundColor: "#1AB394",
              color: "white",
              border: "none",
            }}
            icon={<MdModeEditOutline />}
          >
            Edit
          </Button>

          {/* Write To Us Button */}
          <Button
            onClick={() => {
              setInteractionRecord(record);
              setIsInteractionModalOpen(true);
            }}
            style={{
              backgroundColor: "#1c84c6",
              color: "white",
              border: "none",
            }}
            icon={<MessageOutlined />}
          >
            Write To Us
          </Button>

          {/* Chat View Button */}
          <Button
            style={{
              backgroundColor: "#8e44ad",
              color: "white",
              border: "none",
            }}
            icon={<MdForum />}
            onClick={() =>
              navigate(`/taskmanagement/chatview/${record.radhaInstructionsId}`)
            }
          >
            Chat View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-xl font-bold mb-2 md:mb-0">Radha instructions</h2>
        <Button
          style={{ backgroundColor: "#1c84c6", color: "white" }}
          onClick={() => {
            setIsAddModalOpen(true);
            formAdd.resetFields(); // ✅ Clear form whenever opening Add Modal
          }}
        >
          Add Radha instructions
        </Button>
      </div>
      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <Input
          placeholder="Search by Header or Instruction"
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);

            if (!value) {
              setFilteredData(data);
              return;
            }

            const filtered = data.filter(
              (item) =>
                item.instructionHeader
                  ?.toLowerCase()
                  .includes(value.toLowerCase()) ||
                item.radhaInstructions
                  ?.toLowerCase()
                  .includes(value.toLowerCase())
            );

            setFilteredData(filtered);
          }}
          style={{ width: 300 }}
          allowClear
        />
      </div>
      {/* Table */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px", // adjust height as needed
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Table
          rowKey="radhaInstructionsId"
          dataSource={filteredData}
          columns={columns}
          bordered
          pagination={{ pageSize: 50 }}
          scroll={{ x: true }}
        />
      )}

      {/* Add Modal */}
      <Modal
        title="Add Admin Inputs"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={formAdd} onFinish={handleAddSave}>
          <Form.Item
            label="Instruction Header"
            name="instructionHeader"
            rules={[{ required: true, message: "Please enter header" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Instructions"
            name="instructions"
            rules={[{ required: true, message: "Please enter instructions" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Upload Document or Image (Optional)">
            <Upload
              beforeUpload={(file) => {
                setFile(file);
                return false;
              }}
              onRemove={() => setFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: "#1c84c6", color: "white" }}
              block
            >
              Save Instruction
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Admin Instruction"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleEditSave}
          form={formEdit}
          initialValues={{
            instructionHeader: editingRecord?.instructionHeader,
            instructions: editingRecord?.radhaInstructions,
          }}
          key={editingRecord?.radhaInstructionsId}
        >
          <Form.Item
            label="Instruction Header"
            name="instructionHeader"
            rules={[{ required: true, message: "Please enter header" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Instructions"
            name="instructions"
            rules={[{ required: true, message: "Please enter instructions" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: "#1c84c6", color: "white" }}
              block
            >
              Update Instruction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add Interaction"
        open={isInteractionModalOpen}
        onCancel={() => setIsInteractionModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={formInteraction}
          onFinish={handleInteractionSave}
        >
          <Form.Item
            label="Admin Conversation"
            name="employeeConversation"
            rules={[{ required: true, message: "Please enter conversation" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: "#1c84c6", color: "white" }}
              block
            >
              Save Interaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default AdminInstructions;
