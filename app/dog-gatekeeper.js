(() => {
  const input = document.querySelector('#dogPhoto');
  const hint = document.querySelector('#uploadHint');
  const title = document.querySelector('#uploadTitle');
  const preview = document.querySelector('#preview');
  const button = document.querySelector('#demoBtn');
  const pawprintButton = document.querySelector('#pawprintBtn');
  const pawprintOutput = document.querySelector('#pawprintOutput');
  if (!input) return;
  const nativeFetch = window.fetch.bind(window);
  let cachedDogResponse = null;
  let replayingEntry = false;
  window.fetch = async (resource, options = {}) => {
    const url = typeof resource === 'string' ? resource : (resource?.url || '');
    if (String(url) === '/api/dog' && cachedDogResponse) {
      const cached = JSON.parse(JSON.stringify(cachedDogResponse));
      try { cached.name = JSON.parse(options.body || '{}').name || cached.name; } catch {}
      cachedDogResponse = null;
      return new Response(JSON.stringify(cached), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (!String(url).startsWith('/api/') || options.signal) return nativeFetch(resource, options);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
    try { return await nativeFetch(resource, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); }
  };
  const setStatus = (headline, message, bad = false) => { if (title) title.textContent = headline; if (hint) { hint.textContent = message; hint.dataset.state = bad ? 'error' : 'ok'; } };
  const restoreEntryButton = () => { if (!button) return; button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = button.dataset.entryLabel || 'Enter BARKVERSE →'; };
  const uploadBox = document.querySelector('#uploadBox');
  if (uploadBox && !document.querySelector('#dogPhotoChoices')) {
    const choices = document.createElement('div'); choices.id = 'dogPhotoChoices'; choices.setAttribute('aria-label', 'Dog photo source');
    choices.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:min(440px,100%);margin:10px auto 0;position:relative;z-index:4';
    choices.innerHTML = '<button type="button" id="dogCameraChoice" class="secondary" style="width:100%;margin:0">📷 Take photo</button><button type="button" id="dogGalleryChoice" class="secondary" style="width:100%;margin:0">🖼️ Upload photo</button>';
    uploadBox.insertAdjacentElement('afterend', choices);
    choices.querySelector('#dogCameraChoice').addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); input.value = ''; input.setAttribute('accept', 'image/jpeg,image/png,image/webp'); input.setAttribute('capture', 'environment'); input.click(); });
    choices.querySelector('#dogGalleryChoice').addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); input.value = ''; input.setAttribute('accept', 'image/jpeg,image/png,image/webp'); input.removeAttribute('capture'); input.click(); });
  }
  input.setAttribute('accept', 'image/jpeg,image/png,image/webp');
  input.addEventListener('change', () => {
    const file = input.files?.[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setStatus('Dog photo required', 'That file is not supported. Choose JPEG, PNG or WebP.', true); input.value = ''; if (preview) preview.classList.add('hidden'); return; }
    if (file.size > 3 * 1024 * 1024) { setStatus('Photo is too large', 'Choose a dog photo under 3 MB. We optimize it before AI inspection.', true); input.value = ''; if (preview) preview.classList.add('hidden'); return; }
    const reader = new FileReader();
    reader.onload = () => { if (preview) { preview.replaceChildren(); const img = document.createElement('img'); img.src = String(reader.result); img.alt = 'Dog photo preview'; preview.appendChild(img); preview.classList.remove('hidden'); } setStatus('Dog photo ready 🐾', 'Photo prepared. Press Enter BARKVERSE to start the dog check.'); restoreEntryButton(); };
    reader.onerror = () => setStatus('Photo could not be read', 'Try another JPEG, PNG or WebP image.', true); reader.readAsDataURL(file);
  });
  document.addEventListener('click', async (event) => {
    if (event.target !== button || replayingEntry) return;
    if (!input.files?.length) { event.preventDefault(); event.stopImmediatePropagation(); setStatus('Bring a dog first 🐾', 'Upload a dog photo or use the camera. BARKVERSE accepts dogs only.', true); return; }
    event.preventDefault(); event.stopImmediatePropagation(); const file = input.files[0]; button.dataset.entryLabel = button.textContent; button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = '🐾 Checking dog…'; setStatus('Checking the visitor…', 'AI is verifying that this is a dog. This check runs once.');
    try {
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await nativeFetch('/api/dog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '', imageBase64: dataUrl.split(',')[1], mimeType: file.type }) });
      const json = await response.json().catch(() => ({})); if (!response.ok) throw new Error(json.error || 'This image could not be accepted as a dog.'); cachedDogResponse = json; replayingEntry = true; restoreEntryButton(); setStatus('Dog verified 🐶', 'Opening BARKVERSE…'); button.click(); replayingEntry = false;
    } catch (error) { cachedDogResponse = null; replayingEntry = false; restoreEntryButton(); const message = error?.name === 'AbortError' ? 'The dog check took too long. Please try again with a clear photo.' : String(error?.message || error); setStatus('Dog check failed', message, true); }
  }, true);
  const injectedWallets = () => {
    const candidates = [['Phantom', window.phantom?.solana], ['Solflare', window.solflare], ['Backpack', window.backpack], ['OKX Wallet', window.okxwallet?.solana], ['Bitget Wallet', window.bitget?.solana], ['Brave Wallet', window.braveSolana], ['Solana wallet', window.solana]];
    const seen = new Set();
    return candidates.filter(([, wallet]) => { if (!wallet || typeof wallet.connect !== 'function' || typeof wallet.signAndSendTransaction !== 'function') return false; const key = wallet.publicKey?.toString?.() || wallet; if (seen.has(key)) return false; seen.add(key); return true; });
  };
  async function getWalletProvider() {
    const wallets = injectedWallets();
    if (wallets.length) { const [name, wallet] = wallets[0]; return { wallet, address: wallet.publicKey?.toString?.() || '', source: name }; }
    if (!window.barkverseWalletConnect?.connect) { try { await import('/app/wallet-connect.js'); } catch {} }
    if (window.barkverseWalletConnect?.connect) { if (pawprintOutput) pawprintOutput.textContent = 'No compatible browser wallet detected. Opening the secure WalletConnect wallet chooser…'; return await window.barkverseWalletConnect.connect(); }
    throw new Error('No Solana wallet detected. Install Phantom, Solflare, Backpack, or use WalletConnect.');
  }
  pawprintButton?.addEventListener('click', async (event) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const memoryText = document.querySelector('#memoryOutput')?.textContent?.trim(); const dogName = document.querySelector('#dogName')?.textContent?.trim() || 'DOG';
    if (!memoryText) { if (pawprintOutput) pawprintOutput.textContent = 'Create a memory first, then preserve its Pawprint.'; return; }
    pawprintButton.disabled = true; if (pawprintOutput) pawprintOutput.textContent = 'Connecting wallet and calculating the real Solana devnet fee…';
    try {
      const { wallet, address, source } = await getWalletProvider(); if (typeof wallet.connect === 'function' && !wallet.publicKey) await wallet.connect();
      const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('https://esm.sh/@solana/web3.js@1.98.4'); const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const publicKeyValue = wallet.publicKey?.toString?.() || address; if (!publicKeyValue) throw new Error('Wallet public key unavailable. Reconnect the wallet and try again.'); const publicKey = new PublicKey(publicKeyValue);
      const balance = await connection.getBalance(publicKey, 'confirmed'); if (balance <= 0) throw new Error('This wallet has 0 SOL on Solana devnet. Switch the wallet to Devnet and request free devnet SOL before signing. No transaction was sent.');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed'); const memoryTitle = (document.querySelector('#memoryOutput strong')?.textContent || 'Memory').slice(0, 160); const payload = `BARKVERSE|${dogName.slice(0, 40)}|${memoryTitle}|${Date.now()}`.slice(0, 500); const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey }).add(new TransactionInstruction({ programId: memoProgram, keys: [], data: new TextEncoder().encode(payload) })); const message = transaction.compileMessage(); let feeInfo = await connection.getFeeForMessage(message, 'confirmed');
      if (feeInfo?.value == null) { await new Promise(resolve => setTimeout(resolve, 350)); feeInfo = await connection.getFeeForMessage(message, 'confirmed'); }
      const estimatedLamports = feeInfo?.value; if (!Number.isInteger(estimatedLamports) || estimatedLamports <= 0) throw new Error('Solana returned no valid network-fee estimate. The transaction was NOT signed. Please retry in a moment.');
      if (balance < estimatedLamports) throw new Error(`Insufficient devnet SOL. Required network fee is ${(estimatedLamports / 1e9).toFixed(9)} SOL; wallet balance is ${(balance / 1e9).toFixed(9)} SOL. No transaction was sent.`);
      if (pawprintOutput) pawprintOutput.textContent = `🐾 ${source}: real devnet network fee ${(estimatedLamports / 1e9).toFixed(9)} SOL. Waiting for wallet approval…`;
      const sent = await wallet.signAndSendTransaction(transaction); const signature = typeof sent === 'string' ? sent : sent?.signature; if (!signature) throw new Error('Wallet did not return a transaction signature. No success state was recorded.');
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed'); const tx = await connection.getTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 }); if (!tx) throw new Error('Transaction was confirmed but its details are not available yet. Please refresh and verify it on Solana Explorer.'); if (tx.meta?.err) throw new Error(`Solana reported a failed transaction: ${JSON.stringify(tx.meta.err)}`);
      const actualLamports = Number(tx.meta?.fee); if (!Number.isFinite(actualLamports) || actualLamports <= 0) throw new Error('Confirmed transaction returned an invalid network fee. The proof was not marked successful.'); if (pawprintOutput) pawprintOutput.innerHTML = `🐾 Pawprint preserved on Solana devnet · actual network fee ${(actualLamports / 1e9).toFixed(9)} SOL · <a href="https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=devnet" target="_blank" rel="noopener noreferrer">View transaction →</a>`;
    } catch (error) { if (pawprintOutput) pawprintOutput.textContent = `Pawprint not preserved: ${String(error?.message || error)} No success state was recorded.`; } finally { pawprintButton.disabled = false; }
  }, true);
})();
