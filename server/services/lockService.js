const Lock = require('../models/Lock');

async function getLockStatus(button, id) {
    const lock = await Lock.findOne({ button, $or: [{ userID: id }, { adminID: id }] });
    return lock ? lock.isLocked : false;
}

async function setLockStatus(button, status, id) {
    const lock = await Lock.findOneAndUpdate(
        { button, $or: [{ userID: id }, { adminID: id }] },
        { isLocked: status, userID: id, adminID: id },
        { new: true, upsert: true }
    );
    return lock.isLocked;
}

module.exports = {
    getLockStatus,
    setLockStatus,
};
