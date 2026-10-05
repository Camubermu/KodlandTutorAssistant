


const SEND_CREDENTIAL_LABELS_BY_LANG = {
  es: {
    sendCredentials: 'Enviar datos de acceso',
    sending: '⏳ Enviando...',
    copyFirst: 'Por favor copia primero los datos de acceso y luego haz clic en este botón.'
  },
  en: {
    sendCredentials: 'Send credentials',
    sending: '⏳ Sending...',
    copyFirst: 'Please copy the credentials first, then click this button.'
  },
  ar: {
    sendCredentials: 'إرسال بيانات الدخول',
    sending: '⏳ جارٍ الإرسال...',
    copyFirst: 'يُرجى نسخ بيانات الدخول أولاً، ثم النقر على هذا الزر.'
  },
  ru: {
    sendCredentials: 'Отправить данные для входа',
    sending: '⏳ Отправка...',
    copyFirst: 'Сначала скопируйте данные для входа, затем нажмите эту кнопку.'
  },
  fr: {
    sendCredentials: 'Envoyer les identifiants',
    sending: '⏳ Envoi...',
    copyFirst: 'Veuillez d\'abord copier les identifiants, puis cliquer sur ce bouton.'
  },
  tr: {
    sendCredentials: 'Giriş bilgilerini gönder',
    sending: '⏳ Gönderiliyor...',
    copyFirst: 'Lütfen önce giriş bilgilerini kopyalayın, ardından bu düğmeye tıklayın.'
  },
  id: {
    sendCredentials: 'Kirim data login',
    sending: '⏳ Mengirim...',
    copyFirst: 'Silakan salin data login terlebih dahulu, lalu klik tombol ini.'
  },
  it: {
    sendCredentials: 'Invia credenziali',
    sending: '⏳ Invio...',
    copyFirst: 'Copia prima le credenziali, poi clicca su questo pulsante.'
  },
  pl: {
    sendCredentials: 'Wyślij dane logowania',
    sending: '⏳ Wysyłanie...',
    copyFirst: 'Najpierw skopiuj dane logowania, a następnie kliknij ten przycisk.'
  },
  pt: {
    sendCredentials: 'Enviar dados de acesso',
    sending: '⏳ Enviando...',
    copyFirst: 'Copie primeiro os dados de acesso e depois clique neste botão.'
  }
};

const SEND_CREDENTIAL_RTL_LANGUAGES = ['ar'];


function getSendCredentialLanguage() {
  try {
    if (typeof getMessageLanguage === 'function') {
      return getMessageLanguage();
    }
  } catch (error) {

  }
  return 'es';
}


function isStudentPage() {
  const url = window.location.href;
  return /https?:\/\/bo\.kodland\.org\/students\/\d+/.test(url);
}


function findCredentialCopyButton() {

  const xpath = '//*[@id="app"]/div/div/div/div/div[2]/main/div/div/div[1]/div[4]/div/button[4]';
  
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    const element = result.singleNodeValue;
    

    if (element && element.tagName === 'I') {
      const button = element.closest('button') || element.parentElement;
      if (button) {
        console.log('✅ Credential copy button found via XPath');
        return button;
      }
    }
    
    if (element) {
      console.log('✅ Credential copy button found via XPath');
      return element;
    }
  } catch (error) {
    console.warn('Error evaluating XPath for credential button:', error);
  }
  

  try {
    const altXpath = '//*[@id="app"]/div/div/div/div/div[2]/main/div/div/div[1]/div[4]/div/button[4]/i';
    const result = document.evaluate(
      altXpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    const element = result.singleNodeValue;
    if (element && element.tagName === 'I') {
      const button = element.closest('button') || element.parentElement;
      if (button && button.tagName === 'BUTTON') {
        console.log('✅ Credential copy button found via icon XPath');
        return button;
      }
    }
  } catch (error) {
    console.warn('Error evaluating icon XPath:', error);
  }
  

  try {
    const copyIcons = document.querySelectorAll('i[class*="copy"], i[class*="clipboard"], button i[class*="copy"]');
    for (const icon of copyIcons) {
      const button = icon.closest('button');
      if (button) {

        const parentDiv = button.closest('div[4]');
        if (parentDiv) {
          console.log('✅ Credential copy button found via icon search');
          return button;
        }
      }
    }
  } catch (error) {
    console.warn('Error searching by icon:', error);
  }
  

  try {
    const main = document.querySelector('main');
    if (main) {
      const div4 = main.querySelector('div > div > div[1] > div[4]');
      if (div4) {
        const buttons = div4.querySelectorAll('button');

        if (buttons.length >= 4) {
          const copyButton = buttons[buttons.length - 1] || buttons[3];
          console.log('✅ Credential copy button found via section search');
          return copyButton;
        }
      }
    }
  } catch (error) {
    console.warn('Error searching by section:', error);
  }
  
  console.warn('⚠️ Credential copy button not found with any strategy');
  return null;
}


function extractPhoneNumber(containerElement) {
  if (!containerElement) return null;
  
  const textContent = containerElement.textContent || '';
  
  const phonePatterns = [
    /\+?[0-9]{10,15}/g,
    /\+?[0-9]{1,3}[0-9]{8,12}/g,
    /Телефон:\s*([+\d\s\-()]+)/i,
    /Phone:\s*([+\d\s\-()]+)/i,
    /Teléfono:\s*([+\d\s\-()]+)/i
  ];
  
  for (const pattern of phonePatterns) {
    const matches = textContent.match(pattern);
    if (matches && matches.length > 0) {
      let phone = matches[0];
      const matchWithGroup = textContent.match(pattern);
      if (matchWithGroup && matchWithGroup[1]) {
        phone = matchWithGroup[1];
      }
      phone = phone.replace(/[\s\-()]/g, '').trim();
      phone = phone.replace(/^(Телефон|Phone|Teléfono):/i, '').trim();
      
      if (phone && phone.length >= 10) {
        console.log('Phone number found:', phone);
        return phone;
      }
    }
  }
  
  let parent = containerElement.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const parentText = parent.textContent || '';
    const matches = parentText.match(/\+?[0-9]{10,15}/g);
    if (matches && matches.length > 0) {
      const phone = matches[0].replace(/[\s\-()]/g, '').trim();
      if (phone && phone.length >= 10) {
        console.log('Phone number found in parent:', phone);
        return phone;
      }
    }
    parent = parent.parentElement;
    depth++;
  }
  
  return null;
}


function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }
  cleanPhone = cleanPhone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    console.warn('Phone number too short:', cleanPhone);
    return null;
  }
  
  return cleanPhone;
}


async function readClipboard() {
  try {

    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        console.log('Clipboard read successfully:', text.substring(0, 100));
        return text;
      }
    }
  } catch (error) {
    console.warn('Clipboard API not available or denied:', error);
  }
  

  try {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    

    const success = document.execCommand('paste');
    const text = textarea.value;
    document.body.removeChild(textarea);
    
    if (success && text) {
      console.log('Clipboard read via execCommand:', text.substring(0, 100));
      return text;
    }
  } catch (e) {
    console.error('Error reading clipboard via execCommand:', e);
  }
  
  return null;
}


function encodeMessageForWhatsApp(text) {
  if (!text) return '';
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let encoded = encodeURIComponent(normalized);
  encoded = encoded.replace(/%20/g, '+');
  return encoded;
}


function findContainerElement() {
  const xpath = '//*[@id="app"]/div/div/div/div/div[2]/main/div/div/div[1]/div[2]/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]';
  
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    return result.singleNodeValue;
  } catch (error) {
    console.error('Error finding container element:', error);
    return null;
  }
}


let buttonIntercepted = false;


let isProcessing = false;


let clickFromVisibleButton = false;


let isOpeningWhatsApp = false;


function interceptCredentialCopyButton() {

  if (buttonIntercepted) {
    return true;
  }
  
  const copyButton = findCredentialCopyButton();
  
  if (!copyButton) {
    return false;
  }
  

  if (copyButton.hasAttribute('data-kodland-intercepted')) {
    return true;
  }
  

  copyButton.setAttribute('data-kodland-intercepted', 'true');
  buttonIntercepted = true;
  

  const originalOnClick = copyButton.onclick;
  

  copyButton.addEventListener('click', async function(e) {
    console.log('[Interceptor] Click detected, isProcessing:', isProcessing, 'isOpeningWhatsApp:', isOpeningWhatsApp);
    

    const wasAlreadyProcessing = isProcessing;
    isProcessing = true;
    
    if (wasAlreadyProcessing) {
      console.log('[Interceptor] Already processing (detected by flag check), skipping duplicate execution');
      return;
    }
    
    console.log('[Interceptor] Credential copy button clicked - intercepting');
    console.log('[Interceptor] Set isProcessing = true');
    

    const checkClipboard = async (attempt = 1, maxAttempts = 5) => {
      const delays = [800, 1200, 1500, 2000, 2500];
      const delay = delays[Math.min(attempt - 1, delays.length - 1)];
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const clipboardText = await readClipboard();
      console.log(`[Interceptor] Clipboard attempt ${attempt}:`, clipboardText ? clipboardText.substring(0, 100) : 'empty');
      

      if (clipboardText && clipboardText.includes('Kodland Tutor Assistant')) {
        console.warn('[Interceptor] Clipboard contains "Kodland Tutor Assistant", retrying...');
        if (attempt < maxAttempts) {
          return checkClipboard(attempt + 1, maxAttempts);
        } else {
          console.error('[Interceptor] Failed to get credentials after multiple attempts');
          isProcessing = false;
          return;
        }
      }
      
      if (!clipboardText || clipboardText.trim() === '') {
        console.warn(`[Interceptor] No content found in clipboard (attempt ${attempt})`);
        if (attempt < maxAttempts) {
          return checkClipboard(attempt + 1, maxAttempts);
        } else {
          isProcessing = false;
          return;
        }
      }
      

      const looksLikeCredentials = clipboardText.includes('Usuario') || 
                                    clipboardText.includes('Password') ||
                                    clipboardText.includes('Login') ||
                                    clipboardText.includes('Username') ||
                                    clipboardText.includes('Contraseña') ||
                                    clipboardText.match(/\d{4,}/) ||
                                    clipboardText.length > 20;
      
      console.log('[Interceptor] Credentials validation:', {
        looksLikeCredentials,
        length: clipboardText.length,
        preview: clipboardText.substring(0, 50),
        attempt,
        maxAttempts
      });
      

      if (!looksLikeCredentials && attempt < maxAttempts) {
        console.warn('[Interceptor] Clipboard content does not look like credentials, retrying...');
        return checkClipboard(attempt + 1, maxAttempts);
      }
      

      if (!looksLikeCredentials) {
        console.warn('[Interceptor] Processing anyway after max attempts, even if format is unexpected');
      }
      
      console.log('[Interceptor] Calling processCredentialMessage with text:', clipboardText.substring(0, 100));
      await processCredentialMessage(clipboardText);
      console.log('[Interceptor] processCredentialMessage completed');
      isProcessing = false;
    };
    
    checkClipboard();
  }, true);
  
  console.log('✅ Credential copy button intercepted');
  return true;
}


async function processCredentialMessage(clipboardText) {
  console.log('[processCredentialMessage] Called with text length:', clipboardText ? clipboardText.length : 0);
  

  if (isOpeningWhatsApp) {
    console.log('[processCredentialMessage] WhatsApp already opening, skipping duplicate call');
    return;
  }
  
  isOpeningWhatsApp = true;
  console.log('[processCredentialMessage] Flag set, processing...');
  
  console.log('[processCredentialMessage] Processing credential message:', clipboardText.substring(0, 100));
  

  const container = findContainerElement();
  console.log('[processCredentialMessage] Container found:', !!container);
  
  const phoneNumber = extractPhoneNumber(container);
  console.log('[processCredentialMessage] Phone number extracted:', phoneNumber);
  
  if (!phoneNumber) {
    console.warn('[processCredentialMessage] No phone number found, opening generic WhatsApp');

    const encodedMessage = encodeMessageForWhatsApp(clipboardText);
    const whatsappUrl = `https://api.whatsapp.com`;
    console.log('[processCredentialMessage] Opening:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    setTimeout(() => { 
      isOpeningWhatsApp = false;
      console.log('[processCredentialMessage] Flag reset');
    }, 1000);
    return;
  }
  

  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  console.log('[processCredentialMessage] Formatted phone:', formattedPhone);
  
  if (formattedPhone) {

    const encodedMessage = encodeMessageForWhatsApp(clipboardText);
    

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    console.log('[processCredentialMessage] Opening WhatsApp URL:', whatsappUrl.substring(0, 100) + '...');
    console.log('[processCredentialMessage] Full URL length:', whatsappUrl.length);
    
    try {

      const newWindow = window.open(whatsappUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {

        console.warn('[processCredentialMessage] Pop-up blocked, trying alternative method');

        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('[processCredentialMessage] Alternative method used (link click)');
      } else {
        console.log('[processCredentialMessage] window.open called successfully');
      }
    } catch (error) {
      console.error('[processCredentialMessage] Error opening WhatsApp:', error);

      try {
        window.location.href = whatsappUrl;
        console.log('[processCredentialMessage] Fallback: using window.location.href');
      } catch (e) {
        console.error('[processCredentialMessage] All methods failed:', e);
      }
    }
  } else {
    console.warn('[processCredentialMessage] Could not format phone number, opening generic WhatsApp');

    const encodedMessage = encodeMessageForWhatsApp(clipboardText);
    const whatsappUrl = `https://api.whatsapp.com`;
    console.log('[processCredentialMessage] Opening fallback:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  }
  

  setTimeout(() => { 
    isOpeningWhatsApp = false;
    console.log('[processCredentialMessage] Flag reset after delay');
  }, 2000);
}


function createSendCredentialButton() {
  const language = getSendCredentialLanguage();
  const labels = SEND_CREDENTIAL_LABELS_BY_LANG[language] || SEND_CREDENTIAL_LABELS_BY_LANG.es;
  const isRtl = SEND_CREDENTIAL_RTL_LANGUAGES.includes(language);

  const button = document.createElement('button');
  button.id = 'kodland-send-credential-button';
  button.className = 'kodland-wa-btn kodland-send-btn';
  button.setAttribute('lang', language);
  button.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
    </svg>
    ${labels.sendCredentials}
  `;


  let buttonClickInProgress = false;

  button.addEventListener('click', async function(e) {

    e.stopPropagation();
    e.stopImmediatePropagation();


    if (isProcessing || isOpeningWhatsApp || buttonClickInProgress) {
      console.log('[Send Credential Button] Already processing or click in progress, skipping duplicate click');
      console.log('[Send Credential Button] State - isProcessing:', isProcessing, 'isOpeningWhatsApp:', isOpeningWhatsApp, 'buttonClickInProgress:', buttonClickInProgress);
      return;
    }

    console.log('[Send Credential Button] Send Credential button clicked');
    buttonClickInProgress = true;


    const originalText = button.innerHTML;
    button.innerHTML = labels.sending;
    button.disabled = true;
    
    try {

      const copyButton = findCredentialCopyButton();
      
      if (copyButton) {

        console.log('[Send Credential Button] Current state - isProcessing:', isProcessing, 'isOpeningWhatsApp:', isOpeningWhatsApp);
        console.log('[Send Credential Button] Clicking copy button, interceptor will handle processing');
        copyButton.click();
        console.log('[Send Credential Button] Copy button clicked');
        

        setTimeout(() => {
          buttonClickInProgress = false;
        }, 5000);
        

        const checkProcessing = setInterval(() => {
          if (!isProcessing && !isOpeningWhatsApp) {
            clearInterval(checkProcessing);
            buttonClickInProgress = false;
            button.innerHTML = originalText;
            button.disabled = false;
            console.log('[Send Credential Button] UI reset after processing');
          }
        }, 100);
        

        setTimeout(() => {
          clearInterval(checkProcessing);
          isProcessing = false;
          isOpeningWhatsApp = false;
          buttonClickInProgress = false;
          button.innerHTML = originalText;
          button.disabled = false;
          console.log('[Send Credential Button] UI reset after timeout');
        }, 15000);
      } else {

        const clipboardText = await readClipboard();
        if (clipboardText) {
          await processCredentialMessage(clipboardText);
        } else {
          alert(labels.copyFirst);
        }
        isProcessing = false;
        clickFromVisibleButton = false;
        button.innerHTML = originalText;
        button.disabled = false;
      }
    } catch (error) {
      console.error('Error in Send Credential button:', error);
      isProcessing = false;
      clickFromVisibleButton = false;
      button.innerHTML = originalText;
      button.disabled = false;
    }
  });
  
  return button;
}


function injectSendCredentialButton() {

  if (!isStudentPage()) {
    return;
  }
  

  if (document.getElementById('kodland-send-credential-button')) {
    return;
  }
  

  const container = findContainerElement();
  
  if (container) {
    const button = createSendCredentialButton();
    container.appendChild(button);
    console.log('✅ "Send Credential" button injected successfully');
  } else {
    console.warn('⚠️ Could not find container element for Send Credential button');
  }
}



function initSendCredential() {

  if (!isStudentPage()) {
    return;
  }
  

  injectSendCredentialButton();
  

  if (interceptCredentialCopyButton()) {
    return;
  }
  

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectSendCredentialButton();
      interceptCredentialCopyButton();
    });
  }
  

  const observer = new MutationObserver(function(mutations) {

    if (!document.getElementById('kodland-send-credential-button')) {
      injectSendCredentialButton();
    }
    

    if (!buttonIntercepted) {
      interceptCredentialCopyButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  

  let attempts = 0;
  const maxAttempts = 15;
  const intervalId = setInterval(() => {
    if (isStudentPage()) {
      attempts++;
      

      if (!document.getElementById('kodland-send-credential-button')) {
        injectSendCredentialButton();
      }
      

      if (!buttonIntercepted) {
        interceptCredentialCopyButton();
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    } else {
      clearInterval(intervalId);
    }
  }, 2000);
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSendCredential);
} else {
  initSendCredential();
}


if (typeof window !== 'undefined') {
  window.KodlandSendCredential = {
    interceptCredentialCopyButton,
    initSendCredential,
    extractPhoneNumber,
    readClipboard
  };
}

