const express = require('express');
const {
    getDocuments,
    requestDocument,
    searchDocumentsByTitle,
    searchDocumentsByDocID,
    deleteDocument,
    updateDocument,
} = require('../services/documentService');

const router = express.Router();

// Get all documents
router.get('/', getDocuments);

// Request (create) a new document (manual docID)
router.post('/request', requestDocument);

// Search documents by title
router.post('/search/title', searchDocumentsByTitle);

// Search document by docID (GET method with docID in the URL)
router.get('/search/:docID', searchDocumentsByDocID);  // Change POST to GET

// Delete a document by docID
router.delete('/:docID', deleteDocument);

// Update a document by docID
router.patch('/:docID', updateDocument);

module.exports = router;
