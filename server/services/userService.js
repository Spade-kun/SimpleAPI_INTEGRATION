const User = require('../models/userModel');

exports.createUser = async (userData) => {
    const lastUser = await User.findOne().sort({ userID: -1 });
    const nextUserID = lastUser ? lastUser.userID + 1 : 1;

    const newUser = new User({
        ...userData,
        userID: nextUserID
    });

    newUser.generateGoogleId();
    return await newUser.save();
};

exports.getAllUsers = async () => {
    return await User.find();
};

exports.getUserById = async (userID) => {
    return await User.findOne({ userID });
};

exports.searchUsersByName = async (name) => {
    return await User.find({
        name: { $regex: name, $options: 'i' }
    });
};

exports.updateUser = async (userID, updateData) => {
    return await User.findOneAndUpdate(
        { userID },
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

exports.deleteUser = async (userID) => {
    return await User.findOneAndDelete({ userID });
};