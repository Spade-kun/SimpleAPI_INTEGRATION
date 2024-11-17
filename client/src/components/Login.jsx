// src/components/Login.jsx
import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./components-css/Login.css";

const clientId = "96467309918-sjb49jofskdnaffpravkqgu1o6p0a8eh.apps.googleusercontent.com";
const recaptchaKey = "6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg";

function Login() {
  const navigate = useNavigate();
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);

  const onSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse);
    const { credential } = credentialResponse;

    fetch("http://localhost:3000/login/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: credential }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Login successful") {
          // Store the tokens and user info in sessionStorage
          sessionStorage.setItem("sessionToken", data.token);
          sessionStorage.setItem("refreshToken", data.refreshToken);
          sessionStorage.setItem("userInfo", JSON.stringify(data.user));
          sessionStorage.setItem("googlePicture", data.user.picture);

          // Redirect based on the user's role
          if (data.user.role === "admin") {
            navigate("/admin");
          } else if (data.user.role === "user") {
            navigate("/user");
          } else {
            alert("Unknown role. Contact support.");
          }
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert("Login failed: An error occurred while logging in.");
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
        <div className="left-section">
          <h2>Document Request System</h2>
          <p>Quick, easy, and secure: Quality Assurance Office Document Request System</p>
          <div className="logo-container">
            <img
              src="../src/assets/newbuksu.png"
              alt="Buksu Logo"
              className="buksu-logo"
            />
            <img
              src="../src/assets/logo.png"
              alt="QA Logo"
              className="qa-logo"
            />
          </div>
        </div>
        <div className="right-section">
          <div className="login-card">
            <h3>Log in to Your Account</h3>
            <h4>Effortlessly Request Documents Online</h4>
            <br />
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              disabled={!isRecaptchaValid}
            />
            <br />
            <ReCAPTCHA sitekey={recaptchaKey} onChange={onRecaptchaChange} />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
