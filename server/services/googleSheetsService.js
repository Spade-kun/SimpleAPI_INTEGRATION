const { google } = require('googleapis');
const Document = require('../models/Document');
const path = require('path');

// Update the credentials path to point to the correct location
const keyFilePath = path.join(__dirname, '..', 'credentialsAPI.json');

// Configure Google Sheets API
const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,  // Updated path to your credentials
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/spreadsheets.readonly"
    ],
});

const sheets = google.sheets({ version: 'v4', auth });

// Replace with your spreadsheet ID (from the URL)
const SPREADSHEET_ID = '1pLt-qCXB2mUHE6w4FhPMUpT-k8yQl54QRb4Y4xlep-E';
// Replace with your sheet name or ID
const RANGE = 'Form Responses 1!A2:E'; // Adjust based on your form fields

async function syncFromSheets() {
    try {
        // Get the last document ID from MongoDB to continue the sequence
        const lastDoc = await Document.findOne({}, {}, { sort: { 'docID': -1 } });
        let nextDocID = lastDoc ? lastDoc.docID + 1 : 1;

        // Fetch data from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return { success: true, message: 'No new data to sync' };
        }

        // Process each row and update/insert in MongoDB
        for (const row of rows) {
            const [timestamp, email, title, content, department] = row;

            // Check if document already exists with this combination
            const existingDoc = await Document.findOne({
                email,
                title,
                content,
                department
            });

            if (!existingDoc) {
                // Create new document if it doesn't exist
                await Document.create({
                    docID: nextDocID++,
                    email,
                    title,
                    content,
                    department,
                    status: 'Pending',
                    createdAt: new Date(timestamp)
                });
            }
        }

        return { success: true, message: `Synced ${rows.length} rows from sheets` };
    } catch (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { syncFromSheets }; 