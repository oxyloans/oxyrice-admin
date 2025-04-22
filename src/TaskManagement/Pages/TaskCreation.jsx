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
  Progress,
  Row,
  Col,
  Spin,
  DatePicker,
  Upload,
  Alert,
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
  ClockCircleOutlined,
  FlagOutlined,
  FileOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import BASE_URL from "../../AdminPages/Config";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const TaskCreation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, uploaded, failed
  const [fileName, setFileName] = useState("");
  const [documentId, setDocumentId] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploadProgress, setUploadProgress] = useState(0);
  const userId = localStorage.getItem("userId") || "ADMIN";

  // Enums as defined in your API
  const taskCreatedBy = {
    ADMIN: "ADMIN",
    USER: "USER",
  };

  // Priority options
  const priorityOptions = [
    { value: "HIGH", label: "HIGH" },
    { value: "MEDIUM", label: "MEDIUM" },
    { value: "LOW", label: "LOW" },
  ];

  // Status options
  const statusOptions = [
    { value: "NEW", label: "New", color: "blue" },
    { value: "IN_PROGRESS", label: "In Progress", color: "purple" },
    { value: "COMPLETED", label: "Completed", color: "green" },
    { value: "ON_HOLD", label: "On Hold", color: "orange" },
  ];

  // Color assignments for team members
  const colors = [
    "purple",
    "orange",
    "blue",
    "green",
    "red",
    "cyan",
    "magenta",
    "lime",
    "gold",
    "volcano",
    "geekblue",
  ];

  // Team member names
  const names = [
    "GRISHMA",
    "GUNA",
    "GUNASHEKAR",
    "SAIKUMAR",
    "SREEJA",
    "GADISAI",
    "GUTTISAI",
    "NARENDRA",
    "MANEIAH",
    "VARALAKSHMI",
    "VIJAY",
    "NIHARIKA",
    "HARIPRIYA",
    "VINODH",
    "NAVEEN",
    "SRIDHAR",
    "SUBBU",
    "UDAY",
    "HARIBABU",
    "SUDHEESH",
    "ANUSHA",
    "DIVYA",
    "KARTHIK",
    "RAMADEVI",
    "BHARGAV",
    "PRATHIBHA",
    "JYOTHI",
    "HEMA",
    "RAMYAHR",
    "SURESH",
    "SUCHITHRA",
    "ARUNA",
    "VENKATESH",
    "RAKESH",
    "JHON",
    "MOUNIKA",
    "VANDANA",
    "GOPAL",
    "ANUSHAACCOUNT",
    "RADHAKRISHNA",
    "MADHU",
    "RAVI",
    "SAMPATH",
    "CHANDU",
    "SWATHI",
    "SHANTHI",
  ];

  const availableAssignees = names.map((name, index) => ({
    value: name,
    label: name,
    color: colors[index % colors.length],
  }));
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
      setFileInputKey(Date.now());
    }
  };

  const createTask = async (values) => {
    setLoading(true);

    try {
      // Format the deadline date to ISO string if it exists
      const deadline = values.deadline ? values.deadline.toISOString() : null;

      // Prepare the task data with new fields
      const taskData = {
        taskcreatedby: values.createdBy,
        admindocumentid: documentId,
        taskassingnedto: values.assignedTo, // Array of assignees
        taskcontent: values.content,
        deadline: deadline,
        prioeity: values.priority,
      };

      const response = await axios.post(
        `${BASE_URL}/user-service/write/saveTask`,
        taskData
      );

      if (response.data.message === "Task Created Successfully") {
        message.success({
          content: "Task created successfully!",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });

        // Clear form and reset states
        form.resetFields();
        setUploadStatus("idle");
        setFileName("");
        setDocumentId(null);
        setUploadProgress(0);
      } else {
        message.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      message.error({
        content:
          "Failed to create task: " +
          (error.response?.data?.message || error.message),
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      });
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

  // Function to reset all upload state
  const resetUploadState = () => {
    setUploadStatus("idle");
    setFileName("");
    setDocumentId(null);
    setUploadProgress(0);
    setFileInputKey(Date.now());
  };

  // Function to delete the current upload
  const handleDeleteUpload = () => {
    resetUploadState();
    message.success({
      content: "Upload cleared successfully",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    });
  };

   const renderUploadStatus = () => {
     switch (uploadStatus) {
       case "uploading":
         return (
           <div className="w-full">
             <div className="flex items-center">
               <Spin size="small" className="mr-2" />
               <Text>{fileName}</Text>
             </div>
             <Progress
               percent={uploadProgress}
               size="small"
               status="active"
               strokeColor={{
                 "0%": "#108ee9",
                 "100%": "#87d068",
               }}
             />
           </div>
         );
       case "uploaded":
         return (
           <div className="flex items-center justify-between w-full">
             <div className="flex items-center">
               <FileOutlined className="mr-2 text-green-500" />
               <Text className="mr-2">{fileName}</Text>
               <Tag color="success" icon={<CheckCircleOutlined />}>
                 Uploaded Successfully
               </Tag>
             </div>
             <Button
               danger
               icon={<DeleteOutlined />}
               size="small"
               onClick={handleDeleteUpload}
               className="ml-2"
             >
               Clear
             </Button>
           </div>
         );
       case "failed":
         return (
           <div className="flex items-center justify-between w-full">
             <div className="flex items-center">
               <FileOutlined className="mr-2 text-red-500" />
               <Text className="mr-2">{fileName}</Text>
               <Tag color="error">Upload Failed</Tag>
             </div>
             <Button
               icon={<DeleteOutlined />}
               size="small"
               onClick={handleDeleteUpload}
               className="ml-2"
             >
               Clear
             </Button>
           </div>
         );
       default:
         return (
           <Text type="secondary" className="flex items-center">
             <PaperClipOutlined className="mr-2" />
             No file selected
           </Text>
         );
     }
   };


  return (
    <TaskAdminPanelLayout>
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg rounded-lg border-0">
          <div className="mb-6">
            <Title
              level={3}
              className="flex items-center text-xl md:text-2xl mb-2"
            >
              <SolutionOutlined className="mr-3 text-blue-600" /> Create New
              Task
            </Title>
            <Text type="secondary" className="text-sm md:text-base">
              Create and assign tasks to team members with priorities and
              deadlines
            </Text>
          </div>

          <Divider className="my-4" />

          <Form
            form={form}
            layout="vertical"
            onFinish={createTask}
            autoComplete="off"
            requiredMark="optional"
            className="mt-6"
            initialValues={{
              createdBy: taskCreatedBy.ADMIN,
            }}
          >
            {/* Task Description */}
            <Form.Item
              name="content"
              label={
                <span className="flex items-center text-base">
                  <FileTextOutlined className="mr-2 text-blue-500" />
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
                maxLength={10000}
                className="rounded-md"
              />
            </Form.Item>

            <Row gutter={[24, 16]} className="mt-4">
              {/* First row with Creator and Assignees */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="createdBy"
                  label={
                    <span className="flex items-center">
                      <UserOutlined className="mr-2 text-green-500" />
                      Created By
                    </span>
                  }
                  rules={[{ required: true, message: "Please select creator" }]}
                >
                  <Select
                    placeholder="Select creator role"
                    suffixIcon={<InfoCircleOutlined />}
                    className="w-full rounded-md"
                    size="large"
                  >
                    <Option value={taskCreatedBy.ADMIN}>ADMIN</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="assignedTo"
                  label={
                    <span className="flex items-center">
                      <TeamOutlined className="mr-2 text-purple-500" />
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
                    className="w-full rounded-md"
                    showArrow
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    listHeight={300}
                  >
                    {availableAssignees.map((assignee) => (
                      <Option key={assignee.value} value={assignee.value}>
                        {assignee.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Second row with Deadline and Priority */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="deadline"
                  label={
                    <span className="flex items-center">
                      <CalendarOutlined className="mr-2 text-orange-500" />
                      Deadline
                    </span>
                  }
                  // rules={[
                  //   { required: true, message: "Please select a deadline" },
                  // ]}
                  tooltip="Set a deadline for this task"
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Select deadline"
                    className="w-full rounded-md"
                    disabledDate={(current) => current && current < Date.now()}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="priority"
                  label={
                    <span className="flex items-center">
                      <FlagOutlined className="mr-2 text-red-500" />
                      Priority
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a priority" },
                  ]}
                  tooltip="Set the task priority"
                >
                  <Select
                    placeholder="Select priority"
                    className="w-full rounded-md"
                    size="large"
                  >
                    {priorityOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <div className="flex items-center">{option.label}</div>
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
                  <span>Attachment (optional)</span>
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
                    key={fileInputKey}
                  />
                </label>

                <div className="flex-grow">{renderUploadStatus()}</div>
              </div>
            </Card>
            {/* <Card
              className="mb-6 mt-4 bg-gray-50 shadow border border-gray-200"
              bordered={false}
              title={
                <div className="flex items-center">
                  <UploadOutlined className="mr-2 text-blue-500" />
                  <span>Task Attachment</span>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <Dragger
                  {...uploadProps}
                  className="bg-white border-dashed border-2 border-gray-300 rounded-lg"
                  disabled={uploadStatus === "uploading"}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined className="text-blue-500 text-3xl" />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint text-gray-500">
                    Support for a single file upload. Please upload relevant
                    task documents only.
                  </p>
                </Dragger>

                {uploadStatus !== "idle" && (
                  <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                    {renderUploadStatus()}
                  </div>
                )}
              </div>
            </Card> */}

            {/* Action Buttons */}
            <Form.Item className="mt-6">
              <Space className="flex flex-wrap justify-between w-full">
                <Space className="flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                    className="min-w-[140px] bg-[#008CBA] hover:bg-[#008CBA]"
                    disabled={uploadStatus === "uploading"}
                  >
                    Create Task
                  </Button>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      resetUploadState();
                    }}
                    size="large"
                    icon={<ReloadOutlined />}
                    disabled={uploadStatus === "uploading"}
                  >
                    Reset
                  </Button>
                </Space>

                {documentId && (
                  <Tag
                    color="blue"
                    icon={<InfoCircleOutlined />}
                    className="px-3 py-1"
                  >
                    Document ID: {documentId}
                  </Tag>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TaskCreation;
