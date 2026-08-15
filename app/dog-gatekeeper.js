(() => {
  const input = document.querySelector('#dogPhoto');
  const hint = document.querySelector('#uploadHint');
  const title = document.querySelector('#uploadTitle');
  const preview = document.querySelector('#preview');
  const button = document.querySelector('#demoBtn');
  const pawprintButton = document.querySelector('#pawprintBtn');
  const pawprintOutput = document.querySelector('#pawprintOutput');
  if (!input) return;

  const originalFetch = window.fetch.bind(window);
  let preflight = null;
  const setStatus = (headline, message, bad = false) => {
    if (title) title.textContent = headline;
    if (hint) { hint.textContent = message; hint.dataset.state = bad ? 'error' : 'ok'; }
  };

  const uploadBox = document.querySelector('#uploadBox');
  if (uploadBox && !document.querySelector('#dogPhotoChoices')) {
    const choices = document.createElement('div');
    choices.id = 'dogPhotoChoices';
    choices.setAttribute('aria-label', 'Dog photo source');
    choices.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:min(440px,100%);margin:10px auto 0;position:relative;z-index:4';
    choices.innerHTML = '<button type="button" id="dogCameraChoice" class="secondary" style="width:100%;margin:0">📷 Take photo</button><button type="button" id="dogGalleryChoice" class="secondary" style="width:100%;margin:0">🖼️ Upload photo</button>';
    uploadBox.insertAdjacentElement('afterend', choices);
    choices.querySelector('#dogCameraChoice').addEventListener('click', (event) => {
      event.preventDefault(); event.stopPropagation(); input.value = '';
      input.setAttribute('accept', 'image/jpeg,image/png,image/webp'); input.setAttribute('capture', 'environment'); input.click();
    });
    choices.querySelector('#dogGalleryChoice').addEventListener('click', (event) => {
      event.preventDefault(); event.stopPropagation(); input.value = '';
      input.setAttribute('accept', 'image/jpeg,image/png,image/webp'); input.removeAttribute('capture'); input.click();
    });
  }

  window.fetch = async (url, options = {}) => {
    if (String(url) === '/api/dog' && preflight?.response) {
      const cached = JSON.parse(JSON.stringify(preflight.response.body));
      const requested = (() => { try { return JSON.parse(options.body || '{}').name || ''; } catch { return ''; } })();
      if (requested) cached.name = requested;
      preflight = null;
      return new Response(JSON.stringify(cached), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return originalFetch(url, options);
  };

  input.setAttribute('accept', 'image/jpeg,image/png,image/webp');
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; preflight = null; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setStatus('Dog photo required', 'That file is not supported. Choose JPEG, PNG or WebP.', true); input.value = ''; return; }
    if (file.size > 3 * 1024 * 1024) { setStatus('Photo is too large', 'Choose a dog photo under 3 MB. We optimize it before AI inspection.', true); input.value = ''; return; }
    setStatus('Checking the visitor…', 'AI is making sure this really is a dog before BARKVERSE opens.');
    if (button) button.disabled = true;
    try {
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await originalFetch('/api/dog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '', imageBase64: dataUrl.split(',')[1], mimeType: file.type }) });
      const json = await response.json();
      if (!response.ok) { setStatus('Nope. Not a dog. 🐶', json.error || 'BARKVERSE only accepts dog photos. Try a photo of a dog.', true); if (preview) preview.classList.add('hidden'); input.value = ''; preflight = null; return; }
      preflight = { response: { status: response.status, body: json } };
      if (preview) { preview.replaceChildren(); const img = document.createElement('img'); img.src = dataUrl; img.alt = 'Dog photo preview'; preview.appendChild(img); preview.classList.remove('hidden'); }
      const breed = json.breed?.label || 'Unknown / mixed breed';
      const confidence = String(json.breed?.confidence || 'low').toUpperCase();
      setStatus(`🐶 ${breed}`, `Dog detected · breed estimate: ${confidence} confidence. Add a name if you want, then enter BARKVERSE.`);
    } catch { preflight = null; setStatus('Dog check unavailable', 'We could not inspect that image right now. Try again with a clear dog photo.', true); }
    finally { if (button) button.disabled = false; }
  });

  document.addEventListener('click', (event) => {
    if (event.target === button && (!input.files?.length || !preflight)) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!input.files?.length) setStatus('Bring a dog first 🐾', 'Upload a dog photo or use the camera. BARKVERSE accepts dogs only.', true);
      else setStatus('Dog check needed 🐾', 'Please wait for the AI dog check to finish, then enter BARKVERSE.', true);
    }
  }, true);

  pawprintButton?.addEventListener('click', async (event) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const memoryText = document.querySelector('#memoryOutput')?.textContent?.trim();
    const dogName = document.querySelector('#dogName')?.textContent?.trim() || 'DOG';
    if (!memoryText) { if (pawprintOutput) pawprintOutput.textContent = 'Create a memory first, then preserve its Pawprint.'; return; }
    const wallet = window.solana || window.phantom?.solana;
    if (!wallet) { if (pawprintOutput) pawprintOutput.textContent = 'Wallet not detected. Open BARKVERSE in Phantom or another compatible Solana wallet browser.'; return; }
    pawprintButton.disabled = true;
    if (pawprintOutput) pawprintOutput.textContent = 'Connecting wallet and calculating the real devnet network fee…';
    try {
      await wallet.connect();
      const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('https://esm.sh/@solana/web3.js@1.98.4');
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const publicKey = wallet.publicKey ? new PublicKey(wallet.publicKey.toString()) : null;
      if (!publicKey) throw new Error('Wallet public key unavailable');
      const balance = await connection.getBalance(publicKey, 'confirmed');
      if (balance <= 0) throw new Error('Wallet has 0 SOL on Solana devnet. Get devnet SOL before signing.');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const memoryTitle = (document.querySelector('#memoryOutput strong')?.textContent || 'Memory').slice(0, 160);
      const payload = `BARKVERSE|${dogName.slice(0, 40)}|${memoryTitle}|${Date.now()}`.slice(0, 500);
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey }).add(new TransactionInstruction({ programId: memoProgram, keys: [], data: new TextEncoder().encode(payload) }));
      const feeInfo = await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed');
      const estimatedLamports = Number(feeInfo?.value ?? 5000);
      if (!Number.isFinite(estimatedLamports) || estimatedLamports <= 0) throw new Error('Network returned an invalid fee estimate; transaction was not signed.');
      if (balance < estimatedLamports) throw new Error(`Insufficient devnet SOL. Required fee is ${(estimatedLamports / 1e9).toFixed(9)} SOL; wallet balance is ${(balance / 1e9).toFixed(9)} SOL.`);
      if (pawprintOutput) pawprintOutput.textContent = `Real devnet fee estimate: ${(estimatedLamports / 1e9).toFixed(9)} SOL. Waiting for wallet approval…`;
      const signed = await wallet.signAndSendTransaction(transaction);
      await connection.confirmTransaction({ signature: signed.signature, blockhash, lastValidBlockHeight }, 'confirmed');
      const tx = await connection.getTransaction(signed.signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      const actualLamports = Number(tx?.meta?.fee ?? estimatedLamports);
      if (pawprintOutput) pawprintOutput.innerHTML = `🐾 Pawprint preserved on Solana devnet · actual network fee ${(actualLamports / 1e9).toFixed(9)} SOL · <a href="https://explorer.solana.com/tx/${encodeURIComponent(signed.signature)}?cluster=devnet" target="_blank" rel="noopener noreferrer">View transaction →</a>`;
    } catch (error) {
      if (pawprintOutput) pawprintOutput.textContent = `Pawprint not preserved: ${String(error?.message || error)}. No success state was recorded.`;
    } finally { pawprintButton.disabled = false; }
  }, true);
})();
