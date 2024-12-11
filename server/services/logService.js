const ExcelJS = require('exceljs');
const AdminAction = require('../models/AdminAction');
const Document = require('../models/Document');
const User = require('../models/User');
const Admin = require('../models/Admin');
const decrypt = require('./decryptionService');

const generateLogsExcel = async (req, res) => {
    try {
        // Create a new workbook
        const workbook = new ExcelJS.Workbook();

        // Add metadata
        workbook.creator = 'System';
        workbook.created = new Date();

        // Create worksheets for different log types
        const adminLogsSheet = workbook.addWorksheet('Admin Logs');
        const userLogsSheet = workbook.addWorksheet('User Logs');
        const documentLogsSheet = workbook.addWorksheet('Document Logs');
        const adminActionsSheet = workbook.addWorksheet('Admin Actions');

        // Set up Admin Logs sheet
        adminLogsSheet.columns = [
            { header: 'Admin ID', key: 'adminID', width: 10 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];
        const admins = await Admin.find();
        const decryptedAdmins = admins.map(admin => ({
            ...admin._doc,
            name: admin.name && admin.name.includes(":") ? decrypt(admin.name) : admin.name,
            department: admin.department && admin.department.includes(":") ? decrypt(admin.department) : admin.department
        }));
        adminLogsSheet.addRows(decryptedAdmins);

        // Set up User Logs sheet
        userLogsSheet.columns = [
            { header: 'User ID', key: 'userID', width: 10 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];
        const users = await User.find();
        const decryptedUsers = users.map(user => ({
            ...user._doc,
            name: user.name && user.name.includes(":") ? decrypt(user.name) : user.name,
            department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
        }));
        userLogsSheet.addRows(decryptedUsers);

        // Set up Document Logs sheet
        documentLogsSheet.columns = [
            { header: 'Doc ID', key: 'docID', width: 10 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Requested By', key: 'email', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];
        const documents = await Document.find();
        documentLogsSheet.addRows(documents);

        // Set up Admin Actions sheet
        adminActionsSheet.columns = [
            { header: 'Admin Email', key: 'adminEmail', width: 30 },
            { header: 'Admin Name', key: 'adminName', width: 20 },
            { header: 'Action Type', key: 'actionType', width: 15 },
            { header: 'Target User', key: 'targetUser', width: 30 },
            { header: 'Details', key: 'details', width: 40 },
            { header: 'Timestamp', key: 'timestamp', width: 20 }
        ];
        const adminActions = await AdminAction.find();
        const decryptedAdminActions = adminActions.map(action => {
            try {
                return {
                    ...action._doc,
                    adminName: action.adminName && action.adminName.includes(":") ? decrypt(action.adminName) : action.adminName,
                    targetUser: action.targetUser && typeof action.targetUser === 'string' && action.targetUser.includes(":") ? decrypt(action.targetUser) : action.targetUser
                };
            } catch (error) {
                console.error("Error decrypting admin action data:", error);
                return action;
            }
        });
        adminActionsSheet.addRow(['Admin Email', 'Admin Name', 'Action Type', 'Target User', 'Details', 'Timestamp']);
        decryptedAdminActions.forEach(action => {
            adminActionsSheet.addRow([action.adminEmail, action.adminName, action.actionType, action.targetUser, action.details, action.timestamp]);
        });

        // Style the headers
        [adminLogsSheet, userLogsSheet, documentLogsSheet, adminActionsSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=system_logs.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating Excel logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    generateLogsExcel
};