import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Modal,
  message as AntMessage,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
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

  const handleInviteTypeChange = (value) => {
    setInviteType(value);
    form.setFieldsValue({ inviteType: value });

    if (value === "sample") {
      form.setFieldsValue({
        multiPart: undefined,
      });
    }
  };

  const onFinish = (values) => {
    // Prepare preview data before sending
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

    setPreviewVisible(true); // open preview modal
  };
  const submitFinal = async () => {
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

      // Validate required fields
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

      AntMessage.success("Bulk invite triggered successfully.");
      form.resetFields();
      setInviteType("non sample");
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
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <AdminPanelLayoutTest>
      <Card
        title="Bulk Invite Campaign"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 12,
        }}
        headStyle={{
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            inviteType: "non sample",
          }}
          style={{ fontSize: 14 }}
        >
          {/* Row 1: Invite Type + (File or Sample Email based on type) */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Invite Type"
                name="inviteType"
                rules={[
                  {
                    required: true,
                    message:
                      "Please choose whether this is a sample or bulk invite.",
                  },
                ]}
              >
                <Select
                  onChange={handleInviteTypeChange}
                  value={inviteType}
                  placeholder="Select invite type"
                >
                  <Option value="non sample">
                    Non Sample (Bulk Excel Upload)
                  </Option>
                  <Option value="sample">Sample (Single Test Email)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              {inviteType === "non sample" && (
                <Form.Item
                  label="Upload Excel File"
                  name="multiPart"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  rules={[
                    {
                      required: true,
                      message: "Please upload an Excel file with user details.",
                    },
                  ]}
                >
                  <Upload
                    beforeUpload={() => false} // prevent auto upload
                    accept=".xls,.xlsx"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>
                      Choose Excel File (.xls / .xlsx)
                    </Button>
                  </Upload>
                </Form.Item>
              )}

              {inviteType === "sample" && (
                <Form.Item
                  label="Sample Email"
                  name="sampleEmail"
                  rules={[
                    {
                      required: true,
                      message: "Please enter a sample email address.",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email address.",
                    },
                  ]}
                >
                  <Input placeholder="e.g., test.user@example.com" />
                </Form.Item>
              )}
            </Col>
          </Row>

          {/* Row 2: Mail Subject + Display Name */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mail Subject"
                name="mailSubject"
                rules={[
                  {
                    required: true,
                    message: "Please enter the subject line for the email.",
                  },
                ]}
              >
                <Input placeholder="e.g., Welcome to our platform" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Mail Display Name"
                name="mailDispalyName"
                rules={[
                  {
                    required: true,
                    message: "Please enter the sender display name.",
                  },
                ]}
              >
                <Input placeholder="e.g., ASKOXY Team" />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Message (full width) */}
          <Row>
            <Col span={24}>
              <Form.Item
                label="Email Body Message"
                name="message"
                rules={[
                  {
                    required: true,
                    message: "Please enter the email body content.",
                  },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Write the content of the email that users will receive."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    backgroundColor: "#008cba",
                    borderColor: "#008cba",
                    padding: "0 28px",
                    height: 40,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Send Bulk Invite
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Modal
          title="Preview Bulk Invite"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setPreviewVisible(false)}>
              Cancel
            </Button>,

            <Button
              key="confirm"
              type="primary"
              loading={loading}
              onClick={submitFinal}
              style={{
                backgroundColor: "#1ab394",
                borderColor: "#1ab394",
                color: "#ffffff",
                fontWeight: 500,
              }}
            >
              Confirm & Send
            </Button>,
          ]}
        >
          <p>
            <b>Invite Type:</b> {previewData.inviteType}
          </p>

          {previewData.inviteType === "sample" && (
            <p>
              <b>Sample Email:</b> {previewData.sampleEmail}
            </p>
          )}

          {previewData.inviteType === "non sample" && (
            <p>
              <b>Uploaded File:</b> {previewData.fileName}
            </p>
          )}

          <p>
            <b>Mail Subject:</b> {previewData.mailSubject}
          </p>
          <p>
            <b>Mail Display Name:</b> {previewData.mailDispalyName}
          </p>

          <p>
            <b>Email Message:</b>
          </p>
          <div
            style={{
              padding: "10px",
              background: "#f7f7f7",
              borderRadius: "6px",
              whiteSpace: "pre-line",
            }}
          >
            {previewData.message}
          </div>
        </Modal>
      </Card>
    </AdminPanelLayoutTest>
  );
};

export default BulkInviteCampaign;
