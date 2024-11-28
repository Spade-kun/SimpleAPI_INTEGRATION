const express = require("express");
const {
  getDocuments,
  requestDocument,
  searchDocumentsByTitle,
  searchDocumentsByDocID,
  deleteDocument,
  updateDocument,
  archiveDocument,
  getArchivedDocuments,
  unarchiveDocument,
  uploadDocumentFile,
  getUserDocuments
} = require("../services/documentService");
const multer = require('multer');
const path = require('path');

// Configure multer to store files with their original names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Get all documents
router.get("/", getDocuments);

// Request (create) a new document (manual docID)
router.post("/request", requestDocument);

// Search documents by title
router.post("/search/title", searchDocumentsByTitle);

// Search document by docID (GET method with docID in the URL)
router.get("/search/:docID", searchDocumentsByDocID); // Change POST to GET

// Delete a document by docID
router.delete("/:docID", deleteDocument);

// Update a document by docID
router.patch("/:docID", updateDocument);

// Archive a document
router.patch("/archive/:docID", archiveDocument);

// Unarchive a document
router.patch("/unarchive/:docID", unarchiveDocument);

// Get archived documents
router.get("/archived", getArchivedDocuments);

// Upload a file for a document
router.post('/:docID/upload', upload.single('file'), uploadDocumentFile);

// Get documents for specific user
router.get("/user/:email", getUserDocuments);

module.exports = router;
