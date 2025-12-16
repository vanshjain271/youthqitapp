/**
 * Product Model - MVP
 * 
 * Products with unlimited variants
 * No payment mode per product in MVP (global settings only)
 */

const mongoose = require('mongoose');

// Variant Sub-Schema
const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Variant SKU is required'],
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true,
    maxlength: [200, 'Variant name too long']
  },
  // Variant attributes (e.g., { "Color": "Black", "Model": "S24" })
  attributes: {
    type: Map,
    of: String,
    default: new Map()
  },
  images: [{
    type: String
  }],
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Sale price cannot be negative']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative']
  },
  costPrice: {
    type: Number,
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true, timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
    default: ''
  },
  // Primary images
  images: [{
    type: String
  }],
  // Category reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  // Brand reference
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  // Base SKU (used when no variants)
  sku: {
    type: String,
    trim: true,
    uppercase: true
  },
  // Base pricing (used when no variants)
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Sale price cannot be negative']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative']
  },
  costPrice: {
    type: Number,
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  // Base stock (used when no variants)
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  // HSN Code for GST
  hsnCode: {
    type: String,
    trim: true,
    default: ''
  },
  // Tax rate percentage
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100']
  },
  // Variants
  variants: {
    type: [variantSchema],
    default: []
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  // Minimum order quantity
  minOrderQty: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  // Maximum order quantity (0 = unlimited)
  maxOrderQty: {
    type: Number,
    default: 0,
    min: [0, 'Maximum order quantity cannot be negative']
  },
  // Unit
  unit: {
    type: String,
    default: 'Pcs',
    enum: ['Pcs', 'Box', 'Pack', 'Set', 'Kg', 'Gram', 'Ltr', 'Ml']
  },
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  // Sorting
  sortOrder: {
    type: Number,
    default: 0
  },
  // Search tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sortOrder: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'variants.sku': 1 });

/**
 * Pre-save: Generate slug and set hasVariants
 */
productSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name') || !this.slug) {
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + randomStr;
  }
  
  // Set hasVariants flag
  this.hasVariants = this.variants && this.variants.length > 0;
  
  next();
});

/**
 * Virtual: Discount percentage
 */
productSchema.virtual('discountPercentage').get(function() {
  if (this.mrp > 0 && this.salePrice < this.mrp) {
    return Math.round(((this.mrp - this.salePrice) / this.mrp) * 100);
  }
  return 0;
});

/**
 * Virtual: Total stock (including variants)
 */
productSchema.virtual('totalStock').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return this.stock;
});

/**
 * Virtual: In stock status
 */
productSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

/**
 * Virtual: Price range (for products with variants)
 */
productSchema.virtual('priceRange').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const prices = this.variants.filter(v => v.isActive).map(v => v.salePrice);
    if (prices.length > 0) {
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
  }
  return {
    min: this.salePrice,
    max: this.salePrice
  };
});

/**
 * Method: Get variant by ID
 */
productSchema.methods.getVariantById = function(variantId) {
  if (!this.hasVariants) return null;
  return this.variants.id(variantId);
};

/**
 * Method: Get variant by SKU
 */
productSchema.methods.getVariantBySku = function(sku) {
  if (!this.hasVariants) return null;
  return this.variants.find(v => v.sku === sku.toUpperCase());
};

/**
 * Method: Check if SKU exists in variants
 */
productSchema.methods.skuExists = function(sku, excludeVariantId = null) {
  return this.variants.some(v => {
    if (excludeVariantId && v._id.toString() === excludeVariantId.toString()) {
      return false;
    }
    return v.sku === sku.toUpperCase();
  });
};

/**
 * Static: Get active products with pagination
 */
productSchema.statics.getActiveProducts = async function(options = {}) {
  const {
    page = 1,
    limit = 20,
    categoryId,
    brandId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { isActive: true };

  if (categoryId) {
    query.category = categoryId;
  }

  if (brandId) {
    query.brand = brandId;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    this.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('Product', productSchema);
