// ===================================
// PDF GENERATOR MODULE
// Using pdf-lib for high-quality PDFs
// ===================================

import { PDFDocument, rgb, StandardFonts } from 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';

export async function generatePDF(data) {
    const { customerDetails, menuSelections, notes } = data;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add a page (A4 size)
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
    const { width, height } = page.getSize();

    // Colors
    const primaryColor = rgb(0.1, 0.1, 0.1);
    const goldColor = rgb(0.83, 0.69, 0.22);
    const textColor = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.9, 0.9, 0.9);

    let yPosition = height - 60;

    // ===================================
    // HEADER
    // ===================================

    // Load and embed logo
    try {
        const logoResponse = await fetch('assets/logo.png');
        const logoBytes = await logoResponse.arrayBuffer();
        const logoImage = await pdfDoc.embedPng(logoBytes);

        const logoScale = 0.15;
        const logoDims = logoImage.scale(logoScale);

        page.drawImage(logoImage, {
            x: (width - logoDims.width) / 2,
            y: yPosition - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
        });

        yPosition -= logoDims.height + 20;
    } catch (error) {
        console.error('Error loading logo:', error);
        // Continue without logo
    }

    // Title
    page.drawText('Menu Selection Summary', {
        x: width / 2 - 150,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: primaryColor,
    });

    yPosition -= 10;

    // Decorative line
    page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 2,
        color: goldColor,
    });

    yPosition -= 40;

    // ===================================
    // CUSTOMER DETAILS
    // ===================================

    yPosition = drawSection(page, 'Customer Details', yPosition, boldFont, regularFont, goldColor, primaryColor, textColor);

    yPosition = drawKeyValue(page, 'Name:', customerDetails.fullName, yPosition, boldFont, regularFont, textColor);
    yPosition = drawKeyValue(page, 'Phone:', customerDetails.phone, yPosition, boldFont, regularFont, textColor);
    yPosition = drawKeyValue(page, 'Email:', customerDetails.email, yPosition, boldFont, regularFont, textColor);

    yPosition -= 20;

    // ===================================
    // EVENT DETAILS
    // ===================================

    yPosition = drawSection(page, 'Event Details', yPosition, boldFont, regularFont, goldColor, primaryColor, textColor);

    yPosition = drawKeyValue(page, 'Event Type:', customerDetails.eventType, yPosition, boldFont, regularFont, textColor);
    yPosition = drawKeyValue(page, 'Date:', formatDate(customerDetails.eventDate), yPosition, boldFont, regularFont, textColor);
    yPosition = drawKeyValue(page, 'Location:', customerDetails.eventLocation, yPosition, boldFont, regularFont, textColor);
    yPosition = drawKeyValue(page, 'Number of Guests:', customerDetails.guestCount.toString(), yPosition, boldFont, regularFont, textColor);

    yPosition -= 20;

    // ===================================
    // MENU SELECTIONS
    // ===================================

    // Check if we need a new page
    if (yPosition < 200) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - 60;
    }

    yPosition = drawSection(page, 'Menu Selections', yPosition, boldFont, regularFont, goldColor, primaryColor, textColor);

    // Starters
    if (menuSelections.starters.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Starters', menuSelections.starters, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // Meat/Curry
    if (menuSelections.meatCurry.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Meat / Curry', menuSelections.meatCurry, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // Extras
    if (menuSelections.extras.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Extras', menuSelections.extras, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // Starches
    if (menuSelections.starches.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Starches', menuSelections.starches, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // Salads
    if (menuSelections.salads.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Salads', menuSelections.salads, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // Vegetables
    if (menuSelections.vegetables.length > 0) {
        yPosition = drawMenuCategory(page, pdfDoc, 'Vegetables', menuSelections.vegetables, yPosition, boldFont, regularFont, textColor, lightGray, width, height);
    }

    // ===================================
    // NOTES
    // ===================================

    if (notes) {
        // Check if we need a new page
        if (yPosition < 150) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - 60;
        }

        yPosition = drawSection(page, 'Additional Notes', yPosition, boldFont, regularFont, goldColor, primaryColor, textColor);

        const wrappedNotes = wrapText(notes, 80);
        wrappedNotes.forEach(line => {
            page.drawText(line, {
                x: 70,
                y: yPosition,
                size: 10,
                font: regularFont,
                color: textColor,
            });
            yPosition -= 15;
        });

        yPosition -= 10;
    }

    // ===================================
    // FOOTER
    // ===================================

    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
        // Contact info
        p.drawText('Master Cookery', {
            x: 50,
            y: 40,
            size: 10,
            font: boldFont,
            color: primaryColor,
        });

        p.drawText('Email: themastercookery@gmail.com', {
            x: 50,
            y: 25,
            size: 8,
            font: regularFont,
            color: textColor,
        });

        // Page number
        p.drawText(`Page ${index + 1} of ${pages.length}`, {
            x: width - 100,
            y: 25,
            size: 8,
            font: regularFont,
            color: textColor,
        });
    });

    // ===================================
    // SAVE PDF
    // ===================================

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return blob;
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function drawSection(page, title, yPosition, boldFont, regularFont, goldColor, primaryColor, textColor) {
    page.drawText(title, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: primaryColor,
    });

    yPosition -= 5;

    page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 250, y: yPosition },
        thickness: 1.5,
        color: goldColor,
    });

    return yPosition - 15;
}

function drawKeyValue(page, key, value, yPosition, boldFont, regularFont, textColor) {
    page.drawText(key, {
        x: 70,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: textColor,
    });

    page.drawText(value, {
        x: 200,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: textColor,
    });

    return yPosition - 18;
}

function drawMenuCategory(page, pdfDoc, categoryName, items, yPosition, boldFont, regularFont, textColor, lightGray, width, height) {
    // Check if we need a new page
    if (yPosition < 100) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - 60;
    }

    // Category name
    page.drawText(categoryName + ':', {
        x: 70,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: textColor,
    });

    yPosition -= 15;

    // Items
    items.forEach(item => {
        // Check if we need a new page
        if (yPosition < 50) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - 60;
        }

        // Bullet point
        page.drawText('•', {
            x: 85,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: textColor,
        });

        // Item text
        page.drawText(item, {
            x: 100,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: textColor,
        });

        yPosition -= 15;
    });

    return yPosition - 10;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });

    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }

    return lines;
}

export function downloadPDF(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
