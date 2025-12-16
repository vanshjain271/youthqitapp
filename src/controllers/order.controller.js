/**
 * Order Controller - MVP (Buyer)
 *
 * Buyer order endpoints
 * Controller calls OrderService only (no business logic here)
 */

const OrderService = require('../services/order.service');

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Buyer
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    const result = await OrderService.createOrder(
      req.user.userId,
      items,
      shippingAddress
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      order: result.order
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating order'
    });
  }
};

/**
 * @desc    Upload payment proof
 * @route   POST /api/v1/orders/:orderId/payment-proof
 * @access  Buyer
 */
const uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await OrderService.uploadPaymentProof(
      orderId,
      req.user.userId,
      req.file
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      order: result.order
    });
  } catch (error) {
    console.error('Upload Payment Proof Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while uploading payment proof'
    });
  }
};

/**
 * @desc    Cancel order
 * @route   POST /api/v1/orders/:orderId/cancel
 * @access  Buyer
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await OrderService.cancelOrder(
      orderId,
      req.user.userId,
      reason
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      order: result.order
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling order'
    });
  }
};

/**
 * @desc    Get buyer's orders
 * @route   GET /api/v1/orders/my
 * @access  Buyer
 */
const getMyOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    const result = await OrderService.listOrders(
      { userId: req.user.userId, status },
      { page, limit }
    );

    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching orders'
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:orderId
 * @access  Buyer
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await OrderService.getOrderById(
      orderId,
      req.user.userId,
      false
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      success: true,
      order: result.order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching order'
    });
  }
};

module.exports = {
  createOrder,
  uploadPaymentProof,
  cancelOrder,
  getMyOrders,
  getOrderById
};
