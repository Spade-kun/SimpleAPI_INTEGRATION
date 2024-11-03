const express = require('express');
const { createUser } = require('../services/userService');

const router = express.Router();

router.post('/register', createUser); // Endpoint to register a user

module.exports = router;
