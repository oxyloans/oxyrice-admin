import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../core/config/Config";

function AgentsLogin() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState("live");
  const [switchingMode, setSwitchingMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
    const savedUserType = localStorage.getItem("userType") || "live";
    setActiveMode(savedUserType);
    message.success(
      `${savedUserType === "live" ? "Live" : "Test"} environment activated`,
      2,
    );
  }, [form]);

  const handleModeSwitch = (mode) => {
    if (activeMode === mode) return;
    setSwitchingMode(true);
    localStorage.setItem("userType", mode);
    setTimeout(() => {
      setActiveMode(mode);
      setSwitchingMode(false);
      message.success(`Switched to ${mode === "live" ? "Live" : "Test"} environment`);
      window.location.reload();
    }, 800);
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError(null);

      if (rememberMe) {
        localStorage.setItem("savedEmail", values.email.trim());
      } else {
        localStorage.removeItem("savedEmail");
      }

      const payload = { email: values.email.trim(), password: values.password };

      const response = await axios.post(
        `${BASE_URL}/user-service/userEmailPassword`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data?.status === "Login Successful") {
        localStorage.setItem("adminAccessToken", response.data.accessToken);
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem(
          "adminRefreshToken",
          response.data.refreshToke || response.data.refreshToken,
        );
        localStorage.setItem("adminPrimaryType", response.data.primaryType);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("adminName", response.data.name);

        const primaryType = response.data.primaryType;
        const currentMode = localStorage.getItem("userType") || "live";

        const allowedType = currentMode === "live" ? "HELPDESKSUPERADMIN" : "SELLER";
        const envLabel = currentMode === "live" ? "Live" : "Test";

        if (primaryType === allowedType) {
          message.success({ content: "Login successful! Redirecting...", duration: 2 });
          setTimeout(() => {
            const redirect =
              localStorage.getItem("redirectAfterLogin_agents") || "/admin/assistantslist";
            localStorage.removeItem("redirectAfterLogin_agents");
            navigate(redirect);
          }, 1000);
        } else {
          setError(`Access denied. Only ${allowedType} users can access ${envLabel} environment.`);
          triggerShakeAnimation();
        }
      } else {
        setError("Invalid credentials. Please try again.");
        triggerShakeAnimation();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.status ||
        err.response?.data?.message ||
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
      <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-emerald-600">AGENTS</span>
          <span className="text-orange-500"> ADMIN</span>
        </h1>
        <p className="text-gray-600 mt-2">Admin Control Panel</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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
                className={`mr-2 rounded-full ${activeMode === "live" ? "bg-blue-200 animate-pulse" : "bg-gray-300"}`}
              />
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
                className={`mr-2 ${activeMode === "test" ? "bg-green-200 animate-pulse" : "bg-gray-300"}`}
              />
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
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

          <Form form={form} layout="vertical" onFinish={handleLogin} className="login-form">
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email Address</span>}
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
            >
              <Input size="large" type="email" placeholder="your.email@example.com" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Password</span>}
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password size="large" placeholder="Enter your password" className="rounded-lg" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={`w-full h-12 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${loading ? "opacity-80" : ""}`}
                style={{
                  backgroundColor: activeMode === "live" ? "#2563eb" : "#10b981",
                  borderColor: activeMode === "live" ? "#2563eb" : "#10b981",
                }}
              >
                {loading ? "Authenticating..." : "Login to Dashboard"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ASKOXY.AI - Agents Admin</p>
      </div>

      <style>{`
        .shake-animation { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

export default AgentsLogin;
