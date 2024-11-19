const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const emailService = require('../utils/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        console.log('\n====== Login Attempt ======');
        console.log('Token received:', token ? 'Yes' : 'No');

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        console.log('\n====== Google Payload ======');
        console.log('Email:', payload.email);
        console.log('Name:', payload.name);
        console.log('==========================\n');

        let user = await User.findOne({ email: payload.email });
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('\n🟢 ====== User Login Success ======');
        console.log('ID:', user._id);
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Department:', user.department || 'Not specified');
        console.log('User ID:', user.userID);
        console.log('Login Time:', new Date().toLocaleString());
        console.log('================================\n');

        // Send login notification email
        try {
            const emailSent = await emailService.sendLoginNotification(user.email);
            if (emailSent) {
                console.log('📧 Login notification email sent successfully');
            } else {
                console.log('📧 Login notification email failed to send');
            }
        } catch (emailError) {
            console.error('📧 Email error:', emailError.message);
        }

        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture
            },
            token: jwtToken
        });
    } catch (error) {
        console.error('\n❌ ====== Login Error ======');
        console.error(error);
        console.error('==========================\n');
        res.status(401).json({ message: 'Authentication failed' });
    }
};