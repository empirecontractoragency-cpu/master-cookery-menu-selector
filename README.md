# Master Cookery Menu Selector

A mobile-friendly web application that allows customers to select catering menu options for their events and automatically generates branded PDF summaries with email delivery.

## Features

### Customer-Facing App
- ✅ Clean welcome page with Master Cookery branding
- ✅ Customer details form with validation
- ✅ 6-step menu selection wizard with item limits
- ✅ Review page showing all selections
- ✅ Branded PDF generation (A4, high quality)
- ✅ PDF download for WhatsApp sharing
- ✅ Automatic email delivery to customer and caterers

### Caterer Dashboard
- ✅ Secure login with Firebase Authentication
- ✅ View all menu submissions
- ✅ Search by customer name or email
- ✅ Filter submissions by event date
- ✅ View detailed submission information
- ✅ Download PDFs for any submission
- ✅ Mark submissions as reviewed/pending

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure EmailJS

1. Create a free account at [EmailJS](https://www.emailjs.com/)
2. Create a new email service (Gmail, Outlook, etc.)
3. Create two email templates:
   - **Customer Template**: For sending PDFs to customers
   - **Caterer Template**: For sending PDFs to caterers
4. Get your Public Key from the EmailJS dashboard
5. Update `email-service.js` with your credentials:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'your_service_id',
  templateIdCustomer: 'your_customer_template_id',
  templateIdCaterer: 'your_caterer_template_id',
  publicKey: 'your_public_key'
};
```

**Email Template Variables:**

Customer Template:
- `{{to_email}}` - Customer email
- `{{to_name}}` - Customer name
- `{{event_type}}` - Event type
- `{{event_date}}` - Event date
- `{{menu_summary}}` - Menu selections
- `{{pdf_attachment}}` - PDF file (base64)

Caterer Template:
- `{{to_email}}` - Caterer email
- `{{customer_name}}` - Customer name
- `{{customer_phone}}` - Customer phone
- `{{customer_email}}` - Customer email
- `{{event_date}}` - Event date
- `{{guest_count}}` - Number of guests
- `{{menu_summary}}` - Menu selections
- `{{pdf_attachment}}` - PDF file (base64)

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Create admin user accounts
3. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
4. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config object
5. Update `firebase-service.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

**Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document} {
      // Allow anyone to create submissions
      allow create: if true;
      
      // Only authenticated users can read/update
      allow read, update: if request.auth != null;
    }
  }
}
```

### 4. Update WhatsApp Number

In `app.js`, update the WhatsApp number for sharing:

```javascript
const whatsappUrl = `https://wa.me/27XXXXXXXXX?text=${message}`;
```

Replace `27XXXXXXXXX` with your actual WhatsApp number (with country code, no + or spaces).

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

The production files will be in the `dist/` folder.

## Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your app will be deployed with a URL

### Option 2: Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Your app will be deployed instantly

### Option 3: Firebase Hosting

1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## Editing Menu Items

All menu items are stored in `menu-data.json`. To add, remove, or modify menu items:

1. Open `menu-data.json`
2. Edit the arrays for each category:
   - `starters` - No limit
   - `meatCurry` - Max 3 selections
   - `extras` - No limit
   - `starches` - Max 3 selections
   - `salads` - Max 4 selections
   - `vegetables` - Max 2 selections
3. Save the file
4. Rebuild if deployed: `npm run build`

Example:

```json
{
  "starters": [
    "New Starter Item",
    "Another Starter"
  ]
}
```

## File Structure

```
MastercookeryMenu/
├── assets/
│   └── logo.png              # Master Cookery logo
├── index.html                # Main customer-facing app
├── dashboard.html            # Caterer dashboard
├── styles.css                # Main app styles
├── dashboard.css             # Dashboard styles
├── app.js                    # Main app logic
├── dashboard.js              # Dashboard logic
├── pdf-generator.js          # PDF generation module
├── email-service.js          # EmailJS integration
├── firebase-service.js       # Firebase integration
├── menu-data.json            # Menu items configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Browser Compatibility

- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox
- ✅ Edge
- ✅ Android Chrome

## Support

For issues or questions:
- Email: themastercookery@gmail.com
- Email: empirecontractoragency@gmail.com

## License

MIT License - Master Cookery © 2025
