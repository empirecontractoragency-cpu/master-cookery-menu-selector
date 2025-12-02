# Master Cookery Menu Selector - Configuration Guide

This guide will help you configure the application with your EmailJS and Firebase credentials.

## Step 1: EmailJS Setup

### Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Create Email Service
1. Go to "Email Services" in the dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions
5. Note your **Service ID**

### Create Email Templates

#### Customer Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Template Name: "Customer Menu Selection"
4. Template content:

```
Subject: Your Menu Selection Summary - Master Cookery

Hi {{to_name}},

Thank you for choosing Master Cookery for your {{event_type}} on {{event_date}}!

Your menu selection has been received and our team will be in touch shortly to confirm the details.

Menu Summary:
{{menu_summary}}

Please find your detailed menu selection PDF attached to this email.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Master Cookery Team
Email: themastercookery@gmail.com
```

5. Note your **Customer Template ID**

#### Caterer Template
1. Create another template
2. Template Name: "New Menu Submission"
3. Template content:

```
Subject: New Menu Selection - {{customer_name}}

New menu selection received:

Customer Details:
- Name: {{customer_name}}
- Phone: {{customer_phone}}
- Email: {{customer_email}}
- Event Type: {{event_type}}
- Event Date: {{event_date}}
- Location: {{event_location}}
- Guests: {{guest_count}}

Menu Summary:
{{menu_summary}}

Additional Notes:
{{notes}}

PDF is attached.
```

4. Note your **Caterer Template ID**

### Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

### Update email-service.js
Open `email-service.js` and replace the configuration:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',        // Replace with your Service ID
  templateIdCustomer: 'YOUR_TEMPLATE_ID', // Replace with Customer Template ID
  templateIdCaterer: 'YOUR_TEMPLATE_ID',  // Replace with Caterer Template ID
  publicKey: 'YOUR_PUBLIC_KEY'         // Replace with your Public Key
};
```

---

## Step 2: Firebase Setup

### Create Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "master-cookery-menu"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click "Email/Password"
5. Enable it and click "Save"

### Create Admin Users
1. Go to "Authentication" → "Users"
2. Click "Add user"
3. Enter email and password for dashboard access
4. Repeat for additional admin users

### Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (closest to your users)
5. Click "Enable"

### Set Firestore Rules
1. Go to "Firestore Database" → "Rules"
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document} {
      // Anyone can create submissions
      allow create: if true;
      
      // Only authenticated users can read/update
      allow read, update: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (</>)
4. Register app name: "Master Cookery Menu Selector"
5. Copy the firebaseConfig object

### Update firebase-service.js
Open `firebase-service.js` and replace the configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Step 3: WhatsApp Configuration

Open `app.js` and find this line:

```javascript
const whatsappUrl = `https://wa.me/27123456789?text=${message}`;
```

Replace `27123456789` with your WhatsApp number:
- Include country code (e.g., 27 for South Africa)
- No + symbol
- No spaces or dashes
- Example: `27821234567`

---

## Step 4: Test Locally

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

4. Test the flow:
   - Fill out customer details
   - Select menu items
   - Review selections
   - Generate PDF
   - Check emails (customer and caterer)

5. Test dashboard:
   - Go to `http://localhost:5173/dashboard.html`
   - Login with Firebase admin credentials
   - View submissions

---

## Step 5: Deploy

### Option A: Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Option B: Netlify
```bash
npm run build
# Upload dist/ folder to netlify.com
```

### Option C: Firebase Hosting
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## Troubleshooting

### Emails not sending
- Check EmailJS dashboard for quota limits
- Verify template IDs are correct
- Check browser console for errors
- Ensure email service is connected

### Firebase authentication failing
- Verify Firebase config is correct
- Check that Email/Password auth is enabled
- Ensure admin users are created

### PDF not generating
- Check browser console for errors
- Verify logo.png exists in assets/
- Test on different browsers

### Dashboard not loading submissions
- Check Firestore rules are published
- Verify user is authenticated
- Check browser console for errors

---

## Support

For help:
- Email: themastercookery@gmail.com
- Email: empirecontractoragency@gmail.com
