# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome (Manifest V3) extension for Kodland tutors. It injects buttons and modals into the Kodland backoffice (`bo.kodland.org`) to send WhatsApp messages (welcome messages, credentials, class reminders, group broadcasts) and queues those messages for autopaste into WhatsApp Web (`web.whatsapp.com`). There is no build step, package manager, bundler, or test suite — every file is loaded by Chrome directly as listed in `manifest.json`. Edit the files in place, then reload the unpacked extension at `chrome://extensions/` to see changes.

## Development workflow

- **Load/reload**: `chrome://extensions/` → enable "Modo de desarrollador" → "Cargar extensión sin empaquetar" → select this folder. After edits, click the reload icon on the extension card, then reload the target page (`bo.kodland.org` or `web.whatsapp.com`).
- **Debugging**: content script logs appear in the DevTools console of the page they run on (`bo.kodland.org` or `web.whatsapp.com`). Service worker (`background.js`) logs appear in its own inspect view from `chrome://extensions/`.
- **No lint/test/build commands exist.** Validate changes manually in the browser (see below), and check `chrome://extensions/` for manifest/script load errors after reloading.
- Manual smoke test path: open a group page (`bo.kodland.org/groups/{id}`), confirm the toolbar buttons inject, click one (e.g. "Aviso de clase"), confirm a WhatsApp Web tab opens and the message autopastes into the compose box.

## Architecture

### Script loading order (per `manifest.json`)

1. `early-auth-capture.js` — injected at `document_start` on `bo.kodland.org`, before the page's own scripts run. Monkey-patches `window.fetch` and `XMLHttpRequest.prototype.setRequestHeader` to capture the `Bearer` auth token as soon as the page makes its first API call. Sets a page-global `authToken` var.
2. `open-wa-button.js`, `send-credential-button.js`, `group-students-info.js`, `content.js` — injected at `document_idle` on `bo.kodland.org`, in that order, all sharing the same page global scope (`var`, not modules — that's why `authToken` and `getMessageLanguage()` can be referenced across files without imports). `group-students-info.js` is the core of the extension (~7600 lines); the other two are focused single-button modules that duplicate a few small helpers (phone extraction/formatting) rather than depending on `group-students-info.js` load order.
3. `whatsapp-autopaste.js` — injected at `document_idle` on `web.whatsapp.com`. Runs independently of everything above; the only coupling is the shared `chrome.storage.local` key described below.
4. `background.js` — service worker. Its only job is generating the extension's toolbar icon at runtime via `OffscreenCanvas` (there are no `.png` icon assets in the repo).

### Cross-page handoff: the broadcast/autopaste queue

Sending a message to WhatsApp is a two-tab handoff, not a direct API call (there is no WhatsApp Business API integration here):
1. On `bo.kodland.org`, a button handler builds the message text, calls `queueGroupBroadcastMessage()` (in `group-students-info.js`), which copies the text to the clipboard **and** writes `{ message, timestamp }` to `chrome.storage.local` under the key `kodland_pending_wa_message`.
2. The same click opens (or focuses) a `web.whatsapp.com` tab.
3. `whatsapp-autopaste.js`, running on that tab, polls `chrome.storage.local` (every second, ~45 attempts) for that key, finds a compose box via a fallback list of selectors (`COMPOSE_BOX_SELECTORS` — WhatsApp Web's DOM changes often, hence the list), and inserts the text with `document.execCommand('insertText', ...)`. It never auto-clicks send — the tutor reviews and sends manually. Messages older than `MAX_AGE_MS` (3 minutes) or already-typed compose boxes are skipped.

The "Send Credential" flow (`send-credential-button.js`) is a variant of this: it doesn't queue via storage, it intercepts a click on Kodland's own "copy credentials" button (found via XPath, with several fallback strategies since Kodland's DOM/build can shift), waits for the clipboard to actually contain credential-shaped text (retries with backoff, rejecting content that looks like our own button's leftover text), then opens `web.whatsapp.com` directly with `?phone=...&text=...` — it does not go through the `kodland_pending_wa_message` queue.

### Kodland backoffice API usage

All data (student info, homework/task progress, group schedule, WonderLogin credential links) is fetched directly from `https://backoffice.kodland.org/api/v2/...` (and one `v1` WonderLogin endpoint) using `fetch` with the captured `authToken` as a Bearer header — there is no backend of this extension's own. Key endpoints, all in `group-students-info.js`:
- `student_groups/{id}/get_general_info_for_group_backoffice_page` — WhatsApp group invite link, teacher name, course title, predicted end date. Cached in-memory per group (`groupInfoCache`, 10 min TTL) with in-flight dedupe (`groupInfoInFlight`), since almost every button needs it.
- `students/{id}/get_general_info_for_student_backoffice_page/` — per-student parent name/phone and credentials.
- `students/{id}/group/{groupId}/get_progress_for_homework_modules/`, `.../lesson/{lessonId}/get_progress_for_class_tasks/`, `.../get_progress_for_homework_tasks/` — task/homework completion, used to build the "tasks modal" and grading reports.
- `student_groups/{id}/schedule_view/` — lesson schedule, used for reminders, "next class" detection, and recording links.
- `wonderlogin/generate/?student_id=...` — generates a one-click login link for the student.

If `authToken` is ever empty, every one of these calls will 401 — `captureAuthToken()` has a layered fallback (localStorage/sessionStorage key scan, cookie scan, inline `<script>` regex scan) for when the `document_start` interceptor missed the token.

### Settings and templates

Extension settings (toggle which buttons show, tutor display name, message language, and per-message-type templates) live in `localStorage['kodland_ext_settings']` on `bo.kodland.org` (see `DEFAULT_KODLAND_SETTINGS`, `getExtensionSettings()`/`saveExtensionSettings()` in `group-students-info.js`) — **not** `chrome.storage`, so settings are per-browser-profile, not synced. Each message type (welcome, absence, class-starting, in-class, graduation, group-welcome, first-class, recording — student and group variants) has:
- a `DEFAULT_*_TEMPLATE` constant (Spanish, with `{{placeholder}}` tokens),
- a `getDefault*Template(language)` function returning a hardcoded translation for each of the 10 supported languages,
- a `getResolved*Template(language, settings)` that prefers the tutor's custom-saved template (`resolveTemplate()`) and falls back to the language default.
`renderTemplate(template, vars)` does the `{{key}}` substitution. When adding a new broadcast/message type, follow this same four-piece pattern rather than inlining strings.

### Internationalization

`getMessageLanguage()` is the single source of truth for what language to render in (UI strings *and* generated WhatsApp messages). It reads `settings.messageLanguage`; if that's `'auto'` (the default), it falls back to `detectPageLanguage()`, which sniffs Kodland's own current UI language. Supported codes: `SUPPORTED_MESSAGE_LANGUAGES = ['es','en','ar','ru','fr','tr','id','it','pl','pt']`, with Arabic also needing `RTL_LANGUAGES` handling (`dir="rtl"`, plural forms via `arabicCount()`/`ARABIC_*_FORMS` since Arabic has singular/dual/few/many). Two other files (`open-wa-button.js`, `send-credential-button.js`) keep their own small `*_LABELS_BY_LANG` maps for their own buttons rather than depending on `group-students-info.js`'s `UI_STRINGS`, but they call its `getMessageLanguage()` (with a try/catch fallback to `'es'`) so the language stays consistent across the whole injected UI. When adding user-facing strings, add them to `UI_STRINGS` (general UI) with an entry per supported language plus a Spanish fallback lookup (see `uiTextForLanguage`/`uiText`), not as inline literals.

### DOM injection strategy on `bo.kodland.org`

Kodland's frontend is a SPA with no stable IDs/classes for most of what this extension targets, and its build can shift DOM structure over time. The extension therefore leans on:
- Absolute XPath as a first attempt (fast, precise when it works), with multiple fallback strategies (alternate XPath, icon/class search, structural search) chained after it — see `findCredentialCopyButton()` in `send-credential-button.js` for the fullest example of this pattern.
- A shared `MutationObserver`-based watcher (`registerDomWatcher`/`unregisterDomWatcher`/`sharedDomObserver` in `group-students-info.js`) plus a bounded `setInterval` retry (attempts capped, ~2s interval, ~30-60s total) as a belt-and-suspenders fallback for elements that render asynchronously. Any new injected button/modal should register through this shared watcher rather than creating another independent `MutationObserver`.
- Idempotency guards before injecting: check `document.getElementById(...)` (or a data attribute like `data-kodland-intercepted`) before creating a button/listener, since the watcher/interval can both fire for the same DOM change.

Per-group-page UI has two locations: individual student rows get small icon buttons (`.kodland-student-buttons`, injected per student by `displayStudentInfo()`/`processAllStudents()`), and group-wide actions (broadcasts, settings, export, attendance, grading report, WA group link) live in one fixed toolbar at the top of the page (`#kodland-broadcast-buttons`, built by `getOrCreateToolbar()` and populated by the various `inject*Button()` functions called from `initGroupStudentsInfo()`). `initGroupStudentsInfo()` wraps each injection in a `safeInject()` try/catch specifically so one broken button doesn't cancel the rest of init (including student-row processing) — keep that pattern when adding new toolbar buttons.

## Constraints and conventions

- Manifest V3, no external dependencies, no npm — everything is vanilla JS/CSS loaded straight into the page. Don't introduce a build step or package.json without discussing it first; it changes how this whole repo is loaded and tested.
- Files other than the settings modal use light theme (`#ffffff`-based) `.kodland-modal-content` styling in `styles.css`; the settings and grading-report modals are intentionally scoped back to a dark theme by ID (`#kodland-settings-modal`, `#kodland-grading-report-modal`) — see the comment block in `styles.css` around those rules before changing modal colors.
- `host_permissions` in `manifest.json` is the allowlist for both API calls and content script matches (`bo.kodland.org`, `backoffice.kodland.org`, `web.whatsapp.com`). Any new API host or injection target needs a matching entry there.
