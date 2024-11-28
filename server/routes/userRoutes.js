// routes/userRoutes.js
const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  searchUsersByName,
  updateUser,
  deleteUser,
  createUserFromTransfer,
} = require("../services/userService");

const router = express.Router();

router.post("/register", createUser); // Register a new user
router.get("/", getAllUsers); // Get all users
router.get("/:userID", getUserById); // Get a user by userID
router.get("/search/:name", searchUsersByName); // Search users by name
router.patch("/:userID", updateUser); // Update user information by userID
router.delete("/:userID", deleteUser); // Delete a user by userID
router.post("/transfer", createUserFromTransfer); // Add this new route

module.exports = router;
