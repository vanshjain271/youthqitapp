/**
 * Invoice Service - MVP
 */

const Invoice = require('../models/invoice');
const Order = require('../models/Order');
const Product = require('../models/Product');
const S3Service = require('./s3.service');
const { calculateOrderGST } = require('../utils/gst.utils');
const { generateInvoicePDF } = require('../utils/pdf.utils');

class InvoiceService {
  /**
   * Generate invoice for a confirmed order
   * Idempotent: will not create duplicate invoices
   */
  async generateInvoice(orderId) {
    // ✅ Idempotency check
    const exists = await Invoice.existsForOrder(orderId);
    if (exists) {
      const existingInvoice = await Invoice.findOne({ order: orderId })
        .populate('order', 'orderNumber status')
        .populate('user', 'name phone');

      return {
        success: true,
        invoice: existingInvoice,
        message: 'Invoice already exists'
      };
    }

    // Fetch order
    const order = await Order.findById(orderId).populate('user', 'name phone');
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.status !== 'CONFIRMED') {
      return {
        success: false,
        message: 'Invoice can only be generated for confirmed orders'
      };
    }

    // Enrich items with HSN + tax rate
    const itemsWithHSN = await this._enrichItemsWithHSN(order.items);

    // GST calculation
    const buyerState = order.shippingAddress.state;
    const gstResult = calculateOrderGST(itemsWithHSN, buyerState);

    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber();

    // Create invoice document
    const invoice = new Invoice({
      invoiceNumber,
      order: order._id,
      user: order.user._id,
      invoiceDate: new Date(),
      billingAddress: order.shippingAddress,
      shippingAddress: order.shippingAddress,
      items: gstResult.items,
      subtotal: gstResult.subtotal,
      totalCgst: gstResult.totalCgst,
      totalSgst: gstResult.totalSgst,
      totalIgst: gstResult.totalIgst,
      totalTax: gstResult.totalTax,
      grandTotal: gstResult.grandTotal,
      isIntraState: gstResult.isIntraState
    });

    await invoice.save();

    // Generate & upload PDF (non-blocking for order)
    try {
      const pdfResult = await this.generateAndUploadPDF(invoice._id);
      if (pdfResult.success) {
        invoice.pdfUrl = pdfResult.url;
        await invoice.save();
      }
    } catch (err) {
      console.error('Invoice PDF generation failed:', err);
    }

    await invoice.populate('order', 'orderNumber status');
    await invoice.populate('user', 'name phone');

    return {
      success: true,
      invoice,
      message: 'Invoice generated successfully'
    };
  }

  /**
   * Generate PDF and upload to S3
   */
  async generateAndUploadPDF(invoiceId) {
    const invoice = await Invoice.findById(invoiceId)
      .populate('order', 'orderNumber createdAt')
      .populate('user', 'name phone');

    if (!invoice) {
      return { success: false, message: 'Invoice not found' };
    }

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(invoice.toObject());
    const fileName = `${invoice.invoiceNumber}.pdf`;

    // Upload to S3
    const uploadResult = await S3Service.uploadFile(
      {
        buffer: pdfBuffer,
        originalname: fileName,
        mimetype: 'application/pdf'
      },
      'invoices'
    );

    if (!uploadResult.success) {
      return { success: false, message: 'Failed to upload invoice PDF' };
    }

    return { success: true, url: uploadResult.url };
  }

  /**
   * Get invoice by invoiceId
   */
  async getInvoiceById(invoiceId, userId = null, isAdmin = false) {
    const invoice = await Invoice.findById(invoiceId)
      .populate('order', 'orderNumber status createdAt')
      .populate('user', 'name phone');

    if (!invoice) {
      return { success: false, message: 'Invoice not found' };
    }

    if (!isAdmin && userId && invoice.user._id.toString() !== userId.toString()) {
      return { success: false, message: 'Access denied' };
    }

    return { success: true, invoice };
  }

  /**
   * Get invoice by orderId
   */
  async getInvoiceByOrderId(orderId, userId = null, isAdmin = false) {
    const invoice = await Invoice.findOne({ order: orderId })
      .populate('order', 'orderNumber status createdAt')
      .populate('user', 'name phone');

    if (!invoice) {
      return { success: false, message: 'Invoice not found for this order' };
    }

    if (!isAdmin && userId && invoice.user._id.toString() !== userId.toString()) {
      return { success: false, message: 'Access denied' };
    }

    return { success: true, invoice };
  }

  /**
   * List invoices (admin or buyer)
   */
  async listInvoices(filter = {}, pagination = {}) {
    const { userId, status, dateFrom, dateTo } = filter;
    const { page = 1, limit = 20 } = pagination;

    const query = {};
    if (userId) query.user = userId;
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query.invoiceDate = {};
      if (dateFrom) query.invoiceDate.$gte = new Date(dateFrom);
      if (dateTo) query.invoiceDate.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('order', 'orderNumber status')
        .populate('user', 'name phone')
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query)
    ]);

    return {
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Buyer invoices shortcut
   */
  async getBuyerInvoices(userId, pagination = {}) {
    return this.listInvoices({ userId }, pagination);
  }

  /**
   * Regenerate invoice PDF (Admin)
   */
  async regeneratePDF(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return { success: false, message: 'Invoice not found' };
    }

    const pdfResult = await this.generateAndUploadPDF(invoiceId);
    if (!pdfResult.success) return pdfResult;

    invoice.pdfUrl = pdfResult.url;
    await invoice.save();

    return {
      success: true,
      invoice,
      message: 'Invoice PDF regenerated successfully'
    };
  }

  /**
   * Internal helper: enrich order items with HSN & taxRate
   */
  async _enrichItemsWithHSN(orderItems) {
    const enrichedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      enrichedItems.push({
        product: item.product,
        variant: item.variant,
        name: item.name,
        variantName: item.variantName || '',
        sku: item.sku || '',
        hsnCode: product?.hsnCode || '',
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        taxRate: product?.taxRate || 18
      });
    }

    return enrichedItems;
  }
}

module.exports = new InvoiceService();
