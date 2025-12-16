/**
 * YouthQit Backend Server - MVP
 *
 * Phase 1: Auth & User
 * Phase 2: Products
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 🔒 Load environment variables (FORCED PATH)
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

// 🔌 Database
const { connectDB } = require('./config/database');

// 📦 Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const adminProductRoutes = require('./routes/admin/product.routes');

// 🚀 App init
const app = express();

// =====================
// Global Middlewares
// =====================
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// =====================
// Rate Limiting
// =====================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// =====================
// API Routes
// =====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'YouthQit Backend API is running 🚀',
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// =====================
// Global Error Handler
// =====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// =====================
// Server Start
// =====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

