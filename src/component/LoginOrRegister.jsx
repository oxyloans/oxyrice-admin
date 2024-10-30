// import axios from 'axios';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import  '../styles.css';

// function LoginOrRegister() {
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [responseData, setResponseData] = useState(null);
//   const [error, setError] = useState(null);
//   const [issubmit , setisSubmit]=useState(true)
//   const  [isotpsubmit  , setOtpSubmit]=useState(false);const [message , setmessage]=useState('')
//   const [mobileOtpSession, setmobileOtpSession]=useState('')
//   const [primaryType, setprimaryType]=useState('')

//   const history = useNavigate();
//   // Function to handle mobile number submission
//   const handleLoginOrRegister = async () => {
//     try {
//       const response = await fetch('http://182.18.139.138:8282/api/erice-service/user/login-or-register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ mobileNumber }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setisSubmit(false)
//         setOtpSubmit(true)
//         setResponseData(data);
//         setmobileOtpSession(data.mobileOtpSession)
        
//         console.log(data)
//         setError(null);
//       } else {
//         setError(data.errorMessage || 'Something went wrong');
//       }
//     } catch (err) {
//       setError('Network error occurred');
//     }
//   };


//   const handlesubmitotp =async()=>{
//     const data ={
//             mobileNumber,
//             mobileOtpValue: otp,
//             mobileOtpSession,
//             primaryType: "SELLER"
//       }
// try{
//      responseData = axios({
//         method:'POST',
//         url:'http://182.18.139.138:8282/api/erice-service/user/login-or-register',
//         data:data
//     }).then((responseData)=>{
//         console.log(responseData)
//         localStorage.setItem("accessToken" , responseData.data.accessToken);
//         localStorage.setItem("userId" , responseData.data.userId);
//         setmessage(responseData.data.status)
//         if(responseData.data.userId !== null){
//             setTimeout(() => {
//                 history("/dashboard"); 
//             }, 3000);
//         }
      
   
//     }).catch((error)=>{
//         console.log(error)
//     })
// }catch{
//     console.log(error)
// }
//   }

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
      
//       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//         <h2 className="text-2xl font-semibold text-center mb-6">Login or Register</h2>

//         {/* Mobile Number Input */}
//         <div className="mb-4">
//           <label className="block text-gray-600 text-sm font-semibold mb-2" htmlFor="mobileNumber">
//             Mobile Number
//           </label>
//           <input
//             type="text"
//             id="mobileNumber"
//             value={mobileNumber}
//             onChange={(e) => setMobileNumber(e.target.value)}
//             className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
//             placeholder="Enter your mobile number"
//           />
//         </div>
// {issubmit && <>  <button
//           onClick={handleLoginOrRegister}
//           className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4"
//         >
//           Submit
//         </button></>}
      

//         {/* OTP Input - Displayed after mobile number submission */}
//         {responseData?.mobileOtpSession && (
//             <>
//           <div className="mb-4">
//             <label className="block text-gray-600 text-sm font-semibold mb-2" htmlFor="otp">
//               Enter OTP
//             </label>
//             <input
//               type="text"
//               id="otp"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
//               placeholder="Enter OTP"
//             />
            
//           </div>
//            {isotpsubmit && <>  <button
//             onClick={handlesubmitotp}
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4"
//           >
//             verify
//           </button></>} 
//           {message && <div className='sucess'>{message}</div>}
//           </>
          
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="text-red-500 text-sm mb-4">
//             {error}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LoginOrRegister;
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
  const history = useNavigate();

  // Function to handle mobile number submission
  const handleLoginOrRegister = async () => {
    try {
      const response = await fetch('http://182.18.139.138:8282/api/erice-service/user/login-or-register', {
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

  const handleSubmitOtp = async () => {
    const data = {
      mobileNumber,
      mobileOtpValue: otp,
      mobileOtpSession,
      primaryType: 'SELLER',
    };

    try {
      const response = await axios.post('http://182.18.139.138:8282/api/erice-service/user/login-or-register', data);
      const responseData = response.data;

      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('userId', responseData.userId);
      setMessage(responseData.status);

      if (responseData.userId !== null) {
        setTimeout(() => {
          history('/dashboard');
        }, 3000);
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
          backgroundColor: '#f0f0f0', // Light gray background for the card
        }}
      >
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">Login or Register</h2>

        {/* Mobile Number Input */}
        <Form layout="vertical">
          <Form.Item label="Mobile Number" required>
            <Input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              style={{
                borderRadius: '5px',
              }}
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
                  style={{
                    borderRadius: '5px',
                  }}
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
