const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
    isLocked: {
        type: Boolean,
        default: false,
    },
    button: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Lock', lockSchema);