import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { faSleigh } from '@fortawesome/free-solid-svg-icons';

function Register() {
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [password, setPassword] = useState('');
  const [emailOtpSession, setEmailOtpSession] = useState('');
  const [salt, setSalt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  // const accessToken=localStorage.getItem('accessToken')
  const navigate = useNavigate(); // Initialize useNavigate

  const handleEmailSubmit = async () => {
    if (!email) return setError('Please enter your email');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/user/userEmailPassword', { email },  
        
    );
      setIsEmailSubmitted(true);
      setEmailOtpSession(response.data.emailOtpSession);
      setSalt(response.data.salt);
      message.success('OTP has been sent to your email');
     
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };


  const validateForm = () => {
    if (!emailOtp) {
      setError('Please enter the OTP');
      return false;
    }
    if (!password) {
      setError('Please enter the password');
      return false;
    }
    return true;
  };
  const handleSubmitOtp = async () => {

    if (!validateForm()) return;
 
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/user/userEmailPassword', {
        email,
        emailOtp,
        emailOtpSession,
        password,
        primaryType: 'ADMIN',
        salt,
       
      },
     
    );
      message.success('Registration successful!');
      
      // Redirect to login page after a short delay
      if(response.data.userId !== null){
        setTimeout(() => {
          navigate('/login');
        }, 2000); // 2-second delay
      }
    

      setIsEmailSubmitted(false);
      setEmail('');
      setEmailOtp('');
      setPassword('');
      setEmailOtpSession('');
      setSalt('');
    } catch {
      setError('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card 
        title={<h2 className="text-center">Register as a Admin</h2>}
        className="w-full max-w-md shadow-lg"
        style={{ borderRadius: '10px', backgroundColor: '#ffffff' }}
      >
        <Form layout="vertical">
          <Form.Item label="Email"  required>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
            />
          </Form.Item>
          
          {!isEmailSubmitted && (
            <Button type="primary" block onClick={handleEmailSubmit} loading={loading} className="mb-4">
              Submit
            </Button>
          )}

          {isEmailSubmitted && (
            <>
              <Form.Item label="OTP" className="mt-4" required>
                <Input 
                  value={emailOtp} 
                  onChange={(e) => setEmailOtp(e.target.value)} 
                  placeholder="Enter OTP sent to email"
                  
                />
              </Form.Item>
              <Form.Item label="Password" required>
                <Input.Password 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  required
                />
              </Form.Item>
              <Button type="primary" block onClick={handleSubmitOtp} loading={loading} className="mb-4">
                Verify
              </Button>
            </>
          )}

          {error && <Alert message={error} type="error" showIcon className="mt-4" />}

          {/* Centered Login Link */}
          <div className="text-center mt-4">
           Already Registered? <Link to="/login" style={{ color: '#1890ff',fontSize:16 }}>Login</Link>
          </div>


        </Form>
      </Card>
    </div>
  );
}

export default Register;

