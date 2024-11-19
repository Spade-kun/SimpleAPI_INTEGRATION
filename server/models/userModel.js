const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    picture: String,
    department: String,
    userID: { type: Number, unique: true, required: true },
    googleId: String,
}, { timestamps: true });

userSchema.methods.generateGoogleId = function() {
    if (!this.googleId) {
        this.googleId = uuidv4();
    }
};

module.exports = mongoose.model('User', userSchema);