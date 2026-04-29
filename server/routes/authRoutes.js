const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Double-check these names match exactly in authMiddleware.js
const { protect, admin } = require('../middleware/authMiddleware');

// 🔓 Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// 🔒 Private
// LINE 11 IS LIKELY HERE - Ensure 'protect' is a valid function
router.get('/profile', protect, authController.getProfile);

// 🛡️ Admin
// Ensure 'protect' AND 'admin' are valid functions
router.get('/all-users', protect, admin, authController.getAllUsers);

// 🔑 Security
router.post('/update-pin', protect, authController.updateTransactionPin);

module.exports = router;