import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Spin,
  message,
  Card,
  Button,
  Typography,
  Input,
  Badge,
  Dropdown,
  Menu,
  Row,
  Col,
  Modal,
  Form,
  Select,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  EllipsisOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < 768,
  });

  // Updated available assignees with the new names
  const availableAssignees = [
    { value: "GRISHMA", label: "Grishma" },
    { value: "GUNA", label: "Guna" },
    { value: "GUNASHEKAR", label: "Gunashekar" },
    { value: "SAIKUMAR", label: "Saikumar" },
    { value: "SREEJA", label: "Sreeja" },
    { value: "GADISAI", label: "Gadisai" },
    { value: "GUTTISAI", label: "Guttisai" },
    { value: "NARENDRA", label: "Narendra" },
    { value: "MANEIAH", label: "Maneiah" },
    { value: "VARALAKSHMI", label: "Varalakshmi" },
    { value: "VIJAY", label: "Vijay" },
    { value: "NIHARIKA", label: "Niharika" },
    { value: "HARIPRIYA", label: "Haripriya" },
    { value: "VINODH", label: "Vinodh" },
    { value: "NAVEEN", label: "Naveen" },
    { value: "SRIDHAR", label: "Sridhar" },
    { value: "SUBBU", label: "Subbu" },
    { value: "UDAY", label: "Uday" },
    { value: "HARIBABU", label: "Haribabu" },
    { value: "SUDHEESH", label: "Sudheesh" },
    { value: "ANUSHA", label: "Anusha" },
    { value: "DIVYA", label: "Divya" },
    { value: "KARTHIK", label: "Karthik" },
    { value: "RAMADEVI", label: "Ramadevi" },
    { value: "BHARGAV", label: "Bhargav" },
    { value: "PRATHIBHA", label: "Prathibha" },
    { value: "JYOTHI", label: "Jyothi" },
    { value: "HEMA", label: "Hema" },
    { value: "RAMYAHR", label: "Ramyahr" },
    { value: "SURESH", label: "Suresh" },
    { value: "SUCHITHRA", label: "Suchithra" },
    { value: "ARUNA", label: "Aruna" },
    { value: "VENKATESH", label: "Venkatesh" },
    { value: "RAKESH", label: "Rakesh" },
    { value: "JHON", label: "Jhon" },
    { value: "MOUNIKA", label: "Mounika" },
    { value: "VANDANA", label: "Vandana" },
    { value: "GOPAL", label: "Gopal" },
    { value: "ANUSHAACCOUNT", label: "Anushaaccount" },
    { value: "RADHAKRISHNA", label: "Radhakrishna" },
    { value: "MADHU", label: "Madhu" },
    { value: "RAVI", label: "Ravi" },
    { value: "SAMPATH", label: "Sampath" },
    { value: "CHANDU", label: "Chandu" },
    { value: "SWATHI", label: "Swathi" },
    { value: "SHANTHI", label: "Shanthi" },
  ];

  const creatorOptions = [
    { value: "ADMIN", label: "Admin" },
    { value: "USER", label: "User" },
  ];

  useEffect(() => {
    fetchTasks();

    // Add responsive window resize handler
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/user-service/write/getTaskData`
      );

      if (Array.isArray(response.data)) {
        setTasks(response.data);
        message.success("Tasks loaded successfully");
      } else {
        message.error("Unexpected response format");
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      message.error("Failed to fetch tasks");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search text
  const filteredTasks = tasks.filter(
    (task) =>
      task.taskcontent?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.createdby?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.taskassingnedby?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Define a common style for text alignment in both header and body cells
  const centerStyle = {
    textAlign: "center",
  };

  // Helper function to parse assignees from different formats
  const parseAssignees = (assigneesData) => {
    if (!assigneesData) return [];

    // Handle if assignees is a string (comma separated)
    if (typeof assigneesData === "string") {
      // Split by comma and trim whitespace
      return assigneesData.split(",").map((item) => item.trim());
    }
    // Handle if it's already an array
    else if (Array.isArray(assigneesData)) {
      return assigneesData;
    }

    // Fallback
    return [];
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);

    // Determine which field to use for assigned users
    // First try taskassingnedto, if that's empty, try taskassingnedby
    const assigneesSource = task.taskassingnedto || task.taskassingnedby || "";

    // Parse the assigned users
    const taskAssignees = parseAssignees(assigneesSource);

    console.log("Task to edit:", task);
    console.log("Parsed assignees:", taskAssignees);

    // Initialize form with current task values
    editForm.setFieldsValue({
      taskcontent: task.taskcontent,
      taskcreatedby: task.createdby,
      taskassingnedto: taskAssignees,
    });

    // Log the form values after setting them
    console.log("Form values set:", editForm.getFieldsValue());

    // Open modal on larger screens, drawer on mobile
    if (screenSize.isMobile) {
      setEditDrawerVisible(true);
    } else {
      setEditModalVisible(true);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const values = await editForm.validateFields();
      setUpdateLoading(true);

      console.log("Submitting values:", values);

      // Make API call to update task with the new array format for assignees
      const response = await axios.patch(
        `${BASE_URL}/user-service/write/updateTask/${currentTask.id}`,
        {
          taskcontent: values.taskcontent,
          taskcreatedby: values.taskcreatedby,
          // Send taskassingnedto as an array
          taskassingnedto: values.taskassingnedto,
          admindocumentid: currentTask.admindocumentid || "string",
        }
      );

      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === currentTask.id
          ? {
              ...task,
              taskcontent: values.taskcontent,
              createdby: values.taskcreatedby,
              taskassingnedby: values.taskassingnedto.join(", "), // For display purposes
              taskassingnedto: values.taskassingnedto, // Keep the array format
            }
          : task
      );

      setTasks(updatedTasks);
      message.success("Task updated successfully");

      // Close modals
      setEditModalVisible(false);
      setEditDrawerVisible(false);
    } catch (error) {
      console.error("Error updating task:", error);
      message.error(
        "Failed to update task: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to render assigned team members as tags
  const renderAssignedMembers = (assignees) => {
    if (!assignees) return <span>Not assigned</span>;

    // Handle both string and array formats
    let assigneeList = parseAssignees(assignees);

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {assigneeList.map((assignee, index) => (
          <Tag key={index} color="blue">
            {assignee}
          </Tag>
        ))}
      </div>
    );
  };

  // Responsive columns configuration
  const getColumns = () => {
    const baseColumns = [
      {
        title: "S.No",
        key: "serialNumber",
        width: screenSize.isMobile ? 50 : 80,
        render: (_, __, index) => index + 1,
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
      },
      {
        title: "Task Content",
        dataIndex: "taskcontent",
        key: "taskcontent",
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (content) => (
          <div className="max-w-xs mx-auto overflow-hidden text-ellipsis">
            {content}
          </div>
        ),
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (priority) => (
          <Tag color={priority === "HIGH" ? "blue" : "green"}>
            {priority || ""}
          </Tag>
        ),
      },
      // Task Status column updated to display text values for numeric codes and add visual styling
      {
        title: "Task Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (status) => {
          // Map numeric status codes to their text values and visual properties
          const statusMap = {
            1: { text: "CREATED", color: "blue", icon: <PlusCircleOutlined /> },
            2: {
              text: "ACCEPTED",
              color: "green",
              icon: <CheckCircleOutlined />,
            },
            3: {
              text: "PENDING",
              color: "orange",
              icon: <ClockCircleOutlined />,
            },
            4: {
              text: "COMPLETED",
              color: "purple",
              icon: <CheckCircleOutlined />,
            },
            // Handle the case when status directly contains text values
            CREATED: {
              text: "CREATED",
              color: "blue",
              icon: <PlusCircleOutlined />,
            },
            ACCEPTED: {
              text: "ACCEPTED",
              color: "green",
              icon: <CheckCircleOutlined />,
            },
            PENDING: {
              text: "PENDING",
              color: "orange",
              icon: <ClockCircleOutlined />,
            },
            COMPLETED: {
              text: "COMPLETED",
              color: "purple",
              icon: <CheckCircleOutlined />,
            },
          };

          // Get the appropriate status object or use a default one
          const statusObj = statusMap[status] || {
            text: status || "Unknown",
            color: "default",
            icon: <ExclamationCircleOutlined />,
          };

          return (
            <Tag
              color={statusObj.color}
              className="text-xs sm:text-sm py-1 px-2 flex items-center justify-center gap-1"
            >
              {statusObj.icon}
              <span>{statusObj.text}</span>
            </Tag>
          );
        },
        filters: [
          { text: "CREATED", value: "1" },
          { text: "ACCEPTED", value: "2" },
          { text: "PENDING", value: "3" },
          { text: "COMPLETED", value: "4" },
        ],
        onFilter: (value, record) => {
          // Handle both numeric and text status values
          return (
            record.status === value ||
            record.status === value.toString() ||
            (value === "1" && record.status === "CREATED") ||
            (value === "2" && record.status === "ACCEPTED") ||
            (value === "3" && record.status === "PENDING") ||
            (value === "4" && record.status === "COMPLETED")
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        width: screenSize.isMobile ? 80 : 100,
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (_, record) => (
          <Space size="small" wrap={screenSize.isMobile}>
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              className="flex items-center justify-center"
              onClick={() => handleEditTask(record)}
              title="Edit Task"
            >
              Edit
            </Button>
          </Space>
        ),
      },
    ];

    // Add extra columns for larger screens
    if (!screenSize.isMobile) {
      baseColumns.splice(1, 0, {
        title: "Task ID",
        dataIndex: "id",
        key: "id",
        ellipsis: true,
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (id) => (
          <span className="text-gray-500 font-mono text-xs">
            #{id?.substring(id.length - 4) || "N/A"}
          </span>
        ),
      });

      baseColumns.splice(3, 0, {
        title: "Created By",
        dataIndex: "createdby",
        key: "createdby",
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (createdby) => (
          <Tag color={createdby === "ADMIN" ? "blue" : "green"}>
            {createdby || "N/A"}
          </Tag>
        ),
      });

     baseColumns.splice(4, 0, {
       title: "Assigned To",
       dataIndex: "taskassingnedto",
       key: "taskassingnedto",
       align: "center",
       width: 180, // Restrict column width
       onHeaderCell: () => ({
         style: centerStyle,
       }),
       render: (taskassingnedto, record) => {
         const assignees = parseAssignees(
           taskassingnedto || record.taskassingnedby
         );

         // Show only first 2 names with count indicator if there are more
         if (assignees.length > 2) {
           return (
             <div className="flex flex-col items-center">
               <div className="flex flex-wrap gap-1 justify-center">
                 <Tag color="blue">{assignees[0]}</Tag>
                 <Tag color="blue">{assignees[1]}</Tag>
               </div>
               <Badge
                 count={`+${assignees.length - 2}`}
                 style={{ backgroundColor: "#1890ff" }}
                 title={assignees.slice(2).join(", ")}
               />
             </div>
           );
         }

         // Show all if 2 or fewer assignees
         return (
           <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
             {assignees.length > 0 ? (
               assignees.map((assignee, index) => (
                 <Tag key={index} color="blue">
                   {assignee}
                 </Tag>
               ))
             ) : (
               <span>Not assigned</span>
             )}
           </div>
         );
       },
     });
    }

    return baseColumns;
  };

  // Expandable row config for mobile view to show additional information
  const expandableConfig = screenSize.isMobile
    ? {
        expandedRowRender: (record) => (
          <div className="p-3 bg-gray-50">
            <p>
              <strong>Task ID:</strong>{" "}
              <span className="text-gray-500 font-mono text-xs">
                {record.id}
              </span>
            </p>
            <p className="mt-2">
              <strong>Created By:</strong>{" "}
              <Tag color={record.createdby === "ADMIN" ? "blue" : "green"}>
                {record.createdby || "N/A"}
              </Tag>
            </p>
            <p className="mt-2">
              <strong>Assigned To:</strong>{" "}
              <div className="mt-1">
                {renderAssignedMembers(
                  record.taskassingnedto || record.taskassingnedby
                )}
              </div>
            </p>
          </div>
        ),
        expandIcon: ({ expanded, onExpand, record }) => (
          <MenuOutlined
            onClick={(e) => onExpand(record, e)}
            style={{ color: expanded ? "#1890ff" : undefined }}
          />
        ),
      }
    : {};

  // Edit Form Render Function
  const renderEditForm = () => (
    <Form form={editForm} layout="vertical">
      <Form.Item
        name="taskcontent"
        label="Task Content"
        rules={[{ required: true, message: "Please enter task content" }]}
      >
        <TextArea rows={4} placeholder="Enter task description" />
      </Form.Item>

      <Form.Item
        name="taskcreatedby"
        label="Created By"
        rules={[{ required: true, message: "Please select creator" }]}
      >
        <Select placeholder="Select creator">
          {creatorOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              <div className="flex items-center">
                <UserOutlined className="mr-2" />
                {option.label}
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="taskassingnedto"
        label={
          <div className="flex items-center">
            <TeamOutlined className="mr-2" />
            <span>Assigned To (Max 5 members)</span>
          </div>
        }
        rules={[
          { required: true, message: "Please select at least one assignee" },
          {
            validator: (_, value) => {
              if (!value || value.length <= 5) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Maximum 5 team members allowed")
              );
            },
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select up to 5 team members"
          maxTagCount={5}
          showArrow
          maxTagTextLength={10}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.props.children[1]
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
        >
          {availableAssignees.map((assignee) => (
            <Option key={assignee.value} value={assignee.value}>
              <div className="flex items-center">
                <UserOutlined className="mr-2" />
                {assignee.label}
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );

  return (
    <TaskAdminPanelLayout>
      <div className="p-2 sm:p-4 md:p-6">
        <Card className="shadow-md rounded-lg" bodyStyle={{ padding: "0" }}>
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={12}>
                <Title level={4} style={{ margin: 0 }}>
                  Tasks Management
                </Title>
                <p className="text-gray-500 mt-1">
                  Manage and monitor all tasks
                </p>
              </Col>

              <Col xs={24} md={12}>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
                  <Input
                    placeholder="Search tasks..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    suffix={<SearchOutlined />}
                    className="w-full sm:w-auto min-w-0 sm:min-w-[200px]"
                  />

                  <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchTasks}
                      loading={loading}
                    >
                      {!screenSize.isMobile && "Refresh"}
                    </Button>

                    <Button
                      style={{ backgroundColor: "#04AA6D", color: "white" }}
                      icon={<PlusOutlined />}
                      href="/taskcreation"
                    >
                      {!screenSize.isMobile && "New Task"}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="p-3 sm:p-4 md:p-5">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="medium" />
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600 font-medium">
                      Total Tasks:
                    </span>
                    <Badge
                      count={filteredTasks.length}
                      showZero
                      style={{ backgroundColor: "#008CBA" }}
                    />
                  </div>

                  <Button type="default" icon={<DownloadOutlined />}>
                    {!screenSize.isMobile && "Export"}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table
                    columns={getColumns()}
                    dataSource={filteredTasks}
                    rowKey="id"
                    bordered
                    size={screenSize.isMobile ? "small" : "middle"}
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? "bg-gray-50" : ""
                    }
                    pagination={{
                      pageSize: screenSize.isMobile ? 5 : 10,
                      showSizeChanger: !screenSize.isMobile,
                      showTotal: !screenSize.isMobile
                        ? (total) => `Total ${total} tasks`
                        : undefined,
                      showQuickJumper: !screenSize.isMobile,
                      position: ["bottomRight"],
                      size: screenSize.isMobile ? "small" : "default",
                    }}
                    scroll={{ x: "max-content" }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    {...expandableConfig}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Task Modal for desktop */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-green-600" />
            <span>Edit Task</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={updateLoading}
            onClick={handleUpdateTask}
            style={{
              backgroundColor: "#04AA6D",
              color: "white",
              borderColor: "#52c41a",
            }}
          >
            Update Task
          </Button>,
        ]}
        width={600}
        maskClosable={false}
        destroyOnClose={true}
      >
        {renderEditForm()}
      </Modal>

      {/* Edit Task Drawer for mobile */}
      <Drawer
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-green-600" />
            <span>Edit Task</span>
          </div>
        }
        placement="right"
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        width={screenSize.width < 500 ? "100%" : 400}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleUpdateTask}
              loading={updateLoading}
              style={{
                backgroundColor: "#04AA6D",
                color: "white",
                borderColor: "#52c41a",
              }}
              block
            >
              Update Task
            </Button>
          </div>
        }
      >
        {renderEditForm()}
      </Drawer>
    </TaskAdminPanelLayout>
  );
};

export default TasksList;
