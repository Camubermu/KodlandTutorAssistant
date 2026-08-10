# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Kodland Tutor Assistant" is an unpacked Chrome extension (Manifest V3, no build step) for Kodland tutors. It injects WhatsApp-messaging utilities into `https://bo.kodland.org/*` (backend API calls go to `https://backoffice.kodland.org/*`), on two page types:

- **Group pages** (`/groups/{id}`): per-student action buttons (open WhatsApp, send welcome message, progress/weekly summary, class reminder, absence alert, task report) plus floating buttons (export contacts to CSV, save WhatsApp group link, mark attendance for all, grading report, settings).
- **Student pages** (`/students/{id}`): a "open WhatsApp" button and a "send credentials" button.

Default UI/message language is Arabic (RTL), configurable per-tutor via the ⚙️ settings modal, with 10 supported languages. See [README.md](README.md) for the full user-facing feature list and [INSTALL.md](INSTALL.md) for how tutors load the extension unpacked.

There is no package manager, bundler, transpiler, or automated test suite — this is plain vanilla JS/CSS loaded directly by Chrome.

## Development workflow

There are no build/lint/test commands. The validation loop is entirely manual:

1. Open `chrome://extensions/`, enable **Developer mode**, **Load unpacked** → select this folder (or click the reload icon 🔄 on the extension after edits).
2. Open a Kodland group or student page (`https://bo.kodland.org/groups/{id}` or `/students/{id}`).
3. Confirm the changed button/flow renders and works.
4. Check the browser console (F12) for `[Group Students Info]`, `[Kodland Tutor Assistant]`, or similar tagged logs — errors/warnings are logged with these prefixes throughout.

There is no repo-local git history in this checkout — treat file state as the source of truth rather than blame/log.

## Architecture

### File map and load order

`manifest.json` registers one content-script bundle, injected in this order on every `bo.kodland.org` page: `open-wa-button.js` → `send-credential-button.js` → `group-students-info.js` → `content.js` (a no-op logger). `styles.css` is injected alongside. `background.js` is the MV3 service worker; its only job is drawing the extension's toolbar icon on install/startup (`chrome.action.setIcon` with a canvas-drawn "K").

- [group-students-info.js](group-students-info.js) — the core of the extension (~5500 lines). Owns group-page detection, student-row scanning, all backend API calls, the tasks/progress modal, the settings modal, message template rendering, translations, and all floating buttons. Runs its own DOM-ready + `MutationObserver` + polling-interval bootstrap (`initGroupStudentsInfo`) since Kodland is an SPA that renders content asynchronously.
- [open-wa-button.js](open-wa-button.js) and [send-credential-button.js](send-credential-button.js) — self-contained student-page scripts. Each keeps its own small copy of phone-extraction/formatting/label logic rather than importing from `group-students-info.js` (there is no module system — everything is a plain global script), and each does its own DOM-ready + `MutationObserver` + polling bootstrap, gated by `isStudentPage()`.
- `content.js` — just a load-confirmation `console.log`.

Because these are independent content scripts sharing one global scope (no ES modules, no bundler), avoid introducing same-named top-level functions/consts across files (e.g. both `group-students-info.js` and `send-credential-button.js` define their own local `formatPhoneForWhatsApp`/`extractPhoneNumber`/`encodeMessageForWhatsApp` — this duplication is intentional isolation, not an oversight to "fix" by merging).

### Page targeting is DOM-fragile by design

Kodland's frontend gives few stable hooks, so this codebase relies on:
- URL-pattern checks (`isGroupPage()` / `isStudentPage()` via regex on `location.href`) to decide whether to run at all.
- A mix of manual `.children[n]` DOM traversal and literal XPath strings (see `findElementByXPathDirect` in [open-wa-button.js](open-wa-button.js)) to locate injection points, with the manual-traversal version as a fallback if XPath evaluation fails.
- Regex-based phone-number extraction from arbitrary container text, tolerant of multiple locale labels ("Phone:", "Teléfono:", "الهاتف:", "Телефон:").

If you change a selector, XPath, or DOM-traversal path, re-verify it against Kodland's live DOM — it is expected to break silently if the site's markup shifts, and there's no test suite to catch it.

### Auth token capture

`captureAuthToken()` in [group-students-info.js](group-students-info.js) patches `window.fetch` and `XMLHttpRequest.prototype.setRequestHeader` to sniff the tutor's own Bearer token from Kodland's own outgoing requests (plus fallback scans of localStorage/sessionStorage/cookies/inline `<script>` tags), storing it in the module-level `authToken` variable. All subsequent `backoffice.kodland.org/api/v1|v2/...` calls in this file reuse that captured token — there is no login flow of the extension's own.

### Backend API surface (all under `https://backoffice.kodland.org/api/...`)

- `v2/students/{id}/get_general_info_for_student_backoffice_page/` — student info + credentials.
- `v2/students/{id}/group/{groupId}/get_progress_for_homework_modules/` — module/lesson progress.
- `v2/students/{id}/lesson/{lessonId}/get_progress_for_class_tasks/` and `.../get_progress_for_homework_tasks/` — per-lesson task detail (feeds the tasks modal and weekly summary).
- `v2/student_groups/{groupId}/schedule_view/` — group schedule (next/first lesson lookup).
- `v1/wonderlogin/generate/?student_id={id}` — one-time direct login link used in the welcome message.

Task-check links (`https://learn.kodland.org/task/{taskId}/check/{studentId}`) are built **without** a locale segment (no `/ar/`/`/en/`) — Kodland serves these directly; don't add one.

### Settings & storage

- `localStorage['kodland_ext_settings']` (per-browser-profile, not synced) holds `DEFAULT_KODLAND_SETTINGS`: button visibility toggles, `tutorName`, `messageLanguage` (`'auto'` follows Kodland's own page language via `detectPageLanguage()`, or a pinned code), `timezone`/`timezoneLabel` (IANA zone + display name used in welcome-message scheduling), and the editable `welcomeTemplate`/`absenceTemplate` strings.
- Per-group WhatsApp invite links are cached separately in `localStorage`, keyed by group id (`getGroupWhatsAppLink`/pasted via the 📋 button) — pasted manually, never auto-detected.
- `getExtensionSettings()`/`saveExtensionSettings()` always merge over `DEFAULT_KODLAND_SETTINGS`, so adding a new setting just means adding a default; existing stored settings won't have the key until saved once.

### Message templates & i18n

- `UI_STRINGS` (near the top of [group-students-info.js](group-students-info.js)) holds every injected-UI label/tooltip/alert, looked up via `uiText()`/`uiTextForLanguage()` with fallback order **requested language → English → Arabic**.
- `DEFAULT_WELCOME_TEMPLATE` / `DEFAULT_ABSENCE_TEMPLATE` are user-editable `{{placeholder}}` templates rendered by `renderTemplate()` (unknown placeholders are left literally in place, not deleted, so a typo is visible instead of silently dropping text). Placeholders: `studentName`, `tutorName`, `courseName`, `scheduleLine`, `waGroupLink`, `wonderLoginUrl`, `username`, `password` (only the welcome template gets the last four).
- Other message generators (`generateWeeklySummaryMessage`, `generateAbsenceMessage`, `generateClassReminderMessage`, `createWelcomeMessage`) build fully-formed strings per language directly, not through the template system.
- Arabic pluralization is not a simple singular/plural split (1 and 2 have unique forms, 3–10 take the plural, 11+ reverts to singular) — always route counted Arabic nouns through `arabicCount()` with a `{one, two, few, many}` forms object, following the existing `ARABIC_*_FORMS` constants.
- To add a supported language: add its code to `SUPPORTED_MESSAGE_LANGUAGES`, add entries to `UI_STRINGS` and every message-generator's language dictionary, add a `LANGUAGE_LABELS` entry, and add it to `RTL_LANGUAGES` if it's right-to-left.

### Styling

[styles.css](styles.css) covers both the injected buttons/modals and RTL/LTR flipping (elements get `lang`/`dir` attributes at runtime via `applyLanguageDirection()`, which the CSS keys off of).

## Conventions when editing

- Prefer small, surgical changes over broad refactors — this project is feature/UI-driven and DOM-dependent; there's no test suite to validate a large restructuring.
- Keep group-page and student-page logic separate unless a change is genuinely cross-cutting.
- Reuse the existing DOM-traversal and message-language patterns already established in each script rather than introducing a new abstraction or a shared module system.
- Keep any UI-string or template edits consistent with the language-fallback system already in place, and keep README.md's user-facing description in sync if behavior changes.
