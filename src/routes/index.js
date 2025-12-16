/**
 * Routes Index - MVP
 */

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const adminProductRoutes = require('./admin/product.routes');

module.exports = {
  authRoutes,
  userRoutes,
  productRoutes,
  adminProductRoutes
};
