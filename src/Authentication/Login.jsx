
import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
const payload={
  email,password
}
    if (!email) {
      setError('Please enter your Email');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your Password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://meta.oxyloans.com/api/erice-service/user/userEmailPassword',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'Login Successful') {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data.id);

        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(response.data.errorMessage || 'Invalid Email or Password');
      }
    } catch (error) {
      setError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Invalid username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-2">
      <div className="text-center mb-2">
        <h1 className="logo-name text-5xl font-bold text-gray-300 pb-4" style={{ fontSize: 75 }}>OxyRice</h1>
      </div>

      <div className="max-w-sm w-full rounded-lg p-8 bg-white shadow-lg">
        <p className="text-gray-500 text-lg font-bold text-center mb-4">Login to OxyRice</p>
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your Email' },
              {
                type: 'email',
                message: 'Please enter a valid email address',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              },
            ]}
          >
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your Password' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must be at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character',
              },
            ]}
          >
            <Input.Password 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your Password" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              className="w-full text-white"
            >
              Login
            </Button>
          </Form.Item>

          {error && <Alert message={error} type="error" showIcon className="mt-4" />}
        </Form>
      </div>
    </div>
  );
}

export default Login;