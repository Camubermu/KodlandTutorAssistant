# 📦 Installation Guide - Load Unpacked Extension

## Detailed Step-by-Step Guide

### Step 1: Prepare the files
Make sure all files are in the same folder:
- ✅ `manifest.json`
- ✅ `content.js`
- ✅ `styles.css`

### Step 2: Open Chrome Extensions

**Option A - From the address bar:**
1. Open Google Chrome
2. In the address bar, type: `chrome://extensions/`
3. Press Enter

**Option B - From the menu:**
1. Open Google Chrome
2. Click the **three dots** (⋮) in the top-right corner
3. Select **"More tools"**
4. Click **"Extensions"**

### Step 3: Enable Developer Mode

1. On the extensions page (`chrome://extensions/`), find the **"Developer mode"** toggle in the top-right corner
2. **Turn it on** (the toggle should be blue/enabled)

### Step 4: Load the Extension

1. Once Developer mode is enabled, you'll see new buttons at the top
2. Click the **"Load unpacked"** button
3. A file browser window will open
4. Navigate to the folder where your project is located: `C:\Users\Juan Garay\Desktop\KodlandFaster`
5. **Select the folder** `KodlandFaster` (do NOT go inside it, select the folder itself)
6. Click **"Select Folder"**

### Step 5: Verify the Installation

1. You should see your extension appear in the extensions list
2. Verify the name is: **"Kodland WhatsApp Welcome"**
3. Verify the status is **"Enabled"** (if not, turn on the toggle)

### Step 6: Test the Extension

1. Open a new tab
2. Go to: `https://bo.kodland.org/`
3. Log in if necessary
4. The **"Send WhatsApp welcome"** button should appear in the specified location

---

## 🖼️ Visualizing the Key Steps

### Chrome Extensions Interface:

```
┌─────────────────────────────────────────────────────┐
│  Extensions                             [Developer  │
│                                              mode]   │
│  ┌─────────────────────────────────────────────┐   │
│  │  [Enabled]  Kodland WhatsApp Welcome        │   │
│  │            v1.0.0                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [+ Load unpacked] ← CLICK HERE                    │
│  [Pack extension]                                  │
│  [Update]                                          │
└─────────────────────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Error: "Could not load extension"
- ✅ Verify all files are in the same folder
- ✅ Make sure `manifest.json` has no syntax errors
- ✅ Verify the selected folder contains `manifest.json`

### Error: "Manifest file is missing or unreadable"
- ✅ Make sure you select the correct folder (where `manifest.json` is located)
- ✅ Verify that the `manifest.json` file exists and is not corrupted

### The button doesn't appear on the page
- ✅ Verify you're on the correct URL: `https://bo.kodland.org/`
- ✅ Reload the page (F5 or Ctrl+R)
- ✅ Open the browser console (F12) and check for errors
- ✅ Verify the extension is enabled at `chrome://extensions/`

### The extension doesn't load
- ✅ Verify Developer mode is enabled
- ✅ Try reloading the extension by clicking the reload icon (🔄)
- ✅ Close and reopen Chrome

---

## 🔄 Updating the Extension After Changes

If you make changes to the extension files:

1. Go to `chrome://extensions/`
2. Find your extension "Kodland WhatsApp Welcome"
3. Click the **reload icon** (🔄) below the extension
4. Reload the Kodland page to see the changes

---

## 📝 Important Notes

- ⚠️ **Do NOT delete** the `KodlandFaster` folder while using the extension
- ⚠️ If you move the folder, you'll need to reload the extension
- ⚠️ The extension only works on `https://bo.kodland.org/*`
- ✅ You can disable the extension without deleting it using the toggle
- ✅ To remove it completely, click "Remove"

---

## 🎯 Quick Summary

1. Open `chrome://extensions/`
2. Enable **"Developer mode"**
3. Click **"Load unpacked"**
4. Select the `KodlandFaster` folder
5. Done! 🎉
