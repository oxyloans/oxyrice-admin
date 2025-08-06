// import React, { useState, useEffect, useCallback } from "react";
// import TaskAdminPanelLayout from "../Layout/AdminPanel.jsx";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import BASE_URL from "../../AdminPages/Config.jsx";
// import {
//   Card,
//   Typography,
//   Button,
//   Spin,
//   Empty,
//   Divider,
//   Badge,
//   Tag,
//   Avatar,
//   Collapse,
//   message,
//   Tooltip,
//   Statistic,
//   Row,
//   Col,
// } from "antd";
// import dayjs from "dayjs";
// import {
//   CalendarOutlined,
//   ClockCircleOutlined,
//   FileSearchOutlined,
//   UserOutlined,
//   MessageOutlined,
//   FileTextOutlined,
//   DownOutlined,
//   TeamOutlined,
//   ReloadOutlined,
//   PieChartOutlined,
// } from "@ant-design/icons";

// const { Title, Text } = Typography;
// const { Panel } = Collapse;

// // Custom styles for consistent buttons
// const buttonStyle = {
//   width: "120px",
//   height: "40px",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
// };

// const UserTaskDetailsPage = () => {
//   const status = "COMPLETED";
//   const { userId } = useParams();
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [searchText, setSearchText] = useState("");
//   const [dateTaskStats, setDateTaskStats] = useState({
//     pending: 0,
//     total: 0,
//     date: null,
//   });

//   // API call to fetch tasks by date
//   const fetchTasksByDate = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/user-service/write/getAllTaskUpdates`,
//         {
//           taskStatus: status,
//           userId: userId,
//         },
//         {
//           headers: {
//             accept: "*/*",
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const fetchedTasks = response.data || [];
//       setTasks(fetchedTasks);

//       // Update task statistics
//       const taskCount = fetchedTasks.length || 0;
//       setDateTaskStats({
//         pending: taskCount,
//         total: taskCount,
//       });
//     } catch (error) {
//       console.error("Error fetching tasks by date:", error);
//       message.error("Failed to fetch tasks. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedDate, userId]);

//   // Sort and filter tasks
//   useEffect(() => {
//     if (tasks.length > 0) {
//       let result = [...tasks];

//       // Apply search filter
//       if (searchText) {
//         const normalizedSearchText = searchText.toLowerCase();
//         result = result.filter((task) =>
//           [
//             task.planOftheDay,
//             task.endOftheDay,
//             task.taskAssignTo,
//             task.taskAssignedBy,
//           ].some((field) => field?.toLowerCase().includes(normalizedSearchText))
//         );
//       }

//       // Sort tasks: August 2025 updated tasks first, then by planCreatedAt in descending order
//       const currentMonth = dayjs().format("YYYY-MM");
//       result.sort((a, b) => {
//         const createdDateA = dayjs(a.planCreatedAt);
//         const createdDateB = dayjs(b.planCreatedAt);
//         const updatedDateA = dayjs(a.planUpdatedAt || a.planCreatedAt);
//         const updatedDateB = dayjs(b.planUpdatedAt || b.planCreatedAt);
//         const isCurrentMonthA = createdDateA.format("YYYY-MM") === currentMonth;
//         const isCurrentMonthB = createdDateB.format("YYYY-MM") === currentMonth;
//         const isUpdatedA = a.planUpdatedAt && updatedDateA.isValid();
//         const isUpdatedB = b.planUpdatedAt && updatedDateB.isValid();

//         // Prioritize tasks from August 2025 that have been updated
//         if (isCurrentMonthA && isUpdatedA && (!isCurrentMonthB || !isUpdatedB))
//           return -1;
//         if (isCurrentMonthB && isUpdatedB && (!isCurrentMonthA || !isUpdatedA))
//           return 1;

//         // For tasks in the same category, sort by planCreatedAt in descending order
//         return createdDateB - createdDateA;
//       });

//       setFilteredTasks(result);
//     } else {
//       setFilteredTasks([]);
//     }
//   }, [tasks, searchText]);

//   // Automatically fetch tasks when selectedDate changes
//   useEffect(() => {
//     fetchTasksByDate();
//   }, [selectedDate, fetchTasksByDate]);

//   // Helper function to format timeSpentHours
//   const formatTimeSpent = (timeSpent) => {
//     if (!timeSpent || timeSpent === "N/A") return "N/A";
//     const parts = timeSpent.split(" ");
//     if (parts.length >= 2) {
//       return `${parts[0]}h ${parts[2] || "0"}m`;
//     }
//     return timeSpent;
//   };

//   // Helper function to format dates
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = dayjs(dateString);
//       return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : dateString;
//     } catch (e) {
//       return dateString;
//     }
//   };

//   const renderPendingResponses = (responses) => {
//     if (!responses || responses.length === 0) return null;

//     return (
//       <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
//         <Collapse
//           bordered={false}
//           expandIcon={({ isActive }) => (
//             <DownOutlined rotate={isActive ? 180 : 0} />
//           )}
//           className="bg-transparent"
//           defaultActiveKey={["1"]}
//         >
//           <Panel
//             header={
//               <div className="flex items-center text-blue-600">
//                 <MessageOutlined className="mr-2" />
//                 <Text strong>Task History ({responses.length})</Text>
//               </div>
//             }
//             key="1"
//             className="bg-white rounded-md mb-2 shadow-sm"
//           >
//             {responses.map((response) => (
//               <Card
//                 key={response.id}
//                 className={`mb-3 border-l-4 ${
//                   response.updateBy === "ADMIN"
//                     ? "border-l-blue-400"
//                     : "border-l-green-400"
//                 }`}
//                 size="small"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {response.updateBy !== "ADMIN" && response.pendingEod && (
//                     <div>
//                       <Text className="text-gray-600 block mb-1">
//                         User Update:
//                       </Text>
//                       <Text className="text-gray-800 bg-green-50 p-2 rounded block">
//                         {response.pendingEod}
//                       </Text>
//                     </div>
//                   )}
//                   {response.updateBy === "ADMIN" &&
//                     response.adminDescription && (
//                       <div>
//                         <Text className="text-gray-600 block mb-1">
//                           Admin Feedback:
//                         </Text>
//                         <Text className="text-gray-800 bg-blue-50 p-2 rounded block">
//                           {response.adminDescription}
//                         </Text>
//                       </div>
//                     )}
//                   <div>
//                     <div className="flex justify-between">
//                       <div>
//                         <Text className="text-gray-600 block mb-1">
//                           Updated By:
//                         </Text>
//                         <Tag
//                           color={
//                             response.updateBy === "ADMIN" ? "blue" : "green"
//                           }
//                         >
//                           {response.updateBy}
//                         </Tag>
//                       </div>
//                       <div>
//                         <Text className="text-gray-600 block mb-1">
//                           Created At:
//                         </Text>
//                         <Text className="text-gray-800">
//                           {formatDate(response.createdAt)}
//                         </Text>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {response.adminFilePath && (
//                   <div className="mt-3 pt-3 border-t border-gray-100">
//                     <div className="flex items-center">
//                       <FileTextOutlined className="text-blue-500 mr-2" />
//                       <a
//                         href={response.adminFilePath}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         {response.adminFileName || "View Attachment"}
//                       </a>
//                       <Text className="text-xs text-gray-500 ml-3">
//                         {formatDate(response.adminFileCreatedDate)}
//                       </Text>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             ))}
//           </Panel>
//         </Collapse>
//       </div>
//     );
//   };

//   const renderTaskCard = (task) => (
//     <Card
//       key={task.id}
//       className="mb-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
//       headStyle={{
//         backgroundColor: "#f6ffed",
//         borderBottom: "1px solid rgba(246, 255, 237, 0.82)",
//         borderRadius: "8px 8px 0 0",
//         padding: "12px 20px",
//       }}
//       bodyStyle={{ padding: "16px 20px" }}
//       title={
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//           <div className="flex items-center gap-2 mb-2 md:mb-0">
//             <Avatar
//               icon={<UserOutlined />}
//               style={{ backgroundColor: "#52c41a", color: "white" }}
//             />
//             <div className="ml-2">
//               <div className="flex items-center flex-wrap gap-2">
//                 {task.taskAssignTo && <Text strong>{task.taskAssignTo}</Text>}
//                 {task.taskAssignedBy && (
//                   <Tooltip title="Assigned by">
//                     <div className="flex items-center">
//                       <Tag color="blue" className="ml-1 flex items-center">
//                         <TeamOutlined className="mr-1" />
//                         {task.taskAssignedBy}
//                       </Tag>
//                       <span className="ml-2">
//                         Spent: {formatTimeSpent(task.timeSpentHours)}
//                       </span>
//                     </div>
//                   </Tooltip>
//                 )}
//               </div>
//               <div className="flex mt-1 ml-2 items-center text-gray-500 text-sm flex-wrap">
//                 <span>ID: #{task.id.substring(task.id.length - 4)}</span>
//                 <Divider type="vertical" className="mx-2" />
//                 <span>Updated by: {task.updatedBy || "N/A"}</span>
//               </div>
//             </div>
//           </div>
//           <Badge
//             status="success"
//             text={
//               <Tag color="success" icon={<ClockCircleOutlined />}>
//                 COMPLETED
//               </Tag>
//             }
//           />
//         </div>
//       }
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//           <Text className="text-gray-600 font-medium block mb-2">
//             Plan of the Day:
//           </Text>
//           <div className="max-h-50 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
//             <Text className="whitespace-pre-wrap text-gray-700">
//               {task.planOftheDay || "No plan recorded"}
//             </Text>
//           </div>
//         </div>
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
//           <Text className="text-gray-600 font-medium block mb-2">
//             End of the Day:
//           </Text>
//           <div className="max-h-50 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
//             <Text className="whitespace-pre-wrap text-gray-700">
//               {task.endOftheDay || "No end-of-day report"}
//             </Text>
//           </div>
//         </div>
//       </div>
//       {renderPendingResponses(task.pendingUserTaskResponse)}
//       <Divider className="my-3" />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//         <div className="flex items-center gap-2 text-gray-500">
//           <CalendarOutlined />
//           <Text>Created: {formatDate(task.planCreatedAt)}</Text>
//         </div>
//         <div className="flex items-center gap-2 text-gray-500">
//           <CalendarOutlined />
//           <Text>
//             Updated: {formatDate(task.planUpdatedAt || task.planCreatedAt)}
//           </Text>
//         </div>
//       </div>
//     </Card>
//   );

//   const renderDateTaskStatistics = () => (
//     <Card
//       className="mb-6 border-0 shadow-sm"
//       title={
//         <div className="flex items-center flex-wrap">
//           <PieChartOutlined
//             className="mr-2 text-blue-500"
//             style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
//           />
//           <Title
//             level={4}
//             className="!text-base sm:!text-lg md:!text-xl"
//             style={{ margin: 0 }}
//           >
//             Total Tasks updates

//           </Title>
//         </div>
//       }
//       extra={
//         <Button
//           icon={<ReloadOutlined />}
//           size="small"
//           type="primary"
//           onClick={fetchTasksByDate}
//           className="text-xs sm:text-sm"
//         >
//           Refresh
//         </Button>
//       }
//       style={{ borderRadius: "8px", overflow: "hidden" }}
//       bodyStyle={{ padding: "clamp(12px, 3vw, 16px)" }}
//     >
//       <Row gutter={[16, 16]} justify="space-between">
//         <Col xs={24} md={12}>
//           <Card
//             bordered={false}
//             style={{
//               background: "#fff7e6",
//               borderRadius: "8px",
//               textAlign: "center",
//             }}
//           >
//             <Statistic
//               title={<Text strong>Total POD</Text>}
//               value={dateTaskStats.pending || 0}
//               valueStyle={{ color: "#faad14", fontSize: "24px" }}
//               prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
//             />
//           </Card>
//         </Col>
//         <Col xs={24} md={12}>
//           <Card
//             bordered={false}
//             style={{
//               background: "#e6f7ff",
//               borderRadius: "8px",
//               textAlign: "center",
//             }}
//           >
//             <Statistic
//               title={<Text strong>Total EOD</Text>}
//               value={dateTaskStats.total || 0}
//               valueStyle={{ color: "#1890ff", fontSize: "24px" }}
//               prefix={<FileSearchOutlined style={{ color: "#1890ff" }} />}
//             />
//           </Card>
//         </Col>
//       </Row>
//     </Card>
//   );

//   return (
//     <TaskAdminPanelLayout>
//       <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
//         <Card
//           className="shadow-md rounded-lg overflow-hidden border-0"
//           bodyStyle={{ padding: 0 }}
//         >
//           <div className="p-4">
//             {tasks.length > 0 && renderDateTaskStatistics()}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center p-16">
//                 <Spin size="large" />
//                 <Text className="mt-4 text-gray-500">Loading tasks...</Text>
//               </div>
//             ) : filteredTasks.length > 0 ? (
//               <div className="transition-all duration-300">
//                 {filteredTasks.map((task) => renderTaskCard(task))}
//               </div>
//             ) : tasks.length > 0 && filteredTasks.length === 0 ? (
//               <Empty
//                 image={Empty.PRESENTED_IMAGE_SIMPLE}
//                 description={
//                   <div className="text-center">
//                     <Text className="text-gray-500 block mb-2">
//                       No tasks match your search criteria
//                     </Text>
//                     <Button type="primary" onClick={() => setSearchText("")}>
//                       Clear Search
//                     </Button>
//                   </div>
//                 }
//                 className="py-16"
//               />
//             ) : (
//               <Empty
//                 image={Empty.PRESENTED_IMAGE_SIMPLE}
//                 description={
//                   <div className="text-center">
//                     <Text className="text-gray-500 block mb-2">
//                       No tasks found
//                     </Text>
//                     <Text className="text-gray-400 text-sm">
//                       Select a different date to view tasks
//                     </Text>
//                   </div>
//                 }
//                 className="py-16"
//               />
//             )}
//           </div>
//         </Card>
//       </div>
//     </TaskAdminPanelLayout>
//   );
// };

// export default UserTaskDetailsPage;

import React, { useState, useEffect, useCallback } from "react";
import TaskAdminPanelLayout from "../Layout/AdminPanel.jsx";
import axios from "axios";
import { useParams } from "react-router-dom";
import BASE_URL from "../../AdminPages/Config.jsx";
import {
  Card,
  Typography,
  Button,
  Spin,
  Empty,
  Divider,
  Badge,
  Tag,
  Avatar,
  Collapse,
  message,
  Tooltip,
  Statistic,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  UserOutlined,
  MessageOutlined,
  FileTextOutlined,
  DownOutlined,
  TeamOutlined,
  ReloadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Custom styles for consistent buttons
const buttonStyle = {
  width: "120px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const UserTaskDetailsPage = () => {
  const status = "COMPLETED";
  const { userId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateTaskStats, setDateTaskStats] = useState({
    pending: 0,
    total: 0,
    date: null,
  });

  // API call to fetch tasks by date
  const fetchTasksByDate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/write/getAllTaskUpdates`,
        {
          taskStatus: status,
          userId: userId,
        },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      // Filter tasks to include only those from the current month (August 2025)
      const currentMonth = dayjs().format("YYYY-MM");
      const fetchedTasks = (response.data || []).filter(
        (task) => dayjs(task.planCreatedAt).format("YYYY-MM") === currentMonth
      );
      setTasks(fetchedTasks);

      // Update task statistics
      const taskCount = fetchedTasks.length || 0;
      setDateTaskStats({
        pending: taskCount,
        total: taskCount,
      });
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      message.error("Failed to fetch tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Sort and filter tasks
  useEffect(() => {
    if (tasks.length > 0) {
      let result = [...tasks];

      // Apply search filter
      if (searchText) {
        const normalizedSearchText = searchText.toLowerCase();
        result = result.filter((task) =>
          [
            task.planOftheDay,
            task.endOftheDay,
            task.taskAssignTo,
            task.taskAssignedBy,
          ].some((field) => field?.toLowerCase().includes(normalizedSearchText))
        );
      }

      // Sort tasks: updated tasks first, then by planCreatedAt in descending order
      result.sort((a, b) => {
        const updatedDateA = dayjs(a.planUpdatedAt || a.planCreatedAt);
        const updatedDateB = dayjs(b.planUpdatedAt || b.planCreatedAt);
        const createdDateA = dayjs(a.planCreatedAt);
        const createdDateB = dayjs(b.planCreatedAt);
        const isUpdatedA = a.planUpdatedAt && updatedDateA.isValid();
        const isUpdatedB = b.planUpdatedAt && updatedDateB.isValid();

        // Prioritize tasks that have been updated
        if (isUpdatedA && !isUpdatedB) return -1;
        if (!isUpdatedA && isUpdatedB) return 1;

        // For tasks in the same category, sort by planCreatedAt in descending order
        return createdDateB - createdDateA;
      });

      setFilteredTasks(result);
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, searchText]);

  // Automatically fetch tasks on component mount
  useEffect(() => {
    fetchTasksByDate();
  }, [fetchTasksByDate]);

  // Helper function to format timeSpentHours
  const formatTimeSpent = (timeSpent) => {
    if (!timeSpent || timeSpent === "N/A") return "N/A";
    const parts = timeSpent.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]}h ${parts[2] || "0"}m`;
    }
    return timeSpent;
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = dayjs(dateString);
      return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : dateString;
    } catch (e) {
      return dateString;
    }
  };

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
          defaultActiveKey={["1"]}
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
                        {formatDate(response.adminFileCreatedDate)}
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

  const renderTaskCard = (task) => (
    <Card
      key={task.id}
      className="mb-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      headStyle={{
        backgroundColor: "#f6ffed",
        borderBottom: "1px solid rgba(246, 255, 237, 0.82)",
        borderRadius: "8px 8px 0 0",
        padding: "12px 20px",
      }}
      bodyStyle={{ padding: "16px 20px" }}
      title={
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#52c41a", color: "white" }}
            />
            <div className="ml-2">
              <div className="flex items-center flex-wrap gap-2">
                {task.taskAssignTo && <Text strong>{task.taskAssignTo}</Text>}
                {task.taskAssignedBy && (
                  <Tooltip title="Assigned by">
                    <div className="flex items-center">
                      <Tag color="blue" className="ml-1 flex items-center">
                        <TeamOutlined className="mr-1" />
                        {task.taskAssignedBy}
                      </Tag>
                      <span className="ml-2">
                        Spent: {formatTimeSpent(task.timeSpentHours)}
                      </span>
                    </div>
                  </Tooltip>
                )}
              </div>
              <div className="flex mt-1 ml-2 items-center text-gray-500 text-sm flex-wrap">
                <span>ID: #{task.id.substring(task.id.length - 4)}</span>
                <Divider type="vertical" className="mx-2" />
                <span>Updated by: {task.updatedBy || "N/A"}</span>
              </div>
            </div>
          </div>
          <Badge
            status="success"
            text={
              <Tag color="success" icon={<ClockCircleOutlined />}>
                COMPLETED
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
          <div className="max-h-50 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
            <Text className="whitespace-pre-wrap text-gray-700">
              {task.planOftheDay || "No plan recorded"}
            </Text>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Text className="text-gray-600 font-medium block mb-2">
            End of the Day:
          </Text>
          <div className="max-h-50 overflow-y-auto bg-white p-3 rounded-md border border-gray-100">
            <Text className="whitespace-pre-wrap text-gray-700">
              {task.endOftheDay || "No end-of-day report"}
            </Text>
          </div>
        </div>
      </div>
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

  const renderDateTaskStatistics = () => (
    <Card
      className="mb-6 border-0 shadow-sm"
      title={
        <div className="flex items-center flex-wrap">
          <PieChartOutlined
            className="mr-2 text-blue-500"
            style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
          />
          <Title
            level={4}
            className="!text-base sm:!text-lg md:!text-xl"
            style={{ margin: 0 }}
          >
            Total Task Updates (August 2025)
          </Title>
        </div>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          size="small"
          type="primary"
          onClick={fetchTasksByDate}
          className="text-xs sm:text-sm"
        >
          Refresh
        </Button>
      }
      style={{ borderRadius: "8px", overflow: "hidden" }}
      bodyStyle={{ padding: "clamp(12px, 3vw, 16px)" }}
    >
      <Row gutter={[16, 16]} justify="space-between">
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
              title={<Text strong>Total POD</Text>}
              value={dateTaskStats.pending || 0}
              valueStyle={{ color: "#faad14", fontSize: "24px" }}
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
              title={<Text strong>Total EOD</Text>}
              value={dateTaskStats.total || 0}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              prefix={<FileSearchOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
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
          <div className="p-4">
            {tasks.length > 0 && renderDateTaskStatistics()}
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
                      No tasks found for August 2025
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Try refreshing or check other users
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

export default UserTaskDetailsPage;