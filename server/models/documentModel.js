const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    docID: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    department: { type: String, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);