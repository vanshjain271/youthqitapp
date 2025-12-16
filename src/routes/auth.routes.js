/**
 * Auth Routes - MVP
 * 
 * POST /auth/send-otp   - Public
 * POST /auth/verify-otp - Public
 */

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const { authValidation } = require('../middleware/validation.middleware');

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post('/send-otp', authValidation.sendOTP, AuthController.sendOTP);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and issue JWT
 * @access  Public
 */
router.post('/verify-otp', authValidation.verifyOTP, AuthController.verifyOTP);

module.exports = router;
