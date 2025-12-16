/**
 * Admin Order Controller - MVP
 *
 * Admin order endpoints
 * Controller calls OrderService only — no business logic here
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
 * @desc    Verify payment (approve / reject)
 * @route   POST /api/v1/admin/orders/:orderId/verify-payment
 * @access  Admin
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved, note } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: '`approved` field is required and must be boolean'
      });
    }

    const result = await OrderService.verifyPayment(
      orderId,
      req.user.userId,
      approved,
      note
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
    console.error('Admin Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying payment'
    });
  }
};

/**
 * @desc    Update order status
 * @route   POST /api/v1/admin/orders/:orderId/status
 * @access  Admin
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
      message: result.message,
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

module.exports = {
  getOrders,
  getOrderById,
  verifyPayment,
  updateOrderStatus
};
