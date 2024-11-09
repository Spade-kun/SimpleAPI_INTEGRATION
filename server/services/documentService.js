const Document = require('../models/Document'); // Import the Document model

const requestDocument = async (req, res) => {
    const { title, content, department } = req.body; // docID is no longer needed in the request body

    try {
        // Find the document with the highest docID (sort by docID in descending order)
        const lastDocument = await Document.findOne().sort({ docID: -1 }); // Sort by docID in descending order to get the last document

        let newDocID = 1; // Default docID if no documents exist (starting from 1)

        if (lastDocument) {
            // Increment the last docID by 1
            newDocID = lastDocument.docID + 1;
        }

        // Create a new document with auto-generated docID
        const newDocument = new Document({
            docID: newDocID, // Set the auto-incremented docID
            title,
            content,
            department,
        });

        await newDocument.save(); // Save the new document with the generated docID

        res.status(201).json({
            message: `Document ${newDocID} created successfully!`,
            document: newDocument,
        });
    } catch (error) {
        res.status(400).json({ message: 'Error creating document', error });
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
