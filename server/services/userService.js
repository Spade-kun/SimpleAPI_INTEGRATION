const User = require("../models/User");
const Admin = require("../models/Admin");

// Create a new user
const createUser = async (req, res) => {
  const { email, name, department, role = 'user' } = req.body;

  try {
    // Check if email exists in either collection
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Find the highest userID
    const highestUser = await User.findOne({}, { userID: 1 }).sort({ userID: -1 });
    let nextUserID = 1;

    if (highestUser) {
      // Get all userIDs and sort them
      const allUsers = await User.find({}, { userID: 1 }).sort({ userID: 1 });
      const userIDs = allUsers.map(user => user.userID);

      // Find the first available gap in the sequence
      nextUserID = findNextAvailableID(userIDs);
    }

    // Double check that this ID is not in use
    const existingUserWithID = await User.findOne({ userID: nextUserID });
    if (existingUserWithID) {
      // If somehow the ID is taken, find the next truly available ID
      const allUsers = await User.find({}, { userID: 1 }).sort({ userID: 1 });
      const userIDs = allUsers.map(user => user.userID);
      nextUserID = Math.max(...userIDs) + 1;
    }

    const newUser = new User({
      email,
      role: 'user',
      name,
      department,
      userID: nextUserID
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully", user: newUser });

  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with this ID already exists. Please try again."
      });
    }
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

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by userID
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by userID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search users by name
const searchUsersByName = async (req, res) => {
  try {
    const users = await User.find({ name: new RegExp(req.params.name, "i") });
    res.json(users);
  } catch (error) {
    console.error("Error searching users by name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user information by userID
const updateUser = async (req, res) => {
  const { name, role, picture, email, department, userID } = req.body;

  try {
    // Find the user by userID and update the fields provided in the request
    const user = await User.findOneAndUpdate(
      { userID: req.params.userID },
      {
        $set: {
          name: name || undefined,
          role: role || undefined,
          picture: picture || undefined,
          email: email || undefined, // This will update the email
          department: department || undefined,
          userID: userID || undefined, // This will allow updating the userID if needed
        },
      },
      { new: true } // This will return the updated user
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user by userID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ userID: req.params.userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// New method for handling user creation from transfer
const createUserFromTransfer = async (req, res) => {
  const { email, name, department, transferFromId, originalRole } = req.body;

  try {
    // Skip email check if it's a transfer
    if (originalRole !== 'admin') {
      return res.status(400).json({ message: "Invalid transfer request" });
    }

    // Find the highest userID
    const highestUser = await User.findOne({}, { userID: 1 }).sort({ userID: -1 });
    let nextUserID = 1;

    if (highestUser) {
      const allUsers = await User.find({}, { userID: 1 }).sort({ userID: 1 });
      const userIDs = allUsers.map(user => user.userID);
      nextUserID = findNextAvailableID(userIDs);
    }

    const newUser = new User({
      email,
      role: 'user',
      name,
      department,
      userID: nextUserID
    });

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User created successfully from transfer",
      user: newUser
    });

  } catch (error) {
    console.error("Error creating user from transfer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  createUserFromTransfer,
  getAllUsers,
  getUserById,
  searchUsersByName,
  updateUser,
  deleteUser,
};
