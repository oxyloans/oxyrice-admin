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
          <Tag key={index} color="blue" className="m-0">
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
        className="flex items-center text-blue-500 hover:text-blue-700"
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
          <span className="truncate">{comments}</span>
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
            <span className="truncate block max-w-[180px]">{content}</span>
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
          <Tag color={priority === "HIGH" ? "red" : "green"}>
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
            <Tag color={statusObj.color} className="flex items-center gap-1">
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
          <Text type="secondary" className="font-mono text-xs">
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
        width: 150,
        render: (taskassingnedto, record) => {
          const assignees = parseAssignees(
            taskassingnedto || record.taskassingnedby
          );
          if (assignees.length > 2) {
            return (
              <Space direction="vertical" size={4} align="center">
                <Space wrap size={4}>
                  <Tag color="blue">{assignees[0]}</Tag>
                  <Tag color="blue">{assignees[1]}</Tag>
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
          <div className="p-3 bg-gray-50 space-y-2">
            <div>
              <Text strong>Task ID: </Text>
              <Text type="secondary" className="font-mono text-xs">
                {record.id}
              </Text>
            </div>
            <div>
              <Text strong>Created By: </Text>
              <Tag color={record.createdby === "ADMIN" ? "blue" : "green"}>
                {record.createdby || "N/A"}
              </Tag>
            </div>
            <div>
              <Text strong>Assigned To: </Text>
              {renderAssignedMembers(
                record.taskassingnedto || record.taskassingnedby
              )}
            </div>
            <div>
              <Text strong>Comments: </Text>
              {renderComments(record.comments)}
            </div>
            <div>
              <Text strong>Link: </Text>
              {renderLink(record.link)}
            </div>
          </div>
        ),
      }
    : {};

  const renderEditForm = () => (
    <Form form={editForm} layout="vertical">
      <Form.Item
        name="taskcontent"
        label="Task Description"
        rules={[{ required: true, message: "Please enter task description" }]}
      >
        <TextArea
          rows={screenSize.isMobile ? 3 : 4}
          placeholder="Enter task description"
        />
      </Form.Item>
      <Form.Item
        name="taskcreatedby"
        label="Created By"
        rules={[{ required: true, message: "Please select creator" }]}
      >
        <Select placeholder="Select creator">
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
        <Input placeholder="Enter task link" prefix={<LinkOutlined />} />
      </Form.Item>
    </Form>
  );

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <Card>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={12}>
              <Title level={screenSize.isMobile ? 4 : 3}>
                Tasks Management
              </Title>
              <Text type="secondary">Manage and monitor all tasks</Text>
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
                  className="w-full md:w-64"
                />
                <Space size="small">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTasks}
                    loading={loading}
                  >
                    {screenSize.isTablet && "Refresh"}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    href="/taskmanagement/taskcreation"
                  >
                    {screenSize.isTablet && "New Task"}
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>

          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row justify="space-between" align="middle" className="mb-4">
                  <Col>
                    <Space>
                      <Text strong>Total Tasks:</Text>
                      <Badge
                        count={filteredTasks.length}
                        showZero
                        style={{ backgroundColor: "#1890ff" }}
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Button icon={<DownloadOutlined />}>
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
                />
              </>
            )}
          </div>
        </Card>

        <Modal
          title={
            <Space>
              <EditOutlined />
              Edit Task
            </Space>
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
            >
              Update Task
            </Button>,
          ]}
          width={screenSize.isTablet ? "90%" : 600}
          destroyOnClose
        >
          {renderEditForm()}
        </Modal>

        <Drawer
          title={
            <Space>
              <EditOutlined />
              Edit Task
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
              >
                Update Task
              </Button>
              <Button onClick={() => setEditDrawerVisible(false)} block>
                Cancel
              </Button>
            </Space>
          }
        >
          {renderEditForm()}
        </Drawer>
      </div>
    </TaskAdminPanelLayout>
  );
};

export default TasksList;
