import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Typography,
  Divider,
  Space,
  Tag,
  Tooltip,
  Upload,
  Progress,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SolutionOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskCreation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, uploaded, failed
  const [fileName, setFileName] = useState("");
  const [documentId, setDocumentId] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const userId = localStorage.getItem("userId"); // Default to "ADMIN" if not set
  // Get document ID from local storage
  // Enums as defined in your API
  const taskCreatedBy = {
    ADMIN: "ADMIN",
    USER: "USER",
  };

  // Updated available assignees with your provided names
  const availableAssignees = [
    { value: "VINOD", label: "VINOD", color: "purple" },
    { value: "NAVEEN", label: "NAVEEN", color: "orange" },
    { value: "SAIGADI", label: "SAIGADI", color: "blue" },
    { value: "VIJAY", label: "VIJAY", color: "green" },
    { value: "SRIDHAR", label: "SRIDHAR", color: "red" },
    { value: "GUNNA", label: "GUNNA", color: "cyan" },
    { value: "MANEIAH", label: "MANEIAH", color: "magenta" },
    { value: "HARIPRIYA", label: "HARIPRIYA", color: "lime" },
    { value: "NIHARIKA", label: "NIHARIKA", color: "gold" },
    { value: "SUDHEESH", label: "SUDHEESH", color: "volcano" },
    { value: "DIVYA", label: "DIVYA", color: "geekblue" },
    { value: "ANUSHA", label: "ANUSHA", color: "purple" },
    { value: "SAIKRISHNA", label: "SAIKRISHNA", color: "orange" },
    { value: "SREEJA", label: "SREEJA", color: "blue" },
    { value: "GUNNASANKAR", label: "GUNNASANKAR", color: "green" },
    { value: "HARIBABU", label: "HARIBABU", color: "red" },
    { value: "UDYA", label: "UDYA", color: "cyan" },
    { value: "GOPAL", label: "GOPAL", color: "magenta" },
    { value: "KARTHIK", label: "KARTHIK", color: "lime" },
    { value: "GHRISHMA", label: "GHRISHMA", color: "gold" },
    { value: "VARALAKSHMI", label: "VARALAKSHMI", color: "volcano" },
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      message.warning("Please select a file to upload.");
      return;
    }

    setFileName(file.name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "kyc");

    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/uploadTaskScreenShot?userId=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // Set document ID in state and save to local storage
      const docId = response.data.id;
      setDocumentId(docId);

      // Store in local storage with a timestamp
      localStorage.setItem("taskDocumentId", docId);
      localStorage.setItem("taskDocumentTimestamp", new Date().toISOString());
      localStorage.setItem("taskDocumentName", file.name);

      message.success("Document uploaded successfully!");
      setUploadStatus("uploaded");
    } catch (error) {
      console.error("Upload Error:", error);
      message.error({
        content:
          error.response?.data?.error || "An error occurred during upload",
      });

      setUploadStatus("failed");
    }
  };

  const createTask = async (values) => {
    setLoading(true);

    try {
      // Pass the assignees as an array instead of comma-separated string
      const taskData = {
        taskcreatedby: values.createdBy,
        admindocumentid: documentId,
        taskassingnedto: values.assignedTo, // Send as array ["NAVEEN", "DIVYA"]
        taskcontent: values.content,
      };

      const response = await axios.post(
        `${BASE_URL}/user-service/write/saveTask`,
        taskData
      );

      if (response.data.message === "Task Created Successfully") {
        message.success("Task created successfully!");

        // Clear form and reset states
        form.resetFields();
        setUploadStatus("idle");
        setFileName("");
        setDocumentId(null);
        setUploadProgress(0);

        // You may choose to keep or clear localStorage here
        // localStorage.removeItem('taskDocumentId');
      } else {
        message.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      message.error(
        "Failed to create task: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // For displaying selected assignee tags in the form
  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const assignee = availableAssignees.find((a) => a.value === value);
    const color = assignee ? assignee.color : "default";

    return (
      <Tag
        color={color}
        closable={closable}
        onClose={onClose}
        className="m-1 py-1 px-2"
      >
        <UserOutlined className="mr-1" />
        {label}
      </Tag>
    );
  };

  // Render upload status indicator
  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case "uploading":
        return (
          <div className="mt-2">
            <div className="flex items-center mb-1">
              <LoadingOutlined className="mr-2 text-blue-500" />
              <Text className="text-blue-500">Uploading: {fileName}</Text>
            </div>
            <Progress percent={uploadProgress} status="active" />
          </div>
        );
      case "uploaded":
        return (
          <div className="mt-2 flex items-center">
            <CheckCircleOutlined className="mr-2 text-green-500" />
            <Text className="text-green-500">
              Successfully uploaded: {fileName}
            </Text>
          </div>
        );
      case "failed":
        return (
          <div className="mt-2 flex items-center">
            <ExclamationCircleOutlined className="mr-2 text-red-500" />
            <Text className="text-red-500">Upload failed: {fileName}</Text>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <TaskAdminPanelLayout>
      <div className="p-2 sm:p-4 md:p-6">
        <Card className="shadow-md rounded-lg">
          <div className="mb-4">
            <Title level={3} className="flex items-center text-xl md:text-2xl">
              <SolutionOutlined className="mr-2" /> Create New Task
            </Title>
            <Text type="secondary" className="text-sm md:text-base">
              Assign tasks to team members and track their progress
            </Text>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={createTask}
            autoComplete="off"
            requiredMark="optional"
            className="mt-4"
          >
            <Form.Item
              name="content"
              label={
                <span className="flex items-center">
                  <FileTextOutlined className="mr-2" />
                  Task Description
                </span>
              }
              rules={[{ required: true, message: "Please enter task content" }]}
              tooltip="Provide a detailed description of the task"
            >
              <TextArea
                rows={6}
                placeholder="Enter detailed task description here..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="createdBy"
                  label={
                    <span className="flex items-center">
                      <UserOutlined className="mr-2" />
                      Created By
                    </span>
                  }
                  rules={[{ required: true, message: "Please select creator" }]}
                >
                  <Select
                    placeholder="Select creator role"
                    suffixIcon={<InfoCircleOutlined />}
                    className="w-full"
                  >
                    <Option value={taskCreatedBy.ADMIN}>
                      <Tag color="blue">Admin</Tag>
                    </Option>
                    <Option value={taskCreatedBy.USER}>
                      <Tag color="green">User</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="assignedTo"
                  label={
                    <span className="flex items-center">
                      <TeamOutlined className="mr-2" />
                      Assigned To
                      <Tooltip title="You can select up to 5 assignees">
                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one assignee",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.length > 5) {
                          return Promise.reject("Maximum 5 assignees allowed");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  help="Select up to 5 team members"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select team members"
                    tagRender={tagRender}
                    maxTagCount="responsive"
                    className="w-full"
                    showArrow
                  >
                    {availableAssignees.map((assignee) => (
                      <Option key={assignee.value} value={assignee.value}>
                        {assignee.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* File Upload Section */}
            <Card
              className="mb-4 bg-gray-50"
              size="small"
              title={
                <div className="flex items-center">
                  <UploadOutlined className="mr-2" />
                  <span>Attachment</span>
                </div>
              }
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadStatus === "uploading"}
                  />
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploadStatus === "uploading"}
                  >
                    Select File
                  </Button>
                </label>

                <div className="flex-grow">{renderUploadStatus()}</div>
              </div>
            </Card>

            <Form.Item className="mt-4">
              <Space className="flex flex-wrap gap-2">
                <Button
                  type="primary"
                  style={{ background: "#008CBA", color: "white" }}
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  className="min-w-[140px]"
                  disabled={uploadStatus === "uploading"}
                >
                  Create Task
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setUploadStatus("idle");
                    setFileName("");
                    setDocumentId(null);
                    setUploadProgress(0);
                  }}
                  size="large"
                  disabled={uploadStatus === "uploading"}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TaskCreation;
