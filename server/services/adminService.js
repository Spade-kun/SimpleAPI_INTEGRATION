const Admin = require("../models/Admin");

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new admin
const createAdmin = async (req, res) => {
    const { email, name, picture, department } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const lastAdmin = await Admin.findOne().sort({ adminID: -1 });
        const nextAdminID = lastAdmin && lastAdmin.adminID != null ? lastAdmin.adminID + 1 : 1;

        const newAdmin = new Admin({
            email,
            name,
            picture,
            department,
            adminID: nextAdminID,
        });

        newAdmin.generateGoogleId();
        await newAdmin.save();

        res.status(201).json({ message: "Admin registered successfully", admin: newAdmin });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update admin information by adminID
const updateAdmin = async (req, res) => {
    const { name, picture, email, department, adminID } = req.body;

    try {
        const admin = await Admin.findOneAndUpdate(
            { adminID: req.params.adminID },
            {
                $set: {
                    name: name || undefined,
                    picture: picture || undefined,
                    email: email || undefined,
                    department: department || undefined,
                    adminID: adminID || undefined,
                },
            },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ message: "Admin updated successfully", admin });
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

module.exports = {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
};