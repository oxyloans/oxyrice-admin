"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  List,
  Typography,
  Avatar,
  Tag,
  Empty,
  Image,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Badge,
  Tooltip,
  Popconfirm,
} from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import {
  ArrowLeftOutlined,
  MessageOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const isImage = (url) => /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i.test(url);

const formatDateIST = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toLocaleString("en-IN", {
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RadhaInstructionView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [instructionData, setInstructionData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [formInteraction] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchInstructionData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/user-service/write/getRadhaInstructionId?id=${id}`
      );
      setInstructionData(res.data);
    } catch (err) {
      message.error("❌ Failed to fetch instruction data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user-service/getAllEmployees`);
      setEmployees(res.data);
    } catch (err) {
      message.error("❌ Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (id) fetchInstructionData();
  }, [id]);
  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`${BASE_URL}/user-service/write/delete/${documentId}`);
      message.success("✅ Document deleted successfully");
      fetchInstructionData(); // Refresh data after delete
    } catch (err) {
      message.error("❌ Failed to delete document");
    }
  };
  if (loading || !instructionData) {
    return (
      <TaskAdminPanelLayout>
        <div className="min-h-screen flex justify-center items-center ">
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
            <Spin size="large" tip="Loading instruction details..." />
            <div className="mt-4 text-gray-600">
              Please wait while we fetch the data...
            </div>
          </div>
        </div>
      </TaskAdminPanelLayout>
    );
  }

  const getEmployeeName = (userId) => {
    if (
      userId === "91d2f250-20d0-44a5-9b4e-2acb73118b98" ||
      userId === instructionData.adminUserId
    )
      return "Radha";
    const emp = employees.find((e) => e.userId === userId);
    return emp ? emp.name : "Unknown User";
  };

  const interactions =
    instructionData.employeeInteractions?.map((i) => ({
      ...i,
      type: i.type || "EMPLOYEE",
      employeeName: getEmployeeName(i.userId),
    })) || [];

  const renderInteractionItem = (interaction) => (
    <div className="mb-6 last:mb-0">
      <Card
        className={`shadow-md hover:shadow-lg transition-all duration-300 border-0 ${
          interaction.type === "RADHA"
            ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-blue-500"
            : "bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-l-purple-500"
        }`}
        bodyStyle={{ padding: "20px" }}
      >
        <div className="flex items-start gap-4">
          <Badge
            count={interaction.type === "RADHA" ? "R" : "E"}
            style={{
              backgroundColor:
                interaction.type === "RADHA" ? "#1677ff" : "#722ed1",
              fontSize: "10px",
              minWidth: "18px",
              height: "18px",
              lineHeight: "18px",
            }}
          >
            <Avatar
              size={50}
              style={{
                backgroundColor:
                  interaction.type === "RADHA" ? "#1677ff" : "#722ed1",
                fontSize: "18px",
                fontWeight: "600",
              }}
              icon={<UserOutlined />}
            >
              {interaction.employeeName.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Text strong className="text-lg text-gray-800">
                {interaction.employeeName}
              </Text>
              <Tag
                color={interaction.type === "RADHA" ? "blue" : "purple"}
                className="px-3 py-1 rounded-full font-medium"
              >
                {interaction.type === "RADHA" ? "Admin" : "Employee"}
              </Tag>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <CalendarOutlined />
                <span>{formatDateIST(interaction.employeeConversionDate)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <Paragraph
                className="mb-0 text-gray-700 leading-relaxed"
                style={{ fontSize: "15px" }}
              >
                {interaction.employeeConversation}
              </Paragraph>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const handleInteractionSave = async (values) => {
    try {
      setSaving(true);
      const payload = {
        employeeConversation: values.employeeConversation,
        radhaInstructionsId: instructionData?.radhaInstructionsId,
        type: "RADHA",
        userid: instructionData?.adminUserId,
      };

      await axios.patch(
        `${BASE_URL}/user-service/write/radhaInteractions`,
        payload
      );
      message.success("✅ Interaction saved successfully!");
      setIsInteractionModalOpen(false);
      formInteraction.resetFields();
      fetchInstructionData();
    } catch (err) {
      message.error("❌ Failed to save interaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TaskAdminPanelLayout>
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              style={{
                backgroundColor: "#1c84c6",
                color: "white",
                borderRadius: "6px",
              }}
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <Button
              icon={<MessageOutlined />}
              style={{
                backgroundColor: "#1c84c6",
                color: "white",
                borderRadius: "6px",
              }}
              onClick={() => setIsInteractionModalOpen(true)}
            >
              Write Message
            </Button>
          </div>
          {/* Header Section */}
          <div className=" p-4">
           
                <div className="text-gray-600 text-base">
                  Manage and review Radha's instructions and team interactions
                </div>
              
        
          </div>

          <Row gutter={[24, 24]}>
            {/* Left Section - Instructions */}
            <Col xs={24} lg={14}>
              <Card
                className="shadow-lg rounded-2xl border-0 h-full"
                bodyStyle={{ padding: "32px" }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Title level={3} className="mb-0 text-gray-800 font-bold">
                      Radha Instructions
                    </Title>
                  </div>
                  <Divider className="my-4" />
                </div>

                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <Title
                      level={4}
                      className="mb-3 text-blue-800 flex items-center gap-2"
                    >
                      Instruction Header
                    </Title>
                    <Paragraph className="text-gray-700 text-base leading-relaxed mb-0">
                      {instructionData.instructionHeader}
                    </Paragraph>
                  </div>

                  {/* Main Instructions */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <Title
                      level={4}
                      className="mb-3 text-purple-800 flex items-center gap-2"
                    >
                      Detailed Instructions
                    </Title>
                    <Paragraph className="text-gray-700 text-base leading-relaxed mb-0 whitespace-pre-wrap">
                      {instructionData.radhaInstructions}
                    </Paragraph>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <Title
                      level={4}
                      className="mb-4 text-green-800 flex items-center gap-2"
                    >
                      Timeline Information
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarOutlined className="text-blue-600" />
                          </div>
                          <div>
                            <Text strong className="block text-gray-800">
                              Created
                            </Text>
                            <Text className="text-gray-600 text-sm">
                              {formatDateIST(
                                instructionData.radhaInstructeddate
                              )}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <EditOutlined className="text-green-600" />
                          </div>
                          <div>
                            <Text strong className="block text-gray-800">
                              Last Updated
                            </Text>
                            <Text className="text-gray-600 text-sm">
                              {formatDateIST(instructionData.radhaUpdateDate)}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Right Section - Documents */}
            <Col xs={24} lg={10}>
              <Card
                className="shadow-lg rounded-2xl border-0 h-full"
                bodyStyle={{ padding: "32px" }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <Title level={3} className="mb-1 text-gray-800 font-bold">
                        Documents & Media
                      </Title>
                      <Text className="text-gray-500">
                        {instructionData.documents?.length || 0} files attached
                      </Text>
                    </div>
                  </div>
                  <Divider className="my-4" />
                </div>

                {instructionData.documents?.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {instructionData.documents.map((doc, idx) => (
                      <Col xs={12} sm={8} md={12} lg={12} key={idx}>
                        <Card
                          hoverable
                          className="h-full shadow-md hover:shadow-lg transition-all duration-300 border-0 rounded-xl overflow-hidden"
                          bodyStyle={{ padding: "16px" }}
                          cover={
                            isImage(doc.documentUrl) ? (
                              <div className="h-32 overflow-hidden">
                                <Image
                                  src={doc.documentUrl}
                                  alt={doc.documentName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <FileOutlined className="text-4xl text-gray-400" />
                              </div>
                            )
                          }
                        >
                          <div className="text-center">
                            <Tooltip title={doc.documentName}>
                              <Text
                                className="text-sm font-medium text-gray-700 block"
                                ellipsis
                              >
                                {doc.documentName}
                              </Text>
                            </Tooltip>
                            <Button
                              type="link"
                              size="small"
                              icon={<DownloadOutlined />}
                              className="mt-2 text-blue-600 hover:text-blue-800"
                              href={doc.documentUrl}
                              target="_blank"
                            >
                              View
                            </Button>
                            <Popconfirm
                              title="Are you sure to delete this document?"
                              onConfirm={() =>
                                handleDeleteDocument(doc.documentId)
                              }
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                danger
                                type="link"
                                size="small"
                                icon={<DeleteOutlined />}
                              >
                                Delete
                              </Button>
                            </Popconfirm>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gray-50 rounded-2xl inline-block mb-4">
                      <FileOutlined className="text-6xl text-gray-300" />
                    </div>
                    <Empty
                      description={
                        <div>
                          <div className="text-gray-600 font-medium mb-2">
                            No documents available
                          </div>
                          <Text className="text-gray-400 text-sm">
                            Documents will appear here when uploaded
                          </Text>
                        </div>
                      }
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Interactions Section */}
          <div className="mt-8">
            <Card
              className="shadow-lg rounded-2xl border-0"
              bodyStyle={{ padding: "32px" }}
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <Title level={3} className="mb-1 text-gray-800 font-bold">
                        Team Conversations
                      </Title>
                      <Text className="text-gray-500">
                        {interactions.length} conversation
                        {interactions.length !== 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>

                  <Badge count={interactions.length} showZero color="#722ed1" />
                </div>
                <Divider className="my-4" />
              </div>

              {interactions.length > 0 ? (
                <div className="space-y-0">
                  {interactions
                    .sort(
                      (a, b) =>
                        new Date(b.employeeConversionDate).getTime() -
                        new Date(a.employeeConversionDate).getTime()
                    )
                    .map((interaction, index) => (
                      <div key={index}>
                        {renderInteractionItem(interaction)}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="p-8 bg-gray-50 rounded-2xl inline-block mb-6">
                    <MessageOutlined className="text-8xl text-gray-300" />
                  </div>
                  <Empty
                    description={
                      <div>
                        <div className="text-gray-600 font-medium mb-2 text-lg">
                          No conversations yet
                        </div>
                        <Text className="text-gray-400">
                          Start the conversation by writing a message
                        </Text>
                      </div>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      size="large"
                      className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 border-0 px-8 py-2 h-auto rounded-xl font-medium"
                      onClick={() => setIsInteractionModalOpen(true)}
                    >
                      Start Conversation
                    </Button>
                  </Empty>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageOutlined className="text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              New Message
            </span>
          </div>
        }
        open={isInteractionModalOpen}
        onCancel={() => setIsInteractionModalOpen(false)}
        footer={null}
        centered
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        <Form
          layout="vertical"
          form={formInteraction}
          onFinish={handleInteractionSave}
          className="mt-6"
        >
          <Form.Item
            label={
              <span className="text-base font-medium text-gray-700">
                Your Message
              </span>
            }
            name="employeeConversation"
            rules={[
              { required: true, message: "Please enter your message" },
              {
                min: 10,
                message: "Message should be at least 10 characters long",
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Write your message here..."
              className="rounded-xl text-base"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                size="large"
                onClick={() => setIsInteractionModalOpen(false)}
                className="px-6 py-2 h-auto rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 px-8 py-2 h-auto rounded-xl font-medium shadow-md"
                icon={<MessageOutlined />}
              >
                {saving ? "Sending..." : "Send Message"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default RadhaInstructionView;
