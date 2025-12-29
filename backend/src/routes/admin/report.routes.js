/**
 * Admin Report Routes - MVP
 */

const express = require('express');
const router = express.Router();
const ReportController = require('../../controllers/report.controller');
const auth = require('../../middleware/auth.middleware');

// Product report
router.get('/product/:productId', auth.adminOnly, ReportController.getProductReport);

// Sales report
router.get('/sales', auth.adminOnly, ReportController.getSalesReport);

// Inventory report
router.get('/inventory', auth.adminOnly, ReportController.getInventoryReport);

module.exports = router;