import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Card } from 'antd';
import axios from 'axios';
import '../styles.css';

function LoginOrRegister() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmit, setIsSubmit] = useState(true);
  const [isOtpSubmit, setOtpSubmit] = useState(false);
  const [message, setMessage] = useState('');
  const [mobileOtpSession, setMobileOtpSession] = useState('');
  const navigate = useNavigate();

 

  // Function to handle mobile number submission
  const handleLoginOrRegister = async () => {
    if(!mobileNumber)
      {
        setError('Please enter your Mobile Number')
        return false;
      }
      
    try {
     
      const response = await fetch('https://meta.oxyloans.com/api/erice-service/user/login-or-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmit(false);
        setOtpSubmit(true);
        setResponseData(data);
        setMobileOtpSession(data.mobileOtpSession);
        setError(null);
      } else {
        setError(data.errorMessage || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  // Function to handle OTP submission
  const handleSubmitOtp = async () => {
    const data = {
      mobileNumber,
      mobileOtpValue: otp,
      mobileOtpSession,
      primaryType: 'SELLER',
    };
    if(!otp)
      {
        setError('Please enter the OTP')
        return false;
      }

    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/user/login-or-register', data);
      const responseData = response.data;

      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('userId', responseData.userId);
      setMessage(responseData.status);

      if (responseData.userId !== null) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setError('OTP verification failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <Card
        className="max-w-md w-full shadow-lg"
        style={{
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          padding: '20px',
        }}
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Login or Register</h2>

        {/* Mobile Number Input */}
        <Form layout="vertical">
          <Form.Item label="Mobile Number" required>
            <Input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              style={{ borderRadius: '5px' }}
            />
          </Form.Item>
          {isSubmit && (
            <Form.Item>
              <Button type="primary" onClick={handleLoginOrRegister} className="w-full">
                Submit
              </Button>
            </Form.Item>
          )}
        </Form>

        {/* OTP Input - Displayed after mobile number submission */}
        {responseData?.mobileOtpSession && (
          <>
            <Form layout="vertical">
              <Form.Item label="Enter OTP" required>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  style={{ borderRadius: '5px' }}
                />
              </Form.Item>
              {isOtpSubmit && (
                <Form.Item>
                  <Button type="primary" onClick={handleSubmitOtp} className="w-full">
                    Verify
                  </Button>
                </Form.Item>
              )}
            </Form>
            {message && <Alert message={message} type="success" showIcon style={{ marginTop: '10px' }} />}
          </>
        )}

        {/* Error Message */}
        {error && <Alert message={error} type="error" showIcon style={{ marginTop: '10px' }} />}
      </Card>
    </div>
  );
}

export default LoginOrRegister;
