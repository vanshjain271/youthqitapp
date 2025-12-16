/**
 * Order Model - MVP
 *
 * Order states:
 * PAYMENT_PENDING → PAYMENT_VERIFICATION → CONFIRMED → PACKED → SHIPPED → DELIVERED
 * PAYMENT_PENDING / PAYMENT_VERIFICATION → CANCELLED
 *
 * Stock is NOT deducted until CONFIRMED.
 * Invoice is generated ONLY on CONFIRMED (Phase 4).
 * Order number format: ORD-YYYYMMDD-NNN
 */

const mongoose = require('mongoose');

/* -------------------- Order Item Snapshot -------------------- */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    variantName: {
      type: String,
      default: '',
      trim: true,
    },
    sku: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

/* -------------------- Shipping Address Snapshot -------------------- */
const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number'],
    },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Invalid pincode'],
    },
  },
  { _id: false }
);

/* -------------------- Status History -------------------- */
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PAYMENT_VERIFICATION',
        'CONFIRMED',
        'PACKED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: { type: String, default: '' },
  },
  { _id: false }
);

/* -------------------- Order Schema -------------------- */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PAYMENT_VERIFICATION',
        'CONFIRMED',
        'PACKED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PAYMENT_PENDING',
    },

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must have items'],
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotal: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    paymentProof: { type: String, default: '' },
    paymentVerifiedAt: { type: Date, default: null },
    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    statusHistory: { type: [statusHistorySchema], default: [] },

    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },

    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellationReason: { type: String, default: '' },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
  },
  { timestamps: true }
);

/* -------------------- Indexes -------------------- */
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

/* -------------------- State Machine -------------------- */
const VALID_TRANSITIONS = {
  PAYMENT_PENDING: ['PAYMENT_VERIFICATION', 'CANCELLED'],
  PAYMENT_VERIFICATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

orderSchema.statics.isValidTransition = function (from, to) {
  return VALID_TRANSITIONS[from]?.includes(to);
};

orderSchema.statics.getAllowedTransitions = function (state) {
  return VALID_TRANSITIONS[state] || [];
};

/* -------------------- Order Number Generator -------------------- */
orderSchema.statics.generateOrderNumber = async function () {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${date}-`;

  const last = await this.findOne({ orderNumber: { $regex: `^${prefix}` } })
    .sort({ orderNumber: -1 })
    .lean();

  const seq = last ? parseInt(last.orderNumber.split('-')[2]) + 1 : 1;
  return `${prefix}${String(seq).padStart(3, '0')}`;
};

/* -------------------- Instance Helpers -------------------- */
orderSchema.methods.addStatusHistory = function (status, changedBy, note = '') {
  this.statusHistory.push({ status, changedBy, note });
};

orderSchema.methods.transitionTo = function (newStatus, changedBy, note = '') {
  if (!this.constructor.isValidTransition(this.status, newStatus)) {
    return { valid: false, message: 'Invalid state transition' };
  }

  this.status = newStatus;
  this.addStatusHistory(newStatus, changedBy, note);

  if (newStatus === 'CANCELLED') {
    this.cancelledAt = new Date();
    this.cancelledBy = changedBy;
    this.cancellationReason = note;
  }

  return { valid: true };
};

orderSchema.methods.canBuyerCancel = function () {
  return this.status === 'PAYMENT_PENDING';
};

orderSchema.methods.canUploadPaymentProof = function () {
  return this.status === 'PAYMENT_PENDING';
};

orderSchema.methods.canVerifyPayment = function () {
  return this.status === 'PAYMENT_VERIFICATION';
};

module.exports = mongoose.model('Order', orderSchema);
