const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (user) => {
    const sessionToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { sessionToken, refreshToken };
};

module.exports = { generateTokens };
