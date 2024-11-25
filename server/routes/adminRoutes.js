const express = require("express");
const {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
} = require("../services/adminService");

const router = express.Router();

router.get("/", getAllAdmins); // Get all admins
router.post("/register", createAdmin); // Register a new admin
router.patch("/:adminID", updateAdmin); // Update admin information by adminID
router.delete("/:adminID", deleteAdmin); // Delete an admin by adminID

module.exports = router;