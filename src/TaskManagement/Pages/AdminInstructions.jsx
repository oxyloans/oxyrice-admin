import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  message,
  Space,
  Form,
  Input,
  Button,
  Upload,
  Modal,
  Select,
  Tooltip,
} from "antd";
import { UploadOutlined, MessageOutlined } from "@ant-design/icons";
import { MdModeEditOutline, MdForum } from "react-icons/md";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
const AdminInstructions = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
const [selectedDept, setSelectedDept] = useState(null);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [formInteraction] = Form.useForm();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [interactionRecord, setInteractionRecord] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const adminUserId = localStorage.getItem("userId");

  const API_URL = `${BASE_URL}/user-service/write/getAdminUserId?adminUserId=${adminUserId}`;
  const SAVE_API = `${BASE_URL}/user-service/write/radhaInstructions`;
  const UPLOAD_API = `${BASE_URL}/user-service/write/uploadRadhaFiles`;
  const INTERACTION_API = `${BASE_URL}/user-service/write/radhaInteractions`;

  // ✅ Fetch instructions
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => {
          const dateA = new Date(
            a.radhaUpdateDate || a.radhaInstructeddate
          ).getTime();
          const dateB = new Date(
            b.radhaUpdateDate || b.radhaInstructeddate
          ).getTime();
          return dateB - dateA;
        });
        setData(sortedData);
        setFilteredData(sortedData);
      } else {
        message.warning("Unexpected response format");
      }
    } catch {
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

  // ✅ Upload multiple files after instruction is created
  const uploadFiles = async (instructionId) => {
    if (!fileList.length) return;

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file.originFileObj);
    });

    await axios.post(
      `${UPLOAD_API}?fileType=kyc&instructionId=${instructionId}&userId=${adminUserId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  };

  // ✅ Add new instruction
  const handleAddSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        adminUserId,
        instructionHeader: values.instructionHeader,
        instructions: values.instructions,
        department: values.department, // added
        employeesName: values.employeesName, // added
      };

      // First save instruction
      const resp = await axios.patch(SAVE_API, payload);

      if (resp.data?.radhaInstructionsId) {
        // If user uploaded files, upload them linked to instructionId
        if (fileList.length > 0) {
          await uploadFiles(resp.data.radhaInstructionsId);
        }
        message.success("Instruction added successfully!");
      }

      fetchData();
      setIsAddModalOpen(false);
      formAdd.resetFields();
      setFileList([]);
    } catch (err) {
      message.error("Failed to save instruction");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Edit instruction
  const handleEditSave = async (values) => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      const payload = {
        instructionHeader: values.instructionHeader,
        instructions: values.instructions,
        department: values.department, // added
        employeesName: values.employeesName, // added
        radhaInstructionsId: editingRecord.radhaInstructionsId,
      };

      // First update instruction
      const resp = await axios.patch(SAVE_API, payload);

      // ✅ If user uploaded new files, upload them linked to instructionId
      if (resp.data?.radhaInstructionsId && fileList.length > 0) {
        await uploadFiles(resp.data.radhaInstructionsId);
      }
      message.success("Instruction updated successfully!");
      fetchData();
      setIsEditModalOpen(false);
      setEditingRecord(null);
      formEdit.resetFields();
      setFileList([]); // clear file list after save
    } catch {
      message.error("Failed to update instruction");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save interaction
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
    } catch {
      message.error("Failed to save interaction");
    } finally {
      setSaving(false);
    }
  };

  const formatDateIST = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toLocaleString("en-IN", { hour12: true });
  };
const DEPARTMENT_EMPLOYEES = {
  SALESTEAM: ["Ravi", "Suresh", "Jhanisha"],
  BACKENDTEAM: [
    "Vinod",
    "Naveen",
    "Sridhar",
    "Vijay",
    "SaiKumar",
    "Anushak",
    "Sudeesh",
  ],
  FRONTENDTEAM: [
    "Maneiah",
    "Gopal",
    "HariBabu",
    "VaraLakshmi",
    "SaiKrishna",
    "Sreeja",
    "Niharika",
  ],
  ACCOUNTSTEAM: ["Anusha", "Subbu", "Mounika"],
  MANAGEMENTTEAM: ["Radha", "Rama", "Narendra"],
  TESTINGTEAM: ["Guna", "Grishma", "Divya"],
  HRTEAM: ["Ramya"],
};

  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1, align: "center" },
    // {
    //   title: "Admin User ID",
    //   dataIndex: "adminUserId",
    //   align: "center",
    //   render: (text) => (text ? `#${text.slice(-4)}` : "-"),
    // },
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
    {
      title: "Instructions",
      dataIndex: "radhaInstructions",
      align: "center",
      render: (text) => (
        // <Tooltip title={text}>
        <div
          style={{
            maxWidth: 250,
            textAlign: "center",
            display: "-webkit-box",

            WebkitBoxOrient: "vertical",
            maxHeight: 110, // limit height
            overflowX: "auto", // horizontal scroll
          }}
        >
          {text}
        </div>
        // </Tooltip>
      ),
    },
    {
      title: "Employee Names",
      dataIndex: "employeesName",
      align: "center",
      width: 160,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: 140,
              maxHeight: 80, // limit height
              overflowX: "auto", // horizontal scroll
            }}
          >
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },

    {
      title: "Created/Updated",
      dataIndex: "radhaInstructeddate", // Use one as primary dataIndex, but render will access both
      align: "center",
      render: (text, record) => (
        <div style={{ textAlign: "left" }}>
          <div><span style={{ fontWeight: "400" }}>Created: </span>{formatDateIST(record.radhaInstructeddate)}</div>
          <div><span style={{ fontWeight: "400" }}>Updated: </span>{formatDateIST(record.radhaUpdateDate)}</div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space align="center" size="middle">
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
          {/* <Button
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
          </Button> */}
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
        <h2 className="text-xl font-bold mb-2 md:mb-0">Radha Instructions</h2>
        <Button
          style={{ backgroundColor: "#1c84c6", color: "white" }}
          onClick={() => {
            setIsAddModalOpen(true);
            formAdd.resetFields();
            setFileList([]);
          }}
        >
          Add Radha Instructions
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Input
          placeholder="Search by Header or Instruction"
          value={searchText}
          prefix={<SearchOutlined style={{ color: "#aaa" }} />}
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
        <div className="flex justify-center items-center h-[200px]">
          <Spin size="medium" />
        </div>
      ) : (
        <Table
          rowKey="radhaInstructionsId"
          dataSource={filteredData}
          columns={columns}
          bordered
          pagination={{ pageSize: 20 }}
          scroll={{ x: true }}
        />
      )}

      {/* Add Modal */}
      <Modal
        title="Add Radha instructions"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          formAdd.resetFields();
          setFileList([]);
        }}
        footer={null}
      >
        <Form layout="vertical" form={formAdd} onFinish={handleAddSave}>
          <Form.Item
            label="Instruction Header"
            name="instructionHeader"
            rules={[
              { required: true, message: "Please enter instruction header" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Instructions"
            name="instructions"
            rules={[
              { required: true, message: "Please enter instructions" },
              { max: 5000, message: "Maximum 5000 characters allowed" },
            ]}
          >
            <Input.TextArea rows={6} showCount maxLength={5000} />
          </Form.Item>
          <Form.Item
            label="Departments"
            name="department"
            rules={[
              {
                required: true,
                message: "Please select at least one department",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select Departments"
              onChange={(values) => {
                setSelectedDept(values);
                formAdd.setFieldsValue({ employeesName: undefined }); // reset employees
              }}
            >
              {Object.keys(DEPARTMENT_EMPLOYEES).map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept.replace("TEAM", " Team")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Employee Names"
            name="employeesName"
            rules={[{ required: true, message: "Please select employees" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select Employees"
              disabled={!selectedDept?.length}
            >
              {selectedDept?.flatMap((dept) =>
                DEPARTMENT_EMPLOYEES[dept]?.map((emp) => (
                  <Select.Option key={`${dept}-${emp}`} value={emp}>
                    {emp}
                  </Select.Option>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Upload one or more documents or images (optional).">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList((prev) => [
                  ...prev,
                  {
                    uid: String(Date.now()),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                  },
                ]);
                return false; // prevent auto upload
              }}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
              }}
            >
              <Button icon={<UploadOutlined />}>Select Files</Button>
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
        onCancel={() => {
          setIsEditModalOpen(false);
          formEdit.resetFields();
          setFileList([]);
          setSelectedDept(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleEditSave}
          form={formEdit}
          initialValues={{
            instructionHeader: editingRecord?.instructionHeader,
            instructions: editingRecord?.radhaInstructions,
            department: editingRecord?.department,
            employeesName: editingRecord?.employeesName,
          }}
          key={editingRecord?.radhaInstructionsId}
        >
          <Form.Item
            label="Instruction Header"
            name="instructionHeader"
            rules={[
              { required: true, message: "Please enter instruction header" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Instructions"
            name="instructions"
            rules={[
              { required: true, message: "Please enter instructions" },
              { max: 5000, message: "Maximum 5000 characters allowed" },
            ]}
          >
            <Input.TextArea rows={6} showCount maxLength={5000} />
          </Form.Item>

          <Form.Item
            label="Departments"
            name="department"
            rules={[
              {
                required: true,
                message: "Please select at least one department",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select Departments"
              onChange={(values) => {
                setSelectedDept(values);
                formAdd.setFieldsValue({ employeesName: undefined }); // reset employees
              }}
            >
              {Object.keys(DEPARTMENT_EMPLOYEES).map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept.replace("TEAM", " Team")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Employee Names"
            name="employeesName"
            rules={[{ required: true, message: "Please select employees" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select Employees"
              disabled={!selectedDept?.length}
            >
              {selectedDept?.flatMap((dept) =>
                DEPARTMENT_EMPLOYEES[dept]?.map((emp) => (
                  <Select.Option key={`${dept}-${emp}`} value={emp}>
                    {emp}
                  </Select.Option>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Upload one or more documents or images (optional).">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList((prev) => [
                  ...prev,
                  {
                    uid: String(Date.now()),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                  },
                ]);
                return false; // prevent auto upload
              }}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
              }}
            >
              <Button icon={<UploadOutlined />}>Select Files</Button>
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
              Update Instruction
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Interaction Modal */}
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


