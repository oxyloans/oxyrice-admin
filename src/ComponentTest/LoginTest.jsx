import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert, message, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "./Config";

function LoginTest() {
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState("");
  const [switchingMode, setSwitchingMode] = useState(false);
  const navigate = useNavigate();

  

  // Set userType in localStorage and refresh the page when Live button is clicked
  const handleLiveClick = () => {
    if (activeMode === "live") return;

    setSwitchingMode(true);
    localStorage.setItem("userType", "live");

    // Show message before refreshing
    message.loading("Switching to Live environment...", 1, () => {
      // This will trigger a complete page refresh
      window.location.reload();
    });
  };

  // Set userType in localStorage and refresh the page when Test button is clicked
  const handleTestClick = () => {
    if (activeMode === "Test") return;

    setSwitchingMode(true);
    localStorage.setItem("userType", "Test");

    // Show message before refreshing
    message.loading("Switching to Test environment...", 1, () => {
      // This will trigger a complete page refresh
      window.location.reload();
    });
  };

  // Set initial credentials based on saved mode or default to "live"
  useEffect(() => {
    const savedUserType = localStorage.getItem("userType") || "live";
    setActiveMode(savedUserType);

   
    if (savedUserType === "live") {
      message.success("Live environment loaded", 2);
      
    } else {
      message.success("Test environment loaded", 2);
    }
  }, [form]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your Email");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Please enter your Password");
      setLoading(false);
      return;
    }

    const payload = { email, password };

    try {
      const response = await axios.post(
        `${BASE_URL}/user-service/userEmailPassword`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "Login Successful") {
        const { token, refreshToken, id } = response.data;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", id);
        message.success("Login successful!");
        navigate("/admin");
      } else {
        setError(response.data.errorMessage || "Invalid Email or Password");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-emerald-600">ASKOXY</span>
            <span className="text-orange-500">.AI</span>
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Environment Toggle */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 font-medium transition-colors ${
                activeMode === "live"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              onClick={handleLiveClick}
              disabled={switchingMode}
            >
              Live Environment
            </button>
            <button
              className={`flex-1 py-3 font-medium transition-colors ${
                activeMode === "Test"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              onClick={handleTestClick}
              disabled={switchingMode}
            >
              Test Environment
            </button>
          </div>

          <div className="p-8 relative">
            {switchingMode && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <Spin size="large" tip="Switching environment..." />
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Welcome Back
            </h2>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              // initialValues={environmentCredentials[activeMode || "live"]}
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter your email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  },
                ]}
              >
                <Input
                  size="large"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter your password" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must be at least 8 characters, including uppercase, lowercase, number, and special character",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="rounded-lg"
                />
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
                  Sign in to Account
                </Button>
              </Form.Item>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mt-4 rounded-lg"
                />
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginTest;
