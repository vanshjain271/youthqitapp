/**
 * Admin Invoice Routes - MVP
 */

const express = require('express');
const router = express.Router();
const InvoiceController = require('../../controllers/invoice.controller');
const { adminOnly } = require('../../middleware/auth.middleware');

router.get('/', adminOnly, InvoiceController.getInvoices);
router.get('/:invoiceId', adminOnly, InvoiceController.getInvoiceById);
router.post('/:invoiceId/regenerate-pdf', adminOnly, InvoiceController.regeneratePDF);

module.exports = router;