const Document = require('../models/Document'); // Import the Document model

const requestDocument = async (req, res) => {
  const { email, title, content, department } = req.body;

  try {
    // Validate required fields
    if (!email || !title || !content || !department) {
      return res.status(400).json({
        message: "All fields are required (email, title, content, department)"
      });
    }

    // Find the highest docID using aggregation
    const highestDoc = await Document.aggregate([
      { $group: { _id: null, maxDocID: { $max: "$docID" } } }
    ]);

    // Calculate new docID (if no documents exist, start with 1)
    const newDocID = highestDoc.length > 0 ? highestDoc[0].maxDocID + 1 : 1;

    // Create and save the new document with status
    const newDocument = new Document({
      docID: newDocID,
      email,
      title,
      content,
      department,
      status: 'Pending' // Set default status
    });

    const savedDocument = await newDocument.save();

    res.status(201).json({
      success: true,
      message: `Document ${newDocID} created successfully!`,
      document: savedDocument
    });
  } catch (error) {
    console.error('Document creation error:', error);

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      // If duplicate error occurs, retry with a new docID
      try {
        const highest = await Document.findOne().sort({ docID: -1 });
        const retryDocID = (highest?.docID || 0) + 1;

        const retryDocument = new Document({
          docID: retryDocID,
          email,
          title,
          content,
          department,
          status: 'Pending' // Set default status
        });

        const savedDocument = await retryDocument.save();

        return res.status(201).json({
          success: true,
          message: `Document ${retryDocID} created successfully!`,
          document: savedDocument
        });
      } catch (retryError) {
        return res.status(500).json({
          success: false,
          message: "Error creating document after retry",
          error: retryError.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Error creating document",
      error: error.message
    });
  }
};

// Get all documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find(); // Fetch all documents
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Search documents by title
const searchDocumentsByTitle = async (req, res) => {
  const { title } = req.body; // Get search term from the request body

  try {
    const documents = await Document.find({
      title: { $regex: title, $options: 'i' }, // Case-insensitive search
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error searching documents', error });
  }
};

// Search documents by docID (Using GET and URL parameters)
const searchDocumentsByDocID = async (req, res) => {
  const { docID } = req.params; // Get docID from URL parameters

  try {
    const document = await Document.findOne({ docID }); // Find by docID
    if (!document) {
      return res.status(404).json({ message: `Document with docID ${docID} not found!` });
    }

    // Return the document along with docID in the response
    res.json({
      docID: document.docID, // Ensure docID is part of the response
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching for document', error });
  }
};

// Delete document by docID
const deleteDocument = async (req, res) => {
  const { docID } = req.params; // Get docID from URL params

  try {
    const document = await Document.findOneAndDelete({ docID }); // Delete by docID
    if (!document) {
      return res.status(404).json({ message: `Document with docID ${docID} not found!` });
    }
    res.json({ message: `Document ${docID} deleted successfully!` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
};

// Update document by docID
const updateDocument = async (req, res) => {
  const { docID } = req.params; // Get docID from URL params
  const { title, content } = req.body; // Get new data from body

  try {
    const document = await Document.findOneAndUpdate(
      { docID },
      { title, content },
      { new: true } // Return the updated document
    );

    if (!document) {
      return res.status(404).json({ message: `Document with docID ${docID} not found!` });
    }

    res.json({ message: `Document ${docID} updated successfully!`, document });
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error });
  }
};

module.exports = { getDocuments, requestDocument, searchDocumentsByTitle, searchDocumentsByDocID, deleteDocument, updateDocument };
