/**
 * Invoice Controller - MVP
 */

const InvoiceService = require('../services/invoice.service');

const getInvoiceByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await InvoiceService.getInvoiceByOrderId(orderId, req.user.userId, false);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json({ success: true, invoice: result.invoice });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching invoice' });
  }
};

const getMyInvoices = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await InvoiceService.getBuyerInvoices(req.user.userId, { page, limit });
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json({ success: true, invoices: result.invoices, pagination: result.pagination });
  } catch (error) {
    console.error('Get My Invoices Error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching invoices' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { page, limit, status, dateFrom, dateTo } = req.query;
    const result = await InvoiceService.listInvoices({ status, dateFrom, dateTo }, { page, limit });
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json({ success: true, invoices: result.invoices, pagination: result.pagination });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching invoices' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const result = await InvoiceService.getInvoiceById(invoiceId, null, true);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json({ success: true, invoice: result.invoice });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching invoice' });
  }
};

const regeneratePDF = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const result = await InvoiceService.regeneratePDF(invoiceId);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json({ success: true, message: result.message, invoice: result.invoice });
  } catch (error) {
    console.error('Regenerate PDF Error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while regenerating PDF' });
  }
};

module.exports = {
  getInvoiceByOrder,
  getMyInvoices,
  getInvoices,
  getInvoiceById,
  regeneratePDF
};