

const OPEN_WA_LABELS_BY_LANG = {
  es: { openWhatsApp: 'Abrir WhatsApp', opening: '✓ Abriendo...' },
  en: { openWhatsApp: 'Open WhatsApp', opening: '✓ Opening...' },
  ar: { openWhatsApp: 'فتح واتساب', opening: '✓ جارٍ الفتح...' },
  ru: { openWhatsApp: 'Открыть WhatsApp', opening: '✓ Открываем...' },
  fr: { openWhatsApp: 'Ouvrir WhatsApp', opening: '✓ Ouverture...' },
  tr: { openWhatsApp: 'WhatsApp\'ı Aç', opening: '✓ Açılıyor...' },
  id: { openWhatsApp: 'Buka WhatsApp', opening: '✓ Membuka...' },
  it: { openWhatsApp: 'Apri WhatsApp', opening: '✓ Apertura...' },
  pl: { openWhatsApp: 'Otwórz WhatsApp', opening: '✓ Otwieranie...' },
  pt: { openWhatsApp: 'Abrir WhatsApp', opening: '✓ Abrindo...' }
};

const OPEN_WA_RTL_LANGUAGES = ['ar'];


function getOpenWaLanguage() {
  try {
    if (typeof getMessageLanguage === 'function') {
      return getMessageLanguage();
    }
  } catch (error) {

  }
  return 'es';
}

function findElementByXPathDirect() {
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
    console.error('Error evaluating XPath:', error);
    return null;
  }
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
  
  console.warn('No phone number found in container');
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


function createOpenWAButton(containerElement) {
  const language = getOpenWaLanguage();
  const labels = OPEN_WA_LABELS_BY_LANG[language] || OPEN_WA_LABELS_BY_LANG.es;
  const isRtl = OPEN_WA_RTL_LANGUAGES.includes(language);

  const button = document.createElement('button');
  button.id = 'kodland-open-wa-button';
  button.className = 'kodland-wa-btn kodland-open-btn';
  button.setAttribute('lang', language);
  button.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
    </svg>
    ${labels.openWhatsApp}
  `;

  button.addEventListener('click', function() {

    const phoneNumber = extractPhoneNumber(containerElement);

    if (phoneNumber) {

      const formattedPhone = formatPhoneForWhatsApp(phoneNumber);

      if (formattedPhone) {

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}`;
        console.log('Opening WhatsApp for phone:', formattedPhone);
        window.open(whatsappUrl, '_blank');


        const originalText = button.innerHTML;
        button.innerHTML = labels.opening;
        button.disabled = true;
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
        }, 2000);
      } else {
        console.error('Could not format phone number:', phoneNumber);

        window.open('https://api.whatsapp.com', '_blank');
      }
    } else {
      console.warn('No phone number found, opening generic WhatsApp');

      window.open('https://web.whatsapp.com', '_blank');
    }
  });
  
  return button;
}


function isStudentPage() {
  const url = window.location.href;

  return /https?:\/\/bo\.kodland\.org\/students\/\d+/.test(url);
}


function injectOpenWAButton() {

  if (!isStudentPage()) {
    return;
  }
  

  if (document.getElementById('kodland-open-wa-button')) {
    return;
  }
  

  const targetElement = findElementByXPathDirect();
  
  if (targetElement) {
    const button = createOpenWAButton(targetElement);
    targetElement.appendChild(button);
    console.log('✅ "Open WA" button injected successfully at XPath');
  } else {
    console.warn('⚠️ Could not find target element. Retrying...');
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectOpenWAButton);
} else {
  injectOpenWAButton();
}


const observer = new MutationObserver(function(mutations) {

  if (isStudentPage() && !document.getElementById('kodland-open-wa-button')) {
    injectOpenWAButton();
  }
});


if (isStudentPage()) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}


let attempts = 0;
const maxAttempts = 15;
const intervalId = setInterval(() => {
  if (isStudentPage()) {
    attempts++;
    if (!document.getElementById('kodland-open-wa-button')) {
      injectOpenWAButton();
    }
    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
    }
  } else {

    clearInterval(intervalId);
  }
}, 2000);


if (typeof window !== 'undefined') {
  window.KodlandOpenWA = {
    injectOpenWAButton,
    findElementByXPathDirect
  };
}

