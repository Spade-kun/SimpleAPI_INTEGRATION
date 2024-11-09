const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        docID: { type: String, required: true, unique: true }, // Manually setting docID
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: true, // Mongoose will handle createdAt and updatedAt automatically
    }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
