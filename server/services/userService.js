const User = require("../models/User");
const Admin = require("../models/Admin");
const { encrypt } = require("./encryptionService");
const { decrypt } = require("./decryptService");

// Create a new user
const createUser = async (req, res) => {
  const { email, role, name, picture, department } = req.body;

  if (!email || !name || !department || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  console.log("Request Body:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "User already exists" });
    }

    const encryptedEmail = encrypt(email);
    const encryptedName = encrypt(name);
    const encryptedDepartment = encrypt(department);
    const encryptedRole = encrypt(role);

    console.log("Encrypted Email:", encryptedEmail);
    console.log("Encrypted Name:", encryptedName);
    console.log("Encrypted Department:", encryptedDepartment);
    console.log("Encrypted Role:", encryptedRole);

    if (role === "admin") {
      const lastAdmin = await Admin.findOne().sort({ adminID: -1 });
      const nextAdminID =
        lastAdmin && lastAdmin.adminID != null ? lastAdmin.adminID + 1 : 1;

      const newAdmin = new Admin({
        email: encryptedEmail,
        role: encryptedRole,
        name: encryptedName,
        picture,
        department: encryptedDepartment,
        adminID: nextAdminID.toString(),
      });

      newAdmin.generateGoogleId();
      await newAdmin.save();

      return res
        .status(201)
        .json({ message: "Admin registered successfully", admin: newAdmin });
    } else {
      const lastUser = await User.findOne().sort({ userID: -1 });
      const nextUserID =
        lastUser && lastUser.userID != null ? lastUser.userID + 1 : 1;

      const newUser = new User({
        email: encryptedEmail,
        role: encryptedRole,
        name: encryptedName,
        picture,
        department: encryptedDepartment,
        userID: nextUserID.toString(),
      });

      newUser.generateGoogleId();
      await newUser.save();

      return res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const decryptedUsers = users
      .map((user) => {
        try {
          return {
            ...user._doc,
            email: decrypt(user.email),
            name: decrypt(user.name),
            department: decrypt(user.department),
            role: decrypt(user.role),
            userID: user.userID,
          };
        } catch (decryptionError) {
          console.error(
            "Decryption error for user:",
            user._id,
            decryptionError
          );
          return null; // or handle the error as needed
        }
      })
      .filter((user) => user !== null); // Filter out any users that failed decryption
    res.json(decryptedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  searchUsersByName,
  updateUser,
  deleteUser,
};
