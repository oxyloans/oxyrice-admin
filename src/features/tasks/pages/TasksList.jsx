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
  Statistic,
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
  SaveOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
 
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../../TaskManagement/Layout/AdminPanel";

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
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
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

  // Normalize status for comparison
  const normalizeStatus = (status) => {
    if (!status) return "UNKNOWN";

    const statusMap = {
      1: "CREATED",
      2: "ACCEPTED",
      3: "PENDING",
      4: "COMPLETED",
    };

    return statusMap[status] || status.toString().toUpperCase();
  };

  // Handle status card click
  const handleStatusCardClick = (status) => {
    if (activeStatusFilter === status) {
      setActiveStatusFilter(null); // Clear filter if same card is clicked
    } else {
      setActiveStatusFilter(status); // Set new filter
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.taskcontent?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.createdby?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.taskassingnedby?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.comments?.toLowerCase().includes(searchText.toLowerCase());

    const taskStatus = normalizeStatus(task.status);
    const matchesStatus = activeStatusFilter
      ? taskStatus === activeStatusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

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
    if (!assigneeList.length) {
      return <Text type="secondary">Not assigned</Text>;
    }

    return (
      <div style={{ textAlign: "center" }}>
        <Space wrap size={2} direction="vertical">
          {assigneeList.map((assignee, index) => (
            <Tag key={index} color="blue" size="small">
              {assignee}
            </Tag>
          ))}
        </Space>
      </div>
    );
  };

  const renderLink = (link) => {
    if (!link)
      return (
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">No link</Text>
        </div>
      );
    const formattedLink = link.startsWith("http") ? link : `https://${link}`;
    return (
      <div style={{ textAlign: "center" }}>
        <Tooltip title={link}>
          <a
            href={formattedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <LinkOutlined />
            <span className="ml-1 max-w-[100px] truncate inline-block">
              {link}
            </span>
          </a>
        </Tooltip>
      </div>
    );
  };

  const renderComments = (comments) => {
    if (!comments)
      return (
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">No comments</Text>
        </div>
      );
    return (
      <div style={{ textAlign: "center" }}>
        <Tooltip title={comments}>
          <div className="flex items-center justify-center">
            <CommentOutlined className="text-gray-500" />
            <span className="ml-1 max-w-[100px] truncate">{comments}</span>
          </div>
        </Tooltip>
      </div>
    );
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (id) => (
        <Text type="secondary" style={{ fontFamily: "monospace" }}>
          #{id?.slice(-4) || "N/A"}
        </Text>
      ),
    },
    {
      title: "Task",
      dataIndex: "taskcontent",
      key: "taskcontent",
      width: 200,
      align: "center",
      ellipsis: {
        showTitle: false, // disables default tooltip
      },
      render: (content) => (
        <Tooltip placement="topLeft" title={content}>
          <Typography.Text>{content}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "taskassingnedto",
      key: "taskassingnedto",
      width: 150,
      align: "center",
      render: (taskassingnedto, record) =>
        renderAssignedMembers(taskassingnedto || record.taskassingnedby),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => {
        const normalizedStatus = normalizeStatus(status);

        const statusConfig = {
          CREATED: { color: "blue" },
          ACCEPTED: { color: "green" },
          PENDING: { color: "orange" },
          COMPLETED: { color: "purple" },
        };

        const config = statusConfig[normalizedStatus] || { color: "default" };

        return (
          <Tag
            color={config.color}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {normalizedStatus}
          </Tag>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "createdby",
      key: "createdby",
      width: 80,
      align: "center",
      render: (createdby) => <Tag color="blue">{createdby || "N/A"}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      align: "center",
      render: (priority) => {
        const color = priority === "HIGH" ? "red" : "green";
        return <Tag color={color}>{priority || "LOW"}</Tag>;
      },
    },
    {
      title: "ProjectType",
      dataIndex: "projectType",
      key: "projectType",
      width: 120,
      align: "center",
      render: (projectType) => (
        <Tag color="geekblue">{projectType || "N/A"}</Tag>
      ),
    },
    {
      title: "BusinessUnitType",
      dataIndex: "businessUnitType",
      key: "businessUnitType",
      width: 100,
      align: "center",
      render: (businessUnitType) => (
        <Tag color="purple">{businessUnitType || "N/A"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditTask(record)}
          style={{ color: "#1677ff" }}
        />
      ),
    },
  ];

  const renderEditForm = () => (
    <Form form={editForm} layout="vertical">
      <Form.Item
        name="taskcontent"
        label="Task Description"
        rules={[{ required: true, message: "Please enter task description" }]}
      >
        <TextArea rows={3} placeholder="Enter task description" />
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

      <Form.Item name="comments" label="Comments">
        <TextArea rows={2} placeholder="Add comments" maxLength={500} />
      </Form.Item>

      <Form.Item name="link" label="Link">
        <Input placeholder="Enter task link" prefix={<LinkOutlined />} />
      </Form.Item>
    </Form>
  );

  const getStatusCounts = () => {
    const counts = {
      CREATED: 0,
      ACCEPTED: 0,
      PENDING: 0,
      COMPLETED: 0,
    };

    tasks.forEach((task) => {
      const status = normalizeStatus(task.status);
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const statusCards = [
    {
      key: "CREATED",
      title: "Created",
      count: statusCounts.CREATED,
      color: "#1890ff",
      icon: (
        <PlusCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
      ),
    },
    {
      key: "ACCEPTED",
      title: "Accepted",
      count: statusCounts.ACCEPTED,
      color: "#52c41a",
      icon: (
        <CheckCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
      ),
    },
    {
      key: "PENDING",
      title: "Pending",
      count: statusCounts.PENDING,
      color: "#faad14",
      icon: (
        <ClockCircleOutlined style={{ fontSize: "24px", color: "#faad14" }} />
      ),
    },
    {
      key: "COMPLETED",
      title: "Completed",
      count: statusCounts.COMPLETED,
      color: "#722ed1",
      icon: (
        <CheckCircleOutlined style={{ fontSize: "24px", color: "#722ed1" }} />
      ),
    },
  ];

  return (
    <TaskAdminPanelLayout>
      <div className="p-4 bg-gray-50 min-h-screen">
        <Card className="shadow-sm mb-4">
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={12}>
              <Title
                level={screenSize.isMobile ? 4 : 3}
                className="text-gray-800 mb-1"
              >
                Tasks Management
              </Title>
              <Text type="secondary">Manage and monitor all tasks</Text>
            </Col>
            <Col xs={24} md={12}>
              <Space
                direction={screenSize.isMobile ? "vertical" : "horizontal"}
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
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTasks}
                    loading={loading}
                  >
                    {!screenSize.isMobile && "Refresh"}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    href="/taskmanagement/taskcreation"
                  >
                    {!screenSize.isMobile && "New Task"}
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Status Summary Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          {statusCards.map((card) => (
            <Col xs={12} sm={6} key={card.key}>
              <Card
                hoverable
                className={`cursor-pointer transition-all duration-200 ${
                  activeStatusFilter === card.key
                    ? "border-2 shadow-lg"
                    : "border hover:shadow-md"
                }`}
                style={{
                  borderColor:
                    activeStatusFilter === card.key ? card.color : undefined,
                  backgroundColor:
                    activeStatusFilter === card.key
                      ? `${card.color}10`
                      : undefined,
                }}
                onClick={() => handleStatusCardClick(card.key)}
              >
                <Statistic
                  title={card.title}
                  value={card.count}
                  prefix={card.icon}
                  valueStyle={{
                    color: card.color,
                    textAlign: "center",
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filter Status Display */}
        {activeStatusFilter && (
          <Card
            size="small"
            className="mb-4"
            style={{ backgroundColor: "#f6ffed" }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <FilterOutlined style={{ color: "#52c41a" }} />
                  <Text strong>Filtered by: </Text>
                  <Tag
                    color={statusCards
                      .find((c) => c.key === activeStatusFilter)
                      ?.color?.replace("#", "")}
                  >
                    {activeStatusFilter}
                  </Tag>
                  <Text type="secondary">({filteredTasks.length} tasks)</Text>
                </Space>
              </Col>
              <Col>
                <Button
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={() => setActiveStatusFilter(null)}
                >
                  Clear Filter
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        <Card className="shadow-sm">
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Loading tasks..." />
              </div>
            ) : (
              <>
                <Row justify="space-between" align="middle" className="mb-4">
                  <Col>
                    <Space>
                      <Text strong>Total Tasks:</Text>
                      <Badge count={filteredTasks.length} showZero />
                    </Space>
                  </Col>
                  <Col>
                    <Button icon={<DownloadOutlined />}>
                      {!screenSize.isMobile && "Export"}
                    </Button>
                  </Col>
                </Row>

                <Table
                  columns={columns}
                  dataSource={filteredTasks}
                  rowKey="id"
                  bordered={true}
                  loading={loading}
                  size={screenSize.isMobile ? "small" : "middle"}
                  scroll={{ x: "100%" }}
                  pagination={{
                    pageSize: screenSize.isMobile ? 10 : 20,
                    showSizeChanger: !screenSize.isMobile,
                    showTotal: (total) => `Total ${total} tasks`,
                    size: screenSize.isMobile ? "small" : "default",
                  }}
                  className="overflow-x-auto"
                />
              </>
            )}
          </div>
        </Card>

        {/* Edit Modal for Desktop/Tablet */}
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

        {/* Edit Drawer for Mobile */}
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
          width="100%"
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
