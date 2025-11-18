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
  FlagOutlined,
  BankOutlined,
  ProjectOutlined,
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
  const [fileList, setFileList] = useState([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);
  const [businessUnitSubType, setBusinessUnitSubType] = useState(null);

  // Enums as defined in your API
  const taskCreatedBy = {
    ADMIN: "ADMIN",
    USER: "USER",
  };
  const businessUnitMainOptions = [
    { value: "FREELANCERS", label: "Freelancers", color: "purple" },
    { value: "EMPLOYEES", label: "Employees", color: "green" },
  ];

  // Business Unit Type sub-options
  const businessUnitSubOptions = {
    FREELANCERS: [
      { value: "PAID", label: "Paid", color: "red" },
      { value: "OTHERS", label: "Others", color: "orange" },
    ],
    EMPLOYEES: [
      { value: "OWNED", label: "Owned", color: "blue" },
      { value: "OTHERS", label: "Others", color: "orange" },
    ],
  };

  // Project Type options
  const projectTypeOptions = [
    { value: "ASKOXY", label: "AskOxy", color: "blue" },
    { value: "STUDENTX", label: "StudentX", color: "green" },
    { value: "OXYLOANS", label: "OxyLoans", color: "orange" },
    { value: "OXYBRICKS", label: "OxyBricks", color: "red" },
    { value: "BVMMONEY", label: "BVM Money", color: "purple" },
  ];

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
    "akhila u",
    "Anusha",
    "Anusha Kowthavarapu",
    "Arla Aruna Jyothi",
    "Bhargav.M",
    "Darelli nagarani",
    "Darelli nagarani",
    "Dasi srilekha",
    "Dharmapuri Sai Krishna",
    "Divya",
    "Divyajyothi",
    "GOPALA KRISHNA MALLEBOINA",
    "Grishma",
    "Gudelli Gunashekar",
    "Gudelli Jhansi Rani",
    "Gutti Sai Kumar",
    "g venkata karthik",
    "Haribabu",
    "Haripriya Yerreddula",
    "Hemalatha",
    "Kandhikatla Ram kumar",
    "Krovi vamsi",
    "Labhishetty Sreeja",
    "M Vinod",
    "varalakshmi",
    "Maneiah",
    "T.Tejaswini Reddy",
    "Manikanta",
    "Matta madhu venkata durga prasad",
    "Megha",
    "Mounika",
    "Narendra Kumar Balijepalli",
    "Nava Jyothi Pattedi",
    "Naveen Pairala",
    "Niharika Pokuri",
    "Pragada Satya Madhavi",
    "Prameela Kovvali",
    "Prathibha",
    "Raga Ramya",
    "Ramadevi",
    "Ramesh Reddy",
    "RANGASAI",
    "Ravikiran s",
    "Sagarla suresh",
    "Sai Kumar Gadi",
    "Saikarthik Rathod",
    "sandhya",
    "Satyasri",
    "Shanthi",
    "Siddu venkata shiva narayana reddy",
    "Srilekha Kailasapu",
    "sridhar",
    "SUBASH SURE",
    "sudheesh",
    "swathi",
    "thulasi",
    "thulasiboda",

    "Uday Reddy",
    "UMA MAHESH",
    "Vandanapu Indu",

    "Varre venkat",
    "Varre venkat",
    "vijay dasari",
    "Vishnu",
    "Vishwateja Dharmapuri",
    "Zubeidha Begum",
  ];

  const availableAssignees = names.map((name, index) => ({
    value: name,
    label: name,
    color: colors[index % colors.length],
  }));
  // File upload handler
  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    fileList,
    beforeUpload: (file) => {
      const isSizeValid = file.size / 1024 / 1024 < 10; // 10MB limit
      if (!isSizeValid) {
        message.error("File must be smaller than 10MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      setUploadStatus("uploading");
      setFileName(file.name);
      setUploadProgress(0);

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
              onProgress({ percent: percentCompleted });
            },
          }
        );

        const docId = response.data.id;
        setDocumentId(docId);
        setFileList([{ uid: "-1", name: file.name, status: "done" }]);
        localStorage.setItem("taskDocumentId", docId);
        localStorage.setItem("taskDocumentTimestamp", new Date().toISOString());
        localStorage.setItem("taskDocumentName", file.name);

        message.success("Document uploaded successfully!");
        setUploadStatus("uploaded");
        onSuccess(response.data);
      } catch (error) {
        console.error("Upload Error:", error);
        message.error(error.response?.data?.error || "Upload failed");
        setUploadStatus("failed");
        setFileList([{ uid: "-1", name: file.name, status: "error" }]);
        onError(error);
      }
    },
    onRemove: () => {
      setUploadStatus("idle");
      setFileName("");
      setDocumentId(null);
      setFileList([]);
      setUploadProgress(0);
      message.success("File removed successfully");
      return true;
    },
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
        taskname: values.taskname,
        businessUnitType: businessUnitSubType || selectedBusinessUnit, // Use sub-type if available, otherwise main type
        projectType: values.projectType, // New field
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

  const resetForm = () => {
    form.resetFields();
    setUploadStatus("idle");
    setFileName("");
    setDocumentId(null);
    setFileList([]);
    setUploadProgress(0);
    setSelectedBusinessUnit(null);
    setBusinessUnitSubType(null);
  };
  // Handle business unit type change
  const handleBusinessUnitChange = (value) => {
    setSelectedBusinessUnit(value);
    setBusinessUnitSubType(null);
    form.setFieldsValue({ businessUnitSubType: undefined });
  };

  // Handle business unit sub-type change
  const handleBusinessUnitSubTypeChange = (value) => {
    setBusinessUnitSubType(value);
  };

  return (
    <TaskAdminPanelLayout>
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <Card className=" border-0">
          <div className="mb-6">
            <Title
              level={3}
              className="flex items-center text-xl md:text-2xl mb-2"
            >
              <SolutionOutlined className="mr-3 text-blue-600" />
              Create New Task
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
            <Form.Item
              name="taskname"
              label={
                <span className="flex items-center text-base">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  Task Name<span className="text-red-500 ml-1">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter task name" }]}
              // tooltip="Provide a detailed description of the task"
            >
              <Input
                placeholder="Enter task description here..."
                maxLength={10000}
                className="rounded-md"
              />
            </Form.Item>
            {/* Task Description */}
            <Form.Item
              name="content"
              label={
                <span className="flex items-center text-base">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  Task Description<span className="text-red-500 ml-1">*</span>
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
              {/* Business Unit Type and Sub-Type */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessUnitType"
                  label={
                    <span className="flex items-center">
                      <BankOutlined className="mr-2 text-cyan-500" />
                      Business Unit Type
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select business unit type",
                    },
                  ]}
                  tooltip="Select the main business unit type"
                >
                  <Select
                    placeholder="Select business unit type"
                    className="w-full rounded-md"
                    size="large"
                    onChange={handleBusinessUnitChange}
                  >
                    {businessUnitMainOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Tag color={option.color} className="mr-2">
                            {option.label}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="businessUnitSubType"
                  label={
                    <span className="flex items-center">
                      <BankOutlined className="mr-2 text-teal-500" />
                      Business Unit Sub-Type
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select business unit sub-type",
                    },
                  ]}
                  tooltip="Select the specific sub-type based on your business unit selection"
                >
                  <Select
                    placeholder={
                      selectedBusinessUnit
                        ? `Select ${selectedBusinessUnit.toLowerCase()} sub-type`
                        : "First select business unit type"
                    }
                    className="w-full rounded-md"
                    size="large"
                    disabled={!selectedBusinessUnit}
                    onChange={handleBusinessUnitSubTypeChange}
                  >
                    {selectedBusinessUnit &&
                      businessUnitSubOptions[selectedBusinessUnit]?.map(
                        (option) => (
                          <Option key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <Tag color={option.color} className="mr-2">
                                {option.label}
                              </Tag>
                            </div>
                          </Option>
                        )
                      )}
                  </Select>
                </Form.Item>
              </Col>

              {/* Project Type */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="projectType"
                  label={
                    <span className="flex items-center">
                      <ProjectOutlined className="mr-2 text-indigo-500" />
                      Project Type<span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select project type" },
                  ]}
                  tooltip="Select the project type for this task"
                >
                  <Select
                    placeholder="Select project type"
                    className="w-full rounded-md"
                    size="large"
                  >
                    {projectTypeOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Tag color={option.color} className="mr-2">
                            {option.label}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Creator and Assignees */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="createdBy"
                  label={
                    <span className="flex items-center">
                      <UserOutlined className="mr-2 text-green-500" />
                      Created By<span className="text-red-500 ml-1">*</span>
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
                      Assigned To<span className="text-red-500 ml-1">*</span>
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

              {/* Deadline and Priority */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="deadline"
                  label={
                    <span className="flex items-center">
                      <CalendarOutlined className="mr-2 text-orange-500" />
                      Deadline
                    </span>
                  }
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
                      Priority<span className="text-red-500 ml-1">*</span>
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

              <Col xs={24}>
                <Card
                  className="mb-4 bg-gray-50 border-gray-200"
                  size="small"
                  title={
                    <div className="flex items-center text-base font-medium">
                      <UploadOutlined className="mr-2 text-blue-600" />
                      Attachment (optional)
                    </div>
                  }
                >
                  <Upload.Dragger
                    {...uploadProps}
                    className="rounded-lg bg-white"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined className="text-blue-500 text-2xl" />
                    </p>
                    <p className="ant-upload-text text-sm sm:text-base">
                      Click or drag file to upload
                    </p>
                    <p className="ant-upload-hint text-xs sm:text-sm text-gray-500">
                      Supports PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB)
                    </p>
                  </Upload.Dragger>
                  {uploadStatus === "uploading" && (
                    <Progress
                      percent={uploadProgress}
                      size="small"
                      status="active"
                      strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                      className="mt-2"
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Form.Item className="mt-6">
              <Space className="flex flex-wrap justify-between w-full">
                <Space className="flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                    className="min-w-[140px] bg-blue-600 hover:bg-blue-700 rounded-lg"
                    disabled={uploadStatus === "uploading"}
                  >
                    Create Task
                  </Button>
                  <Button
                    onClick={resetForm}
                    size="large"
                    icon={<ReloadOutlined />}
                    className="rounded-lg border-gray-300 hover:border-blue-500"
                    disabled={uploadStatus === "uploading"}
                  >
                    Reset
                  </Button>
                </Space>
                {documentId && (
                  <Tag
                    color="blue"
                    icon={<InfoCircleOutlined />}
                    className="px-3 py-1 rounded-full"
                  >
                    Document ID: {documentId}
                  </Tag>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <style >{`
        .ant-form-item-label > label {
          font-weight: 500;
          color: #374151;
        }
        .ant-input,
        .ant-select-selector,
        .ant-picker {
          border-radius: 8px !important;
          border-color: #d1d5db !important;
          transition: all 0.3s ease;
        }
        .ant-input:focus,
        .ant-select-selector:focus,
        .ant-picker-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        .ant-btn-primary {
          transition: background-color 0.3s ease;
        }
        .ant-upload-drag {
          border: 2px dashed #d1d5db !important;
          background: #f9fafb !important;
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }
        .ant-upload-drag:hover {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }
        @media (max-width: 640px) {
          .ant-form-item {
            margin-bottom: 16px !important;
          }
          .ant-btn {
            width: 100%;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default TaskCreation;

