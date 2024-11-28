const Admin = require("../models/Admin");
const { decrypt } = require("./decryptService");
const { encrypt } = require("./encryptionService");

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({});
    const decryptedAdmins = admins
      .map((admin) => {
        try {
          return {
            ...admin._doc,
            email: decrypt(admin.email),
            name: decrypt(admin.name),
            department: decrypt(admin.department),
            role: decrypt(admin.role),
            adminID: admin.adminID, // Keep adminID as is
          };
        } catch (decryptionError) {
          console.error(
            "Decryption error for admin:",
            admin._id,
            decryptionError
          );
          return null; // or handle the error as needed
        }
      })
      .filter((admin) => admin !== null); // Filter out any admins that failed decryption
    res.json(decryptedAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new admin
const createAdmin = async (req, res) => {
  const { email, name, picture, department } = req.body;

  if (!email || !name || !department) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const encryptedEmail = encrypt(email);
    const encryptedName = encrypt(name);
    const encryptedDepartment = encrypt(department);
    const encryptedRole = encrypt("admin"); // Assuming role is always "admin"

    // Find the last admin and increment the adminID
    const lastAdmin = await Admin.findOne().sort({ adminID: -1 });
    const nextAdminID = lastAdmin ? parseInt(lastAdmin.adminID) + 1 : 1;

    const newAdmin = new Admin({
      email: encryptedEmail,
      role: encryptedRole,
      name: encryptedName,
      picture,
      department: encryptedDepartment,
      adminID: nextAdminID.toString(), // Incremented adminID
    });

    newAdmin.generateGoogleId();
    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin registered successfully", admin: newAdmin });
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
