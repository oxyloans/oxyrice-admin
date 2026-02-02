"use client";

import { useMemo, useState } from "react";
import AdminPanelLayoutTest from "./AdminPanel";
import * as XLSX from "xlsx";
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
  Descriptions, Alert,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PRIMARY = "#008cba";
const SECONDARY = "#1ab394";
const BORDER_COLOR = "#d9d9d9";

const MESSAGE_STYLE = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  backgroundColor: "#f5f5f5",
  padding: 12,
  borderRadius: 4,
  maxHeight: 250,
  overflowY: "auto",
  border: `1px solid ${BORDER_COLOR}`,
};

const renderPreviewContent = (payload) => (
  <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
    <Descriptions
      size="small"
      column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      bordered
    >
      <Descriptions.Item label={<strong>Invitation Type</strong>}>
        {payload.invitationType || "-"}
      </Descriptions.Item>

      <Descriptions.Item label={<strong>Project Type</strong>}>
        {payload.projectType || "-"}
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

      <Descriptions.Item label={<strong>Campaign Start Date</strong>}>
        {payload.startDate || "-"}
      </Descriptions.Item>

      <Descriptions.Item label={<strong>Campaign End Date</strong>}>
        {payload.endDate || "-"}
      </Descriptions.Item>

      <Descriptions.Item label={<strong>Sample Message</strong>}>
        <div style={MESSAGE_STYLE}>{payload.sampleMessage || "-"}</div>
      </Descriptions.Item>

      <Descriptions.Item label={<strong>Excel File URL</strong>}>
        <Text code style={{ wordBreak: "break-all", fontSize: 12 }}>
          {payload.excelUrl || "-"}
        </Text>
      </Descriptions.Item>
    </Descriptions>
  </div>
);

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
      perDaySendMails: "",
      mailSubject: "",
      displayName: "",
      createdBy: "",
      sampleMessage: "",
      excelUrl: "",
      startDate: null,
      endDate: null,
    }),
    [],
  );

  const downloadSampleExcel = () => {
    const data = [
      ["Names", "Email", "MobileNumber"],
      ["Dominique Cim", "prameela7.k@gmail.com", "9493967848"],
      ["Edward Hoare", "prameelakowall@gmail.com", "9989089588"],
      ["Gene Balas", "kopuridrarka@gmail.com", "9441918817"],
      ["Pablo Redondo", "thotamaneiah@gmail.com", "9493967848"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 25 }, { wch: 35 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recipients");

    XLSX.writeFile(wb, "sample_email_list_template.xlsx");
  };


  const beforeUploadExcel = async (file) => {
    const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
    if (!isXlsx) {
      message.error("Only .xlsx files are allowed!");
      return Upload.LIST_IGNORE;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const wsname = wb.SheetNames[0];
      if (!wsname) throw new Error("No worksheet found");

      const ws = wb.Sheets[wsname];
      if (!ws["!ref"]) throw new Error("Empty sheet");

      const range = XLSX.utils.decode_range(ws["!ref"]);
      if (range.s.r !== 0) {
        message.error(
          "No empty rows allowed above the headers. Headers must start from row 1.",
        );
        return Upload.LIST_IGNORE;
      }

      const headerRow = XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || [];
      const headers = headerRow.map((cell) =>
        typeof cell === "string" ? cell.trim() : "",
      );

      const expected = ["Names", "Email", "MobileNumber"];
      if (headers.length !== 3 || headers.join("|") !== expected.join("|")) {
        message.error(
          "Invalid headers. First row must contain exactly: Names, Email, MobileNumber (exact spelling, no extra columns)",
        );
        return Upload.LIST_IGNORE;
      }

      return true; // Allow upload
    } catch (err) {
      message.error("Invalid or corrupted Excel file.");
      return Upload.LIST_IGNORE;
    }
  };

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
      };
    }

    // bulk
    return {
      ...common,
      excelUrl: values.excelUrl,
    };
  };

  const openPreview = () => {
    setPreviewOpen(true);
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
            {renderPreviewContent(payload)}
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
    } catch (err) {
      // Validation failed - show field errors and scroll to first error
      message.warning(
        "Please complete all required fields and fix the highlighted errors.",
      );

      const errorList = form
        .getFieldsError()
        .filter(({ errors }) => errors.length > 0);

      if (errorList.length > 0) {
        form.scrollToField(errorList[0].name, {
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  return (
    <AdminPanelLayoutTest>
      <div style={{ maxWidth: "100%", padding: "8px 16px", minHeight: "100vh" }}>
        <div
          bodyStyle={{
            padding: "8px 8px",
            border: "none",
            boxShadow: "none",
            rounded: 0,
          }}
          style={{ marginBottom: 20 }}
        >
          <Space direction="vertical" size={0} style={{ width: "100%" }}>
            <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
              Campaign Creation
            </Title>
          </Space>
        </div>

        {/* Form Section */}
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          requiredMark="optional"
        >
          {/* File Upload Section */}
          {/* File Upload Section - Only for BULK */}
          {invitationType === "bulk" && (
            <div
              title={
                <span style={{ color: PRIMARY }}>
                  <strong>Upload Files</strong>
                </span>
              }
              style={{ marginBottom: 20 }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<strong>Excel File (.xlsx only)</strong>}
                    extra="Select your file list in .xlsx format"
                  >
                    {/* Buttons: Download & Upload side-by-side on larger screens */}
                    <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12}>
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadSampleExcel}
                          size="large"
                          block
                          style={{
                            background: PRIMARY,
                            borderColor: PRIMARY,
                            color: "#fff",
                            height: 48, // Ensures consistent height with upload button
                          }}
                        >
                          Download Sample Template
                        </Button>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Upload
                          accept=".xlsx"
                          customRequest={handleUpload}
                          showUploadList={false}
                          maxCount={1}
                          disabled={uploading}
                          beforeUpload={beforeUploadExcel}
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
                              height: 48,
                            }}
                          >
                            {uploading ? "Uploading..." : "Choose .xlsx File"}
                          </Button>
                        </Upload>
                      </Col>
                    </Row>

                    {/* Uploaded file confirmation */}
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
                        required: true,
                        message: "Excel file is required for BULK campaign",
                      },
                    ]}
                    extra="This field auto-populates after successful upload"
                  >
                    <Input
                      placeholder="Auto-filled after upload"
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}
          <div
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

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label={<strong>Campaign Start Date</strong>}
                  name="startDate"
                  dependencies={["endDate"]}
                  rules={[
                    { required: true, message: "Start date is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const end = getFieldValue("endDate");
                        if (!value || !end) return Promise.resolve();

                        if (value.isAfter(end, "day")) {
                          return Promise.reject(
                            new Error("Start date cannot be after End date"),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  extra="When to begin sending emails"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Select start date"
                    disabledDate={(current) =>
                      current &&
                      current.startOf("day").isBefore(new Date(), "day")
                    }
                    onChange={(start) => {
                      const end = form.getFieldValue("endDate");
                      if (start && end && end.isBefore(start, "day")) {
                        form.setFieldsValue({ endDate: null });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={8}>
                <Form.Item
                  label={<strong>Campaign End Date</strong>}
                  name="endDate"
                  dependencies={["startDate"]}
                  rules={[
                    { required: true, message: "End date is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const start = getFieldValue("startDate");
                        if (!value || !start) return Promise.resolve();

                        if (value.isBefore(start, "day")) {
                          return Promise.reject(
                            new Error("End date cannot be before Start date"),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  extra="When to stop sending emails"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Select end date"
                    disabledDate={(current) => {
                      const start = form.getFieldValue("startDate");
                      const isPast =
                        current &&
                        current.startOf("day").isBefore(new Date(), "day");
                      const beforeStart =
                        start && current && current.isBefore(start, "day");

                      return isPast || beforeStart;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Email Configuration Section */}
          <div
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
                      {
                        label: "radhakrishna.t@askoxy.ai",
                        value: "radhakrishna.t@askoxy.ai",
                      },
                      {
                        label: "anil@askoxy.ai",
                        value: "anil@askoxy.ai",
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
          </div>

          {/* Action Buttons */}
          <div
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
          </div>
        </Form>

        {/* Preview Modal */}
        <Modal
          title="Campaign Preview"
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          width="95%"
          style={{ maxWidth: 700 }}
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
            return renderPreviewContent(payload);
          })()}
        </Modal>
      </div>
    </AdminPanelLayoutTest>
  );
}
