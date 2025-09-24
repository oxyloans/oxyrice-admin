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
  Col
} from "antd";
import axios from "axios";
import BASE_URL from "../../AdminPages/Config";
import TaskAdminPanelLayout from "../Layout/AdminPanel";

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

  return (
    <TaskAdminPanelLayout>
      <div className="px-6 py-6 max-w-5xl mx-auto">
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
              <Title
                level={3}
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                  color: "#1677ff",
                    fontWeight: 400,
                  
                }}
              >
                {instructionData.instructionHeader}
              </Title>

              <Paragraph
                style={{
                  fontSize: "16px",
                  lineHeight: "1.7",
                  background: "#fafafa",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  whiteSpace: "pre-line",
                }}
              >
                {instructionData.radhaInstructions}
              </Paragraph>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                Created: {formatDateIST(instructionData.radhaInstructeddate)} |{" "}
                Last Updated: {formatDateIST(instructionData.radhaUpdateDate)}
              </Text>
              <Divider />
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
              <Divider />
            </Col>
          </Row>

          {/* Employee Interactions */}
          {interactions.length > 0 ? (
            <div>
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
    </TaskAdminPanelLayout>
  );
};

export default RadhaInstructionView;

