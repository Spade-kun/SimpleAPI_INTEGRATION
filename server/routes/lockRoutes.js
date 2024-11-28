const express = require('express');
const router = express.Router();

let editLock = {
    isLocked: false,
    userID: null,
    lockTime: null
};

const LOCK_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

// Function to check and clear expired locks
const checkLockExpiration = () => {
    if (editLock.isLocked && editLock.lockTime) {
        const currentTime = Date.now();
        if (currentTime - editLock.lockTime > LOCK_TIMEOUT) {
            // Lock has expired
            editLock = {
                isLocked: false,
                userID: null,
                lockTime: null
            };
        }
    }
};

// Get edit lock status
router.get('/edit_user', (req, res) => {
    checkLockExpiration();
    res.json(editLock);
});

// Update edit lock status
router.patch('/edit_user', (req, res) => {
    const { isLocked, userID } = req.body;

    editLock = {
        isLocked,
        userID,
        lockTime: isLocked ? Date.now() : null
    };

    res.json(editLock);
});

module.exports = router;
