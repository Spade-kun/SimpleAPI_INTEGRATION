const User = require("../models/User");
const Admin = require("../models/Admin");
const encrypt = require("./encryptionService");
const decrypt = require("./decryptionService");

// Create a new user
const createUser = async (req, res) => {
  const { email, name, department, role = 'user', picture } = req.body;

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
      const userIDs = allUsers.map(user => parseInt(user.userID));

      // Find the first available gap in the sequence
      nextUserID = findNextAvailableID(userIDs);
    }

    // Double check that this ID is not in use
    const existingUserWithID = await User.findOne({ userID: nextUserID });
    if (existingUserWithID) {
      // If somehow the ID is taken, find the next truly available ID
      const allUsers = await User.find({}, { userID: 1 }).sort({ userID: 1 });
      const userIDs = allUsers.map(user => parseInt(user.userID));
      nextUserID = Math.max(...userIDs) + 1;
    }

    // Encrypt the department before creating the user
    const encryptedDepartment = encrypt(department);

    // Create the user with encrypted fields
    const newUser = new User({
      name,
      role: 'user',
      picture: picture || undefined,
      email,
      department: encryptedDepartment,
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
    const decryptedUsers = users.map(user => ({
      ...user._doc,
      department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
    }));
    res.json(decryptedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a user by userID
const getUserById = async (req, res) => {
  try {
    // Try to find the user by unencrypted userID first
    let user = await User.findOne({ userID: req.params.userID });

    // If not found, try to find the user by encrypted userID
    if (!user) {
      const encryptedUserID = encrypt(req.params.userID);
      user = await User.findOne({ userID: encryptedUserID });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const decryptedUser = {
      ...user._doc,
      department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
    };

    res.json(decryptedUser);
  } catch (error) {
    console.error("Error fetching user by userID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search users by name
const searchUsersByName = async (req, res) => {
  try {
    const users = await User.find({ name: new RegExp(req.params.name, "i") });
    const decryptedUsers = users.map(user => {
      try {
        return {
          ...user._doc,
          department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
        };
      } catch (error) {
        console.error("Error decrypting user data:", error);
        return user;
      }
    });
    res.json(decryptedUsers);
  } catch (error) {
    console.error("Error searching users by name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user information by userID
const updateUser = async (req, res) => {
  const { name, role, picture, email, department, userID } = req.body;

  try {
    // Encrypt the fields if they are provided in the request
    const encryptedDepartment = department ? encrypt(department) : undefined;

    // Try to find the user by unencrypted userID first
    let user = await User.findOne({ userID: req.params.userID });

    // If not found, try to find the user by encrypted userID
    if (!user) {
      const encryptedUserID = encrypt(req.params.userID);
      user = await User.findOne({ userID: encryptedUserID });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user with the provided fields
    user.name = name || user.name;
    user.role = role || user.role;
    user.picture = picture || user.picture;
    user.email = email || user.email;
    user.department = encryptedDepartment || user.department;

    await user.save();

    const decryptedUser = {
      ...user._doc,
      department: user.department && user.department.includes(":") ? decrypt(user.department) : user.department
    };

    res.json({ message: "User updated successfully", user: decryptedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user by userID
const deleteUser = async (req, res) => {
  try {
    // Try to find the user by unencrypted userID first
    let user = await User.findOneAndDelete({ userID: req.params.userID });

    // If not found, try to find the user by encrypted userID
    if (!user) {
      const encryptedUserID = encrypt(req.params.userID);
      user = await User.findOneAndDelete({ userID: encryptedUserID });
    }

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

    // Encrypt department
    const encryptedDepartment = encrypt(department);

    const newUser = new User({
      email,
      role: 'user',
      name,
      department: encryptedDepartment,
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

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Decrypt department
    user.department = decrypt(user.department);

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
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
  getUser,
};
