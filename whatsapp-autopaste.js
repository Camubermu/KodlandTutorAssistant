

const STORAGE_KEY = 'kodland_pending_wa_message';
const MAX_AGE_MS = 3 * 60 * 1000;
const LOG_PREFIX = '[Kodland WA Autopaste]';

console.log(`${LOG_PREFIX} Script loaded (${location.href})`);


const COMPOSE_BOX_SELECTORS = [
  '#main [data-testid="conversation-compose-box-input"]',
  '#main div[aria-label="Escribe un mensaje"][contenteditable="true"]',
  '#main div[aria-label="Type a message"][contenteditable="true"]',
  '#main footer div[contenteditable="true"][data-lexical-editor="true"]',
  '#main footer div[contenteditable="true"][role="textbox"]',
  '#main footer div[contenteditable="true"]',
  'footer div[contenteditable="true"][data-tab]',
  'footer div[contenteditable="true"]'
];

function findComposeBox() {
  for (const selector of COMPOSE_BOX_SELECTORS) {
    try {
      const el = document.querySelector(selector);
      if (el) return { el, selector };
    } catch (error) {

    }
  }
  return null;
}

function pasteIntoComposeBox(box, text) {
  box.focus();


  let inserted = false;
  try {
    inserted = document.execCommand('insertText', false, text);
  } catch (error) {
    inserted = false;
  }

  if (!inserted) {

    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });
    box.dispatchEvent(pasteEvent);
  }


  setTimeout(() => {
    if (!box.textContent || box.textContent.trim().length === 0) {
      console.warn(`${LOG_PREFIX} ⚠️ Se intentó pegar pero el cuadro de texto sigue vacío. El mensaje quedó copiado en el portapapeles - pégalo manualmente con Ctrl+V.`);
    }
  }, 300);
}

async function tryPastePendingMessage(attemptLabel) {
  let stored;
  try {
    stored = await chrome.storage.local.get([STORAGE_KEY]);
  } catch (error) {
    console.warn(`${LOG_PREFIX} No se pudo leer chrome.storage:`, error);
    return;
  }

  const pending = stored[STORAGE_KEY];
  if (!pending || !pending.message) {
    return;
  }

  const age = Date.now() - (pending.timestamp || 0);
  if (age > MAX_AGE_MS) {
    console.log(`${LOG_PREFIX} Había un mensaje en cola pero ya expiró (${Math.round(age / 1000)}s), lo descarto.`);
    chrome.storage.local.remove([STORAGE_KEY]);
    return;
  }

  const found = findComposeBox();
  if (!found) {
    console.log(`${LOG_PREFIX} ${attemptLabel}: hay un mensaje en cola pero todavía no encuentro el cuadro de texto (¿ya tienes un chat abierto?).`);
    return;
  }

  const { el: composeBox, selector } = found;


  if (composeBox.textContent && composeBox.textContent.trim().length > 0) {
    console.log(`${LOG_PREFIX} Encontré el cuadro de texto (via "${selector}") pero ya tiene contenido escrito - no lo piso.`);
    return;
  }

  pasteIntoComposeBox(composeBox, pending.message);
  console.log(`${LOG_PREFIX} ✅ Mensaje pegado automáticamente (cuadro encontrado via "${selector}")`);


  chrome.storage.local.remove([STORAGE_KEY]);
}


let attempts = 0;
const maxAttempts = 45;

const intervalId = setInterval(async () => {
  attempts++;
  await tryPastePendingMessage(`intento ${attempts}/${maxAttempts}`);


  const stored = await chrome.storage.local.get([STORAGE_KEY]).catch(() => ({}));
  if (!stored[STORAGE_KEY]) {
    clearInterval(intervalId);
  } else if (attempts >= maxAttempts) {
    console.warn(`${LOG_PREFIX} Se acabaron los ${maxAttempts} intentos (~45s) y no logré pegar el mensaje. Sigue en el portapapeles para pegarlo manualmente (Ctrl+V).`);
    clearInterval(intervalId);
  }
}, 1000);


tryPastePendingMessage('intento inicial');
