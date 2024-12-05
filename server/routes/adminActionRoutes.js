const express = require('express');
const { logAdminAction, getAdminActions } = require('../services/adminActionService');

const router = express.Router();

router.post('/log', logAdminAction);
router.get('/', getAdminActions);

module.exports = router;
