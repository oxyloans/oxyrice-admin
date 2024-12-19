import React, { useState } from "react";
import { Button, Form, Input, Upload, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const accessToken = localStorage.getItem("accessToken");

const SubscriberDetails = () => {
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const { categoryName, file } = values;

    if (!file || file.fileList.length === 0) {
      notification.warning({
        message: "File Missing",
        description: "Please upload a file before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("fileType", "document");
    formData.append("multiPart", file.file.originFileObj);

    setUploading(true);

    axios
      .post(
        "https://meta.oxyloans.com/api/erice-service/categories/saveCategoryWithImage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        notification.success({
          message: "Success",
          description: "Category saved successfully!",
        });
        form.resetFields();
      })
      .catch((error) => {
        notification.error({
          message: "Error",
          description:
            error.response?.data?.error ||
            "An error occurred while saving the category.",
        });
      })
      .finally(() => setUploading(false));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <Form.Item
        name="categoryName"
        label="Category Name"
        rules={[{ required: true, message: "Please enter a category name" }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>

      <Form.Item
        name="file"
        label="Upload File"
        valuePropName="file"
        getValueFromEvent={(e) => e.fileList && e.fileList[0]}
        rules={[{ required: true, message: "Please upload a file" }]}
      >
        <Upload
          maxCount={1}
          accept=".png,.jpg,.jpeg,.pdf"
          beforeUpload={() => false} // Prevents automatic upload
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={uploading}>
          {uploading ? "Saving..." : "Save Category"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SubscriberDetails;
