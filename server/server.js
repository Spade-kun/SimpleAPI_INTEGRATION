// server.js

const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.post('/login/google', async (req, res) => {
    const { token, recaptcha } = req.body;

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log("Google User Info:", payload);

        // Verify reCAPTCHA token
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY, // Your reCAPTCHA secret key
                response: recaptcha,
            },
        });

        if (!recaptchaResponse.data.success) {
            return res.status(403).json({ message: 'reCAPTCHA verification failed' });
        }

        res.json({
            message: 'Login successful',
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                role: 'admin', // Assume you have logic to get user role
            },
        });
    } catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
