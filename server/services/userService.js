const User = require('../models/User');

// Create a new user
const createUser = async (req, res) => {
    const { email, role, name, picture, department, userID } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user with the provided userID
        const newUser = new User({
            email,
            role,
            name,
            picture,
            department,
            userID,
        });

        // Call the generateGoogleId method before saving if googleId is not provided
        newUser.generateGoogleId();

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a user by userID
const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ userID: req.params.userID });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by userID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search users by name
const searchUsersByName = async (req, res) => {
    try {
        const users = await User.find({ name: new RegExp(req.params.name, 'i') });
        res.json(users);
    } catch (error) {
        console.error('Error searching users by name:', error);
        res.status(500).json({ message: 'Server error' });
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
                    email: email || undefined,   // This will update the email
                    department: department || undefined,
                    userID: userID || undefined  // This will allow updating the userID if needed
                }
            },
            { new: true }  // This will return the updated user
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a user by userID
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ userID: req.params.userID });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createUser, getAllUsers, getUserById, searchUsersByName, updateUser, deleteUser };
