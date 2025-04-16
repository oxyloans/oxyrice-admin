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
  CloseOutlined,
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

  // Available assignees - same as in TaskCreation component
  const availableAssignees = [
    { value: "VINOD", label: "Vinod", color: "purple" },
    { value: "NAVEEN", label: "Naveen", color: "orange" },
    { value: "SURESH", label: "Suresh", color: "blue" },
    { value: "RAMESH", label: "Ramesh", color: "green" },
    { value: "RAJU", label: "Raju", color: "red" },
    { value: "MAHESH", label: "Mahesh", color: "cyan" },
    { value: "GANESH", label: "Ganesh", color: "magenta" },
  ];

  const creatorOptions = [
    { value: "ADMIN", label: "Admin", color: "blue" },
    { value: "USER", label: "User", color: "green" },
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

  const handleEditTask = (task) => {
    setCurrentTask(task);
    // Initialize form with current task values
    editForm.setFieldsValue({
      taskcontent: task.taskcontent,
      taskcreatedby: task.createdby,
      taskassingnedto: task.taskassingnedby,
    });

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

      // Make API call to update task
      const response = await axios.patch(
        `${BASE_URL}/user-service/write/updateTask/${currentTask.id}`,
        {
          taskcontent: values.taskcontent,
          taskcreatedby: values.taskcreatedby,
          taskassingnedto: values.taskassingnedto,
        }
      );

      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === currentTask.id
          ? {
              ...task,
              taskcontent: values.taskcontent,
              createdby: values.taskcreatedby,
              taskassingnedby: values.taskassingnedto,
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
              // style={{ color: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => handleEditTask(record)}
              title="Edit Task"
            >Edit</Button>
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
            #{id.substring(id.length - 4)}
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
          <span
           
          >
            {createdby}
          </span>
        ),
      });

      baseColumns.splice(4, 0, {
        title: "Assigned To",
        dataIndex: "taskassingnedby",
        key: "taskassingnedby",
        align: "center",
        onHeaderCell: () => ({
          style: centerStyle,
        }),
        render: (taskassingnedby) => (
          <span
            // color={taskassingnedby === "VINOD" ? "purple" : "orange"}
            // className="px-3 py-1 rounded-full font-medium"
          >
            {taskassingnedby}
          </span>
        ),
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
              <span
                // color={record.createdby === "ADMIN" ? "blue" : "green"}
                // className="ml-2 px-2 py-0.5 rounded-full font-medium"
              >
                {record.createdby}
              </span>
            </p>
            <p className="mt-2">
              <strong>Assigned To:</strong>{" "}
              <span
               
              >
                {record.taskassingnedby}
              </span>
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
              <span  className="px-2 py-0.5">
                {option.label}
              </span>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="taskassingnedto"
        label="Assigned To"
        rules={[{ required: true, message: "Please select assignee" }]}
      >
        <Select placeholder="Select assignee">
          {availableAssignees.map((assignee) => (
            <Option key={assignee.value} value={assignee.value}>
              <span className="px-2 py-0.5">
                {assignee.label}
              </span>
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
