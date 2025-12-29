/**
 * Buyer Order Routes - MVP (Razorpay Integrated)
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');

// Create order with stock reservation
router.post('/', auth.authenticate, OrderController.createOrder);

// Payment flow
router.post('/:orderId/initiate-payment', auth.authenticate, OrderController.initiatePayment);
router.post('/:orderId/verify-payment', auth.authenticate, OrderController.verifyPayment);
router.post('/:orderId/payment-failed', auth.authenticate, OrderController.paymentFailed);

// Order management
router.get('/my', auth.authenticate, OrderController.getMyOrders);
router.get('/:orderId', auth.authenticate, OrderController.getOrderById);
router.post('/:orderId/cancel', auth.authenticate, OrderController.cancelOrder);

module.exports = router;