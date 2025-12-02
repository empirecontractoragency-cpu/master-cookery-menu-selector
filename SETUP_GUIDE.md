# Quick Setup Guide - Master Cookery Menu Selector

## ✅ GOOD NEWS: Your app is working again!

The buttons are now fixed and the app works when you open `index.html` directly!

**What's working:**
- ✅ All navigation and buttons
- ✅ Form validation
- ✅ Menu wizard (6 steps)
- ✅ All starters pre-selected
- ✅ Vegetables at step 3, Extras at step 6
- ✅ Menu download (as text file)

---

## Option A: Use Development Server (Recommended for PDF)

To get full PDF generation with proper formatting, you need Node.js:

### Step 1: Install Node.js
1. Go to: https://nodejs.org/
2. Download the **LTS version** (left button)
3. Run the installer
4. Click "Next" through all steps (use defaults)
5. Restart your computer

### Step 2: Run the App
1. Open PowerShell in your project folder:
   - Hold `Shift` + Right-click in the folder
   - Select "Open PowerShell window here"

2. Run these commands:
   ```powershell
   npm install
   npm run dev
   ```

3. Open the URL shown (usually `http://localhost:5173`)

---

## Option B: Use Current Standalone Version

**Already working!** Just open `index.html` in your browser.

**Note:** Downloads as `.txt` file instead of PDF (simpler for standalone use)

---

## What Changed

- **Fixed:** All buttons now work properly
- **Fixed:** Starters are all pre-selected (included with menu)
- **Fixed:** Step order: Vegetables (3), Extras (6)
- **Changed:** Download is now a text file (works without server)

---

## Next Steps

1. **Test the app:** Open `index.html` and try the full flow
2. **For PDF:** Install Node.js (Option A above)
3. **For production:** Deploy to Vercel/Netlify (see README.md)

Need help? Check `README.md` for full documentation!
