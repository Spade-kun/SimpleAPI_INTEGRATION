const Lock = require('../models/Lock');

async function getLockStatus(button) {
    const lock = await Lock.findOne({ button });
    return lock ? lock.isLocked : false;
}

async function setLockStatus(button, status) {
    const lock = await Lock.findOneAndUpdate(
        { button },
        { isLocked: status },
        { new: true, upsert: true }
    );
    return lock.isLocked;
}

module.exports = {
    getLockStatus,
    setLockStatus,
};
