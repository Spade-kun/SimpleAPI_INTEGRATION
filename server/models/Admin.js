const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'admin' },
    name: { type: String, required: true },
    picture: String,
    department: String,
    adminID: { type: Number, unique: true },
    googleId: String,
}, { timestamps: true });

adminSchema.methods.generateGoogleId = function () {
    if (!this.googleId) {
        this.googleId = uuidv4();
    }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;