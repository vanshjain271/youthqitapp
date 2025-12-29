/**
 * Product Routes - MVP
 * 
 * Public product endpoints
 * 
 * GET /products           - Buyer, Admin
 * GET /products/:productId - Buyer, Admin
 */

const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/product.controller');
const { buyerOrAdmin } = require('../middleware/auth.middleware');
const { productValidation } = require('../middleware/validation.middleware');

/**
 * @route   GET /api/v1/products
 * @desc    List products with filters
 * @access  Buyer, Admin
 * @query   page, limit, categoryId, search, sortBy, sortOrder
 */
router.get(
  '/',
  buyerOrAdmin,
  productValidation.getProducts,
  ProductController.getProducts
);

/**
 * @route   GET /api/v1/products/:productId
 * @desc    Get single product by ID
 * @access  Buyer, Admin
 */
router.get(
  '/:productId',
  buyerOrAdmin,
  productValidation.getProductById,
  ProductController.getProductById
);

module.exports = router;
