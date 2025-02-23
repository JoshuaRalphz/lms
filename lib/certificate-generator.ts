import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { v4 as uuid } from 'uuid';

// Add this function to generate random particles
const drawParticles = (page: any, pageWidth: number, pageHeight: number) => {
  const colors = [
    rgb(0.1, 0.2, 0.6), // Deep blue
    rgb(0.2, 0.6, 0.1), // Emerald green
    rgb(0.6, 0.1, 0.2), // Burgundy
    rgb(0.95, 0.75, 0.1), // Gold
    rgb(0.2, 0.2, 0.4) // Navy
  ];

  // Draw decorative border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: pageWidth - 40,
    height: pageHeight - 40,
    borderWidth: 2,
    borderColor: colors[0],
    opacity: 0.2
  });

  // Draw decorative corner elements
  const drawCorner = (x: number, y: number) => {
    for (let i = 0; i < 5; i++) {
      page.drawCircle({
        x: x + i * 10,
        y: y + i * 10,
        size: 3 + i * 2,
        color: colors[i % colors.length],
        opacity: 0.3
      });
    }
  };

  drawCorner(30, 30); // Top-left
  drawCorner(pageWidth - 30, 30); // Top-right
  drawCorner(30, pageHeight - 30); // Bottom-left
  drawCorner(pageWidth - 30, pageHeight - 30); // Bottom-right
};

export const generateCertificatePDF = async ({
  studentName,
  courseName,
  date,
  certificateId,
  verificationCode
}: {
  studentName: string;
  courseName: string;
  date: string;
  certificateId: string;
  verificationCode: string;
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([850, 600]);

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const decorativeFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // Draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderWidth: 0
  });

  // Add decorative elements
  drawParticles(page, pageWidth, pageHeight);

  // Certificate Title
  const titleText = 'Certificate of Completion';
  const titleWidth = titleFont.widthOfTextAtSize(titleText, 36);
  page.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 100,
    size: 36,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Certificate Body
  const bodyText = 'This is to certify that';
  const bodyWidth = font.widthOfTextAtSize(bodyText, 24);
  page.drawText(bodyText, {
    x: (pageWidth - bodyWidth) / 2,
    y: pageHeight - 180,
    size: 24,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Student Name
  const nameWidth = boldFont.widthOfTextAtSize(studentName, 36);
  page.drawText(studentName, {
    x: (pageWidth - nameWidth) / 2,
    y: pageHeight - 240,
    size: 36,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.6),
  });

  // Course Completion Text
  const completionText = 'has successfully completed the course';
  const completionWidth = font.widthOfTextAtSize(completionText, 24);
  page.drawText(completionText, {
    x: (pageWidth - completionWidth) / 2,
    y: pageHeight - 300,
    size: 24,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Course Name
  const courseText = `"${courseName}"`;
  const courseWidth = boldFont.widthOfTextAtSize(courseText, 28);
  page.drawText(courseText, {
    x: (pageWidth - courseWidth) / 2,
    y: pageHeight - 360,
    size: 28,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.6),
  });

  // Date
  const dateText = `Awarded on: ${date}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 18);
  page.drawText(dateText, {
    x: (pageWidth - dateWidth) / 2,
    y: pageHeight - 420,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Certificate ID
  const idText = `Certificate ID: ${certificateId}`;
  const idWidth = decorativeFont.widthOfTextAtSize(idText, 12);
  page.drawText(idText, {
    x: (pageWidth - idWidth) / 2,
    y: 50,
    size: 12,
    font: decorativeFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  const instructionsText = "Verify this certificate at your dashboard";
  const instructionsWidth = decorativeFont.widthOfTextAtSize(instructionsText, 10);
  page.drawText(instructionsText, {
    x: (pageWidth - instructionsWidth) / 2,
    y: 30,
    size: 10,
    font: decorativeFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
};
