// services/loginService.js

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Admin = require("../models/Admin");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { generateTokens } = require("./tokenService");
const { decrypt } = require("./decryptService");

const loginUser = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const decryptedEmail = decrypt(email);

    console.log("Decrypted Email:", decryptedEmail);

    let user = await Admin.findOne({ email: decryptedEmail });
    let role = "admin";

    if (!user) {
      user = await User.findOne({ email: decryptedEmail });
      role = "user";
    }

    if (!user) {
      console.log(
        `User with email ${decryptedEmail} does not exist. No role assigned.`
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User ${decryptedEmail} logged in. Role: ${role}`);

    const { sessionToken, refreshToken } = generateTokens(user);

    const responsePayload = {
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: role,
      },
      token: sessionToken,
      refreshToken: refreshToken,
    };
    console.log("Response Payload:", responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { loginUser };
