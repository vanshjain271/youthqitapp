/**
 * Admin Order Routes - MVP (Razorpay Integrated)
 */

const express = require('express');
const router = express.Router();
const AdminOrderController = require('../../controllers/admin-order.controller');
const auth = require('../../middleware/auth.middleware');

// Admin only routes
router.get('/', auth.adminOnly, AdminOrderController.getOrders);
router.get('/:orderId', auth.adminOnly, AdminOrderController.getOrderById);

// Order management
router.post('/:orderId/confirm', auth.adminOnly, AdminOrderController.confirmOrder);
router.post('/:orderId/cod-collected', auth.adminOnly, AdminOrderController.markCodCollected);
router.put('/:orderId/status', auth.adminOnly, AdminOrderController.updateOrderStatus);
router.post('/:orderId/cancel', auth.adminOnly, AdminOrderController.cancelOrder);

module.exports = router;