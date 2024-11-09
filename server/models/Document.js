const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        docID: { type: Number, required: true, unique: true }, // docID is an integer now
        title: { type: String, required: true },
        content: { type: String, required: true },
        department: { type: String, required: true }, // Department field
    },
    {
        timestamps: true, // Mongoose will handle createdAt and updatedAt automatically
    }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
