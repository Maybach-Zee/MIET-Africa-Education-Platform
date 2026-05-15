const express = require('express');
const { login, refreshToken, getMe, changePassword, register } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshToken);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;