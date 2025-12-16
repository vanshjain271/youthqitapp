/**
 * Buyer Order Routes - MVP
 */

const express = require('express');
const router = express.Router();

const {
  createOrder,
  uploadPaymentProof,
  cancelOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/order.controller');

const auth = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.post('/', auth.authenticate, createOrder);
router.get('/my', auth.authenticate, getMyOrders);
router.get('/:orderId', auth.authenticate, getOrderById);
router.post('/:orderId/cancel', auth.authenticate, cancelOrder);
router.post(
  '/:orderId/payment-proof',
  auth.authenticate,
  upload.single('file'),
  uploadPaymentProof
);

module.exports = router;
