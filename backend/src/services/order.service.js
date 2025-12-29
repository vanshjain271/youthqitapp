/**
 * Order Service - MVP (Razorpay Integrated)
 *
 * New Flow:
 * 1. Create Order (PENDING) → Reserve Stock
 * 2. Initiate Payment → Create Razorpay Order (PROCESSING_PAYMENT)
 * 3. Payment Success → Verify Signature → PAID → Deduct Stock → Generate Invoice
 * 4. Admin Workflow → CONFIRMED → PACKED → SHIPPED → DELIVERED
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const RazorpayService = require('./razorpay.service');
const NotificationService = require('./notification.service');

class OrderService {
  /**
   * Create Order with Stock Reservation (Buyer)
   * Status: PENDING
   */
  async createOrder(userId, items, shippingAddress, paymentMode = 'FULL_PAYMENT') {
    if (!items || items.length === 0) {
      return { success: false, message: 'Order must have at least one item' };
    }

    if (!shippingAddress) {
      return { success: false, message: 'Shipping address is required' };
    }

    if (!['FULL_PAYMENT', 'COD_PARTIAL'].includes(paymentMode)) {
      return { success: false, message: 'Invalid payment mode' };
    }

    const orderItems = [];
    let subtotal = 0;

    // Validate products and stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return { success: false, message: `Product not available` };
      }

      let price, mrp, sku = '', variantName = '', stock;
      const image = product.images?.[0] || '';

      if (item.variantId && product.hasVariants) {
        const variant = product.variants.id(item.variantId);
        if (!variant || !variant.isActive) {
          return { success: false, message: 'Variant not available' };
        }

        price = variant.salePrice;
        mrp = variant.mrp;
        sku = variant.sku || '';
        variantName = variant.name;
        stock = variant.stock;
      } else {
        price = product.salePrice;
        mrp = product.mrp;
        stock = product.stock;
      }

      if (stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${product.name}`
        };
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        variant: item.variantId || null,
        name: product.name,
        variantName,
        sku,
        image,
        quantity: item.quantity,
        price,
        mrp,
        total
      });
    }

    const orderNumber = await Order.generateOrderNumber();

    // Calculate payment amounts
    let amountToPay = subtotal;
    let codAmount = 0;

    if (paymentMode === 'COD_PARTIAL') {
      const partialPercentage = parseInt(process.env.COD_PARTIAL_PAYMENT_PERCENTAGE) || 30;
      amountToPay = (subtotal * partialPercentage) / 100;
      codAmount = subtotal - amountToPay;
    }

    const order = new Order({
      orderNumber,
      user: userId,
      status: 'PENDING',
      items: orderItems,
      shippingAddress,
      subtotal,
      totalAmount: subtotal,
      payment: {
        mode: paymentMode,
        amountPaid: 0,
        codAmount
      }
    });

    // Reserve stock
    const reservationResult = await this._reserveStock(order.items);
    if (!reservationResult.success) {
      return reservationResult;
    }

    order.reserveStock();
    order.addStatusHistory('PENDING', null, 'Order created, stock reserved');
    
    await order.save();

    // Send notification
    try {
      await NotificationService.sendOrderStatusUpdate(
        order._id,
        userId,
        'PENDING',
        order.orderNumber
      );
    } catch (error) {
      console.error('Failed to send order creation notification:', error);
      // Continue even if notification fails
    }

    return { 
      success: true, 
      order,
      amountToPay: Math.round(amountToPay * 100) / 100 // Rounded for payment
    };
  }

  /**
   * Initiate Razorpay Payment (Buyer)
   * Creates Razorpay order when user clicks "Pay Now"
   * Status: PENDING → PROCESSING_PAYMENT
   */
  async initiatePayment(orderId, userId) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };
    if (order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (order.status !== 'PENDING' && order.status !== 'PAYMENT_FAILED') {
      return { success: false, message: 'Payment already initiated or order not in pending state' };
    }

    // Check stock reservation expiry
    if (order.isStockReservationExpired()) {
      await this._releaseStock(order.items);
      order.releaseStockReservation();
      await order.save();
      
      return { success: false, message: 'Stock reservation expired. Please create order again.' };
    }

    // Calculate amount to pay
    const amountToPay = order.payment.mode === 'COD_PARTIAL' 
      ? order.totalAmount - order.payment.codAmount 
      : order.totalAmount;

    // Create Razorpay order
    const razorpayResult = await RazorpayService.createOrder({
      amount: amountToPay,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        paymentMode: order.payment.mode
      }
    });

    if (!razorpayResult.success) {
      return { success: false, message: razorpayResult.error };
    }

    // Update order status
    order.payment.razorpayOrderId = razorpayResult.razorpayOrderId;
    
    const transition = order.transitionTo(
      'PROCESSING_PAYMENT',
      userId,
      'Razorpay order created'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();

    // Send notification
    try {
      await NotificationService.sendOrderStatusUpdate(
        order._id,
        order.user,
        'PAYMENT_FAILED',
        order.orderNumber
      );
    } catch (error) {
      console.error('Failed to send payment failure notification:', error);
    }

    return {
      success: true,
      razorpayOrderId: razorpayResult.razorpayOrderId,
      amount: amountToPay,
      currency: 'INR',
      keyId: RazorpayService.getKeyId(),
      order
    };
  }

  /**
   * Verify Payment and Complete Order (Buyer/Webhook)
   * Verifies Razorpay signature, deducts stock, generates invoice
   * Status: PROCESSING_PAYMENT → PAID
   */
  async verifyPayment(orderId, paymentData, userId = null) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };

    if (userId && order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (order.status !== 'PROCESSING_PAYMENT') {
      return { success: false, message: 'Order not in payment processing state' };
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    // Verify Razorpay signature
    const verificationResult = RazorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!verificationResult.valid) {
      // Mark as payment failed
      order.transitionTo('PAYMENT_FAILED', null, verificationResult.error || 'Invalid payment signature');
      await order.save();
      
      return { success: false, message: 'Payment verification failed' };
    }

    // Payment verified - deduct stock
    const stockResult = await this._deductStock(order.items);
    if (!stockResult.success) {
      // Critical: Payment succeeded but stock unavailable
      // Need manual intervention or refund
      order.addStatusHistory('PROCESSING_PAYMENT', null, 'Payment verified but stock unavailable - REQUIRES ADMIN ATTENTION');
      await order.save();
      
      return { 
        success: false, 
        message: 'Payment successful but stock unavailable. Please contact support.',
        requiresRefund: true
      };
    }

    // Update payment details
    const amountPaid = order.payment.mode === 'COD_PARTIAL' 
      ? order.totalAmount - order.payment.codAmount 
      : order.totalAmount;

    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.amountPaid = amountPaid;
    order.payment.paidAt = new Date();

    // Clear stock reservation
    order.releaseStockReservation();

    // Transition to PAID
    const transition = order.transitionTo(
      'PAID',
      userId || null,
      'Payment verified and stock deducted'
    );

    if (!transition.valid) {
      // Rollback stock deduction
      await this._restoreStock(order.items);
      return { success: false, message: transition.message };
    }

    await order.save();

    // Generate invoice
    let invoice = null;
    try {
      const InvoiceService = require('./invoice.service');
      const invoiceResult = await InvoiceService.generateInvoice(order._id);
      if (invoiceResult.success) {
        invoice = invoiceResult.invoice;
        order.invoice = invoice._id;
        await order.save();
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      // Continue without invoice - can be generated later
    }

    // Send notification
    try {
      await NotificationService.sendOrderStatusUpdate(
        order._id,
        order.user,
        'PAID',
        order.orderNumber
      );
    } catch (error) {
      console.error('Failed to send payment success notification:', error);
    }

    return {
      success: true,
      order,
      invoice,
      message: 'Payment verified successfully'
    };
  }

  /**
   * Handle Payment Failure (Buyer/Webhook)
   * Releases stock reservation
   * Status: PROCESSING_PAYMENT → PAYMENT_FAILED
   */
  async handlePaymentFailure(orderId, reason, userId = null) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };

    if (userId && order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (order.status !== 'PROCESSING_PAYMENT') {
      return { success: false, message: 'Order not in payment processing state' };
    }

    // Release stock reservation
    await this._releaseStock(order.items);
    order.releaseStockReservation();

    // Transition to PAYMENT_FAILED
    const transition = order.transitionTo(
      'PAYMENT_FAILED',
      userId || null,
      reason || 'Payment failed'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();

    return {
      success: true,
      order,
      message: 'Payment failure recorded'
    };
  }

  /**
   * Admin Confirm Order (Admin)
   * Optional step after PAID
   * Status: PAID → CONFIRMED
   */
  async confirmOrder(orderId, adminId, note = '') {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };

    if (order.status !== 'PAID') {
      return { success: false, message: 'Order must be in PAID status' };
    }

    const transition = order.transitionTo(
      'CONFIRMED',
      adminId,
      note || 'Order confirmed by admin'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();
    return { success: true, order };
  }

  /**
   * Mark COD Collected (Admin)
   * For COD_PARTIAL orders
   */
  async markCodCollected(orderId, adminId) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };

    if (order.payment.mode !== 'COD_PARTIAL') {
      return { success: false, message: 'Not a COD order' };
    }

    if (order.payment.codCollected) {
      return { success: false, message: 'COD already collected' };
    }

    order.payment.codCollected = true;
    order.payment.codCollectedAt = new Date();
    order.addStatusHistory(order.status, adminId, `COD amount ₹${order.payment.codAmount} collected`);

    await order.save();
    return { success: true, order, message: 'COD marked as collected' };
  }

  /**
   * Update Order Status (Admin)
   */
  async updateOrderStatus(orderId, adminId, status, data = {}) {
    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (!Order.isValidTransition(order.status, status)) {
      return { success: false, message: 'Invalid status transition' };
    }

    if (status === 'SHIPPED' && !data.trackingNumber) {
      return { success: false, message: 'Tracking number required for shipping' };
    }

    const transition = order.transitionTo(
      status,
      adminId,
      data.note || ''
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    if (data.trackingNumber) order.trackingNumber = data.trackingNumber;
    if (data.trackingUrl) order.trackingUrl = data.trackingUrl;

    await order.save();

    // Send notification
    try {
      await NotificationService.sendOrderStatusUpdate(
        order._id,
        order.user,
        status,
        order.orderNumber
      );
    } catch (error) {
      console.error('Failed to send order status update notification:', error);
    }

    return { success: true, order };
  }

  /**
   * Cancel Order (Buyer/Admin)
   */
  async cancelOrder(orderId, userId, reason = '', isAdmin = false) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };

    if (!isAdmin && order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (!isAdmin && !order.canBuyerCancel()) {
      return { success: false, message: 'Cannot cancel order at this stage' };
    }

    // Release stock if reserved
    if (order.stockReserved) {
      await this._releaseStock(order.items);
      order.releaseStockReservation();
    }

    // If order is PAID, need refund
    let requiresRefund = false;
    if (order.status === 'PAID' || order.status === 'CONFIRMED') {
      requiresRefund = true;
      // TODO: Implement refund logic
    }

    const transition = order.transitionTo(
      'CANCELLED',
      userId,
      reason || 'Order cancelled'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();
    
    // Send notification
    try {
      await NotificationService.sendOrderStatusUpdate(
        order._id,
        order.user,
        'CANCELLED',
        order.orderNumber
      );
    } catch (error) {
      console.error('Failed to send order cancellation notification:', error);
    }
    
    return { 
      success: true, 
      order,
      requiresRefund,
      message: requiresRefund ? 'Order cancelled. Refund will be processed.' : 'Order cancelled successfully'
    };
  }

  /**
   * Get Order by ID
   */
  async getOrderById(orderId, userId = null, isAdmin = false) {
    const order = await Order.findById(orderId)
      .populate('user', 'name phone')
      .populate('invoice');

    if (!order) return { success: false, message: 'Order not found' };

    if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
      return { success: false, message: 'Access denied' };
    }

    return { success: true, order };
  }

  /**
   * List Orders
   */
  async listOrders(filter = {}, pagination = {}) {
    const { userId, status, dateFrom, dateTo } = filter;
    const { page = 1, limit = 20 } = pagination;

    const query = {};
    if (userId) query.user = userId;
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name phone')
        .populate('invoice', 'invoiceNumber pdfUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Reserve Stock (Internal)
   */
  async _reserveStock(items) {
    // For now, we just check availability
    // In production, you might want to create a StockReservation collection
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return { success: false, message: 'Product not found' };
      }

      if (item.variant && product.hasVariants) {
        const variant = product.variants.id(item.variant);
        if (!variant || variant.stock < item.quantity) {
          return { success: false, message: 'Insufficient stock' };
        }
      } else {
        if (product.stock < item.quantity) {
          return { success: false, message: 'Insufficient stock' };
        }
      }
    }

    return { success: true };
  }

  /**
   * Release Stock Reservation (Internal)
   */
  async _releaseStock(items) {
    // Currently no-op since we don't actually reserve in Product model
    // In production with StockReservation collection, delete reservation here
    return { success: true };
  }

  /**
   * Deduct Stock (Internal)
   */
  async _deductStock(items) {
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return { success: false, message: 'Product not found' };
      }

      if (item.variant && product.hasVariants) {
        const variant = product.variants.id(item.variant);
        if (!variant || variant.stock < item.quantity) {
          return { success: false, message: 'Insufficient stock' };
        }
        variant.stock -= item.quantity;
      } else {
        if (product.stock < item.quantity) {
          return { success: false, message: 'Insufficient stock' };
        }
        product.stock -= item.quantity;
      }

      await product.save();
    }

    return { success: true };
  }

  /**
   * Restore Stock (Internal - Rollback)
   */
  async _restoreStock(items) {
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      if (item.variant && product.hasVariants) {
        const variant = product.variants.id(item.variant);
        if (variant) variant.stock += item.quantity;
      } else {
        product.stock += item.quantity;
      }

      await product.save();
    }
  }

  /**
   * Cleanup Expired Reservations (Cron Job)
   * Should be called periodically to release expired stock reservations
   */
  async cleanupExpiredReservations() {
    const expiredOrders = await Order.find({
      stockReserved: true,
      stockReservationExpiry: { $lt: new Date() },
      status: { $in: ['PENDING', 'PAYMENT_FAILED'] }
    });

    let cleanedCount = 0;

    for (const order of expiredOrders) {
      await this._releaseStock(order.items);
      order.releaseStockReservation();
      order.addStatusHistory(order.status, null, 'Stock reservation expired');
      await order.save();
      cleanedCount++;
    }

    return { success: true, cleanedCount };
  }
}

module.exports = new OrderService();