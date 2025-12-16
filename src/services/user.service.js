/**
 * User Service - MVP
 * 
 * Handles user profile business logic
 * - Get profile
 * - Update profile (name, addresses)
 * 
 * Service-first architecture: Controllers only call services
 */

const User = require('../models/User');

class UserService {
  /**
   * Get user profile by ID
   * 
   * @param {string} userId
   * @returns {Promise<Object>} { success, user?, message? }
   */
  async getProfile(userId) {
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

  /**
   * Update user profile
   * Only allows updating: name, addresses
   * 
   * @param {string} userId
   * @param {Object} updates - { name?, addresses? }
   * @returns {Promise<Object>} { success, user?, message? }
   */
  async updateProfile(userId, updates) {
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
    
    // Only allow specific fields to be updated
    const allowedFields = ['name', 'addresses'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    }
    
    await user.save();
    
    return {
      success: true,
      user,
      message: 'Profile updated successfully'
    };
  }

  /**
   * Add address to user profile
   * 
   * @param {string} userId
   * @param {Object} address
   * @returns {Promise<Object>} { success, user?, message? }
   */
  async addAddress(userId, address) {
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
    
    user.addresses.push(address);
    await user.save();
    
    return {
      success: true,
      user,
      message: 'Address added successfully'
    };
  }

  /**
   * Update specific address
   * 
   * @param {string} userId
   * @param {string} addressId
   * @param {Object} updates
   * @returns {Promise<Object>} { success, user?, message? }
   */
  async updateAddress(userId, addressId, updates) {
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
    
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return {
        success: false,
        message: 'Address not found'
      };
    }
    
    // Update address fields
    const addressFields = ['name', 'phone', 'addressLine1', 'addressLine2', 'landmark', 'city', 'state', 'pincode'];
    
    for (const field of addressFields) {
      if (updates[field] !== undefined) {
        address[field] = updates[field];
      }
    }
    
    await user.save();
    
    return {
      success: true,
      user,
      message: 'Address updated successfully'
    };
  }

  /**
   * Delete address
   * 
   * @param {string} userId
   * @param {string} addressId
   * @returns {Promise<Object>} { success, user?, message? }
   */
  async deleteAddress(userId, addressId) {
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
    
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return {
        success: false,
        message: 'Address not found'
      };
    }
    
    address.deleteOne();
    await user.save();
    
    return {
      success: true,
      user,
      message: 'Address deleted successfully'
    };
  }
}

module.exports = new UserService();
