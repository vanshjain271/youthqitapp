/**
 * Admin Order Controller - MVP (Razorpay Integrated)
 */

const OrderService = require('../services/order.service');

/**
 * @desc    Get all orders
 * @route   GET /api/v1/admin/orders
 * @access  Admin
 */
const getOrders = async (req, res) => {
  try {
    const { page, limit, status, dateFrom, dateTo } = req.query;

    const result = await OrderService.listOrders(
      { status, dateFrom, dateTo },
      { page, limit }
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Admin Get Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching orders'
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/admin/orders/:orderId
 * @access  Admin
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await OrderService.getOrderById(orderId, null, true);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      success: true,
      order: result.order
    });
  } catch (error) {
    console.error('Admin Get Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching order'
    });
  }
};

/**
 * @desc    Confirm order (after payment)
 * @route   POST /api/v1/admin/orders/:orderId/confirm
 * @access  Admin
 * @body    { note }
 */
const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;

    const result = await OrderService.confirmOrder(
      orderId,
      req.user.userId,
      note
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: 'Order confirmed',
      order: result.order
    });
  } catch (error) {
    console.error('Admin Confirm Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while confirming order'
    });
  }
};

/**
 * @desc    Mark COD collected
 * @route   POST /api/v1/admin/orders/:orderId/cod-collected
 * @access  Admin
 */
const markCodCollected = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await OrderService.markCodCollected(
      orderId,
      req.user.userId
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
    console.error('Admin Mark COD Collected Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while marking COD collected'
    });
  }
};

/**
 * @desc    Update order status
 * @route   POST /api/v1/admin/orders/:orderId/status
 * @access  Admin
 * @body    { status, trackingNumber, trackingUrl, note }
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, trackingUrl, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '`status` field is required'
      });
    }

    const result = await OrderService.updateOrderStatus(
      orderId,
      req.user.userId,
      status,
      { trackingNumber, trackingUrl, note }
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: result.order
    });
  } catch (error) {
    console.error('Admin Update Order Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating order status'
    });
  }
};

/**
 * @desc    Cancel order (admin)
 * @route   POST /api/v1/admin/orders/:orderId/cancel
 * @access  Admin
 * @body    { reason }
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await OrderService.cancelOrder(
      orderId,
      req.user.userId,
      reason,
      true
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      order: result.order,
      requiresRefund: result.requiresRefund
    });
  } catch (error) {
    console.error('Admin Cancel Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling order'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  confirmOrder,
  markCodCollected,
  updateOrderStatus,
  cancelOrder
};