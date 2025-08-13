const PDFDocument = require("pdfkit");

async function generateAccountStatementPDF(account, transactions, res) {
  const doc = new PDFDocument({ margin: 50 });

  // Set headers for browser/Postman download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=AccountStatement_${account.accountNumber}.pdf`);

  // Pipe PDF to response
  doc.pipe(res);

  // ===== HEADER =====
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Smart Banking", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Account Statement", { align: "center" })
    .moveDown(1.5);

  // ===== ACCOUNT DETAILS =====
  doc.fontSize(12).font("Helvetica");
  doc.text(`Account Number: ${account.accountNumber}`);
  doc.text(`Account Holder: ${account.user.name}`);
  doc.text(`Email: ${account.user.email}`);
  doc.text(`KYC Status: ${account.kycStatus}`);
  doc.text(`Balance: ₹${account.balance.toFixed(2)}`);
  doc.moveDown(1.5);

  // ===== TRANSACTION HISTORY HEADER =====
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Transaction History", { underline: true })
    .moveDown(0.5);

  // ===== TABLE HEADERS =====
  const tableTop = doc.y;
  const colWidths = [120, 80, 80, 200]; // Adjust as needed

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Date", 50, tableTop, { width: colWidths[0] })
    .text("Type", 50 + colWidths[0], tableTop, { width: colWidths[1] })
    .text("Amount", 50 + colWidths[0] + colWidths[1], tableTop, { width: colWidths[2] })
    .text("Description", 50 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, { width: colWidths[3] });

  doc.moveDown(0.5);

  // ===== TABLE ROWS =====
  doc.font("Helvetica").fontSize(10);
  let yPosition = doc.y;

  transactions.forEach(tx => {
    doc.text(new Date(tx.createdAt).toLocaleString(), 50, yPosition, { width: colWidths[0] })
      .text(tx.type || "-", 50 + colWidths[0], yPosition, { width: colWidths[1] })
      .text(`₹${tx.amount}`, 50 + colWidths[0] + colWidths[1], yPosition, { width: colWidths[2] })
      .text(tx.description || "-", 50 + colWidths[0] + colWidths[1] + colWidths[2], yPosition, { width: colWidths[3] });

    yPosition += 20; // Space between rows
  });

  // ===== FOOTER =====
  doc.moveDown(2)
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });

  // Finalize the PDF
  doc.end();
}

module.exports = { generateAccountStatementPDF };

