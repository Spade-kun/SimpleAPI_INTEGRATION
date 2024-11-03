// src/components/Login.jsx

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const clientId = '96467309918-sjb49jofskdnaffpravkqgu1o6p0a8eh.apps.googleusercontent.com'; // Replace with your actual Google client ID
const recaptchaKey = '6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg'; // Replace with your reCAPTCHA Site Key

function Login() {
    const navigate = useNavigate();
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(false); // State for reCAPTCHA validity

    const onSuccess = async (credentialResponse) => {
        console.log("Login Success:", credentialResponse);

        // Check if reCAPTCHA was verified
        if (!recaptchaValue) {
            alert("Please complete the reCAPTCHA.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/login/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential, recaptcha: recaptchaValue }), // Send recaptcha value to the server
            });

            const data = await response.json();

            console.log("Backend response:", data);

            if (response.ok) {
                localStorage.setItem('authToken', credentialResponse.credential); // Store token
                localStorage.setItem('userInfo', JSON.stringify(data.user)); // Store user info

                // Navigate to the appropriate dashboard based on the role
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'user') {
                    navigate('/user');
                }
            } else {
                console.log("Login Failed:", data.message);
                alert("Login failed: " + data.message);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("An error occurred while logging in.");
        }
    };

    const onError = () => {
        console.log("Login Failed");
        alert("Login failed. Please try again.");
    };

    // Callback when reCAPTCHA is successfully completed
    const onRecaptchaChange = (value) => {
        setRecaptchaValue(value);
        setIsRecaptchaValid(true); // Set the reCAPTCHA validity state to true
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ReCAPTCHA
                    sitekey={recaptchaKey}
                    onChange={onRecaptchaChange}
                />
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    disabled={!isRecaptchaValid} // Disable button if reCAPTCHA is not completed
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;
