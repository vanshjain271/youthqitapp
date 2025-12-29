/**
 * Admin Product Controller - MVP
 * 
 * Admin-only product endpoints
 * Variants handled inline via create/update only
 * 
 * STRICT RULES:
 * - No DB calls
 * - Only input validation + service calls
 * - Role checks handled by middleware
 */

const ProductService = require('../services/product.service');

/**
 * @desc    Create new product
 * @route   POST /api/v1/admin/products
 * @access  Admin
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const imageFiles = req.files || [];

    const result = await ProductService.createProduct(productData, imageFiles);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      product: result.product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating product'
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/v1/admin/products/:productId
 * @access  Admin
 */
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;
    const newImageFiles = req.files || [];

    const result = await ProductService.updateProduct(productId, updates, newImageFiles);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      product: result.product
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating product'
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/admin/products/:productId
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await ProductService.deleteProduct(productId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting product'
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct
};
