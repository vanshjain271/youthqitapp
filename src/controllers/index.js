/**
 * Admin Order Routes - MVP
 */

const express = require('express');
const router = express.Router();

const { adminOrderController } = require('../../controllers');
const authMiddleware = require('../../middleware/auth.middleware');
const adminMiddleware = require('../../middleware/admin.middleware');

// Admin-only
router.use(authMiddleware, adminMiddleware);

router.get('/', adminOrderController.getOrders);
router.get('/:orderId', adminOrderController.getOrderById);
router.post('/:orderId/verify-payment', adminOrderController.verifyPayment);
router.post('/:orderId/status', adminOrderController.updateOrderStatus);

module.exports = router;
