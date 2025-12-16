/**
 * Controllers Index - MVP
 */

const AuthController = require('./auth.controller');
const UserController = require('./user.controller');
const ProductController = require('./product.controller');
const AdminProductController = require('./admin-product.controller');

module.exports = {
  AuthController,
  UserController,
  ProductController,
  AdminProductController
};
