// ===================================
// MASTER COOKERY MENU SELECTOR
// Main Application Logic
// ===================================

import { generatePDF, downloadPDF } from './pdf-generator.js';
import { sendEmails } from './email-service.js';
import { saveSubmission } from './firebase-service.js';

// Application State
const state = {
  currentPage: 'welcomePage',
  currentStep: 1,
  customerDetails: {},
  menuSelections: {
    starters: [],
    meatCurry: [],
    extras: [],
    starches: [],
    salads: [],
    vegetables: []
  },
  menuData: null,
  generatedPdfBlob: null
};

// Wizard Configuration
const wizardSteps = [
  { 
    step: 1, 
    category: 'starters', 
    title: 'Step 1: Starters',
    limit: null,
    description: 'Select your favorite starters'
  },
  { 
    step: 2, 
    category: 'meatCurry', 
    title: 'Step 2: Meat / Curry',
    limit: 3,
    description: 'Choose up to 3 options'
  },
  { 
    step: 3, 
    category: 'extras', 
    title: 'Step 3: Extras',
    limit: null,
    description: 'Select additional items'
  },
  { 
    step: 4, 
    category: 'starches', 
    title: 'Step 4: Starches',
    limit: 3,
    description: 'Choose up to 3 options'
  },
  { 
    step: 5, 
    category: 'salads', 
    title: 'Step 5: Salads',
    limit: 4,
    description: 'Choose up to 4 options'
  },
  { 
    step: 6, 
    category: 'vegetables', 
    title: 'Step 6: Vegetables',
    limit: 2,
    description: 'Choose up to 2 options'
  }
];

// ===================================
// INITIALIZATION
// ===================================

async function init() {
  try {
    // Load menu data
    const response = await fetch('menu-data.json');
    state.menuData = await response.json();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set minimum date for event date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').setAttribute('min', today);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    alert('Error loading menu data. Please refresh the page.');
  }
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
  // Welcome Page
  document.getElementById('startBtn').addEventListener('click', () => {
    navigateToPage('detailsPage');
  });
  
  // Details Page
  document.getElementById('backToWelcomeBtn').addEventListener('click', () => {
    navigateToPage('welcomePage');
  });
  
  document.getElementById('detailsForm').addEventListener('submit', handleDetailsSubmit);
  
  // Wizard Page
  document.getElementById('wizardBackBtn').addEventListener('click', handleWizardBack);
  document.getElementById('wizardNextBtn').addEventListener('click', handleWizardNext);
  
  // Review Page
  document.getElementById('backToWizardBtn').addEventListener('click', () => {
    navigateToPage('wizardPage');
  });
  
  document.getElementById('generatePdfBtn').addEventListener('click', handleGeneratePdf);
  
  // Success Page
  document.getElementById('downloadPdfBtn').addEventListener('click', handleDownloadPdf);
  document.getElementById('whatsappBtn').addEventListener('click', handleWhatsAppShare);
  document.getElementById('newSelectionBtn').addEventListener('click', handleNewSelection);
}

// ===================================
// NAVIGATION
// ===================================

function navigateToPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  document.getElementById(pageId).classList.add('active');
  state.currentPage = pageId;
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Page-specific actions
  if (pageId === 'wizardPage') {
    renderWizardStep(state.currentStep);
  } else if (pageId === 'reviewPage') {
    renderReviewPage();
  }
}

// ===================================
// CUSTOMER DETAILS FORM
// ===================================

function handleDetailsSubmit(e) {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach(error => {
    error.classList.remove('show');
  });
  document.querySelectorAll('.form-input, .form-select').forEach(input => {
    input.classList.remove('error');
  });
  
  // Validate form
  let isValid = true;
  
  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const eventType = document.getElementById('eventType').value;
  const eventDate = document.getElementById('eventDate').value;
  const eventLocation = document.getElementById('eventLocation').value.trim();
  const guestCount = document.getElementById('guestCount').value;
  
  // Validate full name
  if (!fullName || fullName.length < 2) {
    showError('fullName', 'Please enter your full name');
    isValid = false;
  }
  
  // Validate phone
  if (!phone || phone.length < 10) {
    showError('phone', 'Please enter a valid phone number');
    isValid = false;
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showError('email', 'Please enter a valid email address');
    isValid = false;
  }
  
  // Validate event type
  if (!eventType) {
    showError('eventType', 'Please select an event type');
    isValid = false;
  }
  
  // Validate event date (must be future)
  const selectedDate = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!eventDate || selectedDate < today) {
    showError('eventDate', 'Please select a future date');
    isValid = false;
  }
  
  // Validate location
  if (!eventLocation) {
    showError('eventLocation', 'Please enter the event location');
    isValid = false;
  }
  
  // Validate guest count
  if (!guestCount || guestCount < 1) {
    showError('guestCount', 'Please enter the number of guests');
    isValid = false;
  }
  
  if (!isValid) {
    return;
  }
  
  // Save to state
  state.customerDetails = {
    fullName,
    phone,
    email,
    eventType,
    eventDate,
    eventLocation,
    guestCount: parseInt(guestCount)
  };
  
  // Navigate to wizard
  state.currentStep = 1;
  navigateToPage('wizardPage');
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + 'Error');
  
  input.classList.add('error');
  error.textContent = message;
  error.classList.add('show');
}

// ===================================
// WIZARD
// ===================================

function renderWizardStep(step) {
  const config = wizardSteps[step - 1];
  const category = config.category;
  
  // Update progress bar
  updateWizardProgress(step);
  
  // Update title
  document.getElementById('wizardTitle').textContent = config.title;
  
  // Update selection limit message
  const limitEl = document.getElementById('selectionLimit');
  if (config.limit) {
    const selected = state.menuSelections[category].length;
    limitEl.textContent = `${config.description} (${selected}/${config.limit} selected)`;
    limitEl.classList.toggle('warning', selected >= config.limit);
  } else {
    limitEl.textContent = config.description;
    limitEl.classList.remove('warning');
  }
  
  // Render menu items
  renderMenuItems(category, config.limit);
  
  // Update buttons
  const backBtn = document.getElementById('wizardBackBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  
  if (step === 1) {
    backBtn.textContent = '← Back to Details';
  } else {
    backBtn.textContent = '← Previous';
  }
  
  if (step === 6) {
    nextBtn.textContent = 'Review Selection →';
  } else {
    nextBtn.textContent = 'Next →';
  }
}

function renderMenuItems(category, limit) {
  const container = document.getElementById('menuItemsContainer');
  container.innerHTML = '';
  
  const items = state.menuData[category];
  
  items.forEach((item, index) => {
    const isSelected = state.menuSelections[category].includes(item);
    
    const itemEl = document.createElement('div');
    itemEl.className = `menu-item ${isSelected ? 'selected' : ''}`;
    itemEl.innerHTML = `
      <input type="checkbox" 
             id="item-${category}-${index}" 
             class="menu-item-checkbox"
             ${isSelected ? 'checked' : ''}>
      <label for="item-${category}-${index}" class="menu-item-label">
        <div class="menu-item-checkmark"></div>
        <span>${item}</span>
      </label>
    `;
    
    itemEl.addEventListener('click', () => {
      toggleMenuItem(category, item, limit);
    });
    
    container.appendChild(itemEl);
  });
}

function toggleMenuItem(category, item, limit) {
  const selections = state.menuSelections[category];
  const index = selections.indexOf(item);
  
  if (index > -1) {
    // Remove item
    selections.splice(index, 1);
  } else {
    // Add item (check limit)
    if (limit && selections.length >= limit) {
      alert(`You can only select up to ${limit} items in this category.`);
      return;
    }
    selections.push(item);
  }
  
  // Re-render
  renderWizardStep(state.currentStep);
}

function updateWizardProgress(step) {
  // Update step indicators
  document.querySelectorAll('.wizard-step').forEach((stepEl, index) => {
    const stepNum = index + 1;
    stepEl.classList.remove('active', 'completed');
    
    if (stepNum === step) {
      stepEl.classList.add('active');
    } else if (stepNum < step) {
      stepEl.classList.add('completed');
      stepEl.querySelector('.wizard-step-number').textContent = '✓';
    } else {
      stepEl.querySelector('.wizard-step-number').textContent = stepNum;
    }
  });
  
  // Update progress bar
  const progress = ((step - 1) / 5) * 100;
  document.getElementById('wizardProgressBar').style.width = `${progress}%`;
}

function handleWizardBack() {
  if (state.currentStep === 1) {
    navigateToPage('detailsPage');
  } else {
    state.currentStep--;
    renderWizardStep(state.currentStep);
  }
}

function handleWizardNext() {
  if (state.currentStep === 6) {
    navigateToPage('reviewPage');
  } else {
    state.currentStep++;
    renderWizardStep(state.currentStep);
  }
}

// ===================================
// REVIEW PAGE
// ===================================

function renderReviewPage() {
  // Customer details
  document.getElementById('reviewName').textContent = state.customerDetails.fullName;
  document.getElementById('reviewPhone').textContent = state.customerDetails.phone;
  document.getElementById('reviewEmail').textContent = state.customerDetails.email;
  
  // Event details
  document.getElementById('reviewEventType').textContent = state.customerDetails.eventType;
  document.getElementById('reviewEventDate').textContent = formatDate(state.customerDetails.eventDate);
  document.getElementById('reviewEventLocation').textContent = state.customerDetails.eventLocation;
  document.getElementById('reviewGuestCount').textContent = state.customerDetails.guestCount;
  
  // Menu selections
  renderReviewMenuSection('reviewStarters', 'reviewStartersSection', state.menuSelections.starters);
  renderReviewMenuSection('reviewMeat', 'reviewMeatSection', state.menuSelections.meatCurry);
  renderReviewMenuSection('reviewExtras', 'reviewExtrasSection', state.menuSelections.extras);
  renderReviewMenuSection('reviewStarches', 'reviewStarchesSection', state.menuSelections.starches);
  renderReviewMenuSection('reviewSalads', 'reviewSaladsSection', state.menuSelections.salads);
  renderReviewMenuSection('reviewVegetables', 'reviewVegetablesSection', state.menuSelections.vegetables);
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
  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// ===================================
// PDF GENERATION
// ===================================

async function handleGeneratePdf() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const generateBtn = document.getElementById('generatePdfBtn');
  
  try {
    generateBtn.disabled = true;
    loadingOverlay.classList.add('show');
    
    // Get additional notes
    const notes = document.getElementById('additionalNotes').value.trim();
    
    // Generate PDF
    const pdfBlob = await generatePDF({
      customerDetails: state.customerDetails,
      menuSelections: state.menuSelections,
      notes
    });
    
    state.generatedPdfBlob = pdfBlob;
    
    // Save to Firebase
    const submissionId = await saveSubmission({
      customerDetails: state.customerDetails,
      menuSelections: state.menuSelections,
      notes,
      timestamp: new Date().toISOString()
    });
    
    // Send emails
    await sendEmails({
      customerDetails: state.customerDetails,
      menuSelections: state.menuSelections,
      notes,
      pdfBlob
    });
    
    // Navigate to success page
    navigateToPage('successPage');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating your PDF. Please try again.');
  } finally {
    generateBtn.disabled = false;
    loadingOverlay.classList.remove('show');
  }
}

// ===================================
// SUCCESS PAGE ACTIONS
// ===================================

function handleDownloadPdf() {
  if (state.generatedPdfBlob) {
    downloadPDF(state.generatedPdfBlob, 'Master-Cookery-Menu-Selection.pdf');
  }
}

function handleWhatsAppShare() {
  const message = encodeURIComponent(
    `Hello Master Cookery! I've completed my menu selection for my ${state.customerDetails.eventType} on ${formatDate(state.customerDetails.eventDate)}. Please find my PDF attached.`
  );
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/27123456789?text=${message}`;
  window.open(whatsappUrl, '_blank');
  
  // Also trigger download so they can attach it
  handleDownloadPdf();
}

function handleNewSelection() {
  // Reset state
  state.currentStep = 1;
  state.customerDetails = {};
  state.menuSelections = {
    starters: [],
    meatCurry: [],
    extras: [],
    starches: [],
    salads: [],
    vegetables: []
  };
  state.generatedPdfBlob = null;
  
  // Clear form
  document.getElementById('detailsForm').reset();
  document.getElementById('additionalNotes').value = '';
  
  // Navigate to welcome
  navigateToPage('welcomePage');
}

// ===================================
// START APP
// ===================================

init();
