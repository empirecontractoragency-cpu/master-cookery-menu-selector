// ===================================
// DASHBOARD JAVASCRIPT
// Caterer Dashboard Logic
// ===================================

import {
    loginUser,
    logoutUser,
    onAuthChange,
    getAllSubmissions,
    searchSubmissions,
    filterSubmissionsByDate,
    markAsReviewed
} from './firebase-service.js';
import { generatePDF, downloadPDF } from './pdf-generator.js';

// State
let currentSubmissions = [];
let selectedSubmission = null;

// ===================================
// INITIALIZATION
// ===================================

function init() {
    setupEventListeners();

    // Check auth state
    onAuthChange((user) => {
        if (user) {
            showDashboard(user);
        } else {
            showLogin();
        }
    });
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filter
    document.getElementById('filterBtn').addEventListener('click', handleFilter);
    document.getElementById('clearFilterBtn').addEventListener('click', handleClearFilter);

    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn2').addEventListener('click', closeModal);
    document.getElementById('downloadSubmissionPdfBtn').addEventListener('click', handleDownloadSubmissionPdf);
    document.getElementById('toggleReviewedBtn').addEventListener('click', handleToggleReviewed);

    // Close modal on outside click
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') {
            closeModal();
        }
    });
}

// ===================================
// AUTHENTICATION
// ===================================

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    errorEl.classList.remove('show');

    try {
        showLoading(true);
        await loginUser(email, password);
        // Auth state change will trigger showDashboard
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'Invalid email or password. Please try again.';
        errorEl.classList.add('show');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await logoutUser();
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard(user) {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userEmail').textContent = user.email;

    loadSubmissions();
}

// ===================================
// SUBMISSIONS
// ===================================

async function loadSubmissions() {
    try {
        showLoading(true);
        const submissions = await getAllSubmissions();
        currentSubmissions = submissions;
        renderSubmissions(submissions);
        updateStats(submissions);
    } catch (error) {
        console.error('Error loading submissions:', error);
        alert('Error loading submissions. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

function renderSubmissions(submissions) {
    const tbody = document.getElementById('submissionsTableBody');

    if (submissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No submissions found</td></tr>';
        return;
    }

    tbody.innerHTML = submissions.map(submission => {
        const timestamp = submission.timestamp?.toDate?.() || new Date(submission.timestamp);
        const eventDate = new Date(submission.customerDetails?.eventDate);

        return `
      <tr>
        <td>${formatDateTime(timestamp)}</td>
        <td>${submission.customerDetails?.fullName || 'N/A'}</td>
        <td>${submission.customerDetails?.eventType || 'N/A'}</td>
        <td>${formatDate(eventDate)}</td>
        <td>${submission.customerDetails?.guestCount || 'N/A'}</td>
        <td>
          <span class="status-badge ${submission.reviewed ? 'status-reviewed' : 'status-pending'}">
            ${submission.reviewed ? 'Reviewed' : 'Pending'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick="viewSubmission('${submission.id}')">
              View
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

function updateStats(submissions) {
    const total = submissions.length;
    const reviewed = submissions.filter(s => s.reviewed).length;
    const pending = total - reviewed;

    document.getElementById('totalSubmissions').textContent = total;
    document.getElementById('reviewedSubmissions').textContent = reviewed;
    document.getElementById('pendingSubmissions').textContent = pending;
}

// ===================================
// SEARCH & FILTER
// ===================================

async function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        loadSubmissions();
        return;
    }

    try {
        showLoading(true);
        const results = await searchSubmissions(searchTerm);
        currentSubmissions = results;
        renderSubmissions(results);
        updateStats(results);
    } catch (error) {
        console.error('Search error:', error);
        alert('Error searching submissions.');
    } finally {
        showLoading(false);
    }
}

async function handleFilter() {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    try {
        showLoading(true);
        const results = await filterSubmissionsByDate(startDate, endDate);
        currentSubmissions = results;
        renderSubmissions(results);
        updateStats(results);
    } catch (error) {
        console.error('Filter error:', error);
        alert('Error filtering submissions.');
    } finally {
        showLoading(false);
    }
}

function handleClearFilter() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    loadSubmissions();
}

// ===================================
// SUBMISSION DETAIL MODAL
// ===================================

window.viewSubmission = function (submissionId) {
    const submission = currentSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    selectedSubmission = submission;
    renderSubmissionDetail(submission);
    openModal();
};

function renderSubmissionDetail(submission) {
    const { customerDetails, menuSelections, notes, reviewed } = submission;
    const timestamp = submission.timestamp?.toDate?.() || new Date(submission.timestamp);

    const html = `
    <div class="detail-section">
      <h3>Submission Info</h3>
      <div class="detail-item">
        <span class="detail-label">Submitted:</span>
        <span class="detail-value">${formatDateTime(timestamp)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge ${reviewed ? 'status-reviewed' : 'status-pending'}">
            ${reviewed ? 'Reviewed' : 'Pending'}
          </span>
        </span>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Customer Details</h3>
      <div class="detail-item">
        <span class="detail-label">Name:</span>
        <span class="detail-value">${customerDetails?.fullName || 'N/A'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Phone:</span>
        <span class="detail-value">${customerDetails?.phone || 'N/A'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${customerDetails?.email || 'N/A'}</span>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Event Details</h3>
      <div class="detail-item">
        <span class="detail-label">Event Type:</span>
        <span class="detail-value">${customerDetails?.eventType || 'N/A'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${formatDate(new Date(customerDetails?.eventDate))}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${customerDetails?.eventLocation || 'N/A'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Guests:</span>
        <span class="detail-value">${customerDetails?.guestCount || 'N/A'}</span>
      </div>
    </div>
    
    ${renderMenuSection('Starters', menuSelections?.starters)}
    ${renderMenuSection('Meat / Curry', menuSelections?.meatCurry)}
    ${renderMenuSection('Extras', menuSelections?.extras)}
    ${renderMenuSection('Starches', menuSelections?.starches)}
    ${renderMenuSection('Salads', menuSelections?.salads)}
    ${renderMenuSection('Vegetables', menuSelections?.vegetables)}
    
    ${notes ? `
      <div class="detail-section">
        <h3>Additional Notes</h3>
        <p>${notes}</p>
      </div>
    ` : ''}
  `;

    document.getElementById('modalBody').innerHTML = html;

    // Update toggle button text
    const toggleBtn = document.getElementById('toggleReviewedBtn');
    toggleBtn.textContent = reviewed ? 'Mark as Pending' : 'Mark as Reviewed';
}

function renderMenuSection(title, items) {
    if (!items || items.length === 0) return '';

    return `
    <div class="detail-section">
      <h3>${title}</h3>
      <div class="menu-tags">
        ${items.map(item => `<span class="menu-tag">${item}</span>`).join('')}
      </div>
    </div>
  `;
}

function openModal() {
    document.getElementById('detailModal').classList.add('show');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('show');
    selectedSubmission = null;
}

// ===================================
// MODAL ACTIONS
// ===================================

async function handleDownloadSubmissionPdf() {
    if (!selectedSubmission) return;

    try {
        showLoading(true);
        const pdfBlob = await generatePDF({
            customerDetails: selectedSubmission.customerDetails,
            menuSelections: selectedSubmission.menuSelections,
            notes: selectedSubmission.notes || ''
        });

        const customerName = selectedSubmission.customerDetails?.fullName?.replace(/\s+/g, '-') || 'Customer';
        downloadPDF(pdfBlob, `Menu-Selection-${customerName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleToggleReviewed() {
    if (!selectedSubmission) return;

    try {
        showLoading(true);
        const newStatus = !selectedSubmission.reviewed;
        await markAsReviewed(selectedSubmission.id, newStatus);

        // Update local state
        selectedSubmission.reviewed = newStatus;
        const index = currentSubmissions.findIndex(s => s.id === selectedSubmission.id);
        if (index > -1) {
            currentSubmissions[index].reviewed = newStatus;
        }

        // Re-render
        renderSubmissionDetail(selectedSubmission);
        renderSubmissions(currentSubmissions);
        updateStats(currentSubmissions);
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ===================================
// UTILITIES
// ===================================

function formatDate(date) {
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// ===================================
// START
// ===================================

init();
