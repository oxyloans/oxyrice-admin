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
  Modal,
  Form,
  Select,
  Drawer,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  LinkOutlined,
  CommentOutlined,
  UserOutlined,
  TeamOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

const { Title, Text } = Typography;
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
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
  });

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
    { value: "VISWA", label: "Viswa" },
  ];

  const creatorOptions = [{ value: "ADMIN", label: "Admin" }];

  useEffect(() => {
    fetchTasks();

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
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
      }
    } catch (error) {
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.taskcontent?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.createdby?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.taskassingnedby?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.comments?.toLowerCase().includes(searchText.toLowerCase())
  );

  const parseAssignees = (assigneesData) => {
    if (!assigneesData) return [];
    return typeof assigneesData === "string"
      ? assigneesData.split(",").map((item) => item.trim())
      : Array.isArray(assigneesData)
        ? assigneesData
        : [];
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    const taskAssignees = parseAssignees(
      task.taskassingnedto || task.taskassingnedby
    );

    editForm.setFieldsValue({
      taskcontent: task.taskcontent,
      taskcreatedby: task.createdby,
      taskassingnedto: taskAssignees,
      comments: task.comments || "",
      link: task.link || "",
    });

    setEditDrawerVisible(screenSize.isMobile);
    setEditModalVisible(!screenSize.isMobile);
  };

  const handleUpdateTask = async () => {
    try {
      const values = await editForm.validateFields();
      setUpdateLoading(true);

      await axios.patch(
        `${BASE_URL}/user-service/write/updateTask/${currentTask.id}`,
        {
          taskcontent: values.taskcontent,
          taskcreatedby: values.taskcreatedby,
          taskassingnedto: values.taskassingnedto,
          admindocumentid: currentTask.admindocumentid || "string",
          comments: values.comments,
          link: values.link,
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                taskcontent: values.taskcontent,
                createdby: values.taskcreatedby,
                taskassingnedby: values.taskassingnedto.join(", "),
                taskassingnedto: values.taskassingnedto,
                comments: values.comments,
                link: values.link,
              }
            : task
        )
      );

      message.success("Task updated successfully");
      setEditModalVisible(false);
      setEditDrawerVisible(false);
    } catch (error) {
      message.error("Failed to update task");
    } finally {
      setUpdateLoading(false);
    }
  };

  const renderAssignedMembers = (assignees) => {
    const assigneeList = parseAssignees(assignees);
    return (
      <Space wrap size={4} className="justify-center">
        {assigneeList.map((assignee, index) => (
          <Tag key={index} color="blue" className="m-0 font-medium">
            {assignee}
          </Tag>
        ))}
        {!assigneeList.length && <Text type="secondary">Not assigned</Text>}
      </Space>
    );
  };

  const renderLink = (link) => {
    if (!link) return <Text type="secondary">No link</Text>;
    const formattedLink = link.startsWith("http") ? link : `https://${link}`;
    return (
      <a
        href={formattedLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
      >
        <LinkOutlined className="mr-1" />
        <span className="truncate max-w-[120px]">{link}</span>
      </a>
    );
  };

  const renderComments = (comments) => {
    if (!comments) return <Text type="secondary">No comments</Text>;
    return (
      <Tooltip title={comments}>
        <div className="flex items-center max-w-[150px]">
          <CommentOutlined className="mr-1 text-gray-500" />
          <span className="truncate text-gray-600">{comments}</span>
        </div>
      </Tooltip>
    );
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: "S.No",
        key: "serialNumber",
        width: 60,
        render: (_, __, index) => index + 1,
        align: "center",
      },
      {
        title: "Task",
        dataIndex: "taskcontent",
        key: "taskcontent",
        align: "center",
        width: screenSize.isMobile ? 120 : 200,
        render: (content) => (
          <Tooltip title={content}>
            <span className="truncate block max-w-[180px] text-gray-800">
              {content}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Comments",
        dataIndex: "comments",
        key: "comments",
        align: "center",
        width: screenSize.isMobile ? 100 : 150,
        render: renderComments,
      },
      {
        title: "Link",
        dataIndex: "link",
        key: "link",
        align: "center",
        width: screenSize.isMobile ? 100 : 120,
        render: renderLink,
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        align: "center",
        width: 100,
        render: (priority) => (
          <Tag
            color={priority === "HIGH" ? "red" : "green"}
            className="font-medium"
          >
            {priority || "LOW"}
          </Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 120,
        render: (status) => {
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

          const statusObj = statusMap[status] || {
            text: status || "Unknown",
            color: "default",
            icon: <ExclamationCircleOutlined />,
          };

          return (
            <Tag
              color={statusObj.color}
              className="flex items-center gap-1 font-medium"
            >
              {statusObj.icon}
              {statusObj.text}
            </Tag>
          );
        },
        filters: [
          { text: "CREATED", value: "1" },
          { text: "ACCEPTED", value: "2" },
          { text: "PENDING", value: "3" },
          { text: "COMPLETED", value: "4" },
        ],
        onFilter: (value, record) =>
          record.status === value ||
          record.status === value.toString() ||
          (value === "1" && record.status === "CREATED") ||
          (value === "2" && record.status === "ACCEPTED") ||
          (value === "3" && record.status === "PENDING") ||
          (value === "4" && record.status === "COMPLETED"),
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
            className="text-blue-600 hover:text-blue-800"
            aria-label={`Edit task ${record.taskcontent}`}
            title="Edit Task"
          />
        ),
      },
    ];

    if (!screenSize.isMobile) {
      baseColumns.splice(1, 0, {
        title: "ID",
        dataIndex: "id",
        key: "id",
        align: "center",
        width: 80,
        render: (id) => (
          <Text type="secondary" className="font-mono text-xs text-gray-600">
            #{id?.substring(id.length - 4) || "N/A"}
          </Text>
        ),
      });

      baseColumns.splice(3, 0, {
        title: "Created By",
        dataIndex: "createdby",
        key: "createdby",
        align: "center",
        width: 120,
        render: (createdby) => (
          <Tag
            color={createdby === "ADMIN" ? "blue" : "green"}
            className="font-medium"
          >
            {createdby || "N/A"}
          </Tag>
        ),
      });

      baseColumns.splice(4, 0, {
        title: "Assigned To",
        dataIndex: "taskassingnedto",
        key: "taskassingnedto",
        align: "center",
        width: 150,
        render: (taskassingnedto, record) => {
          const assignees = parseAssignees(
            taskassingnedto || record.taskassingnedby
          );
          if (assignees.length > 2) {
            return (
              <Space direction="vertical" size={4} align="center">
                <Space wrap size={4}>
                  <Tag color="blue" className="font-medium">
                    {assignees[0]}
                  </Tag>
                  <Tag color="blue" className="font-medium">
                    {assignees[1]}
                  </Tag>
                </Space>
                <Badge
                  count={`+${assignees.length - 2}`}
                  style={{ backgroundColor: "#1890ff" }}
                  title={assignees.slice(2).join(", ")}
                />
              </Space>
            );
          }
          return renderAssignedMembers(
            taskassingnedto || record.taskassingnedby
          );
        },
      });
    }

    return baseColumns;
  };

  const expandableConfig = screenSize.isMobile
    ? {
        expandedRowRender: (record) => (
          <div className="p-3 bg-gray-50 space-y-2 rounded-lg">
            <div>
              <Text strong className="text-gray-800">
                Task ID:{" "}
              </Text>
              <Text
                type="secondary"
                className="font-mono text-xs text-gray-600"
              >
                {record.id}
              </Text>
            </div>
            <div>
              <Text strong className="text-gray-800">
                Created By:{" "}
              </Text>
              <Tag
                color={record.createdby === "ADMIN" ? "blue" : "green"}
                className="font-medium"
              >
                {record.createdby || "N/A"}
              </Tag>
            </div>
            <div>
              <Text strong className="text-gray-800">
                Assigned To:{" "}
              </Text>
              {renderAssignedMembers(
                record.taskassingnedto || record.taskassingnedby
              )}
            </div>
            <div>
              <Text strong className="text-gray-800">
                Comments:{" "}
              </Text>
              {renderComments(record.comments)}
            </div>
            <div>
              <Text strong className="text-gray-800">
                Link:{" "}
              </Text>
              {renderLink(record.link)}
            </div>
          </div>
        ),
      }
    : {};

  const renderEditForm = () => (
    <Form form={editForm} layout="vertical" className="space-y-4">
      <Form.Item
        name="taskcontent"
        label="Task Description"
        rules={[{ required: true, message: "Please enter task description" }]}
      >
        <TextArea
          rows={screenSize.isMobile ? 3 : 4}
          placeholder="Enter task description"
          className="border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
          aria-label="Task description"
        />
      </Form.Item>
      <Form.Item
        name="taskcreatedby"
        label="Created By"
        rules={[{ required: true, message: "Please select creator" }]}
      >
        <Select
          placeholder="Select creator"
          className="rounded-lg"
          aria-label="Select task creator"
        >
          {creatorOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              <Space>
                <UserOutlined />
                {option.label}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="taskassingnedto"
        label="Assigned To"
        rules={[
          { required: true, message: "Please select at least one assignee" },
          {
            validator: (_, value) =>
              value && value.length <= 5
                ? Promise.resolve()
                : Promise.reject(new Error("Maximum 5 assignees allowed")),
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select team members"
          maxTagCount="responsive"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children[1].props.children
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          className="rounded-lg"
          aria-label="Select assignees"
        >
          {availableAssignees.map((assignee) => (
            <Option key={assignee.value} value={assignee.value}>
              <Space>
                <UserOutlined />
                {assignee.label}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="comments"
        label="Comments"
        rules={[{ max: 500, message: "Comments cannot exceed 500 characters" }]}
      >
        <TextArea
          rows={screenSize.isMobile ? 2 : 3}
          placeholder="Add comments"
          className="border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
          aria-label="Task comments"
        />
      </Form.Item>
      <Form.Item
        name="link"
        label="Link"
        rules={[
          {
            type: "url",
            message: "Please enter a valid URL",
            warningOnly: true,
          },
        ]}
      >
        <Input
          placeholder="Enter task link"
          prefix={<LinkOutlined />}
          className="border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
          aria-label="Task link"
        />
      </Form.Item>
    </Form>
  );

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
        <Card className="shadow-md rounded-xl bg-white border border-gray-200">
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={12}>
              <Title
                level={screenSize.isMobile ? 4 : 3}
                className="text-gray-800 font-bold mb-1"
              >
                Tasks Management
              </Title>
              <Text type="secondary" className="text-gray-600">
                Manage and monitor all tasks
              </Text>
            </Col>
            <Col xs={24} md={12}>
              <Space
                direction={screenSize.isMobile ? "vertical" : "horizontal"}
                size="middle"
                className="w-full justify-end"
                wrap
              >
                <Input
                  placeholder="Search tasks..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  className="w-full md:w-64 border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                  aria-label="Search tasks"
                />
                <Space size="small">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTasks}
                    loading={loading}
                    className="border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg"
                    aria-label="Refresh tasks"
                  >
                    {screenSize.isTablet && "Refresh"}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    href="/taskmanagement/taskcreation"
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    aria-label="Create new task"
                  >
                    {screenSize.isTablet && "New Task"}
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>

          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Loading tasks..." />
              </div>
            ) : (
              <>
                <Row justify="space-between" align="middle" className="mb-4">
                  <Col>
                    <Space>
                      <Text strong className="text-gray-800">
                        Total Tasks:
                      </Text>
                      <Badge
                        count={filteredTasks.length}
                        showZero
                        style={{ backgroundColor: "#1890ff" }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      icon={<DownloadOutlined />}
                      className="border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg"
                      aria-label="Export tasks"
                    >
                      {screenSize.isTablet && "Export"}
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={getColumns()}
                  dataSource={filteredTasks}
                  rowKey="id"
                  bordered
                  size="small"
                  pagination={{
                    pageSize: screenSize.isMobile ? 5 : 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} tasks`,
                    responsive: true,
                  }}
                  scroll={{ x: true }}
                  {...expandableConfig}
                  className="rounded-lg shadow-sm"
                  rowClassName={(record, index) =>
                    index % 2 === 0
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-white hover:bg-gray-100"
                  }
                />
              </>
            )}
          </div>
        </Card>

        <Modal
          title={
            <Space>
              <EditOutlined />
              <span className="text-gray-800 font-semibold">Edit Task</span>
            </Space>
          }
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setEditModalVisible(false)}
              className="border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg"
              aria-label="Cancel edit task"
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              icon={<SaveOutlined />}
              loading={updateLoading}
              onClick={handleUpdateTask}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Update task"
            >
              Update Task
            </Button>,
          ]}
          width={screenSize.isTablet ? "90%" : 600}
          destroyOnClose
          className="rounded-lg"
        >
          {renderEditForm()}
        </Modal>

        <Drawer
          title={
            <Space>
              <EditOutlined />
              <span className="text-gray-800 font-semibold">Edit Task</span>
            </Space>
          }
          placement="right"
          onClose={() => setEditDrawerVisible(false)}
          open={editDrawerVisible}
          width={screenSize.isMobile ? "100%" : "90%"}
          footer={
            <Space className="w-full" direction="vertical">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateTask}
                loading={updateLoading}
                block
                className="bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Update task"
              >
                Update Task
              </Button>
              <Button
                onClick={() => setEditDrawerVisible(false)}
                block
                className="border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg"
                aria-label="Cancel edit task"
              >
                Cancel
              </Button>
            </Space>
          }
          className="rounded-lg"
        >
          {renderEditForm()}
        </Drawer>
      </div>

      <style jsx global>{`
        .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #1f2937;
        }
        .ant-table-row {
          transition: background-color 0.2s ease;
        }
        .ant-table-row:hover {
          background-color: #f1f5f9 !important;
        }
        .ant-card {
          border: 1px solid #e5e7eb;
        }
        .ant-modal,
        .ant-drawer-content {
          border-radius: 8px;
        }
        .ant-form-item-label > label {
          color: #1f2937;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px;
          }
          .ant-table-tbody > tr > td {
            padding: 8px;
          }
          .ant-card-body {
            padding: 12px;
          }
          .ant-btn {
            padding: 4px 8px;
            font-size: 12px;
          }
          .ant-input,
          .ant-select-selector {
            font-size: 12px;
          }
        }
        @media (max-width: 480px) {
          .ant-table {
            font-size: 10px;
          }
          .ant-table-tbody > tr > td {
            padding: 6px;
          }
          .ant-card-title {
            font-size: 16px;
          }
          .ant-btn {
            padding: 4px 6px;
            font-size: 10px;
          }
          .ant-input,
          .ant-select-selector {
            font-size: 10px;
          }
          .ant-row {
            flex-direction: column;
            align-items: stretch;
          }
          .ant-col {
            width: 100%;
          }
        }
      `}</style>
    </TaskAdminPanelLayout>
  );
};

export default TasksList;
