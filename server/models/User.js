const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    name: { type: String },
    picture: { type: String },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
