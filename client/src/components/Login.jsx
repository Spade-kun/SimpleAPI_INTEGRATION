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

    const onSuccess = (credentialResponse) => {
        console.log("Login Success:", credentialResponse);
        const { credential } = credentialResponse;

        fetch('http://localhost:3000/login/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: credential }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Login successful') {
                    // Store the session token in sessionStorage
                    sessionStorage.setItem('sessionToken', data.token);

                    // Redirect based on the user's role
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/user');
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
