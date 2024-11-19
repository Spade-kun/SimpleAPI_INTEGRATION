const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/google', authController.googleLogin);

module.exports = router;