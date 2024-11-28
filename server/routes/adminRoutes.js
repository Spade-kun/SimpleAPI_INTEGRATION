const express = require("express");
const {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    createAdminFromTransfer
} = require("../services/adminService");

const router = express.Router();

router.get("/", getAllAdmins); // Get all admins
router.post("/register", createAdmin); // Register a new admin
router.patch("/:adminID", updateAdmin); // Update admin information by adminID
router.delete("/:adminID", deleteAdmin); // Delete an admin by adminID
router.post("/transfer", createAdminFromTransfer); // Add this new route

module.exports = router;