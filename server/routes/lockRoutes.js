const express = require('express');
const { getLockStatus, setLockStatus } = require('../services/lockService');

const router = express.Router();

router.get('/:button', async (req, res) => {
    try {
        const isLocked = await getLockStatus(req.params.button);
        res.json({ isLocked });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lock status' });
    }
});

router.patch('/:button', async (req, res) => {
    try {
        const { isLocked } = req.body;
        const status = await setLockStatus(req.params.button, isLocked);
        res.json({ isLocked: status });
    } catch (error) {
        res.status(500).json({ message: 'Error updating lock status' });
    }
});

module.exports = router;
