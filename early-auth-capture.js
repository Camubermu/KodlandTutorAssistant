
var authToken = (typeof authToken !== 'undefined' && authToken) ? authToken : null;

(function installEarlyAuthTokenInterceptors() {
  if (window.__kodlandAuthInterceptorsInstalled) return;
  window.__kodlandAuthInterceptorsInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const [, options = {}] = args;

    if (options.headers) {
      let authHeader = null;
      if (options.headers instanceof Headers) {
        authHeader = options.headers.get('Authorization');
      } else if (typeof options.headers === 'object') {
        authHeader = options.headers['Authorization'] || options.headers.Authorization;
      }
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.replace('Bearer ', '').trim();
        if (newToken) authToken = newToken;
      }
    }

    const fetchPromise = originalFetch.apply(this, args);
    fetchPromise.then(response => {
      const authHeader = response.headers.get('Authorization') || response.headers.get('X-Auth-Token');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.replace('Bearer ', '').trim();
        if (newToken) authToken = newToken;
      }
    }).catch(() => {});

    return fetchPromise;
  };

  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    if (header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
      authToken = value.replace('Bearer ', '').trim();
    }
    return originalSetRequestHeader.apply(this, arguments);
  };

  console.log('[Kodland Early Auth Capture] Interceptors instalados en document_start');
})();
