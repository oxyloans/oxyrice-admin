import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin, Checkbox } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../core/config/Config";

function TaskManagementLogin() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState("live"); // Default to live environment
  const [switchingMode, setSwitchingMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved credentials if remember me was used
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }

    // Default to "live" if no userType is set
    const savedUserType = localStorage.getItem("userType") || "live";
    setActiveMode(savedUserType);
    message.success(
      `${savedUserType === "live" ? "Live" : "Test"} environment activated`,
      2
    );
  }, [form]);

  const handleModeSwitch = (mode) => {
    if (activeMode === mode) return;
    setSwitchingMode(true);
    localStorage.setItem("userType", mode);

    // Animated transition
    setTimeout(() => {
      setActiveMode(mode);
      setSwitchingMode(false);
      message.success(
        `Switched to ${mode === "live" ? "Live" : "Test"} environment`
      );

      // Force reload to apply new BASE_URL from Config
      window.location.reload();
    }, 800);
  };

  

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError(null);

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("savedEmail", values.email.trim());
      } else {
        localStorage.removeItem("savedEmail");
      }

      const payload = {
        email: values.email.trim(),
        password: values.password,
      };

      // Get the current BASE_URL which should reflect the active environment
      const response = await axios.post(
        `${BASE_URL}/user-service/userEmailPassword`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.status === "Login Successful") {
        // Store auth tokens
        localStorage.setItem(
          "token",
          response.data.accessToken || response.data.token
        );
        localStorage.setItem(
          "refreshToken",
          response.data.refreshToken || response.data.refreshToken
        );
        localStorage.setItem("primaryType", response.data.primaryType);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("lastLogin", new Date().toISOString());

        const primaryType = localStorage.getItem("primaryType");
        if (primaryType === "HELPDESKSUPERADMIN") {
          // Success animation
          message.success({
            content: "Login successful! Redirecting to dashboard...",
            duration: 2,
          });
          setTimeout(() => {
            navigate("/taskmanagement/overview");
          }, 1000); // Delay navigation to show success message
        } else {
          // Show error if primaryType is not HELPDESKSUPERADMIN
          setError("Access denied. Only HELPDESKSUPERADMIN users can log in.");
          triggerShakeAnimation();
        }
      } else {
        setError("Invalid credentials. Please try again.");
        triggerShakeAnimation();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.status ||
        error.response?.data?.message ||
        "Authentication failed. Please check your credentials.";
      setError(errorMsg);
      triggerShakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const triggerShakeAnimation = () => {
    const formElement = document.querySelector(".login-form");
    if (formElement) {
      formElement.classList.add("shake-animation");
      setTimeout(() => formElement.classList.remove("shake-animation"), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Logo and branding */}
      <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-emerald-600">Task Management</span>
          {/* <span className="text-orange-500">.AI</span> */}
        </h1>
        <p className="text-gray-600 mt-2">Admin Control Panel</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Environment toggle */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 font-medium transition-all duration-300 ${
              activeMode === "live"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => handleModeSwitch("live")}
            disabled={switchingMode}
            aria-label="Switch to Live Environment"
          >
            <div className="flex items-center justify-center">
              <div
                className={` ${activeMode === "live" ? "bg-[#008CBA] animate-pulse" : "bg-gray-300"}`}
              ></div>
              Live Environment
            </div>
          </button>
          <button
            className={`flex-1 py-4 font-medium transition-all duration-300 ${
              activeMode === "test"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => handleModeSwitch("test")}
            disabled={switchingMode}
            aria-label="Switch to Test Environment"
          >
            <div className="flex items-center justify-center">
              <div
                className={` ${activeMode === "test" ? "bg-[#04AA6D] animate-pulse" : "bg-gray-300"}`}
              ></div>
              Test Environment
            </div>
          </button>
        </div>

        <div className="p-8 relative">
          {switchingMode && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
              <Spin size="large" tip="Switching environment..." />
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Welcome Back
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            className="login-form"
          >
            <Form.Item
              name="email"
              label={
                <span className="text-gray-700 font-medium">Email Address</span>
              }
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
                prefix={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-gray-700 font-medium">Password</span>
              }
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter your password"
                prefix={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={`w-full h-12 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                  loading ? "opacity-80" : ""
                }`}
                style={{
                  backgroundColor:
                    activeMode === "live" ? "#2563eb" : "#10b981",
                  borderColor: activeMode === "live" ? "#2563eb" : "#10b981",
                }}
              >
                {loading ? "Authenticating..." : "Login to Dashboard"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ASKOXY.AI - Admin Portal v2.0</p>
        {/* <p className="mt-1">
          <a href="/terms" className="text-blue-500 hover:text-blue-700 mx-2">
            Terms
          </a>
          <a href="/privacy" className="text-blue-500 hover:text-blue-700 mx-2">
            Privacy
          </a>
          <a href="/help" className="text-blue-500 hover:text-blue-700 mx-2">
            Help
          </a>
        </p> */}
      </div>

      {/* CSS for animations */}
      <style >{`
        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes shake {
          10%,
          90% {
            transform: translate3d(-1px, 0, 0);
          }
          20%,
          80% {
            transform: translate3d(2px, 0, 0);
          }
          30%,
          50%,
          70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%,
          60% {
            transform: translate3d(4px, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default TaskManagementLogin;
