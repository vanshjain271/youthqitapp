/**
 * Category Model - MVP
 * 
 * Product categories with parent-child hierarchy
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  // Parent category (null for root categories)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Level in hierarchy (0 = root)
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ level: 1 });

/**
 * Pre-save: Generate slug and set level
 */
categorySchema.pre('save', async function(next) {
  // Generate slug
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set level based on parent
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await mongoose.model('Category').findById(this.parent);
      this.level = parentCategory ? parentCategory.level + 1 : 0;
    } else {
      this.level = 0;
    }
  }
  
  next();
});

/**
 * Virtual: Subcategories
 */
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

/**
 * Static: Get root categories (no parent)
 */
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort('sortOrder name');
};

/**
 * Static: Get category tree
 */
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort('level sortOrder name')
    .lean();
  
  // Build tree structure
  const categoryMap = {};
  const tree = [];
  
  // Create map
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = { ...cat, children: [] };
  });
  
  // Build tree
  categories.forEach(cat => {
    if (cat.parent) {
      const parentId = cat.parent.toString();
      if (categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
      }
    } else {
      tree.push(categoryMap[cat._id.toString()]);
    }
  });
  
  return tree;
};

/**
 * Static: Get subcategories of a category
 */
categorySchema.statics.getSubcategories = function(parentId) {
  return this.find({ parent: parentId, isActive: true }).sort('sortOrder name');
};

module.exports = mongoose.model('Category', categorySchema);
