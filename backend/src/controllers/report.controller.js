/**
 * Report Controller - MVP (Admin)
 */

const ReportService = require('../services/report.service');

/**
 * @desc    Generate product report
 * @route   GET /api/v1/admin/reports/product/:productId
 * @access  Admin
 * @query   dateFrom, dateTo, status, format (json|csv|xlsx)
 */
const getProductReport = async (req, res) => {
  try {
    const { productId } = req.params;
    const { dateFrom, dateTo, status, format = 'json' } = req.query;

    const result = await ReportService.generateProductReport(productId, {
      dateFrom,
      dateTo,
      status
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return based on format
    if (format === 'csv') {
      const csvResult = await ReportService.exportToCSV(
        result.data,
        `product-report-${result.product.name}`
      );

      if (!csvResult.success) {
        return res.status(500).json(csvResult);
      }

      res.setHeader('Content-Type', csvResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
      return res.send(csvResult.csv);
    }

    if (format === 'xlsx') {
      const xlsxResult = await ReportService.exportToXLSX(
        result.data,
        `product-report-${result.product.name}`,
        'Product Report'
      );

      if (!xlsxResult.success) {
        return res.status(500).json(xlsxResult);
      }

      res.setHeader('Content-Type', xlsxResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${xlsxResult.filename}"`);
      return res.send(xlsxResult.buffer);
    }

    // Default: JSON
    return res.status(200).json({
      success: true,
      report: result
    });
  } catch (error) {
    console.error('Get Product Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating product report'
    });
  }
};

/**
 * @desc    Generate sales report
 * @route   GET /api/v1/admin/reports/sales
 * @access  Admin
 * @query   dateFrom, dateTo, status, format (json|csv|xlsx)
 */
const getSalesReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, format = 'json' } = req.query;

    const result = await ReportService.generateSalesReport({
      dateFrom,
      dateTo,
      status
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return based on format
    if (format === 'csv') {
      const csvResult = await ReportService.exportToCSV(
        result.data,
        'sales-report'
      );

      if (!csvResult.success) {
        return res.status(500).json(csvResult);
      }

      res.setHeader('Content-Type', csvResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
      return res.send(csvResult.csv);
    }

    if (format === 'xlsx') {
      const xlsxResult = await ReportService.exportToXLSX(
        result.data,
        'sales-report',
        'Sales Report'
      );

      if (!xlsxResult.success) {
        return res.status(500).json(xlsxResult);
      }

      res.setHeader('Content-Type', xlsxResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${xlsxResult.filename}"`);
      return res.send(xlsxResult.buffer);
    }

    // Default: JSON
    return res.status(200).json({
      success: true,
      report: result
    });
  } catch (error) {
    console.error('Get Sales Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating sales report'
    });
  }
};

/**
 * @desc    Generate inventory report
 * @route   GET /api/v1/admin/reports/inventory
 * @access  Admin
 * @query   format (json|csv|xlsx)
 */
const getInventoryReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const result = await ReportService.generateInventoryReport();

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return based on format
    if (format === 'csv') {
      const csvResult = await ReportService.exportToCSV(
        result.data,
        'inventory-report'
      );

      if (!csvResult.success) {
        return res.status(500).json(csvResult);
      }

      res.setHeader('Content-Type', csvResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
      return res.send(csvResult.csv);
    }

    if (format === 'xlsx') {
      const xlsxResult = await ReportService.exportToXLSX(
        result.data,
        'inventory-report',
        'Inventory Report'
      );

      if (!xlsxResult.success) {
        return res.status(500).json(xlsxResult);
      }

      res.setHeader('Content-Type', xlsxResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${xlsxResult.filename}"`);
      return res.send(xlsxResult.buffer);
    }

    // Default: JSON
    return res.status(200).json({
      success: true,
      report: result
    });
  } catch (error) {
    console.error('Get Inventory Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating inventory report'
    });
  }
};

module.exports = {
  getProductReport,
  getSalesReport,
  getInventoryReport
};