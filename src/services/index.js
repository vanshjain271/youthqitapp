/**
 * Services Index - MVP
 */

const SMSService = require('./sms.service');
const AuthService = require('./auth.service');
const UserService = require('./user.service');
const S3Service = require('./s3.service');
const ProductService = require('./product.service');
const OrderService = require('./order.service');
const InvoiceService = require('./invoice.service');

module.exports = {
  SMSService,
  AuthService,
  UserService,
  S3Service,
  ProductService,
  OrderService,
  InvoiceService
};