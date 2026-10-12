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

These were merged in from the other team's fork so this project contains every available feature. Everything below runs **entirely inside the extension** — no Python, no local install, no per-OS setup. Just load the extension and use it.

- 🎓 **PDF report button** (per student, "PDF" icon next to the WhatsApp buttons): builds a general or per-module progress report as real HTML/CSS (same design as the original tool) and opens it in a new tab, triggering the browser's own print-to-PDF so the tutor saves it directly — no backend involved.
- ✅ **Grading engine**, inside the existing "📊 Reporte calificación" modal: once it lists a group's pending tasks, three buttons let the tutor grade them for real — **Calificar (nota máxima)** (grade-only), **Calificar y comentar** (free, template-based comments picked from `calificador/plantillas_comentarios.json`), and **Calificar y comentar (IA)** (AI-written comments via Groq — needs a free API key pasted into Settings; see `settings.groqApiKey`). It calls the same Kodland API endpoints the original Python tool used internally (`get_progress_by_task`, `tasks/{id}`, `PUT grade/{progress_id}`), scoped to whatever group page the tutor currently has open.
- 🎮 **Send ME Credential** (student page): same flow as "Send Credential" but for Minecraft Education accounts.
- 🧪 **`retention-radar/`**: early, in-progress experiment to flag students at risk of not renewing. Currently just fetches a group's schedule and logs it to the console — not a finished feature yet.

⚠️ The grading engine and PDF report are fresh ports from a ~4500-line Python tool, written without the ability to test live against Kodland — verify both carefully (ideally with `plantillas`/grade-only mode before trusting AI-written comments) before relying on them with real students. Known simplification: unlike the original, it doesn't run a real Python syntax check on the student's code (the browser has no Python parser) — the AI-comment mode isn't affected by this, only the free template mode's heuristics.

## License

This project is for personal/educational use.
