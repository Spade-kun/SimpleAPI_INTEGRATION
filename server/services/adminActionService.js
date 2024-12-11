const AdminAction = require('../models/AdminAction');
const { decrypt } = require('./decryptionService');

const logAdminAction = async (req, res) => {
    try {
        const { adminEmail, adminName, actionType, targetUser, details } = req.body;

        const adminAction = new AdminAction({
            adminEmail,
            adminName,
            actionType,
            targetUser,
            details
        });

        await adminAction.save();
        res.status(201).json({ success: true, message: 'Admin action logged successfully' });
    } catch (error) {
        console.error('Error logging admin action:', error);
        res.status(500).json({ success: false, message: 'Error logging admin action' });
    }
};

const getAdminActions = async (req, res) => {
    try {
        const actions = await AdminAction.find().sort({ timestamp: -1 });
        const decryptedActions = actions.map(action => {
            try {
                return {
                    ...action._doc,
                    adminName: action.adminName && action.adminName.includes(":") ? decrypt(action.adminName) : action.adminName,
                    targetUser: action.targetUser && action.targetUser.includes(":") ? decrypt(action.targetUser) : action.targetUser
                };
            } catch (error) {
                console.error("Error decrypting admin action data:", error);
                return action;
            }
        });
        res.status(200).json(decryptedActions);
    } catch (error) {
        console.error('Error fetching admin actions:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin actions' });
    }
};

module.exports = {
    logAdminAction,
    getAdminActions
};
