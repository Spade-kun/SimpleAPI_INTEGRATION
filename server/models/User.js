// models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const userSchema = new mongoose.Schema({

    userID: { type: Number, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    name: { type: String },
    picture: { type: String },
    department: { type: String },
    googleId: { type: String, unique: true, sparse: true }

}, { timestamps: true });  // Enable timestamps for createdAt and updatedAt

userSchema.methods.generateGoogleId = function () {
    if (!this.googleId) {
        this.googleId = uuidv4();
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
