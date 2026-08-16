(() => {
  const nativeFetch = window.fetch.bind(window);
  const API_LANGUAGES = new Set(['en','hi','es','fr','de','ja','ko']);
  const getLanguage = () => {
    try {
      const lang = window.BARKVERSE_I18N?.getLanguage?.();
      if (API_LANGUAGES.has(lang)) return lang;
      const saved = JSON.parse(localStorage.getItem('barkverse.experience.v2') || '{}');
      return API_LANGUAGES.has(saved.lang) ? saved.lang : 'en';
    } catch { return 'en'; }
  };
  const languageEndpoints = new Set(['/api/dog','/api/talk','/api/memory','/api/voice']);
  window.fetch = (resource, options = {}) => {
    const url = typeof resource === 'string' ? resource : (resource?.url || '');
    if (!languageEndpoints.has(String(url)) || !options.body || typeof options.body !== 'string') return nativeFetch(resource, options);
    try {
      const body = JSON.parse(options.body);
      body.language = getLanguage();
      options = { ...options, body: JSON.stringify(body) };
    } catch {}
    return nativeFetch(resource, options);
  };
})();
