# Firebase Cloud Messaging (FCM) Setup Guide

## Overview

The YouthQit backend now includes complete FCM push notification support for real-time order updates and custom notifications.

---

## 📋 Prerequisites

1. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. **Service Account**: Download service account credentials JSON file
3. **Mobile App**: Configure FCM in your React Native app

---

## 🔧 Backend Configuration

### Step 1: Get Firebase Service Account Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file

### Step 2: Extract Credentials

From the downloaded JSON file, extract:
- `project_id`
- `private_key`
- `client_email`

### Step 3: Update `.env` File

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important**: Keep the `\n` characters in the private key as-is.

---

## 📱 Mobile App Integration

### React Native Setup

1. **Install Firebase SDK:**
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

2. **Configure Android** (`android/app/google-services.json`):
   - Download from Firebase Console → Project Settings → Android App

3. **Configure iOS** (`ios/GoogleService-Info.plist`):
   - Download from Firebase Console → Project Settings → iOS App

4. **Request Permission & Get Token:**
```javascript
import messaging from '@react-native-firebase/messaging';

// Request permission (iOS)
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

// Get FCM token
async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

// Register token with backend
async function registerToken(authToken) {
  const fcmToken = await getFCMToken();
  
  await fetch('https://your-api.com/api/v1/notifications/register-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      token: fcmToken,
      device: Platform.OS // 'ios' or 'android'
    })
  });
}
```

5. **Listen for Notifications:**
```javascript
// Foreground messages
messaging().onMessage(async remoteMessage => {
  console.log('Notification received in foreground:', remoteMessage);
  // Show in-app notification
});

// Background/Quit state messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Notification received in background:', remoteMessage);
});

// Notification tap handler
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification opened:', remoteMessage);
  // Navigate to specific screen
});
```

---

## 🔔 Automatic Notifications

The system automatically sends notifications for:

### Order Status Updates
- **Order Created** - When buyer places order
- **Processing Payment** - When payment is being processed
- **Payment Successful** - When payment is confirmed
- **Order Confirmed** - When admin confirms order
- **Order Packed** - When order is packed
- **Order Shipped** - When order is shipped with tracking
- **Order Delivered** - When order is delivered
- **Payment Failed** - When payment fails
- **Order Cancelled** - When order is cancelled

### Implementation
No additional code needed - notifications are sent automatically when order status changes.

```javascript
// Example: Order status update automatically triggers notification
await OrderService.updateOrderStatus(orderId, adminId, 'SHIPPED', {
  trackingNumber: 'TRACK123',
  trackingUrl: 'https://tracking.com/TRACK123'
});
// ✅ Notification sent automatically to buyer
```

---

## 📤 Manual Notifications (Admin)

### Send Custom Notification

```bash
POST /api/v1/admin/notifications/send
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "6541234567890abcdef12345",
  "title": "Special Offer",
  "body": "Get 20% off on all products this weekend!",
  "data": {
    "type": "PROMO",
    "promoCode": "WEEKEND20"
  }
}
```

### Send Abandoned Cart Reminder

```bash
POST /api/v1/admin/notifications/abandoned-cart-reminder
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "6541234567890abcdef12345",
  "itemCount": 3,
  "cartValue": 2500
}
```

---

## 📖 API Endpoints

### Buyer Endpoints

#### Register FCM Token
```
POST /api/v1/notifications/register-token
Body: { token, device }
```

#### Unregister FCM Token
```
POST /api/v1/notifications/unregister-token
Body: { token }
```

#### Get Notifications
```
GET /api/v1/notifications?page=1&limit=20&unreadOnly=false
```

#### Get Unread Count
```
GET /api/v1/notifications/unread-count
```

#### Mark as Read
```
PUT /api/v1/notifications/:notificationId/read
```

#### Mark All as Read
```
PUT /api/v1/notifications/read-all
```

### Admin Endpoints

#### Send Custom Notification
```
POST /api/v1/admin/notifications/send
Body: { userId, title, body, data }
```

#### Send Abandoned Cart Reminder
```
POST /api/v1/admin/notifications/abandoned-cart-reminder
Body: { userId, itemCount, cartValue }
```

---

## 🧪 Testing Notifications

### Development Mode

In development, notifications are simulated and logged to console:

```bash
========================================
[DEV] FCM Notification (Simulated):
To: device-token-here
Title: Order Shipped
Body: Your order ORD-20251226-001 has been shipped.
Data: { orderId: '...', orderNumber: 'ORD-20251226-001' }
========================================
```

### Production Mode

1. Ensure Firebase credentials are configured
2. Register FCM token from mobile app
3. Trigger order status change
4. Check mobile device for notification

---

## 🎨 Notification Types

### System Types
```javascript
enum NotificationType {
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  LOW_STOCK = 'LOW_STOCK',
  ABANDONED_CART = 'ABANDONED_CART',
  CUSTOM = 'CUSTOM'
}
```

### Notification Structure
```javascript
{
  "_id": "notification-id",
  "user": "user-id",
  "type": "ORDER_STATUS_UPDATE",
  "title": "Order Shipped",
  "body": "Your order has been shipped",
  "data": {
    "orderId": "order-id",
    "orderNumber": "ORD-20251226-001",
    "status": "SHIPPED"
  },
  "order": "order-id",
  "status": "SENT",
  "read": false,
  "createdAt": "2025-12-26T10:00:00Z"
}
```

---

## 🔍 Debugging

### Check Notification Logs
```bash
# Server logs show notification attempts
[INFO] Sending notification to user: 6541234567890abcdef12345
[INFO] FCM tokens found: 2
[INFO] Notification sent successfully
```

### Verify Token Registration
```javascript
// Check if user has FCM tokens
const user = await User.findById(userId).select('fcmTokens');
console.log('FCM Tokens:', user.fcmTokens);
```

### Test with Postman/cURL
```bash
curl -X POST http://localhost:5000/api/v1/admin/notifications/send \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

---

## ⚠️ Important Notes

1. **Token Management**: FCM tokens can expire or change. Handle token refresh in mobile app.
2. **Multiple Devices**: Users can have multiple tokens (multiple devices). Notifications are sent to all.
3. **Development Mode**: Notifications are simulated in development. Configure Firebase for production.
4. **Rate Limits**: Be mindful of FCM rate limits (1,000,000 messages/day for free tier).
5. **Error Handling**: Failed notifications are logged but don't block order processing.

---

## 📊 Monitoring

### Notification Delivery Status
```javascript
// Check notification status
const notification = await Notification.findById(notificationId);
console.log('Status:', notification.status); // PENDING, SENT, FAILED, DELIVERED
console.log('Sent At:', notification.sentAt);
console.log('Failure Reason:', notification.failureReason);
```

### User Notification History
```javascript
// Get user's notification history
const notifications = await Notification.find({ user: userId })
  .sort({ createdAt: -1 })
  .limit(20);
```

---

## 🚀 Production Checklist

- [ ] Firebase project created
- [ ] Service account credentials downloaded
- [ ] Environment variables configured
- [ ] Mobile app FCM configured (Android + iOS)
- [ ] Token registration implemented in mobile app
- [ ] Notification permissions requested
- [ ] Background message handler implemented
- [ ] Notification tap handler implemented
- [ ] Test notifications sent successfully
- [ ] Monitor notification delivery rates

---

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [FCM Server Protocol](https://firebase.google.com/docs/cloud-messaging/server)
- [Push Notification Best Practices](https://firebase.google.com/docs/cloud-messaging/concept-options)

---

## 🆘 Troubleshooting

### Notifications Not Received

1. Check if FCM token is registered:
```bash
GET /api/v1/users/me
# Check fcmTokens array
```

2. Verify Firebase credentials are correct
3. Check mobile app has notification permissions
4. Verify app is not in battery saver mode (Android)
5. Check Firebase Console → Cloud Messaging logs

### Token Invalid Error

- FCM tokens can become invalid
- Implement token refresh in mobile app
- Re-register token when `messaging().onTokenRefresh()` fires

### Notifications Not Showing

- Check notification channel settings (Android)
- Verify notification permissions granted
- Check app notification settings in device settings
- Test with foreground message first

---

**For support, contact your backend team or refer to Firebase documentation.**
