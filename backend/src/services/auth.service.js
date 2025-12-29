/**
 * Auth Service - MVP
 * 
 * Handles all authentication business logic
 * - OTP generation and verification
 * - JWT token generation
 * - User creation/lookup
 * 
 * Service-first architecture: Controllers only call services
 */

const User = require('../models/User');
const SMSService = require('./sms.service');

class AuthService {
  /**
   * Send OTP to phone number
   * Creates user if doesn't exist (as BUYER)
   * 
   * @param {string} phone - 10-digit phone number
   * @returns {Promise<Object>} { success, message, isNewUser?, devOtp? }
   */
  async sendOTP(phone) {
    // Find or create user
    const user = await User.findOrCreateByPhone(phone);
    
    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      };
    }
    
    // Generate OTP
    const otp = SMSService.generateOTP();
    
    // Set OTP on user (hashed)
    await user.setOTP(otp);
    await user.save();
    
    // Send OTP via SMS
    const smsResult = await SMSService.sendOTP(phone, otp);
    
    if (!smsResult.success && process.env.NODE_ENV !== 'development') {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
    
    const isNewUser = !user.name || user.name === '';
    
    const response = {
      success: true,
      message: 'OTP sent successfully',
      isNewUser
    };
    
    // Include OTP in development mode for testing
    if (process.env.NODE_ENV === 'development' && smsResult.devOtp) {
      response.devOtp = smsResult.devOtp;
    }
    
    return response;
  }

  /**
   * Verify OTP and issue JWT
   * 
   * @param {string} phone - 10-digit phone number
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} { success, message, token?, user? }
   */
  async verifyOTP(phone, otp) {
    // Find user with OTP field
    const user = await User.findOne({ phone }).select('+otp');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found. Please request OTP first.'
      };
    }
    
    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      };
    }
    
    // Verify OTP
    const verification = await user.verifyOTP(otp);
    
    if (!verification.valid) {
      return {
        success: false,
        message: verification.message
      };
    }
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // Prepare user data for response (without sensitive fields)
    const userData = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userData
    };
  }

  /**
   * Get user by ID
   * 
   * @param {string} userId
   * @returns {Promise<Object>} { success, user? }
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    if (!user.isActive) {
      return {
        success: false,
        message: 'Your account has been deactivated'
      };
    }
    
    return {
      success: true,
      user
    };
  }
}

module.exports = new AuthService();
