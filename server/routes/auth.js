const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/register
// @desc    Register user and send verification OTP
router.post('/register', authController.register);

// @route   POST /api/auth/verify-email
// @desc    Verify user email with OTP
router.post('/verify-email', authController.verifyEmail);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @route   POST /api/auth/google
// @desc    Google Sign In
router.post('/google', authController.googleLogin);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
router.post('/reset-password', authController.resetPassword);

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
router.post('/upload-avatar', [auth, upload.single('avatar')], authController.uploadAvatar);

// @route   POST /api/auth/typing-result
// @desc    Save typing test result
router.post('/typing-result', auth, authController.saveTypingResult);

module.exports = router;
