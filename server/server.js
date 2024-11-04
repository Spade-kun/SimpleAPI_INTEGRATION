const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User'); // Import the User model
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Google login route
app.post('/login/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        console.log("Google User Info:", payload);

        // Check if the user exists in the database
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            // Optionally, create the user if not found
            user = await User.create({
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                role: 'user', // Default role if user is created
            });
            console.log("New user created:", user);
        }

        // Send the user info and role to the client
        res.json({
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
