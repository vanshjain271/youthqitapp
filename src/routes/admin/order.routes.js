/**
 * Admin Order Routes - MVP
 */

const express = require('express');
const router = express.Router();


const {
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../../controllers/admin-order.controller');


const auth = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Admin only routes
router.get('/', auth.adminOnly, getOrders);
router.get('/:orderId', auth.adminOnly, getOrderById);
router.put('/:orderId/status', auth.adminOnly, updateOrderStatus);

module.exports = router;
