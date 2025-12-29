/**
 * Order Controller - MVP (Buyer - Razorpay Integrated)
 */

const OrderService = require('../services/order.service');

/**
 * @desc    Create new order with stock reservation
 * @route   POST /api/v1/orders
 * @access  Buyer
 * @body    { items, shippingAddress, paymentMode }
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMode } = req.body;

    const result = await OrderService.createOrder(
      req.user.userId,
      items,
      shippingAddress,
      paymentMode
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully. Stock reserved.',
      order: result.order,
      amountToPay: result.amountToPay
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
 * @desc    Initiate Razorpay payment
 * @route   POST /api/v1/orders/:orderId/initiate-payment
 * @access  Buyer
 */
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await OrderService.initiatePayment(
      orderId,
      req.user.userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment initiated',
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amount,
      currency: result.currency,
      keyId: result.keyId,
      order: result.order
    });
  } catch (error) {
    console.error('Initiate Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while initiating payment'
    });
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/v1/orders/:orderId/verify-payment
 * @access  Buyer
 * @body    { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    const result = await OrderService.verifyPayment(
      orderId,
      { razorpayOrderId, razorpayPaymentId, razorpaySignature },
      req.user.userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      order: result.order,
      invoice: result.invoice
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying payment'
    });
  }
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/v1/orders/:orderId/payment-failed
 * @access  Buyer
 * @body    { reason }
 */
const paymentFailed = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await OrderService.handlePaymentFailure(
      orderId,
      reason,
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
    console.error('Payment Failed Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while handling payment failure'
    });
  }
};

/**
 * @desc    Cancel order
 * @route   POST /api/v1/orders/:orderId/cancel
 * @access  Buyer
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
      false
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
  initiatePayment,
  verifyPayment,
  paymentFailed,
  cancelOrder,
  getMyOrders,
  getOrderById
};