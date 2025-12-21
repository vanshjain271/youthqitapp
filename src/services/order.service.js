/**
 * Order Service – MVP (Phase 3 + Phase 4 Invoice Integration)
 *
 * Rules:
 * - Service-first architecture
 * - Stock deducted ONLY on CONFIRMED
 * - Invoice generated ONLY on CONFIRMED
 * - Buyer can cancel ONLY in PAYMENT_PENDING
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const S3Service = require('./s3.service');

class OrderService {
  /**
   * Create Order (Buyer)
   */
  async createOrder(userId, items, shippingAddress) {
    if (!items || items.length === 0) {
      return { success: false, message: 'Order must have at least one item' };
    }

    if (!shippingAddress) {
      return { success: false, message: 'Shipping address is required' };
    }

    const orderItems = [];
    let subtotal = 0;

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

    const order = new Order({
      orderNumber,
      user: userId,
      status: 'PAYMENT_PENDING',
      items: orderItems,
      shippingAddress,
      subtotal,
      totalAmount: subtotal
    });

    order.addStatusHistory('PAYMENT_PENDING', null, 'Order created');
    await order.save();

    return { success: true, order };
  }

  /**
   * Upload Payment Proof (Buyer)
   */
  async uploadPaymentProof(orderId, userId, file) {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };
    if (order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (!order.canUploadPaymentProof()) {
      return { success: false, message: 'Payment proof not allowed' };
    }

    if (!file) {
      return { success: false, message: 'Payment proof required' };
    }

    const upload = await S3Service.uploadFile(file, 'payments');
    if (!upload.success) {
      return { success: false, message: 'Upload failed' };
    }

    order.paymentProof = upload.url;
    const transition = order.transitionTo(
      'PAYMENT_VERIFICATION',
      userId,
      'Payment proof uploaded'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();
    return { success: true, order };
  }

  /**
   * Verify Payment (Admin)
   * Generates invoice on CONFIRMED
   */
  async verifyPayment(orderId, adminId, approved, note = '') {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };
    if (!order.canVerifyPayment()) {
      return { success: false, message: 'Verification not allowed' };
    }

    let invoice = null;

    if (approved) {
      // Deduct stock
      const stockResult = await this._deductStock(order.items);
      if (!stockResult.success) return stockResult;

      // Transition to CONFIRMED
      const transition = order.transitionTo(
        'CONFIRMED',
        adminId,
        note || 'Payment verified'
      );

      if (!transition.valid) {
        await this._restoreStock(order.items);
        return { success: false, message: transition.message };
      }

      order.paymentVerifiedAt = new Date();
      order.paymentVerifiedBy = adminId;

      await order.save();

      // Generate invoice on CONFIRMED
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
    } else {
      // Reject - transition to CANCELLED
      const transition = order.transitionTo(
        'CANCELLED',
        adminId,
        note || 'Payment rejected'
      );

      if (!transition.valid) {
        return { success: false, message: transition.message };
      }

      await order.save();
    }

    return {
      success: true,
      order,
      invoice,
      message: approved ? 'Payment verified' : 'Payment rejected'
    };
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
      return { success: false, message: 'Tracking number required' };
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
    return { success: true, order };
  }

  /**
   * Cancel Order (Buyer)
   */
  async cancelOrder(orderId, userId, reason = '') {
    const order = await Order.findById(orderId);

    if (!order) return { success: false, message: 'Order not found' };
    if (order.user.toString() !== userId) {
      return { success: false, message: 'Access denied' };
    }

    if (!order.canBuyerCancel()) {
      return { success: false, message: 'Cannot cancel order now' };
    }

    const transition = order.transitionTo(
      'CANCELLED',
      userId,
      reason || 'Cancelled by buyer'
    );

    if (!transition.valid) {
      return { success: false, message: transition.message };
    }

    await order.save();
    return { success: true, order };
  }

  /**
   * Get Order by ID
   */
  async getOrderById(orderId, userId = null, isAdmin = false) {
    const order = await Order.findById(orderId)
      .populate('user', 'name phone')
      .populate('paymentVerifiedBy', 'name')
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
   * Deduct stock (CONFIRMED only)
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
   * Restore stock (rollback safety)
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
}

module.exports = new OrderService();