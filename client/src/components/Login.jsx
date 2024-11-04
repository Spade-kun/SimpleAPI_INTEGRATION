// src/components/Login.jsx

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const clientId = '96467309918-sjb49jofskdnaffpravkqgu1o6p0a8eh.apps.googleusercontent.com';
const recaptchaKey = '6Lfty3MqAAAAACp-CJm8DFxDW1GfjdR1aXqHbqpg';

function Login() {
    const navigate = useNavigate();
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);

    const onSuccess = async (credentialResponse) => {
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
                body: JSON.stringify({ token: credentialResponse.credential, recaptcha: recaptchaValue }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', credentialResponse.credential);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                // Redirect based on user role
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'user') {
                    navigate('/user');
                } else {
                    alert("Access denied: No role assigned.");
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

    const onRecaptchaChange = (value) => {
        setRecaptchaValue(value);
        setIsRecaptchaValid(true);
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
                    disabled={!isRecaptchaValid}
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;
