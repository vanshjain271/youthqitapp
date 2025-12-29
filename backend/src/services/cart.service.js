/**
 * Cart Service - MVP
 * 
 * Handles all cart business logic
 * - Add/update/remove items
 * - Get cart with enriched product data
 * - Abandoned cart detection
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  /**
   * Get cart for user
   * Returns cart with enriched product data
   */
  async getCart(userId) {
    try {
      let cart = await Cart.findOrCreateByUser(userId);
      
      // Populate product details
      await cart.populate({
        path: 'items.product',
        select: 'name slug images salePrice mrp stock hasVariants variants isActive'
      });

      // Enrich cart items with latest pricing and availability
      const enrichedItems = [];
      
      for (const item of cart.items) {
        if (!item.product || !item.product.isActive) {
          // Product no longer available - skip
          continue;
        }

        const product = item.product;
        let price, mrp, stock, available = true, variantData = null;

        if (item.variant && product.hasVariants) {
          const variant = product.variants.id(item.variant);
          
          if (!variant || !variant.isActive) {
            available = false;
          } else {
            price = variant.salePrice;
            mrp = variant.mrp;
            stock = variant.stock;
            variantData = {
              _id: variant._id,
              name: variant.name,
              sku: variant.sku,
              attributes: variant.attributes,
              images: variant.images
            };
          }
        } else {
          price = product.salePrice;
          mrp = product.mrp;
          stock = product.stock;
        }

        enrichedItems.push({
          _id: item._id,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            isActive: product.isActive
          },
          variant: variantData,
          quantity: item.quantity,
          price,
          mrp,
          stock,
          available: available && stock >= item.quantity,
          subtotal: price * item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        });
      }

      const cartTotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        success: true,
        cart: {
          _id: cart._id,
          user: cart.user,
          items: enrichedItems,
          itemCount: cart.itemCount,
          total: cartTotal,
          lastModified: cart.lastModified,
          isAbandoned: cart.isAbandoned
        }
      };
    } catch (error) {
      console.error('Get Cart Error:', error);
      return {
        success: false,
        message: 'Failed to fetch cart'
      };
    }
  }

  /**
   * Add item to cart
   */
  async addItem(userId, productId, variantId, quantity) {
    try {
      // Validate product exists and is active
      const product = await Product.findById(productId);
      
      if (!product || !product.isActive) {
        return {
          success: false,
          message: 'Product not available'
        };
      }

      // Validate variant if specified
      let stock;
      
      if (variantId && product.hasVariants) {
        const variant = product.variants.id(variantId);
        
        if (!variant || !variant.isActive) {
          return {
            success: false,
            message: 'Variant not available'
          };
        }
        
        stock = variant.stock;
      } else if (variantId) {
        return {
          success: false,
          message: 'This product does not have variants'
        };
      } else {
        stock = product.stock;
      }

      // Check stock availability
      const cart = await Cart.findOrCreateByUser(userId);
      
      // Calculate total quantity (existing + new)
      const variantIdStr = variantId ? variantId.toString() : null;
      const existingItem = cart.items.find(item => {
        const itemProductId = item.product.toString();
        const itemVariantId = item.variant ? item.variant.toString() : null;
        return itemProductId === productId.toString() && itemVariantId === variantIdStr;
      });

      const totalQuantity = (existingItem?.quantity || 0) + quantity;

      if (totalQuantity > stock) {
        return {
          success: false,
          message: `Insufficient stock. Only ${stock} units available.`
        };
      }

      // Add item to cart
      cart.addItem(productId, variantId, quantity);
      await cart.save();

      return await this.getCart(userId);
    } catch (error) {
      console.error('Add Item to Cart Error:', error);
      return {
        success: false,
        message: 'Failed to add item to cart'
      };
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(userId, itemId, quantity) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found'
        };
      }

      const item = cart.items.id(itemId);
      
      if (!item) {
        return {
          success: false,
          message: 'Item not found in cart'
        };
      }

      // Validate stock
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return {
          success: false,
          message: 'Product not available'
        };
      }

      let stock;
      
      if (item.variant && product.hasVariants) {
        const variant = product.variants.id(item.variant);
        
        if (!variant || !variant.isActive) {
          return {
            success: false,
            message: 'Variant not available'
          };
        }
        
        stock = variant.stock;
      } else {
        stock = product.stock;
      }

      if (quantity > stock) {
        return {
          success: false,
          message: `Insufficient stock. Only ${stock} units available.`
        };
      }

      // Update quantity
      const updateResult = cart.updateItemQuantity(itemId, quantity);
      
      if (!updateResult.success) {
        return updateResult;
      }

      await cart.save();

      return await this.getCart(userId);
    } catch (error) {
      console.error('Update Cart Item Error:', error);
      return {
        success: false,
        message: 'Failed to update cart item'
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, itemId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found'
        };
      }

      const removeResult = cart.removeItem(itemId);
      
      if (!removeResult.success) {
        return removeResult;
      }

      await cart.save();

      return await this.getCart(userId);
    } catch (error) {
      console.error('Remove Cart Item Error:', error);
      return {
        success: false,
        message: 'Failed to remove item from cart'
      };
    }
  }

  /**
   * Clear cart
   */
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        return {
          success: true,
          message: 'Cart already empty'
        };
      }

      cart.clearCart();
      await cart.save();

      return {
        success: true,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      console.error('Clear Cart Error:', error);
      return {
        success: false,
        message: 'Failed to clear cart'
      };
    }
  }

  /**
   * Get abandoned carts (Admin)
   */
  async getAbandonedCarts(thresholdHours = 24) {
    try {
      const carts = await Cart.findAbandonedCarts(thresholdHours);
      
      // Enrich with product details
      const enrichedCarts = [];
      
      for (const cart of carts) {
        await cart.populate({
          path: 'items.product',
          select: 'name images salePrice'
        });

        const items = cart.items.map(item => ({
          product: item.product,
          quantity: item.quantity
        }));

        let total = 0;
        for (const item of items) {
          if (item.product) {
            total += item.product.salePrice * item.quantity;
          }
        }

        enrichedCarts.push({
          _id: cart._id,
          user: cart.user,
          items,
          itemCount: cart.itemCount,
          total,
          lastModified: cart.lastModified,
          hoursSinceLastModified: Math.floor((Date.now() - cart.lastModified) / (1000 * 60 * 60))
        });
      }

      return {
        success: true,
        carts: enrichedCarts
      };
    } catch (error) {
      console.error('Get Abandoned Carts Error:', error);
      return {
        success: false,
        message: 'Failed to fetch abandoned carts'
      };
    }
  }

  /**
   * Mark abandoned carts (Cron Job)
   * Should be called periodically
   */
  async markAbandonedCarts(thresholdHours = 24) {
    try {
      const carts = await Cart.findAbandonedCarts(thresholdHours);
      
      let markedCount = 0;
      
      for (const cart of carts) {
        cart.markAsAbandoned();
        await cart.save();
        markedCount++;
      }

      return {
        success: true,
        markedCount
      };
    } catch (error) {
      console.error('Mark Abandoned Carts Error:', error);
      return {
        success: false,
        message: 'Failed to mark abandoned carts'
      };
    }
  }
}

module.exports = new CartService();