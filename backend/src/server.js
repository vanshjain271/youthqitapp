/**
 * YouthQit Backend Server - MVP
 *
 * FIXED: Added invoice routes mounting
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/database');
const { requestLogger, errorLogger, performanceLogger } = require('./middleware/logger.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const adminProductRoutes = require('./routes/admin/product.routes');
const cartRoutes = require('./routes/cart.routes');
const adminCartRoutes = require('./routes/admin/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminOrderRoutes = require('./routes/admin/order.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const adminInvoiceRoutes = require('./routes/admin/invoice.routes');
const adminAnalyticsRoutes = require('./routes/admin/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminNotificationRoutes = require('./routes/admin/notification.routes');
const adminReportRoutes = require('./routes/admin/report.routes');
const couponRoutes = require('./routes/coupon.routes');
const adminCouponRoutes = require('./routes/admin/coupon.routes');
const bannerRoutes = require('./routes/banner.routes');
const adminBannerRoutes = require('./routes/admin/banner.routes');

// Init app
const app = express();

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);
app.use(performanceLogger(2000)); // Log requests > 2 seconds

// Morgan for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

/* =========================
   Routes
========================= */

// Health
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'YouthQit API running 🚀'
  });
});

// Auth & User
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Products
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);

// Cart
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/admin/carts', adminCartRoutes);

// Orders
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);

// FIXED: Invoice routes now mounted
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/admin/invoices', adminInvoiceRoutes);

// Analytics
app.use('/api/v1/admin/analytics', adminAnalyticsRoutes);

// Notifications
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin/notifications', adminNotificationRoutes);

// Reports
app.use('/api/v1/admin/reports', adminReportRoutes);

// Coupons & Discounts
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/admin', adminCouponRoutes);

// Banners
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/admin/banners', adminBannerRoutes);

/* =========================
   Error Handler
========================= */
app.use(errorLogger);

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: req.requestId
  });
});

/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();