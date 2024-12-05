const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    actionType: { type: String, required: true }, // 'ADD', 'EDIT', 'DELETE'
    targetUser: {
        email: String,
        name: String,
        role: String,
        department: String,
        id: String // userID or adminID
    },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const AdminAction = mongoose.model('AdminAction', adminActionSchema);

module.exports = AdminAction;
