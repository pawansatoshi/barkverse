(() => {
  const input = document.querySelector('#dogPhoto');
  const hint = document.querySelector('#uploadHint');
  const title = document.querySelector('#uploadTitle');
  const preview = document.querySelector('#preview');
  const button = document.querySelector('#demoBtn');
  if (!input) return;

  const originalFetch = window.fetch.bind(window);
  let preflight = null;
  let requestKey = '';

  const setStatus = (headline, message, bad = false) => {
    if (title) title.textContent = headline;
    if (hint) {
      hint.textContent = message;
      hint.dataset.state = bad ? 'error' : 'ok';
    }
  };

  const keyFor = (body) => `${body?.imageBase64 || ''}:${body?.mimeType || ''}`.slice(0, 128);

  window.fetch = async (url, options = {}) => {
    if (String(url) === '/api/dog' && preflight?.response && preflight.key === keyFor(JSON.parse(options.body || '{}'))) {
      const cached = preflight.response;
      preflight = null;
      return new Response(JSON.stringify(cached.body), { status: cached.status, headers: { 'Content-Type': 'application/json' } });
    }
    return originalFetch(url, options);
  };

  input.setAttribute('capture', 'environment');
  input.setAttribute('accept', 'image/jpeg,image/png,image/webp');

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    preflight = null;
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setStatus('Dog photo required', 'That file is not a supported dog photo. Choose JPEG, PNG or WebP.', true);
      input.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setStatus('Photo is too large', 'Choose a dog photo under 3 MB. We optimize it before AI inspection.', true);
      input.value = '';
      return;
    }

    setStatus('Checking the visitor…', 'AI is making sure this really is a dog before BARKVERSE opens.', false);
    if (button) button.disabled = true;

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const encoded = dataUrl.split(',')[1];
      const body = { name: '', imageBase64: encoded, mimeType: file.type };
      const response = await originalFetch('/api/dog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await response.json();
      const key = keyFor(body);
      preflight = { key, response: { status: response.status, body: json } };

      if (!response.ok) {
        setStatus('Nope. Not a dog. 🐶', json.error || 'BARKVERSE only accepts dog photos. Try a photo of a dog.', true);
        if (preview) preview.classList.add('hidden');
        input.value = '';
        preflight = null;
        return;
      }

      if (preview) {
        preview.replaceChildren();
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Dog photo preview';
        preview.appendChild(img);
        preview.classList.remove('hidden');
      }
      const breed = json.breed?.label || 'Unknown / mixed breed';
      const confidence = String(json.breed?.confidence || 'low').toUpperCase();
      setStatus(`🐶 ${breed}`, `Dog detected · breed estimate: ${confidence} confidence. Add a name if you want, then enter the BARKVERSE.`, false);
      requestKey = key;
    } catch {
      preflight = null;
      setStatus('Dog check unavailable', 'We could not inspect that image right now. Try again with a clear dog photo.', true);
    } finally {
      if (button) button.disabled = false;
    }
  }, { capture: false });

  document.addEventListener('click', (event) => {
    if (event.target === button && !input.files?.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus('Bring a dog first 🐾', 'Upload a dog photo or use the camera. BARKVERSE accepts dogs only.', true);
    }
  }, true);
})();
