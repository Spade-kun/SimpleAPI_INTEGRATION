const express = require('express');
const { loginUser } = require('../services/loginService');

const router = express.Router();

router.post('/google', loginUser);

module.exports = router;
