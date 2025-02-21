import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Add this function to generate random particles
const drawParticles = (page: any, pageWidth: number, pageHeight: number, font: any) => {
  // Professional color palette
  const colors = [
    rgb(0.1, 0.2, 0.6), // Deep blue
    rgb(0.2, 0.6, 0.1), // Emerald green
    rgb(0.6, 0.1, 0.2), // Burgundy
    rgb(0.95, 0.75, 0.1), // Gold
    rgb(0.2, 0.2, 0.4) // Navy
  ];

  // Draw corner squares
  const cornerSize = 50;
  const cornerMargin = 20;
  const squareSize = 10;
  const squareSpacing = 5;

  // Top-left corner
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      page.drawSquare({
        x: cornerMargin + i * (squareSize + squareSpacing),
        y: pageHeight - cornerMargin - j * (squareSize + squareSpacing),
        size: squareSize,
        color: colors[(i + j) % colors.length],
        opacity: 0.3,
        borderWidth: 0
      });
    }
  }

  // Top-right corner
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      page.drawSquare({
        x: pageWidth - cornerMargin - i * (squareSize + squareSpacing),
        y: pageHeight - cornerMargin - j * (squareSize + squareSpacing),
        size: squareSize,
        color: colors[(i + j) % colors.length],
        opacity: 0.3,
        borderWidth: 0
      });
    }
  }

  // Bottom-left corner
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      page.drawSquare({
        x: cornerMargin + i * (squareSize + squareSpacing),
        y: cornerMargin + j * (squareSize + squareSpacing),
        size: squareSize,
        color: colors[(i + j) % colors.length],
        opacity: 0.3,
        borderWidth: 0
      });
    }
  }

  // Bottom-right corner
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      page.drawSquare({
        x: pageWidth - cornerMargin - i * (squareSize + squareSpacing),
        y: cornerMargin + j * (squareSize + squareSpacing),
        size: squareSize,
        color: colors[(i + j) % colors.length],
        opacity: 0.3,
        borderWidth: 0
      });
    }
  }
};

export const generateCertificatePDF = async ({
  studentName,
  courseName,
  date,
}: {
  studentName: string;
  courseName: string;
  date: string;
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([850, 600]); // Slightly wider for a modern look

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // Draw background rectangle (moved to be first)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.95, 0.95, 0.95),
    opacity: 0.3,
    borderWidth: 0
  });

  // Add particles
  drawParticles(page, pageWidth, pageHeight, font);

  // Placeholder for logo (Aligned to the left)
  page.drawText('LOGO PLACEHOLDER', {
    x: 50,
    y: pageHeight - 50,
    size: 16,
    font: boldFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Certificate Title (Improved centering)
  const titleText = 'Certificate of Completion';
  const titleWidth = titleFont.widthOfTextAtSize(titleText, 32);
  page.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 100,
    size: 32,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Certificate Body (Improved centering)
  const bodyText = 'This is to certify that';
  const bodyWidth = font.widthOfTextAtSize(bodyText, 20);
  page.drawText(bodyText, {
    x: (pageWidth - bodyWidth) / 2,
    y: pageHeight - 180,
    size: 20,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Student Name (Improved centering and styling)
  const nameWidth = boldFont.widthOfTextAtSize(studentName, 30);
  page.drawText(studentName, {
    x: (pageWidth - nameWidth) / 2,
    y: pageHeight - 220,
    size: 30,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.6),
  });

  // Course Completion Text (Improved centering)
  const completionText = 'has successfully completed the Course';
  const completionWidth = font.widthOfTextAtSize(completionText, 20);
  page.drawText(completionText, {
    x: (pageWidth - completionWidth) / 2,
    y: pageHeight - 260,
    size: 20,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Course Name (Improved centering and styling)
  const courseText = `"${courseName}"`;
  const courseWidth = boldFont.widthOfTextAtSize(courseText, 26);
  page.drawText(courseText, {
    x: (pageWidth - courseWidth) / 2,
    y: pageHeight - 300,
    size: 26,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.6),
  });

  // Date (Improved centering)
  const dateText = `Awarded on: ${date}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 18);
  page.drawText(dateText, {
    x: (pageWidth - dateWidth) / 2,
    y: pageHeight - 360,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // // Signature Text
  // page.drawText('Authorized Signature', {
  //   x: 50,
  //   y: 60,
  //   size: 16,
  //   font,
  //   color: rgb(0.1, 0.1, 0.1),
  // });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
};
