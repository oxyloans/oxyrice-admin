import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import AdminPanelLayout from "./AdminPanelLayout";


const ChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { oldPassword, newPassword } = values;
    setLoading(true);
    
    try {
      const response = await axios.patch("http://182.18.139.138:8181/api/change-password", {
        oldPassword,
        newPassword,
      });
      message.success(response.data.message || "Password changed successfully!");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AdminPanelLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
   

      <div className="flex flex-1">
        {/* Sidebar */}
       

        {/* Main Content */}
        <div className="flex justify-center items-center flex-1">
          <Form
            name="changePassword"
            onFinish={onFinish}
            style={{ width: 300 }}
            layout="vertical"
          >
            <Form.Item
              label="Old Password"
              name="oldPassword"
              rules={[{ required: true, message: "Please input your old password!" }]}
            >
              <Input.Password placeholder="Enter old password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, message: "Please input your new password!" }]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
    </AdminPanelLayout>
    </>
  );
};

export default ChangePassword;
