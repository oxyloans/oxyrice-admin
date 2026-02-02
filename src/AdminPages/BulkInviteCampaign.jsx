"use client";

import React, { useState, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Modal,
  message as AntMessage,
  Divider,
  Space,
  Alert,
  Spin,
  Empty,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import axios from "axios";
import BASE_URL from "./Config";
import AdminPanelLayoutTest from "./AdminPanel";

const { TextArea } = Input;
const { Option } = Select;

const BulkInviteCampaign = () => {
  const [form] = Form.useForm();

  const [inviteType, setInviteType] = useState("non sample");
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleInviteTypeChange = useCallback(
    (value) => {
      setInviteType(value);
      form.setFieldsValue({ inviteType: value });

      if (value === "sample") {
        form.setFieldsValue({ multiPart: undefined });
        setUploadedFile(null);
      } else {
        form.setFieldsValue({ sampleEmail: undefined });
      }
    },
    [form],
  );

  const handleFileChange = useCallback((fileList) => {
    if (fileList && fileList.length > 0) {
      setUploadedFile(fileList[0]);
    } else {
      setUploadedFile(null);
    }
  }, []);

  const onFinish = useCallback(
    (values) => {
      const fileName =
        inviteType === "non sample"
          ? values.multiPart?.[0]?.name || "No file selected"
          : "No file (Sample Invite)";

      setPreviewData({
        inviteType,
        sampleEmail: values.sampleEmail || "",
        mailSubject: values.mailSubject,
        mailDispalyName: values.mailDispalyName,
        message: values.message,
        fileName,
      });

      setPreviewVisible(true);
    },
    [inviteType],
  );

  const submitFinal = useCallback(async () => {
    setPreviewVisible(false);
    setLoading(true);

    try {
      const values = form.getFieldsValue();
      const userId = localStorage.getItem("userId");

      if (!userId) {
        AntMessage.error("User ID not found. Please login again.");
        return;
      }

      const formData = new FormData();

      if (inviteType === "non sample") {
        const fileObj = values.multiPart?.[0]?.originFileObj;
        if (!fileObj) {
          AntMessage.error("Please select an Excel file to upload.");
          return;
        }
        formData.append("multiPart", fileObj);
      } else {
        const emptyFile = new Blob([], { type: "application/octet-stream" });
        formData.append("multiPart", emptyFile, "");
      }

      if (!values.mailSubject || !values.mailDispalyName || !values.message) {
        AntMessage.error("Please fill in all required fields.");
        return;
      }

      formData.append("inviteType", inviteType);
      formData.append("mailSubject", values.mailSubject);
      formData.append("mailDispalyName", values.mailDispalyName);
      formData.append("message", values.message);

      const sampleEmailToSend =
        inviteType === "sample" ? values.sampleEmail || "" : "";
      formData.append("sampleEmail", sampleEmailToSend);
      formData.append("userId", userId);

      const url = `${BASE_URL}/user-service/excelInvite`;

      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "*/*",
        },
      });

      AntMessage.success("Bulk invite triggered successfully!");
      form.resetFields();
      setInviteType("non sample");
      setUploadedFile(null);
    } catch (error) {
      console.error("Bulk invite error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while sending the bulk invite.";
      AntMessage.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [form, inviteType]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const PreviewContent = () => {
    if (!previewData.inviteType) {
      return <Empty description="No preview data" />;
    }

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm font-semibold text-blue-900">
            Invite Type:{" "}
            <span className="font-normal capitalize">
              {previewData.inviteType}
            </span>
          </p>
        </div>

        {previewData.inviteType === "sample" && (
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Sample Email</p>
            <p className="text-sm text-gray-600 break-all">
              {previewData.sampleEmail}
            </p>
          </div>
        )}

        {previewData.inviteType === "non sample" && (
          <div className="bg-gray-50 p-4 rounded border border-gray-200 flex items-center gap-3">
            <FileExcelOutlined className="text-xl text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Uploaded File
              </p>
              <p className="text-sm text-gray-600 truncate">
                {previewData.fileName}
              </p>
            </div>
          </div>
        )}

        <Divider />

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Email Subject
          </p>
          <p className="text-sm text-gray-600">{previewData.mailSubject}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Sender Name
          </p>
          <p className="text-sm text-gray-600">{previewData.mailDispalyName}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Email Message
          </p>
          <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {previewData.message}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AdminPanelLayoutTest>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div>
            <h6 className="text-1xl sm:text-xl font-bold text-gray-900 mb-2">
              Bulk Invite Campaign
            </h6>
            <p className="text-gray-600 text-sm sm:text-base">
              Send bulk invitations via Excel upload or test with a sample email
            </p>
          </div>

          {/* Main Form Card */}
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
            }}
            bodyStyle={{
              padding: "24px",
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                inviteType: "non sample",
              }}
              className="space-y-6"
              requiredMark="optional"
            >
              {/* Alert Section */}
              {/* {inviteType === "sample" && (
                <Alert
                  message="Sample Mode"
                  description="Send a test invitation to a single email address to preview how your message will look."
                  type="info"
                  showIcon
                  className="mb-6"
                  closable
                />
              )} */}

              {/* {inviteType === "non sample" && (
                <Alert
                  message="Bulk Mode"
                  description="Upload an Excel file containing email addresses and user details to send bulk invitations."
                  type="success"
                  showIcon
                  className="mb-6"
                  closable
                />
              )} */}

              {/* Row 1: Invite Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Invite Type
                    </span>
                  }
                  name="inviteType"
                  rules={[
                    {
                      required: true,
                      message: "Please select an invite type.",
                    },
                  ]}
                  className="mb-0"
                >
                  <Select
                    onChange={handleInviteTypeChange}
                    value={inviteType}
                    placeholder="Select invite type"
                    size="large"
                    className="w-full"
                  >
                    <Option value="non sample">
                      <span className="flex items-center gap-2">
                        <FileExcelOutlined />
                        Bulk (Excel Upload)
                      </span>
                    </Option>
                    <Option value="sample">
                      <span className="flex items-center gap-2">
                        <CheckCircleOutlined />
                        Sample (Test Email)
                      </span>
                    </Option>
                  </Select>
                </Form.Item>

                {/* File Upload or Sample Email */}
                <div>
                  {inviteType === "non sample" ? (
                    <Form.Item
                      label={
                        <span className="font-semibold text-gray-700">
                          Excel File
                        </span>
                      }
                      name="multiPart"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      rules={[
                        {
                          required: true,
                          message: "Please upload an Excel file.",
                        },
                      ]}
                      className="mb-0"
                    >
                      <Upload
                        beforeUpload={() => false}
                        accept=".xls,.xlsx"
                        maxCount={1}
                        onChange={(info) => handleFileChange(info.fileList)}
                        className="w-full"
                      >
                        <Button
                          icon={<UploadOutlined />}
                          size="large"
                          className="w-full h-10 font-medium"
                        >
                          Choose Excel File (.xls/.xlsx)
                        </Button>
                      </Upload>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      label={
                        <span className="font-semibold text-gray-700">
                          Email Address
                        </span>
                      }
                      name="sampleEmail"
                      rules={[
                        {
                          required: true,
                          message: "Please enter an email address.",
                        },
                        {
                          type: "email",
                          message: "Please enter a valid email address.",
                        },
                      ]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="test.user@example.com"
                        size="large"
                        type="email"
                        className="rounded"
                      />
                    </Form.Item>
                  )}
                </div>
              </div>

              <Divider />

              {/* Row 2: Email Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Email Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    label={
                      <span className="font-semibold text-gray-700">
                        Email Subject
                      </span>
                    }
                    name="mailSubject"
                    rules={[
                      {
                        required: true,
                        message: "Please enter an email subject.",
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="e.g., Welcome to our platform"
                      size="large"
                      className="rounded"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-semibold text-gray-700">
                        Sender Name
                      </span>
                    }
                    name="mailDispalyName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a sender name.",
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="e.g., ASKOXY Team"
                      size="large"
                      className="rounded"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Row 3: Email Body */}
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Email Message
                  </span>
                }
                name="message"
                rules={[
                  {
                    required: true,
                    message: "Please enter the email body content.",
                  },
                ]}
                className="mb-0"
              >
                <TextArea
                  rows={8}
                  placeholder="Write the email content that recipients will see..."
                  className="rounded"
                  style={{
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </Form.Item>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  size="large"
                  className="w-full sm:w-auto rounded font-medium"
                  disabled={loading}
                >
                  Clear Form
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full sm:w-auto rounded font-medium h-10"
                  style={{
                    backgroundColor: "#008cba",
                    borderColor: "#008cba",
                  }}
                >
                  Preview & Send
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Preview Your Invitation</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: "600px" }}
        bodyStyle={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
        className="rounded-lg"
      >
        <Spin spinning={loading} tip="Sending invitation...">
          <PreviewContent />

          <Divider />

          <Space className="w-full flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setPreviewVisible(false)}
              disabled={loading}
              size="large"
            >
              Back to Edit
            </Button>
            <Button
              type="primary"
              onClick={submitFinal}
              loading={loading}
              size="large"
              style={{
                backgroundColor: "#1ab394",
                borderColor: "#1ab394",
              }}
            >
              Confirm & Send
            </Button>
          </Space>
        </Spin>
      </Modal>
    </AdminPanelLayoutTest>
  );
};

export default BulkInviteCampaign;
