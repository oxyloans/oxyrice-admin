import React, { useMemo, useState } from "react";

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
  Divider,
  Descriptions,
} from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PRIMARY = "#1ab394";
const SECONDARY = "#008cba";

export default function Email() {
  const [form] = Form.useForm();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const initialValues = useMemo(
    () => ({
      invitationType: "",
      perDaySendMails: "",
      lastProcessedRow: "",
      mailSubject: "",
      fromMail: "",
      displayName: "",
      createdBy: "",
      sampleMessage: "",
      excelUrl: "",
      startDate: null,
      endDate: null,
    }),
    []
  );

  // ✅ Upload Excel
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);

      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadUrl = `${BASE_URL}/upload-service/upload?id=45880e62-acaf-4645-a83e-d1c8498e923e&fileType=aadhar`;
      const accessToken = localStorage.getItem("accessToken");

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
    return {
      excelUrl: values.excelUrl,
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
      lastProcessedRow: values.lastProcessedRow || 0,
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
        width: 600, // ✅ responsive friendly
        content: (
          <div>
            <Text type="secondary">
              Please verify the details below before creating the campaign.
            </Text>
            <Divider style={{ margin: "12px 0" }} />
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Invitation Type">
                {payload.invitationType}
              </Descriptions.Item>

              <Descriptions.Item label="Mail Subject">
                {payload.mailSubject}
              </Descriptions.Item>
              <Descriptions.Item label="From Mail">
                {payload.fromMail}
              </Descriptions.Item>
              <Descriptions.Item label="Display Name">
                {payload.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {payload.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Per Day Send Mails">
                {payload.perDaySendMails}
              </Descriptions.Item>
              <Descriptions.Item label="Last Processed Row">
                {payload.lastProcessedRow}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {payload.startDate}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {payload.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="Sample Message">
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {payload.sampleMessage}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ),
        okText: "Yes, Create",
        cancelText: "Cancel",
        okButtonProps: { style: { background: PRIMARY, borderColor: PRIMARY } },
        onOk: async () => {
          try {
            setConfirming(true);
            setSubmitting(true);

            const res = await fetch(`${BASE_URL}/user-service/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
              message.success("Campaign created successfully");
              form.resetFields();
              form.setFieldsValue(initialValues);
            } else {
              message.error(data?.message || "API error");
            }
          } catch {
            message.error("Something went wrong");
          } finally {
            setConfirming(false);
            setSubmitting(false);
          }
        },
      });
    } catch {
      message.error("Please check the form");
    }
  };

  return (
   
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ color: PRIMARY, marginBottom: 0 }}>
            Email Campaign through excel
          </Title>
        </Space>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          style={{ marginTop: 20 }}
        >
          <Row gutter={[16, 16]}>
            {/* Upload */}
            <Col xs={24} md={12}>
              <Form.Item label="Upload Excel File">
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
                    style={{
                      background: SECONDARY,
                      color: "#fff",
                      width: "100%",
                    }}
                  >
                    Upload Excel
                  </Button>
                </Upload>
              </Form.Item>
            </Col>

            {/* Excel URL */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Excel URL"
                name="excelUrl"
                rules={[{ required: true, message: "Excel URL is required" }]}
              >
                <Input placeholder="Upload file to auto-fill" />
              </Form.Item>
            </Col>

            {/* Invitation Type */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Invitation Type"
                name="invitationType"
                rules={[
                  {
                    required: true,
                    message: "Please select invitation type",
                  },
                ]}
              >
                <Select
                  placeholder="Select type"
                  options={[
                    {
                      label: "bmv",
                      value: "bmv",
                    },
                    {
                      label: "null",
                      value: "null",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            {/* From Mail */}
            <Col xs={24} md={12}>
              <Form.Item
                label="From Mail"
                name="fromMail"
                rules={[
                  { required: true, message: "From mail is required" },
                  { type: "email", message: "Enter a valid email address" },
                ]}
              >
                <Select
                  placeholder="Select from mail"
                  options={[
                    {
                      label: "admin@oxyloans.com",
                      value: "admin@oxyloans.com",
                    },
                    {
                      label: "radha@oxybricks.world",
                      value: "radha@oxybricks.world",
                    },
                    { label: "anil@askoxy.ai", value: "anil@askoxy.ai" },
                    { label: "team@askoxy.in", value: "team@askoxy.in" },
                    {
                      label: "support@askoxy.ai",
                      value: "support@askoxy.ai",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Mail Subject */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Mail Subject"
                name="mailSubject"
                rules={[
                  { required: true, message: "Mail subject is required" },
                  { min: 3, message: "Minimum 3 characters" },
                  { max: 120, message: "Maximum 120 characters" },
                ]}
              >
                <Input placeholder="Enter mail subject" />
              </Form.Item>
            </Col>

            {/* Display Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Display Name"
                name="displayName"
                rules={[
                  { required: true, message: "Display name is required" },
                  { min: 2, message: "Minimum 2 characters" },
                  { max: 60, message: "Maximum 60 characters" },
                ]}
              >
                <Input placeholder="e.g., John Doe" />
              </Form.Item>
            </Col>

            {/* Created By */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Created By"
                name="createdBy"
                rules={[
                  { required: true, message: "Created by is required" },
                  { min: 2, message: "Minimum 2 characters" },
                  { max: 60, message: "Maximum 60 characters" },
                ]}
              >
                <Input placeholder="e.g., admin" />
              </Form.Item>
            </Col>

            {/* Per Day */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Per Day Send Mails"
                name="perDaySendMails"
                rules={[
                  { required: true, message: "Per day limit is required" },
                  { type: "number", min: 1, message: "Minimum 1" },
                  { type: "number", max: 50000, message: "Too high" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="e.g., 50" />
              </Form.Item>
            </Col>

            {/* Start Date */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* End Date */}
            <Col xs={24} md={12}>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[{ required: true, message: "End date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Last Processed Row"
                name="lastProcessedRow"
                tooltip="Usually keep 0 for new campaigns"
                rules={[
                  {
                    required: true,
                    message: "Last processed row is required",
                  },
                  { type: "number", min: 0, message: "Must be 0 or more" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>

            {/* Sample Message */}
            <Col xs={24}>
              <Form.Item
                label="Sample Message"
                name="sampleMessage"
                rules={[
                  { required: true, message: "Sample message is required" },
                  { min: 10, message: "Minimum 10 characters" },
                  { max: 5000, message: "Maximum 5000 characters" },
                ]}
              >
                <Input.TextArea rows={5} placeholder="Type your message..." />
              </Form.Item>
            </Col>
          </Row>
          {/* Buttons */}
          <Row justify="end">
            <Col>
              <Space>
                <Button icon={<EyeOutlined />} onClick={openPreview}>
                  Preview
                </Button>

                <Button
                  type="primary"
                  onClick={submitWithConfirm}
                  loading={submitting || confirming}
                  style={{
                    background: PRIMARY,
                    borderColor: PRIMARY,
                  }}
                >
                  Create Campaign
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {/* Preview Modal */}
        <Modal
          title="Campaign Preview"
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          width={600}
          footer={[
            <Button key="close" onClick={() => setPreviewOpen(false)}>
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
            >
              Continue & Create
            </Button>,
          ]}
        >
          {(() => {
            const v = form.getFieldsValue(true);
            const payload = buildPayload(v);

            return (
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Invitation Type">
                  {payload.invitationType || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Mail Subject">
                  {payload.mailSubject || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="From Mail">
                  {payload.fromMail || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Display Name">
                  {payload.displayName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {payload.createdBy || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Per Day Send Mails">
                  {payload.perDaySendMails ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Last Processed Row">
                  {payload.lastProcessedRow ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {payload.startDate || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {payload.endDate || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Sample Message">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {payload.sampleMessage || "-"}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            );
          })()}
        </Modal>
      </div>
  
  );
}
