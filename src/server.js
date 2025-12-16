/**
 * YouthQit Backend Server - MVP
 *
 * Phase 1: Auth & User
 * Phase 2: Products
 * Phase 3: Orders
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const adminProductRoutes = require('./routes/admin/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminOrderRoutes = require('./routes/admin/order.routes');

// Init app
const app = express();

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

// Orders
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);

/* =========================
   Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
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
