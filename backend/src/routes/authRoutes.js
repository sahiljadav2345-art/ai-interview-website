const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', authenticate, authController.getUserProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
