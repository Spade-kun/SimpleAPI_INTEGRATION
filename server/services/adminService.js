const Admin = require("../models/Admin");
const User = require("../models/User");
const encrypt = require("./encryptionService");
const decrypt = require("./decryptionService");

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        const decryptedAdmins = admins.map(admin => {
            try {
                return {
                    ...admin._doc,
                    department: admin.department && admin.department.includes(":") ? decrypt(admin.department) : admin.department
                };
            } catch (error) {
                console.error("Error decrypting admin data:", error);
                return admin;
            }
        });
        res.status(200).json(decryptedAdmins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new admin
const createAdmin = async (req, res) => {
    const { email, name, department } = req.body;

    try {
        // Check if email exists in either collection
        const existingUser = await User.findOne({ email });
        const existingAdmin = await Admin.findOne({ email });

        if (existingUser || existingAdmin) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Find the highest adminID
        const highestAdmin = await Admin.findOne({}, { adminID: 1 }).sort({ adminID: -1 });
        let nextAdminID = 1;

        if (highestAdmin) {
            // Get all adminIDs and sort them
            const allAdmins = await Admin.find({}, { adminID: 1 }).sort({ adminID: 1 });
            const adminIDs = allAdmins.map(admin => admin.adminID);

            // Find the first available gap in the sequence
            nextAdminID = findNextAvailableID(adminIDs);
        }

        // Encrypt the department before creating the admin
        const encryptedDepartment = encrypt(department);

        const newAdmin = new Admin({
            email,
            role: 'admin',
            name,
            department: encryptedDepartment,
            adminID: nextAdminID
        });

        await newAdmin.save();
        return res.status(201).json({ message: "Admin created successfully", admin: newAdmin });

    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Helper function to find the next available ID
const findNextAvailableID = (ids) => {
    if (ids.length === 0) return 1;

    ids.sort((a, b) => a - b);
    let expectedID = 1;

    for (const id of ids) {
        if (id !== expectedID) {
            return expectedID;
        }
        expectedID++;
    }

    return expectedID;
};

// Update admin information by adminID
const updateAdmin = async (req, res) => {
    const { name, picture, email, department, adminID } = req.body;

    try {
        // Encrypt the fields if they are provided in the request
        const encryptedDepartment = department ? encrypt(department) : undefined;

        const admin = await Admin.findOneAndUpdate(
            { adminID: req.params.adminID },
            {
                $set: {
                    name: name || undefined,
                    picture: picture || undefined,
                    email: email || undefined,
                    department: encryptedDepartment || undefined,
                    adminID: adminID || undefined,
                },
            },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Decrypt the updated admin before sending the response
        const decryptedAdmin = {
            ...admin._doc,
            department: admin.department && admin.department.includes(":") ? decrypt(admin.department) : admin.department
        };

        res.json({ message: "Admin updated successfully", admin: decryptedAdmin });
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete an admin by adminID
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOneAndDelete({ adminID: req.params.adminID });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// New method for handling admin creation from transfer
const createAdminFromTransfer = async (req, res) => {
    const { email, name, department, transferFromId, originalRole } = req.body;

    try {
        // Skip email check if it's a transfer
        if (originalRole !== 'user') {
            return res.status(400).json({ message: "Invalid transfer request" });
        }

        // Find the highest adminID
        const highestAdmin = await Admin.findOne({}, { adminID: 1 }).sort({ adminID: -1 });
        let nextAdminID = 1;

        if (highestAdmin) {
            const allAdmins = await Admin.find({}, { adminID: 1 }).sort({ adminID: 1 });
            const adminIDs = allAdmins.map(admin => admin.adminID);
            nextAdminID = findNextAvailableID(adminIDs);
        }

        // Encrypt the name department before creating the admin
        const encryptedDepartment = encrypt(department);

        const newAdmin = new Admin({
            email,
            role: 'admin',
            name,
            department: encryptedDepartment,
            adminID: nextAdminID
        });

        await newAdmin.save();
        return res.status(201).json({
            success: true,
            message: "Admin created successfully from transfer",
            admin: newAdmin
        });

    } catch (error) {
        console.error("Error creating admin from transfer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllAdmins,
    createAdmin,
    createAdminFromTransfer,
    updateAdmin,
    deleteAdmin,
};
