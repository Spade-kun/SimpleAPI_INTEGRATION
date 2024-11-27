const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
    isLocked: {
        type: Boolean,
        default: false,
    },
    button: {
        type: String,
        required: true,
        unique: true,
    },
    userID: {
        type: String,
        default: null,
    },
    adminID: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Lock', lockSchema);