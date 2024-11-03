const express = require('express');
const { getDocuments, requestDocument } = require('../services/documentService');

const router = express.Router();

// Get all documents
router.get('/', getDocuments);

// Request a new document
router.post('/request', requestDocument);

module.exports = router;
