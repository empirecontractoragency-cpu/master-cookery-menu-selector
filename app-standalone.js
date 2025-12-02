// ===================================
// MASTER COOKERY MENU SELECTOR  
// Standalone Version with Logo
// ===================================

// Menu Data
const MENU_DATA = {
    "starters": ["Charcuterie Boards", "Chicken Winglets", "Chicken Strips", "Fruit Platter", "Chicken Skewers", "French Toast With Tuna Topping", "Meat Balls", "Samosa", "Spring Rolls", "Chicken & Mayo Rolls"],
    "meatCurry": ["Beef Curry", "Chicken Curry", "Chicken Briyani", "Mutton Curry", "Roast Chicken", "Roast Beef", "Roast Pork", "Grilled Hake", "Roast Lamb"],
    "extras": ["Chicken & Prawn Curry", "Butter Chicken Curry", "Rich Oxtail", "Mutton Briyani", "Fish Curry", "Sushi Platter"],
    "starches": ["Creamy Chicken & Mushroom Pasta", "Creamy Samp", "Isigwaqane", "Jeqe", "Samp & Beans", "Savoury Rice", "Plain Rice", "Mealie Bread"],
    "salads": ["Coleslaw", "Chakalaka", "Beetroot Salad", "3 Bean Salad", "Green Beans & Smoked Chicken", "Pasta Salad", "Greek Salad", "Cous Cous Summer Salad"],
    "vegetables": ["Baby Potatoes in Garlic Sauce", "Creamy Spinach", "Roasted Potatoes", "Roast Vegetables", "Honey Glazed Baby Carrots & Green Beans", "Cauliflower & Broccoli in Cheese Sauce", "Creamy Potato Bake", "Sweet Potato & Veg Roast"]
};

const appState = {
    currentPage: 'welcomePage',
    currentStep: 1,
    customerDetails: {},
    menuSelections: { starters: [], meatCurry: [], extras: [], starches: [], salads: [], vegetables: [] },
    generatedPdfBlob: null
};

const wizardSteps = [
    { step: 1, category: 'starters', title: 'Step 1: Starters (Included)', limit: null, description: 'All starters are included with your menu' },
    { step: 2, category: 'meatCurry', title: 'Step 2: Meat / Curry', limit: 3, description: 'Choose up to 3 options' },
    { step: 3, category: 'vegetables', title: 'Step 3: Vegetables', limit: 2, description: 'Choose up to 2 options' },
    { step: 4, category: 'starches', title: 'Step 4: Starches', limit: 3, description: 'Choose up to 3 options' },
    { step: 5, category: 'salads', title: 'Step 5: Salads', limit: 4, description: 'Choose up to 4 options' },
    { step: 6, category: 'extras', title: 'Step 6: Extras (Optional)', limit: null, description: 'Optional premium add-ons for your menu' }
];

function initApp() {
    appState.menuSelections.starters = [...MENU_DATA.starters];
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').setAttribute('min', today);
    document.getElementById('startBtn').addEventListener('click', () => navigateToPage('detailsPage'));
    document.getElementById('backToWelcomeBtn').addEventListener('click', () => navigateToPage('welcomePage'));
    document.getElementById('detailsForm').addEventListener('submit', handleDetailsSubmit);
    document.getElementById('wizardBackBtn').addEventListener('click', handleWizardBack);
    document.getElementById('wizardNextBtn').addEventListener('click', handleWizardNext);
    document.getElementById('backToWizardBtn').addEventListener('click', () => navigateToPage('wizardPage'));
    document.getElementById('generatePdfBtn').addEventListener('click', handleGeneratePdf);
    document.getElementById('downloadPdfBtn').addEventListener('click', handleDownloadPdf);
    document.getElementById('whatsappBtn').addEventListener('click', handleWhatsAppShare);
    document.getElementById('newSelectionBtn').addEventListener('click', handleNewSelection);
}

function navigateToPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    appState.currentPage = pageId;
    window.scrollTo(0, 0);
    if (pageId === 'wizardPage') renderWizardStep(appState.currentStep);
    else if (pageId === 'reviewPage') renderReviewPage();
}

function handleDetailsSubmit(e) {
    e.preventDefault();
    document.querySelectorAll('.form-error').forEach(err => err.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(inp => inp.classList.remove('error'));
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventLocation = document.getElementById('eventLocation').value.trim();
    const guestCount = document.getElementById('guestCount').value;
    let isValid = true;
    if (!fullName || fullName.length < 2) { showError('fullName', 'Please enter your full name'); isValid = false; }
    if (!phone || phone.length < 10) { showError('phone', 'Please enter a valid phone number'); isValid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Please enter a valid email'); isValid = false; }
    if (!eventType) { showError('eventType', 'Please select an event type'); isValid = false; }
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!eventDate || selectedDate < today) { showError('eventDate', 'Please select a future date'); isValid = false; }
    if (!eventLocation) { showError('eventLocation', 'Please enter the event location'); isValid = false; }
    if (!guestCount || guestCount < 1) { showError('guestCount', 'Please enter the number of guests'); isValid = false; }
    if (!isValid) return;
    appState.customerDetails = { fullName, phone, email, eventType, eventDate, eventLocation, guestCount: parseInt(guestCount) };
    appState.currentStep = 1;
    navigateToPage('wizardPage');
}

function showError(fieldId, message) {
    document.getElementById(fieldId).classList.add('error');
    const error = document.getElementById(fieldId + 'Error');
    error.textContent = message;
    error.classList.add('show');
}

function renderWizardStep(step) {
    const config = wizardSteps[step - 1];
    const category = config.category;
    updateWizardProgress(step);
    document.getElementById('wizardTitle').textContent = config.title;
    const limitEl = document.getElementById('selectionLimit');
    if (config.limit) {
        const selected = appState.menuSelections[category].length;
        limitEl.textContent = `${config.description} (${selected}/${config.limit} selected)`;
        limitEl.classList.toggle('warning', selected >= config.limit);
    } else {
        limitEl.textContent = config.description;
        limitEl.classList.remove('warning');
    }
    renderMenuItems(category, config.limit);
    const backBtn = document.getElementById('wizardBackBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    backBtn.textContent = step === 1 ? '← Back to Details' : '← Previous';
    nextBtn.textContent = step === 6 ? 'Review Selection →' : 'Next →';
}

function renderMenuItems(category, limit) {
    const container = document.getElementById('menuItemsContainer');
    container.innerHTML = '';
    MENU_DATA[category].forEach((item, index) => {
        const isSelected = appState.menuSelections[category].includes(item);
        const itemEl = document.createElement('div');
        itemEl.className = `menu-item ${isSelected ? 'selected' : ''}`;
        itemEl.innerHTML = `<input type="checkbox" id="item-${category}-${index}" class="menu-item-checkbox" ${isSelected ? 'checked' : ''}><label for="item-${category}-${index}" class="menu-item-label"><div class="menu-item-checkmark"></div><span>${item}</span></label>`;
        itemEl.addEventListener('click', () => toggleMenuItem(category, item, limit));
        container.appendChild(itemEl);
    });
}

function toggleMenuItem(category, item, limit) {
    if (category === 'starters') {
        alert('All starters are included with your menu and cannot be removed.');
        return;
    }
    const selections = appState.menuSelections[category];
    const index = selections.indexOf(item);
    if (index > -1) {
        selections.splice(index, 1);
    } else {
        if (limit && selections.length >= limit) {
            alert(`You can only select up to ${limit} items in this category.`);
            return;
        }
        selections.push(item);
    }
    renderWizardStep(appState.currentStep);
}

function updateWizardProgress(step) {
    document.querySelectorAll('.wizard-step').forEach((stepEl, index) => {
        const stepNum = index + 1;
        stepEl.classList.remove('active', 'completed');
        if (stepNum === step) stepEl.classList.add('active');
        else if (stepNum < step) {
            stepEl.classList.add('completed');
            stepEl.querySelector('.wizard-step-number').textContent = '✓';
        } else {
            stepEl.querySelector('.wizard-step-number').textContent = stepNum;
        }
    });
    const progress = ((step - 1) / 5) * 100;
    document.getElementById('wizardProgressBar').style.width = `${progress}%`;
}

function handleWizardBack() {
    if (appState.currentStep === 1) navigateToPage('detailsPage');
    else { appState.currentStep--; renderWizardStep(appState.currentStep); }
}

function handleWizardNext() {
    if (appState.currentStep === 6) navigateToPage('reviewPage');
    else { appState.currentStep++; renderWizardStep(appState.currentStep); }
}

function renderReviewPage() {
    document.getElementById('reviewName').textContent = appState.customerDetails.fullName;
    document.getElementById('reviewPhone').textContent = appState.customerDetails.phone;
    document.getElementById('reviewEmail').textContent = appState.customerDetails.email;
    document.getElementById('reviewEventType').textContent = appState.customerDetails.eventType;
    document.getElementById('reviewEventDate').textContent = formatDate(appState.customerDetails.eventDate);
    document.getElementById('reviewEventLocation').textContent = appState.customerDetails.eventLocation;
    document.getElementById('reviewGuestCount').textContent = appState.customerDetails.guestCount;
    renderReviewMenuSection('reviewStarters', 'reviewStartersSection', appState.menuSelections.starters);
    renderReviewMenuSection('reviewMeat', 'reviewMeatSection', appState.menuSelections.meatCurry);
    renderReviewMenuSection('reviewExtras', 'reviewExtrasSection', appState.menuSelections.extras);
    renderReviewMenuSection('reviewStarches', 'reviewStarchesSection', appState.menuSelections.starches);
    renderReviewMenuSection('reviewSalads', 'reviewSaladsSection', appState.menuSelections.salads);
    renderReviewMenuSection('reviewVegetables', 'reviewVegetablesSection', appState.menuSelections.vegetables);
}

function renderReviewMenuSection(containerId, sectionId, items) {
    const container = document.getElementById(containerId);
    const section = document.getElementById(sectionId);
    if (items.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    container.innerHTML = '';
    items.forEach(item => {
        const tag = document.createElement('div');
        tag.className = 'review-menu-tag';
        tag.textContent = item;
        container.appendChild(tag);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function handleGeneratePdf() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const generateBtn = document.getElementById('generatePdfBtn');
    try {
        generateBtn.disabled = true;
        loadingOverlay.classList.add('show');
        loadingOverlay.querySelector('p').textContent = 'Generating your PDF...';
        const notes = document.getElementById('additionalNotes').value.trim();
        const pdfBytes = await createMenuPDF(notes);
        appState.generatedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        await new Promise(resolve => setTimeout(resolve, 500));
        navigateToPage('successPage');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        generateBtn.disabled = false;
        loadingOverlay.classList.remove('show');
    }
}

async function createMenuPDF(notes) {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const margin = 40;
    const orangeColor = rgb(0.95, 0.5, 0);
    const darkGray = rgb(0.2, 0.2, 0.2);

    // Header
    page.drawRectangle({ x: 0, y: height - 95, width, height: 95, color: orangeColor });

    // Load and embed logo from Base64 (loaded via logo.js)
    try {
        if (typeof LOGO_BASE64 !== 'undefined') {
            const logoBytes = Uint8Array.from(atob(LOGO_BASE64), c => c.charCodeAt(0));
            const logoImage = await pdfDoc.embedPng(logoBytes);
            const logoScale = 0.12;
            const logoDims = logoImage.scale(logoScale);

            page.drawImage(logoImage, {
                x: margin,
                y: height - 85,
                width: logoDims.width,
                height: logoDims.height,
            });

            const textX = margin + logoDims.width + 15;
            page.drawText('The Master Cookery', { x: textX, y: height - 45, size: 22, font: boldFont, color: rgb(1, 1, 1) });
            page.drawText('Mastering Taste, Every Time.', { x: textX, y: height - 68, size: 10, font: regularFont, color: rgb(1, 1, 1) });
        } else {
            throw new Error('LOGO_BASE64 not defined');
        }
    } catch (error) {
        console.warn('Logo failed to load:', error);
        page.drawText('The Master Cookery', { x: margin, y: height - 45, size: 22, font: boldFont, color: rgb(1, 1, 1) });
        page.drawText('Mastering Taste, Every Time.', { x: margin, y: height - 68, size: 10, font: regularFont, color: rgb(1, 1, 1) });
    }

    page.drawText('MENU SELECTION', { x: width - 240, y: height - 55, size: 24, font: boldFont, color: rgb(1, 1, 1) });

    const leftCol = margin;
    const rightCol = width / 2 + 10;
    let leftY = height - 120;

    // Customer Details - LARGER FONTS
    page.drawText('BILL TO:', { x: leftCol, y: leftY, size: 13, font: boldFont, color: orangeColor });
    leftY -= 22;
    page.drawText(appState.customerDetails.fullName, { x: leftCol, y: leftY, size: 11, font: regularFont, color: darkGray });
    leftY -= 16;
    page.drawText(appState.customerDetails.phone, { x: leftCol, y: leftY, size: 11, font: regularFont, color: darkGray });
    leftY -= 16;
    page.drawText(appState.customerDetails.email, { x: leftCol, y: leftY, size: 11, font: regularFont, color: darkGray });

    // Event Details - LARGER FONTS
    let rightY = height - 120;
    page.drawText('EVENT DETAILS', { x: rightCol, y: rightY, size: 13, font: boldFont, color: orangeColor });
    rightY -= 22;
    page.drawText(`Event Name: ${appState.customerDetails.fullName}`, { x: rightCol, y: rightY, size: 10, font: regularFont, color: darkGray });
    rightY -= 15;
    page.drawText(`Event Date: ${formatDate(appState.customerDetails.eventDate)}`, { x: rightCol, y: rightY, size: 10, font: regularFont, color: darkGray });
    rightY -= 15;
    page.drawText(`Location: ${appState.customerDetails.eventLocation}`, { x: rightCol, y: rightY, size: 10, font: regularFont, color: darkGray });
    rightY -= 15;
    page.drawText(`Type: ${appState.customerDetails.eventType}`, { x: rightCol, y: rightY, size: 10, font: regularFont, color: darkGray });
    rightY -= 15;
    page.drawText(`Guests: ${appState.customerDetails.guestCount}`, { x: rightCol, y: rightY, size: 10, font: regularFont, color: darkGray });

    // Menu Selection Header - LARGER FONT
    leftY -= 35;
    page.drawText('MENU SELECTION', { x: leftCol, y: leftY, size: 14, font: boldFont, color: darkGray });
    leftY -= 28;

    const addSection = (title, items, x, startY) => {
        if (items.length === 0) return startY;
        page.drawText(title, { x, y: startY, size: 11, font: boldFont, color: orangeColor });
        startY -= 16;
        items.forEach(item => {
            page.drawText(`• ${item}`, { x: x + 5, y: startY, size: 9, font: regularFont, color: darkGray });
            startY -= 13;
        });
        return startY - 10;
    };

    leftY = addSection('Starters (Included)', appState.menuSelections.starters, leftCol, leftY);
    leftY = addSection('Meat / Curry', appState.menuSelections.meatCurry, leftCol, leftY);
    leftY = addSection('Vegetables', appState.menuSelections.vegetables, leftCol, leftY);

    rightY = height - 260;
    rightY = addSection('Starches', appState.menuSelections.starches, rightCol, rightY);
    rightY = addSection('Salads', appState.menuSelections.salads, rightCol, rightY);
    rightY = addSection('Extras (Optional)', appState.menuSelections.extras, rightCol, rightY);

    if (notes) {
        const notesY = Math.min(leftY, rightY) - 15;
        if (notesY > 130) {
            page.drawText('Additional Notes:', { x: leftCol, y: notesY, size: 11, font: boldFont, color: orangeColor });
            let noteY = notesY - 16;
            const words = notes.split(' ');
            let line = '';
            words.forEach(word => {
                const testLine = line + word + ' ';
                const testWidth = regularFont.widthOfTextAtSize(testLine, 9);
                if (testWidth > width - (margin * 2)) {
                    if (noteY > 120) {
                        page.drawText(line, { x: leftCol + 5, y: noteY, size: 9, font: regularFont, color: darkGray });
                        noteY -= 13;
                    }
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            });
            if (line && noteY > 120) {
                page.drawText(line, { x: leftCol + 5, y: noteY, size: 9, font: regularFont, color: darkGray });
            }
        }
    }

    // IMPROVED FOOTER - Better spacing and hierarchy
    const footerHeight = 95;
    page.drawRectangle({ x: 0, y: 0, width, height: footerHeight, color: orangeColor });

    // Thank you message - centered and well spaced
    page.drawText('Thank You for Choosing', {
        x: width / 2 - 95,
        y: 60,
        size: 14,
        font: regularFont,
        color: rgb(1, 1, 1)
    });

    page.drawText('THE MASTER COOKERY', {
        x: width / 2 - 115,
        y: 38,
        size: 20,
        font: boldFont,
        color: rgb(1, 1, 1)
    });

    page.drawText('We look forward to making your event memorable!', {
        x: width / 2 - 145,
        y: 18,
        size: 11,
        font: regularFont,
        color: rgb(1, 1, 1)
    });

    return await pdfDoc.save();
}

function handleDownloadPdf() {
    if (!appState.generatedPdfBlob) {
        alert('No PDF available. Please generate your menu first.');
        return;
    }
    const url = URL.createObjectURL(appState.generatedPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MasterCookery_Menu_${appState.customerDetails.fullName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleWhatsAppShare() {
    const message = encodeURIComponent(`Hello Master Cookery! I've completed my menu selection for my ${appState.customerDetails.eventType} on ${formatDate(appState.customerDetails.eventDate)}.`);
    window.open(`https://wa.me/27123456789?text=${message}`, '_blank');
}

function handleNewSelection() {
    appState.currentStep = 1;
    appState.customerDetails = {};
    appState.menuSelections = { starters: [...MENU_DATA.starters], meatCurry: [], extras: [], starches: [], salads: [], vegetables: [] };
    appState.generatedPdfBlob = null;
    document.getElementById('detailsForm').reset();
    document.getElementById('additionalNotes').value = '';
    navigateToPage('welcomePage');
}

document.addEventListener('DOMContentLoaded', initApp);
