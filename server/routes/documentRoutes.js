const express = require('express');
const documentController = require('../controllers/documentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(documentController.getAllDocuments)
    .post(documentController.createDocument);

router.post('/search/title', documentController.searchByTitle);

router
    .route('/:docID')
    .get(documentController.getByDocId)
    .patch(restrictTo('admin'), documentController.updateDocument)
    .delete(restrictTo('admin'), documentController.deleteDocument);

module.exports = router;