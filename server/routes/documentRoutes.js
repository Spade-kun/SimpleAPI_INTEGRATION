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
} = require("../services/documentService");

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

// Add these new routes
router.get("/stats", async (req, res) => {
  try {
    const documents = await Document.find();
    const stats = {
      pending: documents.filter((doc) => doc.status === "Pending").length,
      approved: documents.filter((doc) => doc.status === "Approved").length,
      rejected: documents.filter((doc) => doc.status === "Rejected").length,
      total: documents.length,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const documents = await Document.find();
    const monthlyData = new Array(12).fill(0);
    documents.forEach((doc) => {
      const month = new Date(doc.createdAt).getMonth();
      monthlyData[month]++;
    });
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/department-stats", async (req, res) => {
  try {
    const documents = await Document.find();
    const deptStats = {};
    documents.forEach((doc) => {
      deptStats[doc.department] = (deptStats[doc.department] || 0) + 1;
    });
    res.json(deptStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const recentDocs = await Document.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .select("status title updatedAt");
    res.json(recentDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
