// src/components/Login.jsx
import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./components-css/Login.css";
import { Alert, Backdrop, CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const clientId = "96467309918-sjb49jofskdnaffpravkqgu1o6p0a8eh.apps.googleusercontent.com";
const recaptchaKey = "6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg";

function Login() {
  const navigate = useNavigate();
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = (credentialResponse) => {
    if (!isRecaptchaValid) {
      setShowAlert(true);
      return;
    }
    
    setIsLoading(true);
    console.log("Login Success:", credentialResponse);
    const { credential } = credentialResponse;

    axios.post("http://localhost:3000/api/auth/google", { token: credential })
      .then((response) => {
        if (response.data.message === 'Login successful') {
          sessionStorage.setItem("sessionToken", response.data.token);
          sessionStorage.setItem("userInfo", JSON.stringify(response.data.user));
          sessionStorage.setItem("googlePicture", response.data.user.picture);

          toast.success('Login successful!');

          if (response.data.user.role === "admin") {
            navigate("/admin", { replace: true });
          } else if (response.data.user.role === "user") {
            navigate("/user", { replace: true });
          }
        } else {
          toast.error(response.data.message || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        toast.error(error.response?.data?.message || "An error occurred while logging in.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onError = () => {
    console.log("Login Failed");
    alert("Login failed. Please try again.");
  };

  const onRecaptchaChange = (value) => {
    setIsRecaptchaValid(!!value);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-page">
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            gap: '10px'
          }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
          <div>Logging you in...</div>
        </Backdrop>
        
        <div className="left-section">
          <div className="logo-container">
            <img src="../src/assets/newbuksu.png" alt="Buksu Logo" className="buksu-logo" />
            <img src="../src/assets/logo.png" alt="QA Logo" className="qa-logo" />
          </div>
          <h2 className="login-txt">Document Request System</h2>
          <p className="login-txt1">Quick, easy, and secure: Quality Assurance Office Document Request System</p>
        </div>
    
        <div className="right-section">
          <div className="login-card">
            <h3 className="login-txt1">Log in to Your Account</h3>
            <h5 className="login-txt2">Effortlessly Request Documents Online</h5>
            <br />
            {showAlert && (
              <Alert 
                severity="warning" 
                onClose={() => setShowAlert(false)}
                sx={{ mb: 2, width: '100%' }}
              >
                Please complete the reCAPTCHA verification first
              </Alert>
            )}
            <div className="google-login">
              <GoogleLogin 
                onSuccess={onSuccess} 
                onError={onError} 
                useOneTap
              />
            </div>
            <br />
            <ReCAPTCHA sitekey={recaptchaKey} onChange={onRecaptchaChange} />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>  
  );
}

export default Login;
