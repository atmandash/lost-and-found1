const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/sanitize');

// @route   POST api/auth/register
// @desc    Register user (Direct - No OTP)
// @access  Public
router.post('/register', authLimiter, validateRegistration, handleValidationErrors, authController.register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
