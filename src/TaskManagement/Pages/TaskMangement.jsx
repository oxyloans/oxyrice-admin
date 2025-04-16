import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// Custom styles for consistent buttons
const buttonStyle = {
  width: "120px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const TaskManagement = () => {
  const [status, setStatus] = useState("COMPLETED");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("general");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/getAllTaskUpdates`,
        {
          taskStatus: status,
        },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      setTasks(response.data);
      if (response.data.length === 0) {
        notification.info({
          message: "No Tasks Found",
          description: `No ${status.toLowerCase()} tasks found.`,
          placement: "topRight",
          icon: <FileSearchOutlined style={{ color: "#1890ff" }} />,
        });
      } else {
        notification.success({
          message: "Tasks Loaded",
          description: `Found ${response.data.length} ${status.toLowerCase()} tasks.`,
          placement: "topRight",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      notification.error({
        message: "Error Fetching Tasks",
        description: "Failed to fetch tasks. Please try again later.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksByDate = async () => {
    if (!selectedDate) {
      notification.warning({
        message: "Missing Date",
        description: "Please select a date.",
        placement: "topRight",
        duration: 3,
      });
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
      if (response.data.length === 0) {
        notification.info({
          message: "No Tasks Found",
          description: `No ${status.toLowerCase()} tasks found for ${formattedDate}.`,
          placement: "topRight",
          duration: 3,
          icon: <FileSearchOutlined style={{ color: "#1890ff" }} />,
        });
      } else {
        notification.success({
          message: "Tasks Found",
          description: `Found ${response.data.length} tasks for ${formattedDate}.`,
          placement: "topRight",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      notification.error({
        message: "Fetch Failed",
        description: "Failed to fetch tasks. Please try again later.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setTasks([]); // Clear previous results when switching tabs
  };

  const openCommentModal = (task) => {
    setCurrentTask(task);
    setCommentModalVisible(true);
    form.resetFields();
  };

  const handleCommentSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmittingComment(true);

      // Prepare the payload for the API
      const payload = {
        adminDescription: values.adminComment,
        id: currentTask.id,
        taskStatus: "PENDING", // As per your requirement, only for PENDING tasks
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
        notification.success({
          message: "Comment Added",
          description: "Your comment has been added successfully.",
          placement: "topRight",
          duration: 3,
        });

        // Refresh the task list
        if (activeTab === "general") {
          fetchAllTasks();
        } else {
          fetchTasksByDate();
        }

        // Close the modal
        setCommentModalVisible(false);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      notification.error({
        message: "Comment Failed",
        description: "Failed to add comment. Please try again.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderPendingResponses = (responses) => {
    if (!responses || responses.length === 0) return null;

    const validResponses = responses.filter(
      (response) => response.pendingEod !== null
    );

    if (validResponses.length === 0) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <DownOutlined rotate={isActive ? 180 : 0} />
          )}
          className="bg-transparent"
        >
          <Panel
            header={
              <div className="flex items-center text-blue-600">
                <MessageOutlined className="mr-2" />
                <Text strong>Pending Responses ({validResponses.length})</Text>
              </div>
            }
            key="1"
            className="bg-white rounded-md mb-2 shadow-sm"
          >
            {validResponses.map((response) => (
              <Card
                key={response.id}
                className="mb-3 border-l-4 border-l-blue-400"
                size="small"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="text-gray-600 block mb-1">
                      Response Update:
                    </Text>
                    <Text className="text-gray-800">
                      {response.pendingEod || "No update provided"}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-gray-600 block mb-1">
                      Admin Description:
                    </Text>
                    <Text className="text-gray-800">
                      {response.adminDescription || "No admin comments"}
                    </Text>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <div>
                        <Text className="text-gray-600 block mb-1">
                          Updated By:
                        </Text>
                        <Tag color="blue">{response.updateBy}</Tag>
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

  // New component to render admin comments box
  const renderAdminCommentsBox = (task) => {
    if (task.taskStatus !== "PENDING") return null;

    // Extract admin comments from the task if they exist
    const adminComments = task.adminDescription || null;

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
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
            <div>
              <Text strong className="text-gray-800 text-lg">
                {task.taskAssignTo}
              </Text>
              <Text className="text-gray-500 text-sm ml-2">
                ID: #{task.id.substring(task.id.length - 4)}
              </Text>
              <Text className="text-gray-500 text-sm ml-2">
                Updated by: {task.updatedBy}
              </Text>
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

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <Card
          className="shadow-md rounded-lg overflow-hidden border-0"
          bodyStyle={{ padding: 0 }}
        >
          <div className="bg-gradient-to-r p-2 text-black">
            <Title level={2} className="text-black mb-1">
              Task Status
            </Title>
          </div>

          <div className="p-2">
            <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
              <TabPane
                tab={
                  <span>
                    <FileSearchOutlined className="mr-2" />
                    All Tasks
                  </span>
                }
                key="general"
              />
              <TabPane
                tab={
                  <span>
                    <CalendarOutlined className="mr-2" />
                    Tasks By Date
                  </span>
                }
                key="byDate"
              />
            </Tabs>

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

                {activeTab === "byDate" && (
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
                )}

                <div>
                  <Button
                    type="primary"
                    onClick={
                      activeTab === "general" ? fetchAllTasks : fetchTasksByDate
                    }
                    className="bg-[#008CBA] shadow-sm"
                    style={buttonStyle}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16">
                <Spin size="small" />
                <Text className="mt-4 text-gray-500">Loading tasks...</Text>
              </div>
            ) : tasks.length > 0 ? (
              <div>{tasks.map(renderTaskCard)}</div>
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
      <Modal
        title={
          <div className="flex items-center text-blue-600">
            <CommentOutlined className="mr-2" />
            <span>Add Admin Comment</span>
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
            Submit Comment
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="adminComment"
            rules={[
              { required: true, message: "Please enter your comment" },
              { min: 2, message: "Comment must be at least 2 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your feedback or instructions..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* {currentTask && (
            <div className="mt-4 bg-gray-50 p-3 rounded-md text-xs text-gray-500">
              <p>
                <strong>Task ID:</strong> {currentTask.id}
              </p>
              <p>
                <strong>User ID:</strong> {currentTask.userId}
              </p>
              <p>
                <strong>Assigned To:</strong> {currentTask.taskAssignTo}
              </p>
            </div>
          )} */}
        </Form>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default TaskManagement;
