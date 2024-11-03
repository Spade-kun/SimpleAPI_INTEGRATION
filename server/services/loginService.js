// services/loginService.js

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const email = payload.email;

        // Check if user exists in the database
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} does not exist. No role assigned.`);
            return res.status(404).json({ message: 'User not found' });
        }

        // User exists, log their role
        console.log(`User ${email} logged in. Role: ${user.role}`);

        // Log the response before sending it back
        const responsePayload = {
            message: 'Login successful',
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                role: user.role,
            },
        };
        console.log('Response Payload:', responsePayload); // Debug log
        res.json(responsePayload);
    } catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(401).json({ message: 'Invalid token' });
    }
};


module.exports = { loginUser };
