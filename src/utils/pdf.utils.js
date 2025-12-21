/**
 * PDF Utility - MVP
 * 
 * Generates invoice PDF using PDFKit
 */

const PDFDocument = require('pdfkit');
const { numberToWords } = require('./gst.util');

// Company details (configure based on business)
const COMPANY = {
  name: 'YouthQit Technologies',
  address: 'Shop No. 123, Electronics Market',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380001',
  phone: '+91 98765 43210',
  email: 'info@youthqit.com',
  gstin: '24XXXXX1234X1Z5',
  pan: 'XXXXX1234X'
};

/**
 * Generate invoice PDF buffer
 */
const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      drawHeader(doc, invoice);
      drawInvoiceDetails(doc, invoice);
      drawAddresses(doc, invoice);
      drawItemsTable(doc, invoice);
      drawTaxSummary(doc, invoice);
      drawTotals(doc, invoice);
      drawAmountInWords(doc, invoice);
      drawFooter(doc, invoice);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const drawHeader = (doc, invoice) => {
  doc.fontSize(18).font('Helvetica-Bold').text(COMPANY.name, 40, 40);
  doc.fontSize(9).font('Helvetica')
    .text(COMPANY.address, 40, 62)
    .text(`${COMPANY.city}, ${COMPANY.state} - ${COMPANY.pincode}`, 40, 74)
    .text(`Phone: ${COMPANY.phone} | Email: ${COMPANY.email}`, 40, 86)
    .text(`GSTIN: ${COMPANY.gstin} | PAN: ${COMPANY.pan}`, 40, 98);

  doc.fontSize(14).font('Helvetica-Bold')
    .text('TAX INVOICE', 450, 40, { align: 'right' });

  doc.moveTo(40, 115).lineTo(555, 115).stroke();
};

const drawInvoiceDetails = (doc, invoice) => {
  const y = 125;
  doc.fontSize(10).font('Helvetica-Bold')
    .text('Invoice No:', 40, y)
    .text('Invoice Date:', 40, y + 15)
    .text('Order No:', 300, y)
    .text('Order Date:', 300, y + 15);

  doc.font('Helvetica')
    .text(invoice.invoiceNumber, 120, y)
    .text(formatDate(invoice.invoiceDate), 120, y + 15)
    .text(invoice.order?.orderNumber || '-', 380, y)
    .text(formatDate(invoice.order?.createdAt), 380, y + 15);
};

const drawAddresses = (doc, invoice) => {
  const y = 170;

  doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 40, y);
  doc.fontSize(9).font('Helvetica')
    .text(invoice.billingAddress.name, 40, y + 15)
    .text(invoice.billingAddress.addressLine1, 40, y + 27)
    .text(invoice.billingAddress.addressLine2 || '', 40, y + 39)
    .text(`${invoice.billingAddress.city}, ${invoice.billingAddress.state} - ${invoice.billingAddress.pincode}`, 40, y + 51)
    .text(`Phone: ${invoice.billingAddress.phone}`, 40, y + 63);

  doc.fontSize(10).font('Helvetica-Bold').text('Ship To:', 300, y);
  doc.fontSize(9).font('Helvetica')
    .text(invoice.shippingAddress.name, 300, y + 15)
    .text(invoice.shippingAddress.addressLine1, 300, y + 27)
    .text(invoice.shippingAddress.addressLine2 || '', 300, y + 39)
    .text(`${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} - ${invoice.shippingAddress.pincode}`, 300, y + 51)
    .text(`Phone: ${invoice.shippingAddress.phone}`, 300, y + 63);

  doc.moveTo(40, y + 80).lineTo(555, y + 80).stroke();
};

const drawItemsTable = (doc, invoice) => {
  const tableTop = 265;
  const tableHeaders = ['#', 'Description', 'HSN', 'Qty', 'Rate', 'Taxable', 'GST%', 'Tax', 'Total'];
  const colWidths = [25, 140, 50, 35, 55, 55, 40, 50, 60];
  
  let x = 40;
  doc.rect(40, tableTop, 515, 20).fill('#f0f0f0');

  doc.fillColor('#000').fontSize(8).font('Helvetica-Bold');
  tableHeaders.forEach((header, i) => {
    doc.text(header, x + 3, tableTop + 6, { width: colWidths[i], align: i > 2 ? 'right' : 'left' });
    x += colWidths[i];
  });

  let y = tableTop + 25;
  doc.font('Helvetica').fontSize(8);

  invoice.items.forEach((item, index) => {
    x = 40;
    const rowData = [
      (index + 1).toString(),
      item.name + (item.variantName ? ` - ${item.variantName}` : ''),
      item.hsnCode || '-',
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.taxableAmount),
      `${item.gstRate}%`,
      formatCurrency(item.totalTax),
      formatCurrency(item.totalWithTax)
    ];

    rowData.forEach((data, i) => {
      doc.text(data, x + 3, y, { width: colWidths[i] - 6, align: i > 2 ? 'right' : 'left' });
      x += colWidths[i];
    });

    y += 18;
    if (y > 700) {
      doc.addPage();
      y = 40;
    }
  });

  doc.rect(40, tableTop, 515, y - tableTop + 5).stroke();
  return y + 10;
};

const drawTaxSummary = (doc, invoice) => {
  const y = 480;
  doc.fontSize(9).font('Helvetica-Bold').text('Tax Summary:', 40, y);

  const taxY = y + 15;
  doc.fontSize(8).font('Helvetica');

  if (invoice.isIntraState) {
    doc.text(`CGST: ${formatCurrency(invoice.totalCgst)}`, 40, taxY);
    doc.text(`SGST: ${formatCurrency(invoice.totalSgst)}`, 150, taxY);
  } else {
    doc.text(`IGST: ${formatCurrency(invoice.totalIgst)}`, 40, taxY);
  }
};

const drawTotals = (doc, invoice) => {
  const x = 380;
  let y = 480;

  doc.fontSize(9).font('Helvetica');

  doc.text('Subtotal:', x, y);
  doc.text(formatCurrency(invoice.subtotal), x + 100, y, { align: 'right', width: 75 });
  y += 15;

  if (invoice.isIntraState) {
    doc.text(`CGST (${invoice.items[0]?.gstRate / 2 || 9}%):`, x, y);
    doc.text(formatCurrency(invoice.totalCgst), x + 100, y, { align: 'right', width: 75 });
    y += 15;

    doc.text(`SGST (${invoice.items[0]?.gstRate / 2 || 9}%):`, x, y);
    doc.text(formatCurrency(invoice.totalSgst), x + 100, y, { align: 'right', width: 75 });
    y += 15;
  } else {
    doc.text(`IGST (${invoice.items[0]?.gstRate || 18}%):`, x, y);
    doc.text(formatCurrency(invoice.totalIgst), x + 100, y, { align: 'right', width: 75 });
    y += 15;
  }

  doc.font('Helvetica-Bold');
  doc.text('Grand Total:', x, y);
  doc.text(formatCurrency(invoice.grandTotal), x + 100, y, { align: 'right', width: 75 });
};

const drawAmountInWords = (doc, invoice) => {
  const y = 560;
  doc.fontSize(9).font('Helvetica-Bold').text('Amount in Words:', 40, y);
  doc.font('Helvetica').text(numberToWords(invoice.grandTotal), 40, y + 12);
};

const drawFooter = (doc, invoice) => {
  const y = 620;

  doc.fontSize(9).font('Helvetica-Bold').text('Bank Details:', 40, y);
  doc.fontSize(8).font('Helvetica')
    .text('Bank: State Bank of India', 40, y + 12)
    .text('A/C No: 1234567890123', 40, y + 24)
    .text('IFSC: SBIN0001234', 40, y + 36)
    .text('Branch: Ahmedabad Main', 40, y + 48);

  doc.fontSize(9).font('Helvetica-Bold').text('Terms & Conditions:', 300, y);
  doc.fontSize(7).font('Helvetica')
    .text('1. Goods once sold will not be taken back.', 300, y + 12)
    .text('2. Subject to Ahmedabad jurisdiction only.', 300, y + 22)
    .text('3. E. & O.E.', 300, y + 32);

  doc.fontSize(9).font('Helvetica-Bold')
    .text('For ' + COMPANY.name, 400, y + 55, { align: 'right' });
  doc.fontSize(8).font('Helvetica')
    .text('Authorized Signatory', 400, y + 85, { align: 'right' });

  doc.moveTo(40, 750).lineTo(555, 750).stroke();
  doc.fontSize(7).font('Helvetica')
    .text('This is a computer generated invoice.', 40, 755, { align: 'center', width: 515 });
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  return '₹' + (amount || 0).toFixed(2);
};

module.exports = {
  generateInvoicePDF,
  COMPANY
};