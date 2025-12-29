/**
 * Product Service - MVP
 * 
 * Handles all product business logic
 * - CRUD operations
 * - Variants handled inline via create/update only
 * 
 * Service-first architecture: Controllers only call services
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const S3Service = require('./s3.service');

class ProductService {
  /**
   * Get products with pagination and filters (Public)
   * 
   * @param {Object} options - { page, limit, categoryId, brandId, search, sortBy, sortOrder }
   * @returns {Promise<Object>} { success, products, pagination }
   */
  async getProducts(options = {}) {
    try {
      const result = await Product.getActiveProducts(options);
      
      return {
        success: true,
        products: result.products,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get Products Error:', error);
      return {
        success: false,
        message: 'Failed to fetch products'
      };
    }
  }

  /**
   * Get single product by ID (Public)
   * 
   * @param {string} productId
   * @returns {Promise<Object>} { success, product?, message? }
   */
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name slug')
        .populate('brand', 'name slug image');

      if (!product) {
        return {
          success: false,
          message: 'Product not found'
        };
      }

      if (!product.isActive) {
        return {
          success: false,
          message: 'Product is not available'
        };
      }

      return {
        success: true,
        product
      };
    } catch (error) {
      console.error('Get Product Error:', error);
      return {
        success: false,
        message: 'Failed to fetch product'
      };
    }
  }

  /**
   * Create new product (Admin)
   * Variants are handled inline via productData.variants
   * 
   * @param {Object} productData
   * @param {Array} imageFiles - Array of multer file objects
   * @returns {Promise<Object>} { success, product?, message? }
   */
  async createProduct(productData, imageFiles = []) {
    try {
      // Validate category exists
      const category = await Category.findById(productData.category);
      if (!category) {
        return {
          success: false,
          message: 'Category not found'
        };
      }

      // Validate brand if provided
      if (productData.brand) {
        const brand = await Brand.findById(productData.brand);
        if (!brand) {
          return {
            success: false,
            message: 'Brand not found'
          };
        }
      }

      // Upload images if provided
      let imageUrls = [];
      if (imageFiles && imageFiles.length > 0) {
        const uploadResult = await S3Service.uploadMultiple(imageFiles, 'products');
        if (uploadResult.success) {
          imageUrls = uploadResult.urls;
        }
      }

      // If images passed as URLs in productData
      if (productData.images && Array.isArray(productData.images)) {
        imageUrls = [...imageUrls, ...productData.images];
      }

      // Create product (variants included inline if provided)
      const product = new Product({
        ...productData,
        images: imageUrls
      });

      await product.save();

      // Populate references
      await product.populate('category', 'name slug');
      await product.populate('brand', 'name slug image');

      return {
        success: true,
        product,
        message: 'Product created successfully'
      };
    } catch (error) {
      console.error('Create Product Error:', error);
      
      // Handle duplicate slug
      if (error.code === 11000) {
        return {
          success: false,
          message: 'A product with this name already exists'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to create product'
      };
    }
  }

  /**
   * Update product (Admin)
   * Variants are handled inline via updates.variants
   * 
   * @param {string} productId
   * @param {Object} updates
   * @param {Array} newImageFiles - New images to add
   * @returns {Promise<Object>} { success, product?, message? }
   */
  async updateProduct(productId, updates, newImageFiles = []) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return {
          success: false,
          message: 'Product not found'
        };
      }

      // Validate category if being updated
      if (updates.category) {
        const category = await Category.findById(updates.category);
        if (!category) {
          return {
            success: false,
            message: 'Category not found'
          };
        }
      }

      // Validate brand if being updated
      if (updates.brand) {
        const brand = await Brand.findById(updates.brand);
        if (!brand) {
          return {
            success: false,
            message: 'Brand not found'
          };
        }
      }

      // Upload new images if provided
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadResult = await S3Service.uploadMultiple(newImageFiles, 'products');
        if (uploadResult.success) {
          // Append new images to existing
          updates.images = [...(product.images || []), ...uploadResult.urls];
        }
      }

      // Apply updates (variants included inline if provided)
      const allowedFields = [
        'name', 'description', 'shortDescription', 'images',
        'category', 'brand', 'sku', 'salePrice', 'mrp', 'costPrice',
        'stock', 'hsnCode', 'taxRate', 'variants', 'minOrderQty',
        'maxOrderQty', 'unit', 'isActive', 'sortOrder', 'tags'
      ];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          product[field] = updates[field];
        }
      }

      await product.save();

      // Populate references
      await product.populate('category', 'name slug');
      await product.populate('brand', 'name slug image');

      return {
        success: true,
        product,
        message: 'Product updated successfully'
      };
    } catch (error) {
      console.error('Update Product Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update product'
      };
    }
  }

  /**
   * Delete product (Admin)
   * 
   * @param {string} productId
   * @returns {Promise<Object>} { success, message }
   */
  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return {
          success: false,
          message: 'Product not found'
        };
      }

      // Delete images from S3
      if (product.images && product.images.length > 0) {
        await S3Service.deleteMultiple(product.images);
      }

      // Delete variant images from S3
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          if (variant.images && variant.images.length > 0) {
            await S3Service.deleteMultiple(variant.images);
          }
        }
      }

      await product.deleteOne();

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Delete Product Error:', error);
      return {
        success: false,
        message: 'Failed to delete product'
      };
    }
  }
}

module.exports = new ProductService();
