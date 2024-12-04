const PDFDocument = require('pdfkit');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Document = require('../models/Document');

const generateLogsPDF = async (req, res) => {
    try {
        // Fetch data from all collections
        const admins = await Admin.find({});
        const users = await User.find({});
        const documents = await Document.find({});

        // Create PDF document
        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=system_logs.pdf');

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('System Logs Report', { align: 'center' });
        doc.moveDown();

        // Add timestamp
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        // Admin Logs
        doc.fontSize(16).text('Admin Logs', { underline: true });
        doc.moveDown();
        admins.forEach(admin => {
            doc.fontSize(12).text(`Admin ID: ${admin.adminID}`);
            doc.text(`Name: ${admin.name}`);
            doc.text(`Email: ${admin.email}`);
            doc.text(`Department: ${admin.department || 'N/A'}`);
            doc.text(`Created At: ${admin.createdAt.toLocaleString()}`);
            doc.moveDown();
        });

        // User Logs
        doc.addPage();
        doc.fontSize(16).text('User Logs', { underline: true });
        doc.moveDown();
        users.forEach(user => {
            doc.fontSize(12).text(`User ID: ${user.userID}`);
            doc.text(`Name: ${user.name}`);
            doc.text(`Email: ${user.email}`);
            doc.text(`Department: ${user.department || 'N/A'}`);
            doc.text(`Created At: ${user.createdAt.toLocaleString()}`);
            doc.moveDown();
        });

        // Document Logs
        doc.addPage();
        doc.fontSize(16).text('Document Logs', { underline: true });
        doc.moveDown();
        documents.forEach(document => {
            doc.fontSize(12).text(`Document ID: ${document.docID}`);
            doc.text(`Title: ${document.title}`);
            doc.text(`Department: ${document.department}`);
            doc.text(`Status: ${document.status}`);
            doc.text(`Created By: ${document.email}`);
            doc.text(`Created At: ${document.createdAt.toLocaleString()}`);
            doc.moveDown();
        });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Error generating logs PDF:', error);
        res.status(500).json({ message: 'Error generating logs PDF' });
    }
};

module.exports = {
    generateLogsPDF
}; 