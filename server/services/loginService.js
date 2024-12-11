// services/loginService.js

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Admin = require('../models/Admin');
const decrypt = require('./decryptionService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { generateTokens } = require('./tokenService');

const loginUser = async (req, res) => {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
  
      const email = payload.email;
      const encryptedEmail = encrypt(email);
  
      let user = await Admin.findOne({ email: encryptedEmail });
      let role = 'admin';
  
      if (!user) {
        user = await User.findOne({ email: encryptedEmail });
        role = 'user';
      }
  
      if (!user) {
        console.log(`User with email ${email} does not exist. No role assigned.`);
        return res.status(404).json({ message: 'User not found' });
      }
  
      const decryptedUser = {
        ...user._doc,
        email: user.email && user.email.includes(":") ? decrypt(user.email) : user.email,
        department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
      };
  
      console.log(`User ${email} logged in. Role: ${role}`);
  
      const { sessionToken, refreshToken } = generateTokens(decryptedUser);
  
      const responsePayload = {
        message: 'Login successful',
        user: {
          name: decryptedUser.name,
          email: decryptedUser.email,
          picture: decryptedUser.picture,
          role: role,
        },
        token: sessionToken,
        refreshToken: refreshToken,
      };
      console.log('Response Payload:', responsePayload);
      res.json(responsePayload);
    } catch (error) {
      console.error("Error verifying Google token:", error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };  

module.exports = { loginUser };
