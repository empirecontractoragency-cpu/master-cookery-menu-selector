# Master Cookery Menu Selector - Quick Start

## ⚡ Quick Start (3 Steps)

### Step 1: Configure Services (30 minutes)

#### A. EmailJS Setup
1. Go to [emailjs.com](https://emailjs.com) → Sign up
2. Add email service (Gmail/Outlook)
3. Create 2 templates (Customer + Caterer)
4. Copy Service ID, Template IDs, and Public Key
5. Update `email-service.js` lines 8-13

#### B. Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create project
2. Enable Authentication → Email/Password
3. Create admin user
4. Create Firestore database
5. Copy Firebase config
6. Update `firebase-service.js` lines 20-27

#### C. WhatsApp Number
1. Open `app.js`
2. Find line 449
3. Replace `27123456789` with your WhatsApp number (with country code)

**Detailed instructions:** See [CONFIGURATION.md](file:///C:/Users/Luyanda/Desktop/MastercookeryMenu/CONFIGURATION.md)

---

### Step 2: Install & Run (5 minutes)

**Option A: With Node.js installed**
```bash
npm install
npm run dev
```
Open browser to `http://localhost:5173`

**Option B: Without Node.js**
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Then run commands above

**Option C: Direct file access (limited functionality)**
- Open `index.html` directly in browser
- Note: Some features may not work without a dev server

---

### Step 3: Test & Deploy

#### Test Locally
1. Fill customer form → Select menu → Generate PDF
2. Check emails received
3. Test dashboard at `/dashboard.html`

#### Deploy (Choose one)

**Vercel** (Easiest)
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm run build
```
Upload `dist/` folder to [netlify.com](https://netlify.com)

**Firebase Hosting**
```bash
npm i -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

---

## 📁 What You Got

### Customer App
- ✅ Welcome page with branding
- ✅ Customer details form (validated)
- ✅ 6-step menu wizard
- ✅ Review page
- ✅ PDF generation & download
- ✅ Email delivery
- ✅ WhatsApp sharing

### Dashboard
- ✅ Secure login
- ✅ View all submissions
- ✅ Search & filter
- ✅ Download PDFs
- ✅ Mark as reviewed

### Files
```
MastercookeryMenu/
├── index.html          → Customer app
├── dashboard.html      → Caterer dashboard
├── styles.css          → Premium design
├── app.js              → Main logic
├── pdf-generator.js    → PDF creation
├── email-service.js    → Email delivery
├── firebase-service.js → Database & auth
├── menu-data.json      → Menu items (editable!)
└── assets/logo.png     → Your logo
```

---

## 🎨 Editing Menu Items

Open `menu-data.json` and edit:

```json
{
  "starters": ["Item 1", "Item 2"],
  "meatCurry": ["Item 1", "Item 2"],
  ...
}
```

Save → Rebuild if deployed

---

## 🆘 Need Help?

1. **Configuration issues?** → Read [CONFIGURATION.md](file:///C:/Users/Luyanda/Desktop/MastercookeryMenu/CONFIGURATION.md)
2. **How it works?** → Read [README.md](file:///C:/Users/Luyanda/Desktop/MastercookeryMenu/README.md)
3. **What was built?** → Read [walkthrough.md](file:///C:/Users/Luyanda/.gemini/antigravity/brain/c8824c35-c312-4583-a384-0c02a5e8b607/walkthrough.md)

**Contact:**
- themastercookery@gmail.com
- empirecontractoragency@gmail.com

---

## ✅ Checklist

Before going live:
- [ ] EmailJS configured and tested
- [ ] Firebase configured and tested
- [ ] WhatsApp number updated
- [ ] Admin user created in Firebase
- [ ] Test complete customer flow
- [ ] Test email delivery
- [ ] Test dashboard login
- [ ] Deploy to hosting
- [ ] Test on mobile devices

**You're ready to go! 🚀**
