# Kodland WhatsApp Welcome - Chrome Extension

Chrome extension that adds a button to send a welcome message to WhatsApp from the Kodland platform.

## Features

- ✅ Button integrated into the Kodland interface
- ✅ Predefined welcome message
- ✅ Opens WhatsApp Web automatically
- ✅ Modern, responsive design

## Installation

> 📖 **Need detailed help?** See [INSTALACION.md](INSTALACION.md) for a step-by-step guide with screenshots and troubleshooting.

### Manual Installation (Summary)

1. **Open Chrome Extensions**
   - Open Chrome and type in the address bar: `chrome://extensions/`
   - Or go to: Menu (⋮) → More tools → Extensions

2. **Enable Developer Mode**
   - In the top-right corner, turn on the **"Developer mode"** toggle

3. **Load the unpacked extension**
   - Click **"Load unpacked"** (appears at the top)
   - In the window that opens, navigate to: `C:\Users\Juan Garay\Desktop\KodlandFaster`
   - **Select the folder** `KodlandFaster` (don't go inside it, select the folder itself)
   - Click **"Select Folder"**

4. **Verify**
   - The extension "Kodland WhatsApp Welcome" should appear in the list
   - Make sure it's **Enabled** (blue toggle)

## Usage

1. Go to https://bo.kodland.org/
2. The "Send WhatsApp welcome" button will appear automatically in the specified location
3. Click the button to open WhatsApp Web with the predefined welcome message
4. Select the contact or group you want to send the message to, and send it

## Customizing the Message

To change the welcome message, edit the `content.js` file and modify the line:

```javascript
const message = encodeURIComponent('¡Bienvenido/a al curso! 🎉 Estamos muy contentos de tenerte aquí. ¡Comencemos juntos este increíble viaje de aprendizaje!');
```

## Project Structure

```
KodlandFaster/
├── manifest.json       # Extension configuration
├── content.js          # Script that injects the button
├── styles.css          # Button styles
└── README.md          # This file
```

## Icons (Optional)

Icons (`icon16.png`, `icon48.png`, `icon128.png`) are optional. If you want to add them:
- Create PNG images at the specified sizes
- Place them in the project root
- Or edit `manifest.json` to remove the icons section

## Notes

- The extension only works on `https://bo.kodland.org/*`
- The button is injected automatically when the page loads
- If the target element doesn't appear immediately, the extension will keep trying to find it for 30 seconds

## Troubleshooting

**The button doesn't appear:**
- Verify you're on the correct URL: `https://bo.kodland.org/`
- Reload the page
- Verify the extension is enabled at `chrome://extensions/`
- Open the browser console (F12) to check for possible errors

**The button appears but doesn't work:**
- Make sure you don't have any pop-up blockers active
- Make sure WhatsApp Web is allowed in your browser

## Additional tools (ported from KodlandTutorAssistant)

These were merged in from the other team's fork so this project contains every available feature:

- 🎓 **PDF report button** (per student, "PDF" icon next to the WhatsApp buttons): generates a general or per-module PDF progress report via a local Python tool and optionally opens WhatsApp with it attached. Requires the calificador + Native Messaging bridge below to be installed.
- 🐍 **`calificador/`**: a separate Python + Playwright tool to grade pending tasks, post templated/AI comments, and generate PDF reports and group boletines. It talks to the extension through a Native Messaging bridge (`calificador/puente/`), not through the Chrome APIs — see [`calificador/INSTRUCCIONES.md`](calificador/INSTRUCCIONES.md) and [`calificador/puente/README_PUENTE.md`](calificador/puente/README_PUENTE.md) for setup. The floating "🎓 Calificador" panel (`calificador-buttons.js`) and the "✅ Calificar Todo" button on teacher pages (`teacher-page-buttons.js`) both depend on this bridge being installed locally; without it they'll report "El puente no respondió."
- 🎮 **Send ME Credential** (student page): same flow as "Send Credential" but for Minecraft Education accounts.
- 🧪 **`retention-radar/`**: early, in-progress experiment to flag students at risk of not renewing. Currently just fetches a group's schedule and logs it to the console — not a finished feature yet.

⚠️ These files (`calificador/`, `calificador-buttons.js`, `teacher-page-buttons.js`, `send-me-credential-button.js`, `retention-radar/`) came from a different, independently-developed codebase. They're wired into `manifest.json`/`background.js` but haven't been exercised end-to-end in this project yet — test them manually before relying on them with real students.

## License

This project is for personal/educational use.
