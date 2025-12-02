// ===================================
// EMAIL SERVICE MODULE
// Using EmailJS for email delivery
// ===================================

import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

// EmailJS Configuration
// IMPORTANT: Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',
    templateIdCustomer: 'YOUR_CUSTOMER_TEMPLATE_ID',
    templateIdCaterer: 'YOUR_CATERER_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY'
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

export async function sendEmails(data) {
    const { customerDetails, menuSelections, notes, pdfBlob } = data;

    // Convert PDF to base64 for email attachment
    const pdfBase64 = await blobToBase64(pdfBlob);

    try {
        // Send email to customer
        await sendCustomerEmail(customerDetails, menuSelections, notes, pdfBase64);

        // Send email to caterer
        await sendCatererEmail(customerDetails, menuSelections, notes, pdfBase64);

        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        throw error;
    }
}

async function sendCustomerEmail(customerDetails, menuSelections, notes, pdfBase64) {
    const templateParams = {
        to_email: customerDetails.email,
        to_name: customerDetails.fullName,
        event_type: customerDetails.eventType,
        event_date: formatDate(customerDetails.eventDate),
        event_location: customerDetails.eventLocation,
        guest_count: customerDetails.guestCount,
        menu_summary: formatMenuSummary(menuSelections),
        notes: notes || 'None',
        pdf_attachment: pdfBase64
    };

    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateIdCustomer,
            templateParams
        );
        console.log('Customer email sent:', response);
    } catch (error) {
        console.error('Error sending customer email:', error);
        throw error;
    }
}

async function sendCatererEmail(customerDetails, menuSelections, notes, pdfBase64) {
    const templateParams = {
        customer_name: customerDetails.fullName,
        customer_phone: customerDetails.phone,
        customer_email: customerDetails.email,
        event_type: customerDetails.eventType,
        event_date: formatDate(customerDetails.eventDate),
        event_location: customerDetails.eventLocation,
        guest_count: customerDetails.guestCount,
        menu_summary: formatMenuSummary(menuSelections),
        notes: notes || 'None',
        pdf_attachment: pdfBase64
    };

    try {
        // Send to first caterer email
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateIdCaterer,
            {
                ...templateParams,
                to_email: 'themastercookery@gmail.com'
            }
        );

        // Send to second caterer email
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateIdCaterer,
            {
                ...templateParams,
                to_email: 'empirecontractoragency@gmail.com'
            }
        );

        console.log('Caterer emails sent');
    } catch (error) {
        console.error('Error sending caterer emails:', error);
        throw error;
    }
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function formatMenuSummary(menuSelections) {
    let summary = '';

    if (menuSelections.starters.length > 0) {
        summary += `Starters: ${menuSelections.starters.join(', ')}\n\n`;
    }

    if (menuSelections.meatCurry.length > 0) {
        summary += `Meat/Curry: ${menuSelections.meatCurry.join(', ')}\n\n`;
    }

    if (menuSelections.extras.length > 0) {
        summary += `Extras: ${menuSelections.extras.join(', ')}\n\n`;
    }

    if (menuSelections.starches.length > 0) {
        summary += `Starches: ${menuSelections.starches.join(', ')}\n\n`;
    }

    if (menuSelections.salads.length > 0) {
        summary += `Salads: ${menuSelections.salads.join(', ')}\n\n`;
    }

    if (menuSelections.vegetables.length > 0) {
        summary += `Vegetables: ${menuSelections.vegetables.join(', ')}\n\n`;
    }

    return summary;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
