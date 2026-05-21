import React, { useState, useEffect, useCallback } from "react";
import TaskAdminPanelLayout from "../components/TaskAdminPanelLayout";
import axiosInstance from "../../../core/config/axiosInstance";
import BASE_URL from "../../../core/config/Config";
import { toast } from "react-toastify";
import {
  Card,
  Typography,
  Button,
  Spin,
  Empty,
  Divider,
  DatePicker,
  Tabs,
  Badge,
  Tag,
  Avatar,
  Collapse,
  Form,
  Input,
  Tooltip,
  Statistic,
  Row,
  Col,
  Select,
  Grid,
} from "antd";
import useAuth from "../../../shared/hooks/useAuth";
import dayjs from "dayjs";
import MediaViewer from "../components/MediaViewer";
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
  TeamOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { useBreakpoint } = Grid;

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Search } = Input;

const EndOfTheDay = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // State variables - Set status to static "COMPLETED" value
  const status = "COMPLETED"; // Static status value
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form] = Form.useForm();
  const [newApiData, setNewApiData] = useState([]);

  // State for sorting and searching
  const [sortField, setSortField] = useState("taskAssignedBy"); // Default sort by name
  const [sortOrder, setSortOrder] = useState("ascend"); // Default to ascending (A-Z)
  const [searchText, setSearchText] = useState("");

  // State for task statistics specific to selected date
  const [dateTaskStats, setDateTaskStats] = useState({
    pending: 0,
    total: 0,
    date: null,
  });

  // Fetch user ID on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
    axiosInstance
      .get(`${BASE_URL}/ai-service/agent/employeUserIdSaving`)
      .catch(() => {});
  }, []);

  const fetchTasksByDate = useCallback(async () => {
    if (!selectedDate) {
      showNotification("warning", "Missing Date", "Please select a date.");
      return;
    }
    setLoading(true);
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const [response, newApiResponse] = await Promise.all([
        axiosInstance.post(
          `${BASE_URL}/user-service/write/get-task-by-date`,
          { taskStatus: status, specificDate: formattedDate },
          { headers: { accept: "*/*", "Content-Type": "application/json" } },
        ),
        axiosInstance.post(
          `${BASE_URL}/ai-service/agent/planOfTheDayForAdmin`,
          { startDate: formattedDate, endDate: formattedDate },
          { headers: { "Content-Type": "application/json" } },
        ).catch(() => ({ data: [] })),
      ]);

      const filteredSameDateTasks = response.data.filter((task) => {
        const createdDate = task.planCreatedAt ? dayjs(task.planCreatedAt).format("YYYY-MM-DD") : null;
        const updatedDate = task.planUpdatedAt ? dayjs(task.planUpdatedAt).format("YYYY-MM-DD") : null;
        return createdDate && updatedDate && createdDate === updatedDate;
      });

      setTasks(filteredSameDateTasks);
      setNewApiData(Array.isArray(newApiResponse.data) ? newApiResponse.data : []);

      const taskCount = filteredSameDateTasks.length || 0;
      setDateTaskStats({ pending: taskCount, total: taskCount, date: selectedDate.toDate() });

      if (taskCount === 0) {
        showNotification("info", "No Tasks Found", `No completed tasks found for ${formattedDate}.`, <FileSearchOutlined style={{ color: "#1890ff" }} />);
      } else {
        showNotification("success", "Tasks Found", `Found ${taskCount} completed tasks for ${formattedDate}.`, <CheckCircleOutlined style={{ color: "#52c41a" }} />);
      }
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      showNotification("error", "Fetch Failed", "Failed to fetch tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

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

  // Automatically fetch tasks when selectedDate changes
  useEffect(() => {
    fetchTasksByDate();
  }, [selectedDate, fetchTasksByDate]);

  const showNotification = (type, message, description) => {
    const text = `${message}${description ? ": " + description : ""}`;
    if (type === "error") toast.error(text, { icon: "❌" });
    else if (type === "success") toast.success(text, { icon: "✅" });
    else if (type === "warning") toast.warn(text, { icon: "⚠️" });
    else toast.info(text, { icon: "ℹ️" });
  };

  // Event handlers
  const handleDateChange = (date) => {
    setSelectedDate(date || dayjs()); // Fallback to current date if null
    // No need to call fetchTasksByDate() here as it will be triggered by the useEffect
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
      const date = dayjs(dateString);
      if (!date.isValid()) return dateString;
      return date.format("YYYY-MM-DD HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  const renderPendingResponses = (responses) => {
    if (!responses || responses.length === 0) return null;

    return (
      <div className="mt-4 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
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
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <FileTextOutlined className="text-blue-500 mr-2 shrink-0" />
                      <a
                        href={response.adminFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 break-all"
                      >
                        {response.adminFileName || "View Attachment"}
                      </a>
                      <Text className="text-xs text-gray-500 sm:ml-3">
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
          resp.updateBy === "ADMIN",
      );

      if (adminResponseWithDesc) {
        adminComments = adminResponseWithDesc.adminDescription;
      }
    }
  };

  const renderTaskCard = (task) => {
    const newApiEntry = newApiData.find((d) => d.userId === task.userId);
    return (
      <Card
        key={task.id}
        className="mb-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        headStyle={{
          backgroundColor: "#f6ffed",
          borderBottom: "1px solid rgba(246, 255, 237, 0.82)",
          borderRadius: "8px 8px 0 0",
          padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 20px)",
          overflow: "visible",
        }}
        bodyStyle={{ padding: "clamp(12px, 3vw, 16px) clamp(12px, 3vw, 20px)" }}
        title={
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 w-full min-w-0">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <Avatar
                icon={<UserOutlined />}
                className="shrink-0"
                style={{ backgroundColor: "#52c41a", color: "white" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {task.taskAssignTo && (
                    <Text strong className="break-words text-base">
                      {task.taskAssignTo}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-600">
                    Spent hours: {task.timeSpentHours ?? "N/A"}
                  </Text>
                </div>
                {task.taskAssignedBy && (
                  <Tooltip title="Assigned by">
                    <Tag color="blue" className="mt-1 flex items-center w-fit max-w-full">
                      <TeamOutlined className="mr-1 shrink-0" />
                      <span className="truncate">{task.taskAssignedBy}</span>
                    </Tag>
                  </Tooltip>
                )}
                <div className="flex mt-1 items-center text-gray-500 text-xs sm:text-sm flex-wrap gap-x-2 gap-y-1">
                  <span>ID: #{task.id.substring(task.id.length - 4)}</span>
                  <Divider type="vertical" className="hidden sm:inline" />
                  <span className="break-words">
                    Updated by: {task.updatedBy || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Tag color="success" icon={<ClockCircleOutlined />} className="shrink-0 self-start">
              COMPLETED
            </Tag>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 flex flex-col">
            <Text className="text-gray-600 font-medium block mb-2">Plan of the Day:</Text>
            <div className="bg-white p-3 rounded-md border border-gray-100 overflow-y-auto break-words min-h-[96px] max-h-[min(200px,40vh)] md:h-[140px] md:max-h-[140px] whitespace-pre-wrap">
              <Text className="text-gray-700 whitespace-pre-wrap break-words">
                {task.planOftheDay || "No plan recorded"}
              </Text>
            </div>
            {newApiEntry?.planOfTheDay && (
              <div className="mt-3">
                <video controls playsInline className="w-full max-w-full rounded-lg border border-gray-200 aspect-video bg-black">
                  <source src={newApiEntry.planOfTheDay} type="video/mp4" />
                </video>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 flex flex-col">
            <Text className="text-gray-600 font-medium block mb-2">End of the Day:</Text>
            <div className="bg-white p-3 rounded-md border border-gray-100 overflow-y-auto break-words min-h-[96px] max-h-[min(200px,40vh)] md:h-[140px] md:max-h-[140px] whitespace-pre-wrap">
              <Text className="text-gray-700 whitespace-pre-wrap break-words">
                {task.endOftheDay || "No end-of-day report"}
              </Text>
            </div>
            {newApiEntry?.endOfTheDay && (
              <div className="mt-3">
                <video controls playsInline className="w-full max-w-full rounded-lg border border-gray-200 aspect-video bg-black">
                  <source src={newApiEntry.endOfTheDay} type="video/mp4" />
                </video>
              </div>
            )}
          </div>
        </div>

        {newApiEntry && (
          <div className="mt-2 text-right">
            <Text className="text-xs text-gray-400">
              Media by: {newApiEntry.name}
            </Text>
          </div>
        )}

        {renderPendingResponses(task.pendingUserTaskResponse)}

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
  };

  // Component to render date-specific task statistics
  const renderDateTaskStatistics = () => (
    <Card
      className="mb-6 border-0 shadow-sm w-full"
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <Title level={5} className="!m-0 !text-sm sm:!text-base md:!text-lg !leading-snug">
            Daily End Of The Day
          </Title>
          <Text className="text-xs mt-1 sm:text-sm text-gray-500 font-medium">
            {selectedDate ? selectedDate.format("YYYY-MM-DD") : "Select a date"}
          </Text>
        </div>
      }
      extra={null}
      style={{ borderRadius: "8px" }}
      styles={{
        header: {
          flexWrap: "wrap",
          gap: 8,
          alignItems: "flex-start",
          overflow: "visible",
        },
        body: { padding: "clamp(12px, 3vw, 16px)" },
      }}
    >
      <Row gutter={[12, 12]} justify="space-between">
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              background: "#fff7e6",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Statistic
              title={<Text strong>End of the Day Tasks</Text>}
              value={dateTaskStats.pending || 0}
              valueStyle={{ color: "#faad14", fontSize: "clamp(20px, 5vw, 24px)" }}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              background: "#e6f7ff",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Statistic
              title={<Text strong>Total Tasks</Text>}
              value={dateTaskStats.total || 0}
              valueStyle={{ color: "#1890ff", fontSize: "clamp(20px, 5vw, 24px)" }}
              prefix={<FileSearchOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <TaskAdminPanelLayout>
      <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen max-w-full overflow-x-hidden">
        <Card
          className="shadow-md rounded-lg overflow-hidden border-0"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-3 sm:p-4">
            {/* Show date statistics only when tasks are loaded */}
            {tasks.length > 0 && renderDateTaskStatistics()}

            <Card className="bg-gray-50 mb-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <Text className="text-gray-600 font-medium whitespace-nowrap text-sm">
                  <CalendarOutlined className="mr-1" /> Select Date
                </Text>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ height: "32px", fontSize: "14px" }}
                  className="text-sm"
                  allowClear={false}
                />
              </div>
            </Card>

            {/* Search and Sort UI */}
            {tasks.length > 0 && (
              <Card className="mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  {/* Search Area */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-0 w-full">
                        <Search
                          placeholder="Search by name or task content..."
                          allowClear
                          enterButton={<SearchOutlined />}
                          size={isMobile ? "large" : "middle"}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onSearch={(value) => setSearchText(value)}
                        />
                      </div>
                    </div>
                  </div>

                
                  <div className="grid grid-cols-2 sm:flex gap-2 w-full lg:w-auto">
                    <Button
                      type={sortOrder === "ascend" ? "default" : "default"}
                      icon={<SortAscendingOutlined />}
                      onClick={() => setSortOrder("ascend")}
                      className={`w-full sm:w-auto ${
                        sortOrder === "ascend"
                          ? "bg-[#008CBA] text-white hover:bg-[#008CBA]"
                          : ""
                      }`}
                    >
                      Ascending
                    </Button>
                    <Button
                      type={sortOrder === "descend" ? "default" : "default"}
                      icon={<SortDescendingOutlined />}
                      onClick={() => setSortOrder("descend")}
                      className={`w-full sm:w-auto ${
                        sortOrder === "descend"
                          ? "bg-[#008CBA] text-white hover:bg-[#008CBA]"
                          : ""
                      }`}
                    >
                      Descending
                    </Button>
                    <Select
                      value={sortField}
                      onChange={(value) => {
                        setSortField(value);
                      }}
                      className="col-span-2 sm:col-span-1 w-full sm:!w-[150px]"
                    >
                      <Option value="taskAssignTo">Name</Option>
                      <Option value="planUpdatedAt">Updated Date</Option>
                      <Option value="planCreatedAt">Created Date</Option>
                    </Select>
                  </div>
                </div>
                {/* Task stats */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Badge status="processing" />
                    <Text className="ml-2 text-sm sm:text-base">
                      Showing {filteredTasks.length} of {tasks.length} tasks
                      {searchText && (
                        <Tag color="blue" className="ml-2 max-w-full truncate">
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
                        setSortField("taskAssignTo");
                        setSortOrder("ascend");
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
                <Spin size="large" />
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
                      Select a different date to view tasks
                    </Text>
                  </div>
                }
                className="py-16"
              />
            )}
          </div>
        </Card>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default EndOfTheDay;
