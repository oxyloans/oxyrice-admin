import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'antd';
import Logo from '../assets/img/OIP.jpeg'; // Ensure this path is correct

function LoginOrRegister1() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Card 
        className="max-w-md w-full shadow-lg" 
        style={{
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #ddd', // Subtle border for a cleaner look
        }}
      >
        <div className="text-center">
          <img 
            src={Logo} 
            alt="Oxy Logo" 
            className="w-32 h-32 mx-auto mb-0 rounded-full" // Reduced bottom margin to bring image and text closer
          />
          <h2 className="text-3xl font-semibold mb-2">
            Welcome to 
            <span style={{ color: '#FFD700' }}> Oxy</span>
            <span style={{ color: 'green '}}>Rice</span>
          </h2>
          <p className="text-gray-600 mb-2">Your trusted platform for a seamless experience</p> {/* Reduced bottom margin here */}
        </div>
  
        <div className="flex justify-center gap-4 mb-2">
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Login
          </Button>
          {/* Uncomment and adjust if needed */}
          {/* <Button type="default" size="large" onClick={() => navigate('/register')}>
            Register
          </Button> */}
        </div>
      </Card>
    </div>
  );
}

export default LoginOrRegister1;
