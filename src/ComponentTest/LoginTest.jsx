import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "./Config";

function LoginTest() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState("live");
  const [switchingMode, setSwitchingMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserType = localStorage.getItem("userType") || "live";
    setActiveMode(savedUserType);
    message.success(`${savedUserType === "live" ? "Live" : "Test"} environment loaded`, 2);
  }, []);

  const handleModeSwitch = (mode) => {
    if (activeMode === mode) return;
    setSwitchingMode(true);
    localStorage.setItem("userType", mode);
    message.loading(`Switching to ${mode} environment...`, 1, () => {
      window.location.reload();
    });
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError(null);

      const payload = {
        email: values.email.trim(),
        password: values.password,
      };

      const response = await axios.post(`${BASE_URL}/user-service/userEmailPassword`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.status === "Login Successful") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToke); // API has a typo, keeping it as is
        localStorage.setItem("userId", response.data.userId);

        message.success("Login successful!");
        navigate("/admin");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError(
        error.response?.data?.status || error.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-emerald-600">ASKOXY</span>
          <span className="text-orange-500">.AI</span>
        </h1>
      </div>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-medium transition-colors ${
              activeMode === "live"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500"
            }`}
            onClick={() => handleModeSwitch("live")}
            disabled={switchingMode}
          >
            Live Environment
          </button>
          <button
            className={`flex-1 py-3 font-medium transition-colors ${
              activeMode === "Test"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500"
            }`}
            onClick={() => handleModeSwitch("Test")}
            disabled={switchingMode}
          >
            Test Environment
          </button>
        </div>

        <div className="p-8 relative">
          {switchingMode && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
              <Spin size="large" tip="Switching environment..." />
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Welcome Back
          </h2>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                size="large"
                type="email"
                placeholder="your.email@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password size="large" placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base font-medium rounded-lg"
                style={{
                  backgroundColor:
                    activeMode === "live" ? "#2563eb" : "#10b981",
                  borderColor: activeMode === "live" ? "#2563eb" : "#10b981",
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default LoginTest;
