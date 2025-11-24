const PDFDocument = require('pdfkit');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');

// Helper function to create certificate PDF and return buffer
const createCertificatePDF = async (request, certificateId, res = null) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    
    // Create PDF with landscape orientation
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    // If res is provided, pipe to response (for direct download)
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="BloodDonationCertificate_${certificateId}.pdf"`);
      doc.pipe(res);
    } else {
      // Otherwise, collect buffers
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    }

    try {
      // Generate PDF content
      generateCertificateContent(doc, request, certificateId);
      
      // Finalize PDF
      doc.end();
      
      // If res is provided, the response will be handled by doc.pipe(res)
      // Otherwise, resolve with buffer
      if (!res) {
        // The buffer will be resolved in the 'end' event handler above
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Extract the content generation logic
const generateCertificateContent = (doc, request, certificateId) => {
  // Page dimensions for landscape A4
  const pageWidth = 842;
  const pageHeight = 595;
  const centerX = pageWidth / 2;

  // Colors
  const maroon = '#6B1F1F';
  const gold = '#D4AF37';
  const offWhite = '#FAF9F6';
  const lightGold = '#F4E4C1';
  const textGray = '#555555';
  const lightGray = '#777777';

  // ========== BACKGROUND ==========
  doc.rect(0, 0, pageWidth, pageHeight).fill(offWhite);

  // ========== WATERMARK ==========
  doc.save();
  doc.fontSize(100)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .opacity(0.03)
    .text('BloodLink', 0, pageHeight / 2 - 30, { width: pageWidth, align: 'center' });
  doc.restore();
  doc.opacity(1);

  // ========== BORDER ==========
  // Outer maroon border
  doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
    .lineWidth(2.5)
    .stroke(maroon);

  // Inner gold border
  doc.rect(42, 42, pageWidth - 84, pageHeight - 84)
    .lineWidth(1.5)
    .stroke(gold);

  // Corner decorative elements
  const corners = [
    [50, 50], [pageWidth - 50, 50],
    [50, pageHeight - 50], [pageWidth - 50, pageHeight - 50]
  ];
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 6).fill(maroon);
    doc.circle(x, y, 3.5).fill(gold);
  });

  // ========== HEADER SECTION ==========
  let currentY = 80;

  // Main title "CERTIFICATE"
  doc.fontSize(44)
    .font('Times-Bold')
    .fillColor(maroon)
    .text('CERTIFICATE', 0, currentY, { 
      width: pageWidth, 
      align: 'center',
      characterSpacing: 4
    });

  currentY += 50;

  // Subtitle "of Appreciation"
  doc.fontSize(20)
    .font('Times-Italic')
    .fillColor(gold)
    .text('of Appreciation', 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  currentY += 28;

  // Decorative underline
  doc.moveTo(centerX - 120, currentY)
    .lineTo(centerX + 120, currentY)
    .lineWidth(1)
    .stroke(gold);

  currentY += 25;

  // ========== RECIPIENT SECTION ==========
  // "This certificate is proudly presented to"
  doc.fontSize(12)
    .font('Helvetica')
    .fillColor(textGray)
    .text('This certificate is proudly presented to', 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  currentY += 25;

  // Donor name (large and prominent)
  doc.fontSize(34)
    .font('Times-Bold')
    .fillColor(maroon)
    .text(request.donor.fullName, 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  currentY += 42;

  // Blood group inline with separator
  doc.fontSize(13)
    .font('Helvetica')
    .fillColor(textGray);
  
  const bloodGroupText = `Blood Group: `;
  const bloodGroupValue = request.bloodGroup;
  
  // Measure text to center it properly
  const textWidth = doc.widthOfString(bloodGroupText) + doc.widthOfString(bloodGroupValue) + 10;
  const startX = centerX - (textWidth / 2);
  
  doc.text(bloodGroupText, startX, currentY, { continued: true })
    .fillColor(gold)
    .font('Helvetica-Bold')
    .text(' • ', { continued: true })
    .fillColor(maroon)
    .font('Times-Bold')
    .fontSize(15)
    .text(bloodGroupValue);

  currentY += 30;

  // ========== MESSAGE SECTION ==========
  doc.fontSize(12)
    .font('Helvetica')
    .fillColor(textGray)
    .text('For the noble act of voluntary blood donation contributing to saving lives.', 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  currentY += 25;

  // Donation date
  doc.fontSize(13)
    .font('Times-Bold')
    .fillColor(maroon)
    .text(`Donation completed on ${new Date(request.updatedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  currentY += 25;

  // Certificate ID
  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(lightGray)
    .text(`Certificate No: ${certificateId}`, 0, currentY, { 
      width: pageWidth, 
      align: 'center' 
    });

  // ========== BENEFIT RIBBON ==========
  const ribbonY = 420;
  const ribbonHeight = 45;
  const ribbonWidth = 500;

  // Gold ribbon background
  doc.rect(centerX - (ribbonWidth / 2), ribbonY, ribbonWidth, ribbonHeight)
    .fill(lightGold)
    .stroke(gold)
    .lineWidth(1.5)
    .fillAndStroke(lightGold, gold);

  // Benefit text
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(maroon)
    .text('Benefit: FREE BLOOD (1 unit) valid for one year', 0, ribbonY + 10, { 
      width: pageWidth, 
      align: 'center' 
    });

  doc.fontSize(8)
    .font('Helvetica')
    .fillColor(textGray)
    .text('Applicable for donor and immediate family members', 0, ribbonY + 26, { 
      width: pageWidth, 
      align: 'center' 
    });

  // ========== FOOTER SECTION ==========
  const footerY = 490;
  const leftMargin = 90;
  const rightMargin = pageWidth - 240;

  // Left: Hospital information
  doc.fontSize(11)
    .font('Times-Bold')
    .fillColor(maroon)
    .text('Government Hospital Una', leftMargin, footerY, { 
      width: 200, 
      align: 'left' 
    });

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(textGray)
    .text('Himachal Pradesh, India', leftMargin, footerY + 16, { 
      width: 200, 
      align: 'left' 
    });

  // Right: Signature line
  doc.moveTo(rightMargin, footerY + 10)
    .lineTo(rightMargin + 150, footerY + 10)
    .lineWidth(1)
    .stroke(lightGray);

  doc.fontSize(9)
    .font('Helvetica-Oblique')
    .fillColor(lightGray)
    .text('Authorized Signature', rightMargin, footerY + 18, { 
      width: 150, 
      align: 'center' 
    });

  // ========== BRAND FOOTER ==========
  doc.fontSize(10)
    .font('Times-Bold')
    .fillColor(maroon)
    .text('BLOODLINK UNA', 0, 500, { 
      width: pageWidth, 
      align: 'center',
      characterSpacing: 2
    });

  doc.fontSize(8)
    .font('Helvetica-Oblique')
    .fillColor(gold)
    .text('Connecting Hearts • Saving Lives', 0, 513, { 
      width: pageWidth, 
      align: 'center' 
    });
};

const generateCertificate = async (req, res) => {
  const { requestId } = req.params;

  try {
    // Fetch the blood request with donor details
    const request = await BloodRequest.findById(requestId).populate('donor');

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.status !== 'Donation Completed') {
      return res.status(400).json({ message: 'Certificate can only be generated for completed donations.' });
    }

    // Use stored certificate ID or generate one if not present
    const certificateId = request.certificateId || `BLU-${request._id.toString().slice(-8).toUpperCase()}-${new Date().getFullYear()}`;

    // Generate and send PDF
    await createCertificatePDF(request, certificateId, res);

  } catch (error) {
    console.error('Error generating certificate:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error while generating certificate.', error: error.message });
    }
  }
};

module.exports = { generateCertificate, createCertificatePDF };