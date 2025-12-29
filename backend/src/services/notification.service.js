/**
 * Notification Service - MVP
 * 
 * Manages push notifications
 * - Send notifications via FCM
 * - Track notification delivery
 * - Notification templates
 */

const Notification = require('../models/Notification');
const User = require('../models/User');
const FCMService = require('./fcm.service');

class NotificationService {
  /**
   * Send notification to user
   * Automatically fetches user's FCM tokens and sends to all devices
   */
  async sendToUser(userId, notification) {
    try {
      const { type, title, body, data = {}, order = null, product = null } = notification;

      // Get user's FCM tokens
      const user = await User.findById(userId).select('fcmTokens');
      
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        return {
          success: false,
          message: 'User has no registered devices'
        };
      }

      const fcmTokens = user.fcmTokens.map(t => t.token).filter(t => FCMService.isValidToken(t));

      if (fcmTokens.length === 0) {
        return {
          success: false,
          message: 'User has no valid FCM tokens'
        };
      }

      // Create notification record
      const notificationRecord = new Notification({
        user: userId,
        type,
        title,
        body,
        data,
        order,
        product,
        fcmTokensUsed: fcmTokens,
        status: 'PENDING'
      });

      // Send via FCM
      const fcmResult = await FCMService.sendToMultipleDevices(
        fcmTokens,
        { title, body },
        data
      );

      // Update notification status
      if (fcmResult.success) {
        notificationRecord.markAsSent(fcmResult.results[0]?.messageId);
      } else {
        notificationRecord.markAsFailed(fcmResult.error || 'Failed to send');
      }

      await notificationRecord.save();

      return {
        success: fcmResult.success,
        notification: notificationRecord,
        deliveryStatus: {
          successCount: fcmResult.successCount,
          failureCount: fcmResult.failureCount
        }
      };
    } catch (error) {
      console.error('Send Notification Error:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(orderId, userId, newStatus, orderNumber) {
    const statusMessages = {
      PENDING: {
        title: 'Order Created',
        body: `Your order ${orderNumber} has been created successfully.`
      },
      PROCESSING_PAYMENT: {
        title: 'Processing Payment',
        body: `Payment is being processed for order ${orderNumber}.`
      },
      PAID: {
        title: 'Payment Successful',
        body: `Payment confirmed for order ${orderNumber}. Your order will be processed soon.`
      },
      CONFIRMED: {
        title: 'Order Confirmed',
        body: `Order ${orderNumber} has been confirmed and will be packed soon.`
      },
      PACKED: {
        title: 'Order Packed',
        body: `Your order ${orderNumber} has been packed and is ready for shipment.`
      },
      SHIPPED: {
        title: 'Order Shipped',
        body: `Great news! Your order ${orderNumber} has been shipped.`
      },
      DELIVERED: {
        title: 'Order Delivered',
        body: `Your order ${orderNumber} has been delivered. Thank you for shopping with us!`
      },
      PAYMENT_FAILED: {
        title: 'Payment Failed',
        body: `Payment for order ${orderNumber} failed. Please try again.`
      },
      CANCELLED: {
        title: 'Order Cancelled',
        body: `Order ${orderNumber} has been cancelled.`
      }
    };

    const message = statusMessages[newStatus] || {
      title: 'Order Update',
      body: `Your order ${orderNumber} status has been updated to ${newStatus}.`
    };

    return this.sendToUser(userId, {
      type: 'ORDER_STATUS_UPDATE',
      title: message.title,
      body: message.body,
      data: {
        orderId: orderId.toString(),
        orderNumber,
        status: newStatus,
        type: 'ORDER_STATUS_UPDATE'
      },
      order: orderId
    });
  }

  /**
   * Send low stock alert to admin
   */
  async sendLowStockAlert(adminUserId, productName, stock) {
    return this.sendToUser(adminUserId, {
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      body: `${productName} is running low on stock (${stock} units remaining).`,
      data: {
        productName,
        stock: stock.toString(),
        type: 'LOW_STOCK'
      }
    });
  }

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCartReminder(userId, itemCount, cartValue) {
    return this.sendToUser(userId, {
      type: 'ABANDONED_CART',
      title: 'Complete Your Order',
      body: `You have ${itemCount} items (₹${cartValue}) waiting in your cart. Complete your purchase now!`,
      data: {
        itemCount: itemCount.toString(),
        cartValue: cartValue.toString(),
        type: 'ABANDONED_CART'
      }
    });
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(userId, title, body, data = {}) {
    return this.sendToUser(userId, {
      type: 'CUSTOM',
      title,
      body,
      data
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const result = await Notification.getUserNotifications(userId, options);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Get User Notifications Error:', error);
      return {
        success: false,
        message: 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.getUnreadCount(userId);

      return {
        success: true,
        count
      };
    } catch (error) {
      console.error('Get Unread Count Error:', error);
      return {
        success: false,
        message: 'Failed to fetch unread count'
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found'
        };
      }

      notification.markAsRead();
      await notification.save();

      return {
        success: true,
        notification
      };
    } catch (error) {
      console.error('Mark As Read Error:', error);
      return {
        success: false,
        message: 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, read: false },
        { read: true, readAt: new Date() }
      );

      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      console.error('Mark All As Read Error:', error);
      return {
        success: false,
        message: 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Register FCM token for user
   */
  async registerFCMToken(userId, token, device = 'android') {
    try {
      if (!FCMService.isValidToken(token)) {
        return {
          success: false,
          message: 'Invalid FCM token format'
        };
      }

      const user = await User.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if token already exists
      const existingToken = user.fcmTokens.find(t => t.token === token);

      if (!existingToken) {
        user.fcmTokens.push({
          token,
          device,
          addedAt: new Date()
        });
        
        await user.save();
      }

      return {
        success: true,
        message: 'FCM token registered successfully'
      };
    } catch (error) {
      console.error('Register FCM Token Error:', error);
      return {
        success: false,
        message: 'Failed to register FCM token'
      };
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterFCMToken(userId, token) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      user.fcmTokens = user.fcmTokens.filter(t => t.token !== token);
      await user.save();

      return {
        success: true,
        message: 'FCM token unregistered successfully'
      };
    } catch (error) {
      console.error('Unregister FCM Token Error:', error);
      return {
        success: false,
        message: 'Failed to unregister FCM token'
      };
    }
  }
}

module.exports = new NotificationService();