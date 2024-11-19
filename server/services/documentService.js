const Document = require('../models/documentModel');

exports.createDocument = async (documentData, userId) => {
    const lastDocument = await Document.findOne().sort({ docID: -1 });
    const newDocID = lastDocument ? lastDocument.docID + 1 : 1;

    const newDocument = new Document({
        docID: newDocID,
        ...documentData,
        requestedBy: userId
    });

    return await newDocument.save();
};

exports.getAllDocuments = async () => {
    return await Document.find().populate('requestedBy', 'name email');
};

exports.searchByTitle = async (title) => {
    return await Document.find({
        title: { $regex: title, $options: 'i' }
    }).populate('requestedBy', 'name email');
};

exports.getByDocId = async (docID) => {
    return await Document.findOne({ docID }).populate('requestedBy', 'name email');
};

exports.updateDocument = async (docID, updateData) => {
    return await Document.findOneAndUpdate(
        { docID },
        updateData,
        { new: true }
    ).populate('requestedBy', 'name email');
};

exports.deleteDocument = async (docID) => {
    return await Document.findOneAndDelete({ docID });
};