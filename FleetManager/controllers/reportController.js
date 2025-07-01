const Expense = require('../models/Expense');
const Mission = require('../models/Mission');
const Truck = require('../models/Truck');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toISOString().slice(0, 10);
}

function formatAmount(amount) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

exports.generatePDF = async (req, res) => {
  try {
    // Accept both old and new query param names for compatibility
    const camion = req.query.truckId || req.query.camion;
    const dateStart = req.query.startDate || req.query.dateStart;
    const dateEnd = req.query.endDate || req.query.dateEnd;
    const filters = {};
    if (camion) filters.camion = camion;
    if (dateStart || dateEnd) {
      filters.date = {};
      if (dateStart) filters.date.$gte = new Date(dateStart);
      if (dateEnd) filters.date.$lte = new Date(dateEnd);
    }

    // Fetch expenses
    const expenses = await Expense.find(filters)
      .populate('camion', 'immatriculation marque')
      .populate('typeDepense', 'name')
      .sort({ date: 1 });

    // Fetch revenues (missions)
    const missionFilters = {};
    if (camion) missionFilters.truck = camion;
    if (dateStart || dateEnd) {
      missionFilters.returnDate = {};
      if (dateStart) missionFilters.returnDate.$gte = new Date(dateStart);
      if (dateEnd) missionFilters.returnDate.$lte = new Date(dateEnd);
    }
    const missions = await Mission.find(missionFilters)
      .populate('truck', 'immatriculation marque')
      .sort({ departDate: 1 });

    // Calculate summary
    const totalDepenses = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalRevenus = missions.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const solde = totalRevenus - totalDepenses;

    // Determine if a specific truck is selected
    let truckInfo = null;
    if (camion) {
      truckInfo = await Truck.findById(camion);
    }

    // Prepare table headers and column widths
    let headers, colWidths;
    if (truckInfo) {
      headers = ['Date', 'Description', 'Dépense', 'Revenu', 'Bénéficiaire'];
      colWidths = [70, 140, 80, 80, 120];
    } else {
      headers = ['Date', 'Description', 'Dépense', 'Revenu', 'Bénéficiaire', 'Camion'];
      colWidths = [70, 120, 70, 70, 100, 90];
    }

    // Merge and sort all transactions
    const rows = [
      ...expenses.map(e => ({
        date: e.date,
        type: 'Dépense',
        description: e.typeDepense && e.typeDepense.name ? e.typeDepense.name : '',
        montant: -Math.abs(e.amount),
        beneficiaire: e.beneficiaire || '',
        camion: e.camion ? e.camion.immatriculation : '',
      })),
      ...missions.map(m => ({
        date: m.returnDate || m.departDate,
        type: 'Revenu',
        description: 'Mission',
        montant: m.revenue || 0,
        beneficiaire: '',
        camion: m.truck ? m.truck.immatriculation : '',
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Start PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
    doc.pipe(res);

    // Title and filters
    doc.fontSize(20).text('Relevé de Compte – Dépenses & Revenus', { align: 'center' });
    doc.moveDown();
    if (truckInfo) {
      doc.fontSize(14).text(`Camion: ${truckInfo.immatriculation} (${truckInfo.marque})`);
    } else {
      doc.fontSize(14).text('Tous les camions');
    }
    if (dateStart || dateEnd) {
      doc.fontSize(12).text(`Période: ${dateStart || '...'} à ${dateEnd || '...'}\n`);
    }
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const tableStartX = doc.page.margins.left;
    let currentX = tableStartX;
    doc.fontSize(11).fillColor('#fff').rect(tableStartX, tableTop, colWidths.reduce((a, b) => a + b), 22).fill('#2563eb');
    headers.forEach((header, i) => {
      doc.fillColor('#fff').text(header, currentX + 4, tableTop + 5, { width: colWidths[i], align: 'left' });
      currentX += colWidths[i];
    });
    doc.fillColor('#222');

    // Table rows
    let y = tableTop + 22;
    rows.forEach((row, idx) => {
      // Alternating row color
      if (idx % 2 === 0) {
        doc.rect(tableStartX, y, colWidths.reduce((a, b) => a + b), 20).fill('#f4f6fa');
      }
      doc.fillColor('#222');
      let colX = tableStartX;
      doc.text(formatDate(row.date), colX + 4, y + 4, { width: colWidths[0] - 4 });
      colX += colWidths[0];
      doc.text(row.description, colX + 4, y + 4, { width: colWidths[1] - 4 });
      colX += colWidths[1];
      // Dépense column
      doc.text(row.type === 'Dépense' ? formatAmount(Math.abs(row.montant)) : '', colX, y + 4, { width: colWidths[2] - 8, align: 'right' });
      colX += colWidths[2];
      // Revenu column
      doc.text(row.type === 'Revenu' ? formatAmount(row.montant) : '', colX, y + 4, { width: colWidths[3] - 8, align: 'right' });
      colX += colWidths[3];
      doc.text(row.beneficiaire, colX + 4, y + 4, { width: colWidths[4] - 4 });
      colX += colWidths[4];
      if (!truckInfo) {
        doc.text(row.camion, colX + 4, y + 4, { width: colWidths[5] - 4 });
        colX += colWidths[5];
      }
      y += 20;
    });

    // Table border
    doc.rect(tableStartX, tableTop, colWidths.reduce((a, b) => a + b), y - tableTop).stroke();

    // Summary
    doc.moveDown(2);
    doc.fontSize(12).fillColor('#222').text(`Total Dépenses: ${formatAmount(-totalDepenses)} MAD`, { continued: true });
    doc.text(`   Total Revenus: ${formatAmount(totalRevenus)} MAD`, { continued: true });
    doc.text(`   Solde: ${formatAmount(solde)} MAD`);

    doc.end();
  } catch (err) {
    res.status(500).send('Erreur lors de la génération du PDF');
  }
}; 