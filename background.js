

function createIcon(size, bgColor = '#0d6efd', textColor = '#ffffff') {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');


  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);


  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.floor(size * 0.6)}px "Inter", "Segoe UI", system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText('K', size / 2, size / 2 + size * 0.04);

  return ctx.getImageData(0, 0, size, size);
}

function applyIcons() {
  const sizes = [16, 32, 48, 128];
  const imageData = {};
  for (const size of sizes) {
    imageData[size] = createIcon(size);
  }

  chrome.action.setIcon({ imageData }, () => {
    if (chrome.runtime.lastError) {
      console.warn('[Kodland Tutor Assistant] Unable to set icon:', chrome.runtime.lastError);
    } else {
      console.log('[Kodland Tutor Assistant] Icon applied');
    }
  });
}

chrome.runtime.onInstalled.addListener(applyIcons);
chrome.runtime.onStartup.addListener(applyIcons);

// --- Puente para la IA de comentarios (Groq) ---
// El content script no puede hacer fetch de otro origen de forma fiable (lo
// bloquea la política de la página en bo.kodland.org), así que el service
// worker -que sí tiene permiso de host para api.groq.com- hace la llamada y
// devuelve solo el texto de la respuesta.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.tipo !== 'groq-chat') return; // no es para nosotros
  (async () => {
    try {
      const response = await fetch(msg.endpoint || 'https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${msg.apiKey}`
        },
        body: JSON.stringify({
          model: msg.model || 'llama-3.3-70b-versatile',
          temperature: 0.4,
          messages: [
            { role: 'system', content: msg.system },
            { role: 'user', content: msg.user }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = body?.error?.message || JSON.stringify(body || {}).slice(0, 140);
        sendResponse({ ok: false, error: `Groq respondió ${response.status}: ${detail}` });
        return;
      }
      const content = body?.choices?.[0]?.message?.content || null;
      sendResponse({ ok: true, content });
    } catch (error) {
      console.error('[Groq] Error llamando a la IA:', error);
      sendResponse({ ok: false, error: String(error) });
    }
  })();
  return true; // la respuesta llega de forma asíncrona
});

// --- Puente para Google Calendar ---
// Cada tutor pega la URL de SU PROPIO Apps Script (ver calendario-google/).
// El service worker solo reenvía el payload (nombre del grupo y horario) a
// esa URL; nunca ve ni pide permisos de la cuenta de Google del tutor.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.tipo !== 'calendar-sync') return; // no es para nosotros
  (async () => {
    try {
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(msg.url || '')) {
        sendResponse({ ok: false, error: 'La URL no parece de una aplicación web de Apps Script (debe terminar en /exec).' });
        return;
      }
      const response = await fetch(msg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(msg.payload),
        redirect: 'follow'
      });
      const text = await response.text();
      let body = null;
      try { body = JSON.parse(text); } catch (error) { /* no es JSON */ }
      if (!body) {
        // Google devuelve una página HTML (no JSON) si la implementación no
        // está abierta a "Cualquier usuario" o si el script falló.
        const hint = /accounts\.google|signin|ServiceLogin/i.test(text)
          ? 'Google pide iniciar sesión: en tu implementación, "Quién tiene acceso" debe ser "Cualquier usuario".'
          : `El script respondió algo inesperado (${response.status}).`;
        sendResponse({ ok: false, error: hint });
        return;
      }
      if (!body.ok) {
        sendResponse({ ok: false, error: body.error || 'Error del script.' });
        return;
      }
      sendResponse({ ok: true, result: body });
    } catch (error) {
      console.error('[Calendar] Error sincronizando:', error);
      sendResponse({ ok: false, error: String(error) });
    }
  })();
  return true; // la respuesta llega de forma asíncrona
});

