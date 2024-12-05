const express = require('express');
const router = express.Router();

let editLock = {
    isLocked: false,
    userID: null,
    lockTime: null
};

let deleteLock = {
    isLocked: false,
    userID: null,
    lockTime: null
};

const LOCK_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

// Function to check and clear expired locks
const checkLockExpiration = (lock) => {
    if (lock.isLocked && lock.lockTime) {
        const currentTime = Date.now();
        if (currentTime - lock.lockTime > LOCK_TIMEOUT) {
            // Lock has expired
            return {
                isLocked: false,
                userID: null,
                lockTime: null
            };
        }
    }
    return lock;
};

// Get edit lock status
router.get('/edit_user', (req, res) => {
    editLock = checkLockExpiration(editLock);
    res.json(editLock);
});

// Get delete lock status
router.get('/delete_user', (req, res) => {
    deleteLock = checkLockExpiration(deleteLock);
    res.json(deleteLock);
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

// Update delete lock status
router.patch('/delete_user', (req, res) => {
    const { isLocked, userID } = req.body;

    deleteLock = {
        isLocked,
        userID,
        lockTime: isLocked ? Date.now() : null
    };

    res.json(deleteLock);
});

module.exports = router;
