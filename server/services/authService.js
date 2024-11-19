const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

exports.verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        return user;
    } catch (error) {
        throw new Error('Invalid token');
    }
};