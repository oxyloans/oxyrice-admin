"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Spin,
  message,
  Card,
  List,
  Typography,
  Divider,
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
} from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";
import { UploadOutlined,ArrowLeftOutlined, MessageOutlined } from "@ant-design/icons";
const { Title, Text, Paragraph } = Typography;

// Check if file is an image
const isImage = (url) => /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i.test(url);

const formatDateIST = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toLocaleString("en-IN", { hour12: true });
};

const RadhaInstructionView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [instructionData, setInstructionData] = useState(null);
  const [employees, setEmployees] = useState([]);
  // Modal state
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [formInteraction] = Form.useForm();
  const [saving, setSaving] = useState(false);
  // Fetch Radha Instruction
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

  // Fetch all employees
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

  if (loading || !instructionData) {
    return (
      <TaskAdminPanelLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <Spin size="large" tip="Loading instruction details..." />
        </div>
      </TaskAdminPanelLayout>
    );
  }

  // Map userId to employee name or Radha
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
    <List.Item
      style={{
        padding: "14px 18px",
        borderRadius: "12px",
        backgroundColor: interaction.type === "RADHA" ? "#f0f9ff" : "#fdf4ff",
        marginBottom: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      }}
    >
      <Avatar
        style={{
          backgroundColor: interaction.type === "RADHA" ? "#1677ff" : "#722ed1",
          marginRight: "14px",
        }}
        size={42}
      >
        {interaction.employeeName.charAt(0).toUpperCase()}
      </Avatar>
      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <Text strong>{interaction.employeeName}</Text>
          <Tag
            color={interaction.type === "RADHA" ? "blue" : "purple"}
            style={{ borderRadius: "6px" }}
          >
            {interaction.type}
          </Tag>
        </div>
        <Paragraph style={{ marginBottom: "6px" }}>
          {interaction.employeeConversation}
        </Paragraph>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {formatDateIST(interaction.employeeConversionDate)}
        </Text>
      </div>
    </List.Item>
  );

  // ✅ Save Interaction
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
      message.success("Interaction saved successfully!");
      setIsInteractionModalOpen(false);
      formInteraction.resetFields();
      fetchInstructionData();
    } catch (err) {
      message.error("Failed to save interaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TaskAdminPanelLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          {/* Back Button - Left */}
          <Button
            icon={<ArrowLeftOutlined />}
            style={{
              backgroundColor: "#1c84c6",
              color: "white",
              borderRadius: "6px",
            }}
            onClick={() => window.history.back()} // ⬅️ Go back
          >
            Back
          </Button>

          {/* Write To Us Button - Right */}
          <Button
            icon={<MessageOutlined />}
            style={{
              backgroundColor: "#1c84c6",
              color: "white",
              borderRadius: "6px",
            }}
            onClick={() => setIsInteractionModalOpen(true)}
          >
            Write To Us
          </Button>
        </div>
        <Card
          bordered={false}
          style={{
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderRadius: "14px",
          }}
        >
          {/* Header */}
          <Row gutter={[24, 24]} style={{ overflowX: "auto" }}>
            {/* Left Side - Header & Instructions */}
            <Col xs={24} md={12}>
              <Card
                bordered={false}
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  padding: "24px",
                  background: "#ffffff",
                  transition: "transform 0.2s",
                }}
                hoverable
              >
                {/* Card Header */}
                <Title
                  level={4}
                  style={{
                    marginBottom: "16px",
                    color: "#722ed1",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Radha Instructions
                </Title>

                {/* Instruction Header */}
                <Paragraph
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "#1c84c6",
                  }}
                >
                  {instructionData.instructionHeader}
                </Paragraph>

                {/* Instructions Content */}
                <Paragraph
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.8",
                    background: "#f7f9fc",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    border: "1px solid #e6eaf0",
                    color: "#333",
                    whiteSpace: "pre-line",
                  }}
                >
                  {instructionData.radhaInstructions}
                </Paragraph>

                {/* Created & Last Updated Info */}
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  🕒 Created:{" "}
                  {formatDateIST(instructionData.radhaInstructeddate)}
                  <br />
                  ✏️ Last Updated:{" "}
                  {formatDateIST(instructionData.radhaUpdateDate)}
                </Text>
              </Card>
            </Col>

            {/* Right Side - Documents */}
            <Col xs={24} md={12}>
              {instructionData.documents?.length > 0 ? (
                <div style={{ marginBottom: "20px" }}>
                  <Title
                    level={4}
                    style={{ marginBottom: "12px", color: "#722ed1" }}
                  >
                    Documents & Images
                  </Title>
                  <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={instructionData.documents}
                    renderItem={(doc) => (
                      <List.Item>
                        <Card
                          hoverable
                          style={{
                            borderRadius: "10px",
                            textAlign: "center",
                            padding: "12px",
                          }}
                        >
                          {isImage(doc.documentUrl) ? (
                            <Image
                              src={doc.documentUrl}
                              alt={doc.documentName}
                              style={{
                                maxHeight: "200px",
                                objectFit: "contain",
                                marginBottom: "8px",
                              }}
                            />
                          ) : (
                            <a
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontWeight: 500,
                                display: "block",
                                marginBottom: "8px",
                              }}
                            >
                              {doc.documentName}
                            </a>
                          )}
                          <Text>{doc.documentName}</Text>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <Empty description="No documents available" />
              )}
            </Col>
          </Row>

          {/* Employee Interactions */}
          {interactions.length > 0 ? (
            <div className="mt-4">
              <Title
                level={4}
                style={{ marginBottom: "16px", color: "#722ed1" }}
              >
                Team Conversations
              </Title>
              <List
                dataSource={interactions.sort(
                  (a, b) =>
                    new Date(b.employeeConversionDate).getTime() -
                    new Date(a.employeeConversionDate).getTime()
                )}
                renderItem={renderInteractionItem}
              />
            </div>
          ) : (
            <Empty description="No interactions yet" />
          )}
        </Card>
      </div>
      {/* ✅ Modal for Write To Us */}
      <Modal
        title="Add Interaction"
        open={isInteractionModalOpen}
        onCancel={() => setIsInteractionModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={formInteraction}
          onFinish={handleInteractionSave}
        >
          <Form.Item
            label="Admin Conversation"
            name="employeeConversation"
            rules={[{ required: true, message: "Please enter conversation" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ backgroundColor: "#1c84c6", color: "white" }}
              block
            >
              Save Interaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </TaskAdminPanelLayout>
  );
};

export default RadhaInstructionView;

