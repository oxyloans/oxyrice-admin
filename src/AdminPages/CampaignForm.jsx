"use client";

import { useMemo, useState } from "react";
import AdminPanelLayoutTest from "./AdminPanel";
import BASE_URL from "./Config";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Space,
  message,
  Typography,
  Upload,
  Modal,
  Descriptions,
  Tooltip,
  Alert,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PRIMARY = "#008cba";
const SECONDARY = "#1ab394";
const BORDER_COLOR = "#d9d9d9";

export default function CampaignForm() {
  const [form] = Form.useForm();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const invitationType = Form.useWatch("invitationType", form);

  const initialValues = useMemo(
    () => ({
      // invitationType: "",
      perDaySendMails: "",
      lastProcessedRow: 0,
      mailSubject: "",
      // fromMail: "",
      displayName: "",
      createdBy: "",
      sampleMessage: "",
      excelUrl: "",
      startDate: null,
      endDate: null,
    }),
    [],
  );

  // ✅ Upload Excel
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);

      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadUrl = `${BASE_URL}/upload-service/upload?id=45880e62-acaf-4645-a83e-d1c8498e923e&fileType=aadhar`;
      const accessToken = localStorage.getItem("token");

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: uploadForm,
      });

      const data = await res.json();

      if (!res.ok || !data?.documentPath) {
        throw new Error(data?.message || "Upload failed");
      }

      form.setFieldsValue({ excelUrl: data.documentPath });
      setUploadedFile(file.name);
      message.success("Excel uploaded successfully");

      onSuccess?.("ok");
    } catch (e) {
      message.error("File upload failed");
      onError?.(e);
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = (values) => {
    const common = {
      sampleMessage: values.sampleMessage,
      displayName: values.displayName,
      createdBy: values.createdBy,
      fromMail: values.fromMail,
      perDaySendMails: values.perDaySendMails,
      startDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : null,
      endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      invitationType: values.invitationType,
      mailSubject: values.mailSubject,
      projectType: values.ProjectType,
    };

    if (values.invitationType === "sample") {
      return {
        ...common,
        sampleEmail: values.sampleEmail,
        // ❌ excelUrl not included
      };
    }

    // bulk
    return {
      ...common,
      excelUrl: values.excelUrl,
    };
  };

  const openPreview = async () => {
    try {
      await form.validateFields();
      setPreviewOpen(true);
    } catch {
      message.error("Please fix validation errors before preview");
    }
  };

  const submitWithConfirm = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values);

      Modal.confirm({
        title: "Confirm Campaign Creation",
        width: "90%",
        maxWidth: 700,
        okText: "Yes, Create Campaign",
        cancelText: "Cancel",
        okButtonProps: {
          style: { background: PRIMARY, borderColor: PRIMARY },
          size: "large",
        },
        cancelButtonProps: { size: "large" },
        content: (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Alert
              message="Please verify all details before creating the campaign"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Descriptions
              size="small"
              column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              bordered
            >
              <Descriptions.Item label={<strong>Invitation Type</strong>}>
                {payload.invitationType || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Mail Subject</strong>}>
                {payload.mailSubject || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>From Mail Address</strong>}>
                {payload.fromMail || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Display Name</strong>}>
                {payload.displayName || "-"}
              </Descriptions.Item>
              {payload.invitationType === "sample" && (
                <Descriptions.Item label={<strong>Sample Email</strong>}>
                  {payload.sampleEmail || "-"}
                </Descriptions.Item>
              )}

              <Descriptions.Item label={<strong>Created By</strong>}>
                {payload.createdBy || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Daily Email Limit</strong>}>
                {payload.perDaySendMails
                  ? `${payload.perDaySendMails} emails/day`
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Last Processed Row</strong>}>
                {payload.lastProcessedRow ?? "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Campaign Start Date</strong>}>
                {payload.startDate || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Campaign End Date</strong>}>
                {payload.endDate || "-"}
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Sample Message</strong>}>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {payload.sampleMessage || "-"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label={<strong>Excel File URL</strong>}>
                <Text code style={{ wordBreak: "break-all", fontSize: 12 }}>
                  {payload.excelUrl || "-"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ),
        onOk: async () => {
          try {
            setConfirming(true);
            setSubmitting(true);

            const res = await fetch(`${BASE_URL}/user-service/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
              message.success("Campaign created successfully!");
              form.resetFields();
              form.setFieldsValue(initialValues);
              setUploadedFile(null);
            } else {
              message.error(data?.message || "Failed to create campaign");
            }
          } catch (error) {
            message.error("Something went wrong: " + error.message);
          } finally {
            setConfirming(false);
            setSubmitting(false);
          }
        },
      });
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <AdminPanelLayoutTest>
      <div
        style={{ maxWidth: "100%", padding: "12px 8px", minHeight: "100vh" }}
      >
        <Card bodyStyle={{ padding: "16px 20px" }}>
          <Space direction="vertical" size={0} style={{ width: "100%" }}>
            <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
              Email Campaign Creation
            </Title>
            <Text type="secondary">
              Create and manage email campaigns using Excel spreadsheets
            </Text>
          </Space>
        </Card>

        {/* Form Section */}
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          requiredMark="optional"
        >
          {/* File Upload Section */}
          {invitationType !== "sample" && (
            <Card
              title={
                <span style={{ color: PRIMARY }}>
                  <strong>Upload Email List</strong>
                </span>
              }
              style={{ marginBottom: 20 }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<strong>Excel File (.xlsx, .xls, .csv)</strong>}
                    extra="Upload your email list in Excel format"
                  >
                    <Upload
                      accept=".xlsx,.xls,.csv"
                      customRequest={handleUpload}
                      showUploadList={false}
                      maxCount={1}
                      disabled={uploading}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploading}
                        size="large"
                        block
                        style={{
                          background: SECONDARY,
                          color: "#fff",
                          borderColor: SECONDARY,
                        }}
                      >
                        {uploading ? "Uploading..." : "Choose Excel File"}
                      </Button>
                    </Upload>
                    {uploadedFile && (
                      <div style={{ marginTop: 8, color: PRIMARY }}>
                        <CheckCircleOutlined /> File: {uploadedFile}
                      </div>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<strong>Excel File URL (Auto-filled)</strong>}
                    name="excelUrl"
                    rules={[
                      {
                        required: invitationType === "bulk",
                        message: "Excel URL is required for BULK campaign",
                      },
                    ]}
                    extra="This field auto-populates after upload"
                  >
                    <Input
                      placeholder="Auto-filled after upload"
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}
          <Card
            title={
              <span style={{ color: PRIMARY }}>
                <strong>Campaign Settings</strong>
              </span>
            }
            style={{ marginBottom: 20 }}
            bodyStyle={{ padding: "16px 20px" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Invitation Type</strong>}
                  name="invitationType"
                  rules={[
                    {
                      required: true,
                      message: "Please select invitation type",
                    },
                  ]}
                  extra="Choose SAMPLE to send to one email or BULK to send to all in Excel"
                >
                  <Select
                    placeholder="Select invitation type"
                    size="large"
                    options={[
                      { label: "SAMPLE", value: "sample" },
                      { label: "BULK", value: "bulk" },
                    ]}
                    onChange={(val) => {
                      if (val !== "sample") {
                        form.setFieldsValue({ sampleEmail: undefined });
                      } else {
                        // switching to sample
                        form.setFieldsValue({ excelUrl: undefined });
                        setUploadedFile(null);
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              {invitationType === "sample" && (
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={<strong>Sample Email</strong>}
                    name="sampleEmail"
                    rules={[
                      { required: true, message: "Please enter sample email" },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (value.includes(" ")) {
                            return Promise.reject(
                              new Error("Email should not contain spaces"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    extra="This email will receive a test campaign message"
                  >
                    <Input
                      type="email"
                      placeholder="e.g., test@gmail.com"
                      size="large"
                      maxLength={120}
                      showCount
                      onBlur={(e) =>
                        form.setFieldsValue({
                          sampleEmail: e.target.value?.trim(),
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              )}

              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Project Type</strong>}
                  name="ProjectType"
                  rules={[
                    {
                      required: true,
                      message: "Please select project type",
                    },
                  ]}
                  extra="Type of campaign invitation"
                >
                  <Select
                    placeholder="Select project type"
                    size="large"
                    options={[
                      { label: "oxybricks", value: "oxybricks" },
                      { label: "oxyloans", value: "oxyloans" },
                      { label: "askoxy", value: "askoxy" },
                      { label: "erice", value: "erice" },
                      { label: "studentx", value: "studentx" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Daily Email Limit</strong>}
                  name="perDaySendMails"
                  rules={[
                    { required: true, message: "Daily limit is required" },
                    { type: "number", min: 1, message: "Minimum 1 email" },
                    {
                      type: "number",
                      max: 50000,
                      message: "Maximum 50,000 emails",
                    },
                  ]}
                  extra="Emails to send per day (1-50,000)"
                >
                  <InputNumber
                    placeholder="e.g., 100"
                    style={{ width: "100%" }}
                    size="large"
                    min={1}
                    max={50000}
                  />
                </Form.Item>
              </Col>

              {/* <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Last Processed Row</strong>}
                  name="lastProcessedRow"
                  rules={[
                    { required: true, message: "This field is required" },
                    { type: "number", min: 0, message: "Must be 0 or more" },
                  ]}
                  extra={
                    <Tooltip title="Set to 0 for new campaigns, or the last row number if resuming">
                      <span>Set to 0 for new campaigns</span>
                    </Tooltip>
                  }
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: "100%" }}
                    size="large"
                    min={0}
                  />
                </Form.Item>
              </Col> */}

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label={<strong>Campaign Start Date</strong>}
                  name="startDate"
                  rules={[
                    { required: true, message: "Start date is required" },
                  ]}
                  extra="When to begin sending emails"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Select start date"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label={<strong>Campaign End Date</strong>}
                  name="endDate"
                  rules={[{ required: true, message: "End date is required" }]}
                  extra="When to stop sending emails"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Select end date"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Email Configuration Section */}
          <Card
            title={
              <span style={{ color: PRIMARY }}>
                <strong>Email Configuration</strong>
              </span>
            }
            style={{ marginBottom: 20 }}
            bodyStyle={{ padding: "16px 20px" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>From Email Address</strong>}
                  name="fromMail"
                  rules={[{ required: true, message: "From mail is required" }]}
                  extra="Select the sender email address"
                >
                  <Select
                    placeholder="Select sender email"
                    size="large"
                    options={[
                      {
                        label: "admin@oxyloans.com",
                        value: "admin@oxyloans.com",
                      },
                     
                   
                      {
                        label: "support@askoxy.ai",
                        value: "support@askoxy.ai",
                      },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Display Name</strong>}
                  name="displayName"
                  rules={[
                    { required: true, message: "Display name is required" },
                    { min: 2, message: "Minimum 2 characters" },
                    { max: 60, message: "Maximum 60 characters" },
                  ]}
                  extra="Name shown in recipient's inbox"
                >
                  <Input
                    placeholder="e.g., John Doe"
                    size="large"
                    maxLength={60}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} lg={8}>
                <Form.Item
                  label={<strong>Created By</strong>}
                  name="createdBy"
                  rules={[
                    { required: true, message: "Created by is required" },
                    { min: 2, message: "Minimum 2 characters" },
                    { max: 60, message: "Maximum 60 characters" },
                  ]}
                  extra="Your name or admin username"
                >
                  <Input
                    placeholder="e.g., admin"
                    size="large"
                    maxLength={60}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label={<strong>Email Subject Line</strong>}
                  name="mailSubject"
                  rules={[
                    { required: true, message: "Mail subject is required" },
                    { min: 3, message: "Minimum 3 characters" },
                    { max: 120, message: "Maximum 120 characters" },
                  ]}
                  extra="Subject line recipients will see (3-120 characters)"
                >
                  <Input
                    placeholder="Enter an engaging subject line"
                    size="large"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label={<strong>Sample Email Message</strong>}
                  name="sampleMessage"
                  rules={[
                    { required: true, message: "Sample message is required" },
                    { min: 10, message: "Minimum 10 characters" },
                    { max: 5000, message: "Maximum 5000 characters" },
                  ]}
                  extra="Email content that will be sent to all recipients (10-5000 characters)"
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Type your email message here..."
                    maxLength={5000}
                    showCount
                    style={{ fontSize: 14 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Campaign Settings Section */}

          {/* Action Buttons */}
          <Card
            style={{ marginBottom: 24 }}
            bodyStyle={{ padding: "16px 20px" }}
          >
            <Row justify="end" gutter={[12, 12]}>
              <Col xs={12} sm={8} md={6}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={openPreview}
                  block
                  size="large"
                  style={{
                    background: SECONDARY,
                    borderColor: SECONDARY,
                    color: "#fff",
                  }}
                >
                  Preview
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button
                  type="primary"
                  onClick={submitWithConfirm}
                  loading={submitting || confirming}
                  block
                  size="large"
                  style={{
                    background: PRIMARY,
                    borderColor: PRIMARY,
                  }}
                >
                  {submitting ? "Creating..." : "Create Campaign"}
                </Button>
              </Col>
            </Row>
          </Card>
        </Form>

        {/* Preview Modal */}
        <Modal
          title="Campaign Preview"
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          width="95%"
          maxWidth={700}
          footer={[
            <Button
              key="close"
              onClick={() => setPreviewOpen(false)}
              size="large"
            >
              Close
            </Button>,
            <Button
              key="create"
              type="primary"
              style={{ background: PRIMARY, borderColor: PRIMARY }}
              onClick={() => {
                setPreviewOpen(false);
                submitWithConfirm();
              }}
              loading={submitting}
              size="large"
            >
              Continue & Create
            </Button>,
          ]}
        >
          {(() => {
            const v = form.getFieldsValue(true);
            const payload = buildPayload(v);

            return (
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Descriptions
                  size="small"
                  column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                  bordered
                >
                  <Descriptions.Item label={<strong>Invitation Type</strong>}>
                    {payload.invitationType || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Mail Subject</strong>}>
                    {payload.mailSubject || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>From Mail</strong>}>
                    {payload.fromMail || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Display Name</strong>}>
                    {payload.displayName || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Created By</strong>}>
                    {payload.createdBy || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={<strong>Per Day Send Mails</strong>}
                  >
                    {payload.perDaySendMails
                      ? `${payload.perDaySendMails} emails/day`
                      : "-"}
                  </Descriptions.Item>
                  {payload.invitationType === "sample" && (
                    <Descriptions.Item label={<strong>Sample Email</strong>}>
                      {payload.sampleEmail || "-"}
                    </Descriptions.Item>
                  )}

                  <Descriptions.Item
                    label={<strong>Last Processed Row</strong>}
                  >
                    {payload.lastProcessedRow ?? "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Start Date</strong>}>
                    {payload.startDate || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>End Date</strong>}>
                    {payload.endDate || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Sample Message</strong>}>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        backgroundColor: "#fafafa",
                        padding: 12,
                        borderRadius: 4,
                        maxHeight: 250,
                        overflowY: "auto",
                        border: `1px solid ${BORDER_COLOR}`,
                      }}
                    >
                      {payload.sampleMessage || "-"}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={<strong>Excel File URL</strong>}>
                    <Text
                      code
                      style={{ wordBreak: "break-all", fontSize: "12px" }}
                    >
                      {payload.excelUrl || "-"}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            );
          })()}
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
}
