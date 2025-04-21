import React, { useState, useEffect, useCallback } from "react";
import TaskAdminPanelLayout from "../Layout/AdminPanel.jsx";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config.jsx";
import {
  Card,
  Typography,
  Select,
  Button,
  Spin,
  Empty,
  Divider,
  DatePicker,
  Tabs,
  Badge,
  notification,
  Tag,
  Avatar,
  Collapse,
  Modal,
  Form,
  Input,
  Tooltip,
  Space,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  UserOutlined,
  MessageOutlined,
  FileTextOutlined,
  DownOutlined,
  CommentOutlined,
  SendOutlined,
  TeamOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Search } = Input;

// Custom styles for consistent buttons
const buttonStyle = {
  width: "120px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const TaskManagement = () => {
  // State variables
  const [status, setStatus] = useState("COMPLETED");
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form] = Form.useForm();

  // State for sorting and searching
  const [sortField, setSortField] = useState("planCreatedAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [searchText, setSearchText] = useState("");

  // State for task statistics specific to selected date
  const [dateTaskStats, setDateTaskStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
    date: null,
  });

  // Fetch user ID on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Sort and filter tasks
  useEffect(() => {
    if (tasks.length > 0) {
      let result = [...tasks];

      // Apply search filter
      if (searchText) {
        const normalizedSearchText = searchText.toLowerCase();
        result = result.filter((task) => {
          return (
            // Search in task content
            (task.planOftheDay &&
              task.planOftheDay.toLowerCase().includes(normalizedSearchText)) ||
            (task.endOftheDay &&
              task.endOftheDay.toLowerCase().includes(normalizedSearchText)) ||
            // Search in assignee name
            (task.taskAssignTo &&
              task.taskAssignTo.toLowerCase().includes(normalizedSearchText)) ||
            // Search in assigner name
            (task.taskAssignedBy &&
              task.taskAssignedBy.toLowerCase().includes(normalizedSearchText))
          );
        });
      }

      // Apply sorting
      result.sort((a, b) => {
        let valueA, valueB;

        // Handle different field types
        if (sortField === "planCreatedAt" || sortField === "planUpdatedAt") {
          valueA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
          valueB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        } else if (
          sortField === "taskAssignTo" ||
          sortField === "taskAssignedBy"
        ) {
          valueA = (a[sortField] || "").toLowerCase();
          valueB = (b[sortField] || "").toLowerCase();
        } else {
          valueA = a[sortField];
          valueB = b[sortField];
        }

        // Apply sort order
        if (sortOrder === "ascend") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });

      setFilteredTasks(result);
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, sortField, sortOrder, searchText]);

  // Notification helpers
  const showNotification = (type, message, description, icon) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: type === "error" ? 4 : 3,
      icon: icon,
    });
  };

  // API call to fetch tasks by date
  const fetchTasksByDate = useCallback(async () => {
    if (!selectedDate) {
      showNotification("warning", "Missing Date", "Please select a date.");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      const response = await axios.post(
        `${BASE_URL}/user-service/write/get-task-by-date`,
        {
          taskStatus: status,
          specificDate: formattedDate,
        },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      setTasks(response.data);

      // Update task statistics based on the fetched data
      const taskCount = response.data.length || 0;

      // Fetch the opposite status count for complete statistics
      const oppositeStatus = status === "COMPLETED" ? "PENDING" : "COMPLETED";
      const oppositeResponse = await axios.post(
        `${BASE_URL}/user-service/write/get-task-by-date`,
        {
          taskStatus: oppositeStatus,
          specificDate: formattedDate,
        },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const oppositeCount = oppositeResponse.data.length || 0;

      // Update date task stats
      setDateTaskStats({
        pending: status === "PENDING" ? taskCount : oppositeCount,
        completed: status === "COMPLETED" ? taskCount : oppositeCount,
        total: taskCount + oppositeCount,
        date: selectedDate.toDate(),
      });

      if (response.data.length === 0) {
        showNotification(
          "info",
          "No Tasks Found",
          `No ${status.toLowerCase()} tasks found for ${formattedDate}.`,
          <FileSearchOutlined style={{ color: "#1890ff" }} />
        );
      } else {
        showNotification(
          "success",
          "Tasks Found",
          `Found ${response.data.length} tasks for ${formattedDate}.`,
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        );
      }
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      showNotification(
        "error",
        "Fetch Failed",
        "Failed to fetch tasks. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, status]);

  // Admin comment submission
  const handleCommentSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmittingComment(true);

      // Prepare the payload for the API
      const payload = {
        adminDescription: values.adminComment,
        id: currentTask.id,
        taskStatus: "PENDING", // Only for PENDING tasks
        userId: currentTask.userId,
      };

      // Call the API to update the task with admin comments
      const response = await axios.patch(
        `${BASE_URL}/user-service/write/userTaskUpdate`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        showNotification(
          "success",
          "Feedback Added",
          "Your feedback has been submitted successfully.",
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        );

        // Refresh the task list
        fetchTasksByDate();

        // Close the modal
        setCommentModalVisible(false);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      showNotification(
        "error",
        "Submission Failed",
        "Failed to add feedback. Please try again."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // Event handlers
  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSortChange = (field) => {
    // If clicking the same field, toggle order. Otherwise, set new field with descending order
    if (field === sortField) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortField(field);
      setSortOrder("descend"); // Default to descending
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const openCommentModal = (task) => {
    setCurrentTask(task);
    setCommentModalVisible(true);
    form.resetFields();
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // UI Components
  const renderSortButton = (field, label) => (
    <Button
      type={sortField === field ? "primary" : "default"}
      size="small"
      onClick={() => handleSortChange(field)}
      className={sortField === field ? "bg-blue-500 hover:bg-blue-600" : ""}
      icon={
        sortField === field &&
        (sortOrder === "ascend" ? (
          <SortAscendingOutlined />
        ) : (
          <SortDescendingOutlined />
        ))
      }
    >
      {label}
    </Button>
  );

  const renderPendingResponses = (responses) => {
    if (!responses || responses.length === 0) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <DownOutlined rotate={isActive ? 180 : 0} />
          )}
          className="bg-transparent"
          defaultActiveKey={["1"]} // Auto-expand the panel
        >
          <Panel
            header={
              <div className="flex items-center text-blue-600">
                <MessageOutlined className="mr-2" />
                <Text strong>Task History ({responses.length})</Text>
              </div>
            }
            key="1"
            className="bg-white rounded-md mb-2 shadow-sm"
          >
            {responses.map((response) => (
              <Card
                key={response.id}
                className={`mb-3 border-l-4 ${
                  response.updateBy === "ADMIN"
                    ? "border-l-blue-400"
                    : "border-l-green-400"
                }`}
                size="small"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* For user updates, show pendingEod */}
                  {response.updateBy !== "ADMIN" && response.pendingEod && (
                    <div>
                      <Text className="text-gray-600 block mb-1">
                        User Update:
                      </Text>
                      <Text className="text-gray-800 bg-green-50 p-2 rounded block">
                        {response.pendingEod}
                      </Text>
                    </div>
                  )}

                  {/* For admin updates, show adminDescription */}
                  {response.updateBy === "ADMIN" &&
                    response.adminDescription && (
                      <div>
                        <Text className="text-gray-600 block mb-1">
                          Admin Feedback:
                        </Text>
                        <Text className="text-gray-800 bg-blue-50 p-2 rounded block">
                          {response.adminDescription}
                        </Text>
                      </div>
                    )}

                  <div>
                    <div className="flex justify-between">
                      <div>
                        <Text className="text-gray-600 block mb-1">
                          Updated By:
                        </Text>
                        <Tag
                          color={
                            response.updateBy === "ADMIN" ? "blue" : "green"
                          }
                        >
                          {response.updateBy}
                        </Tag>
                      </div>
                      <div>
                        <Text className="text-gray-600 block mb-1">
                          Created At:
                        </Text>
                        <Text className="text-gray-800">
                          {formatDate(response.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>

                {response.adminFilePath && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <FileTextOutlined className="text-blue-500 mr-2" />
                      <a
                        href={response.adminFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {response.adminFileName || "View Attachment"}
                      </a>
                      <Text className="text-xs text-gray-500 ml-3">
                        {response.adminFileCreatedDate
                          ? formatDate(response.adminFileCreatedDate)
                          : ""}
                      </Text>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </Panel>
        </Collapse>
      </div>
    );
  };

  const renderAdminCommentsBox = (task) => {
    if (task.taskStatus !== "PENDING") return null;

    // Extract admin comments from pendingUserTaskResponse if they exist
    let adminComments = task.adminDescription || null;

    // Check pendingUserTaskResponse array for admin comments
    if (
      task.pendingUserTaskResponse &&
      task.pendingUserTaskResponse.length > 0
    ) {
      // Try to find a non-empty adminDescription
      const adminResponseWithDesc = task.pendingUserTaskResponse.find(
        (resp) =>
          resp.adminDescription &&
          resp.adminDescription.trim() !== "" &&
          resp.updateBy === "ADMIN"
      );

      if (adminResponseWithDesc) {
        adminComments = adminResponseWithDesc.adminDescription;
      }
    }

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <Text strong className="text-blue-700">
            <CommentOutlined className="mr-2" />
            Admin Comments
          </Text>
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => openCommentModal(task)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Add Comment
          </Button>
        </div>

        {adminComments ? (
          <div className="bg-white p-3 rounded-md border border-blue-100">
            <Text className="whitespace-pre-wrap text-gray-700">
              {adminComments}
            </Text>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-md border border-blue-100 text-center">
            <Text className="text-gray-500">
              No admin comments yet. Click "Add Comment" to provide feedback.
            </Text>
          </div>
        )}
      </div>
    );
  };

  const renderTaskCard = (task) => (
    <Card
      key={task.id}
      className="mb-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      headStyle={{
        backgroundColor:
          task.taskStatus === "COMPLETED" ? "#f6ffed" : "#fff7e6",
        borderBottom: `1px solid ${
          task.taskStatus === "COMPLETED" ? "#b7eb8f" : "#ffe58f"
        }`,
        borderRadius: "8px 8px 0 0",
        padding: "12px 20px",
      }}
      bodyStyle={{ padding: "16px 20px" }}
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor:
                  task.taskStatus === "COMPLETED" ? "#52c41a" : "#faad14",
                color: "white",
              }}
            />
            <div className="ml-2">
              <div className="flex items-center gap-2">
                {task.taskAssignTo && <Text strong>{task.taskAssignTo}</Text>}
                {task.taskAssignedBy && (
                  <Tooltip title="Assigned by">
                    <Tag color="blue" className="ml-1 flex items-center">
                      <TeamOutlined className="mr-1" />
                      {task.taskAssignedBy}
                    </Tag>
                  </Tooltip>
                )}
              </div>
              <div className="flex mt-1 ml-2 items-center text-gray-500 text-sm">
                <span>ID: #{task.id.substring(task.id.length - 4)}</span>
                <Divider type="vertical" className="mx-2" />
                <span>Updated by: {task.updatedBy || "N/A"}</span>
              </div>
            </div>
          </div>
          <Badge
            status={task.taskStatus === "COMPLETED" ? "success" : "warning"}
            text={
              <Tag
                color={task.taskStatus === "COMPLETED" ? "success" : "warning"}
                icon={
                  task.taskStatus === "COMPLETED" ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  )
                }
              >
                {task.taskStatus}
              </Tag>
            }
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Text className="text-gray-600 font-medium block mb-2">
            Plan of the Day:
          </Text>
          <div className="max-h-32 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
            <Text className="whitespace-pre-wrap text-gray-700">
              {task.planOftheDay || "No plan recorded"}
            </Text>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Text className="text-gray-600 font-medium block mb-2">
            End of the Day:
          </Text>
          <div className="max-h-32 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
            <Text className="whitespace-pre-wrap text-gray-700">
              {task.endOftheDay || "No end-of-day report"}
            </Text>
          </div>
        </div>
      </div>

      {/* Render admin comments box for PENDING tasks */}
      {task.taskStatus === "PENDING" && renderAdminCommentsBox(task)}

      {task.taskStatus === "PENDING" &&
        renderPendingResponses(task.pendingUserTaskResponse)}

      <Divider className="my-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <CalendarOutlined />
          <Text>Created: {formatDate(task.planCreatedAt)}</Text>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <CalendarOutlined />
          <Text>
            Updated: {formatDate(task.planUpdatedAt || task.planCreatedAt)}
          </Text>
        </div>
      </div>
    </Card>
  );

  const renderCommentModal = () => (
    <Modal
      title={
        <div className="flex items-center text-blue-600">
          <CommentOutlined className="mr-2" />
          <span>Add Admin Feedback</span>
        </div>
      }
      open={commentModalVisible}
      onCancel={() => setCommentModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setCommentModalVisible(false)}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submittingComment}
          onClick={handleCommentSubmit}
          icon={<SendOutlined />}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Submit Feedback
        </Button>,
      ]}
      width={600}
    >
      <div className="mb-4 bg-blue-50 p-3 rounded-md">
        <div className="flex items-center mb-2">
          <UserOutlined className="mr-2 text-blue-500" />
          <Text strong>{currentTask?.taskAssignTo || "User"}'s Details</Text>
          {currentTask?.taskAssignedBy && (
            <Tag color="blue" className="ml-2">
              <TeamOutlined className="mr-1" />
              Assigned by: {currentTask.taskAssignedBy}
            </Tag>
          )}
        </div>

        {currentTask && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Text className="text-gray-600">Task ID:</Text>
              <Text className="ml-2 text-gray-800">
                #{currentTask.id.substring(currentTask.id.length - 4)}
              </Text>
            </div>
            <div>
              <Text className="text-gray-600">Employee Name:</Text>
              <Text className="ml-2 text-gray-800">
                {currentTask.taskAssignedBy || "N/A"}
              </Text>
            </div>
          </div>
        )}
      </div>

      {currentTask && currentTask.planOftheDay && (
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <Text className="text-gray-600 block mb-1">Plan of the Day:</Text>
          <Text className="text-gray-800 block">
            {currentTask.planOftheDay}
          </Text>
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="adminComment"
          label="Admin Feedback"
          rules={[
            { required: true, message: "Please enter your feedback" },
            { min: 2, message: "Feedback must be at least 2 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter your feedback or instructions for the task..."
            maxLength={500}
            showCount
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  // Component to render date-specific task statistics
  const renderDateTaskStatistics = () => (
    <Card
      className="mb-6 border-0 shadow-sm"
      title={
        <div className="flex items-center">
          <PieChartOutlined className="mr-2 text-blue-500" />
          <span>Tasks for {selectedDate.format("YYYY-MM-DD")}</span>
        </div>
      }
      extra={
        <Button icon={<ReloadOutlined />} size="small" onClick={fetchTasksByDate}>
          Refresh
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Plan Of The Day Tasks"
            value={dateTaskStats.pending}
            valueStyle={{ color: "#faad14" }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="End Of The Day Tasks"
            value={dateTaskStats.completed}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Tasks"
            value={dateTaskStats.total}
            valueStyle={{ color: "#1890ff" }}
            prefix={<FileSearchOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <Card
          className="shadow-md rounded-lg overflow-hidden border-0"
          bodyStyle={{ padding: 0 }}
        >
          <div className="bg-gradient-to-r p-4 text-white">
            <Title level={2} className="text-white mb-1">
              Task Management Employee Status
            </Title>
            <Text className="text-black opacity-80">
              Monitor and manage tasks by date
            </Text>
          </div>

          <div className="p-4">
            {/* Show date statistics only when tasks are loaded */}
            {tasks.length > 0 && renderDateTaskStatistics()}

            <Card className="bg-gray-50 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1 md:max-w-xs">
                  <Text className="text-gray-600 block mb-1 font-medium">
                    <FilterOutlined className="mr-1" /> Status Filter
                  </Text>
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full"
                    size="middle"
                    style={{ height: "40px" }}
                  >
                    <Option value="PENDING">
                      <div className="flex items-center">
                        <ClockCircleOutlined className="text-orange-500 mr-2" />
                        <span>PENDING</span>
                      </div>
                    </Option>
                    <Option value="COMPLETED">
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <span>COMPLETED</span>
                      </div>
                    </Option>
                  </Select>
                </div>

                <div className="flex-1 md:max-w-xs">
                  <Text className="text-gray-600 block mb-1 font-medium">
                    <CalendarOutlined className="mr-1" /> Select Date
                  </Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full"
                    style={{ height: "40px" }}
                  />
                </div>

                <div>
                  <Button
                    type="primary"
                    onClick={fetchTasksByDate}
                    className="bg-blue-500 hover:bg-blue-600 shadow-sm"
                    style={buttonStyle}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </Card>

            {/* Search and Sort UI */}
            {tasks.length > 0 && (
              <Card className="mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  {/* Search Area */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <Search
                          placeholder="Search by name or task content..."
                          allowClear
                          enterButton={<SearchOutlined />}
                          size="middle"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onSearch={(value) => setSearchText(value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort Area */}
                  <div>
                    <Button
                      type={sortOrder === "ascend" ? "primary" : "default"}
                      icon={<SortAscendingOutlined />}
                      onClick={() => setSortOrder("ascend")}
                      className={
                        sortOrder === "ascend"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                    >
                      Ascending
                    </Button>
                    <Button
                      type={sortOrder === "descend" ? "primary" : "default"}
                      icon={<SortDescendingOutlined />}
                      onClick={() => setSortOrder("descend")}
                      className={
                        sortOrder === "descend"
                          ? "bg-blue-500 hover:bg-blue-600 ml-2"
                          : "ml-2"
                      }
                    >
                      Descending
                    </Button>
                    <Select
                      value={sortField}
                      onChange={(value) => {
                        setSortField(value);
                      }}
                      style={{ width: 150, marginLeft: 8 }}
                    >
                      <Option value="planUpdatedAt">Updated Date</Option>
                      <Option value="planCreatedAt">Created Date</Option>
                      <Option value="taskAssignTo">Name</Option>
                    </Select>
                  </div>
                </div>
                {/* Task stats */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge status="processing" />
                    <Text className="ml-2">
                      Showing {filteredTasks.length} of {tasks.length} tasks
                      {searchText && (
                        <Tag color="blue" className="ml-2">
                          <SearchOutlined className="mr-1" />
                          Search: "{searchText}"
                        </Tag>
                      )}
                    </Text>
                  </div>
                  <div>
                    <Button
                      size="small"
                      onClick={() => {
                        setSortField("planUpdatedAt");
                        setSortOrder("descend");
                        setSearchText("");
                      }}
                      icon={<FilterOutlined />}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16">
                <Spin size="small" />
                <Text className="mt-4 text-gray-500">Loading tasks...</Text>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="transition-all duration-300">
                {filteredTasks.map((task) => renderTaskCard(task))}
              </div>
            ) : tasks.length > 0 && filteredTasks.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <Text className="text-gray-500 block mb-2">
                      No tasks match your search criteria
                    </Text>
                    <Button type="primary" onClick={() => setSearchText("")}>
                      Clear Search
                    </Button>
                  </div>
                }
                className="py-16"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <Text className="text-gray-500 block mb-2">
                      No tasks found
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Use the filters above to search for tasks
                    </Text>
                  </div>
                }
                className="py-16"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Admin Comment Modal */}
      {renderCommentModal()}
    </TaskAdminPanelLayout>
  );
};

export default TaskManagement;
