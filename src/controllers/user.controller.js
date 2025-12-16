/**
 * User Controller - MVP
 * 
 * STRICT RULES:
 * - No DB calls
 * - Only input validation + service calls
 * - Role checks handled by middleware
 */

const UserService = require('../services/user.service');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Buyer, Admin
 */
const getProfile = async (req, res) => {
  try {
    const result = await UserService.getProfile(req.user.userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile'
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Buyer, Admin
 * @body    { name?, addresses? }
 */
const updateProfile = async (req, res) => {
  try {
    const { name, addresses } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (addresses !== undefined) updates.addresses = addresses;
    
    const result = await UserService.updateProfile(req.user.userId, updates);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
