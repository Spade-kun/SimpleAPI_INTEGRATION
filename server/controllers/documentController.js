const Document = require('../models/documentModel');
const documentService = require('../services/documentService');

exports.createDocument = async (req, res) => {
    try {
        const document = await documentService.createDocument(req.body, req.user.userId);
        res.status(201).json({ success: true, data: document });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await documentService.getAllDocuments();
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchByTitle = async (req, res) => {
    try {
        const documents = await documentService.searchByTitle(req.body.title);
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getByDocId = async (req, res) => {
    try {
        const document = await documentService.getByDocId(req.params.docID);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        res.json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const document = await documentService.updateDocument(req.params.docID, req.body);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        res.json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const document = await documentService.deleteDocument(req.params.docID);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};