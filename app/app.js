const state = {
  dog: null,
  imageBase64: null,
  mimeType: 'image/jpeg',
  memory: null,
};

const $ = (selector) => document.querySelector(selector);
const els = {
  photo: $('#dogPhoto'), preview: $('#preview'), demo: $('#demoBtn'), world: $('#world'),
  nameInput: $('#dogNameInput'), uploadTitle: $('#uploadTitle'), uploadHint: $('#uploadHint'), uploadBox: $('#uploadBox'),
  dogName: $('#dogName'), dogNameTop: $('#dogNameTop'), occupation: $('#occupation'), provider: $('#providerBadge'),
  chaos: $('#chaos'), treats: $('#treats'), zoomies: $('#zoomies'), loyalty: $('#loyalty'),
  newsHeadline: $('#newsHeadline'), newsBody: $('#newsBody'), caseTitle: $('#caseTitle'), caseText: $('#caseText'), caseBtn: $('#caseBtn'), caseOutput: $('#caseOutput'),
  talkInput: $('#talkInput'), talkBtn: $('#talkBtn'), dogReply: $('#dogReply'), dogAudio: $('#dogAudio'), voiceStatus: $('#voiceStatus'),
  memoryInput: $('#memoryInput'), memoryBtn: $('#memoryBtn'), memoryOutput: $('#memoryOutput'), pawprintBtn: $('#pawprintBtn'), pawprintOutput: $('#pawprintOutput'),
  observatoryBtn: $('#observatoryBtn'), observatoryOutput: $('#observatoryOutput')
};

const fallbackDog = (name) => ({
  name: name || 'Bruno', occupation: 'Chief Sofa Security Officer', tagline: 'Professional snack inspector. Part-time human supervisor.',
  traits: ['loyal','chaotic','curious'], stats: { chaos: 92, treats: 98, zoomies: 95, loyalty: 100 },
  news: { headline: 'Human opened the refrigerator.', body: 'Millions of dogs are monitoring the situation. No treats have been confirmed.' },
  caseTitle: 'The Missing Biscuit', caseClue: 'The evidence mysteriously disappeared immediately after the investigation began.'
});

function setLoading(button, loading, label) {
  button.disabled = loading;
  if (loading) { button.dataset.label = button.textContent; button.textContent = label; }
  else if (button.dataset.label) button.textContent = button.dataset.label;
}

function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openPhotoPicker() { els.photo?.click(); }
els.uploadBox?.addEventListener('click', openPhotoPicker);
els.uploadBox?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPhotoPicker(); }
});

function renderDog(dog) {
  state.dog = dog;
  els.dogName.textContent = dog.name || 'Your Dog';
  els.dogNameTop.textContent = `${String(dog.name || 'DOG').toUpperCase()} NETWORK`;
  els.occupation.textContent = dog.occupation || 'Professional Dog';
  els.chaos.textContent = dog.stats?.chaos ?? 92;
  els.treats.textContent = dog.stats?.treats ?? 98;
  els.zoomies.textContent = dog.stats?.zoomies ?? 95;
  els.loyalty.textContent = dog.stats?.loyalty ?? 100;
  els.newsHeadline.textContent = dog.news?.headline || 'Breaking bark: human activity detected.';
  els.newsBody.textContent = dog.news?.body || 'Dogs are monitoring the situation.';
  els.caseTitle.textContent = dog.caseTitle || 'The Missing Biscuit';
  els.caseText.textContent = dog.caseClue || 'A suspicious biscuit-shaped mystery has appeared.';
  els.provider.textContent = `AI engine: ${dog.provider || 'BARKVERSE'}`;
  els.provider.classList.toggle('degraded', Boolean(dog.degraded));
}

els.photo.addEventListener('change', async () => {
  const file = els.photo.files?.[0];
  if (!file) return;
  state.mimeType = file.type || 'image/jpeg';
  try {
    const dataUrl = await dataUrlFromFile(file);
    state.imageBase64 = dataUrl.split(',')[1];
    els.preview.innerHTML = `<img src="${dataUrl}" alt="Uploaded dog">`;
    els.preview.classList.remove('hidden');
    els.uploadTitle.textContent = 'Dog acquired';
    els.uploadHint.textContent = 'Barkverse is ready to discover them.';
  } catch {
    state.imageBase64 = null;
    els.uploadTitle.textContent = 'Photo could not be read';
    els.uploadHint.textContent = 'Please choose another image.';
  }
});

els.demo.addEventListener('click', async () => {
  setLoading(els.demo, true, 'Discovering dog…');
  const requestedName = els.nameInput.value.trim() || 'Bruno';
  try {
    const response = await fetch('/api/dog', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: requestedName, imageBase64: state.imageBase64, mimeType: state.mimeType })
    });
    const dog = await response.json();
    renderDog(dog);
  } catch { renderDog(fallbackDog(requestedName)); }
  els.world.classList.remove('hidden');
  els.world.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setLoading(els.demo, false);
});

els.caseBtn.addEventListener('click', () => {
  const name = state.dog?.name || 'Bruno';
  const outcomes = [
    `${name} has been cleared of all charges. The biscuit was found inside ${name}'s stomach. Investigation closed.`,
    `New evidence: ${name} was seen near the biscuit. ${name} has requested a lawyer and a second biscuit.`,
    `Case solved. The human ate the biscuit. ${name} has demanded compensation in treats.`
  ];
  els.caseOutput.textContent = outcomes[Math.floor(Math.random() * outcomes.length)];
});

els.talkBtn.addEventListener('click', async () => {
  const message = els.talkInput.value.trim();
  if (!message) return;
  setLoading(els.talkBtn, true, 'Thinking…');
  els.voiceStatus.textContent = '';
  try {
    const response = await fetch('/api/talk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dog: state.dog, message }) });
    const data = await response.json();
    els.dogReply.textContent = data.reply || 'The dog is staring at you thoughtfully.';
    els.provider.textContent = `AI engine: ${data.provider || 'BARKVERSE'}`;
    await speakDog(data.reply || els.dogReply.textContent);
  } catch {
    const reply = 'I have reviewed your question. My answer is snacks.';
    els.dogReply.textContent = reply;
    await speakDog(reply);
  }
  setLoading(els.talkBtn, false);
});

async function speakDog(text) {
  try {
    const response = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    if (!response.ok) throw new Error('voice unavailable');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    els.dogAudio.src = url;
    els.dogAudio.classList.remove('hidden');
    await els.dogAudio.play().catch(() => {});
    els.voiceStatus.textContent = '🎙️ ElevenLabs dog voice';
  } catch {
    els.voiceStatus.textContent = '🔈 Voice fallback: browser speech';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.35;
      window.speechSynthesis.speak(utterance);
    }
  }
}

els.memoryBtn.addEventListener('click', async () => {
  const memory = els.memoryInput.value.trim();
  if (!memory) return;
  setLoading(els.memoryBtn, true, 'Writing memory…');
  try {
    const response = await fetch('/api/memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dog: state.dog, memory }) });
    const data = await response.json();
    state.memory = data;
    els.memoryOutput.innerHTML = `<strong>${escapeHtml(data.title)}</strong><p>${escapeHtml(data.story)}</p><em>${escapeHtml(data.closing)}</em>`;
    els.pawprintBtn.classList.remove('hidden');
  } catch {
    els.memoryOutput.textContent = `Some memories are small enough to fit inside an ordinary day, yet somehow become the ones we keep. ${memory}`;
    state.memory = { title: `${state.dog?.name || 'Dog'}'s Little Moment`, story: memory, closing: 'Preserve this moment.' };
    els.pawprintBtn.classList.remove('hidden');
  }
  setLoading(els.memoryBtn, false);
});

els.pawprintBtn.addEventListener('click', createPawprint);

async function createPawprint() {
  if (!state.memory) return;
  els.pawprintBtn.disabled = true;
  els.pawprintOutput.textContent = 'Connecting to Solana devnet…';
  try {
    const wallet = window.solana;
    if (!wallet?.isPhantom) throw new Error('Phantom wallet not detected');
    await wallet.connect();
    const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('https://esm.sh/@solana/web3.js@1.98.4');
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const publicKey = wallet.publicKey || new PublicKey(wallet.publicKey.toString());
    const memoPayload = `BARKVERSE|${state.dog?.name || 'DOG'}|${state.memory.title}|${Date.now()}`.slice(0, 500);
    const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    const instruction = new TransactionInstruction({ programId: memoProgram, keys: [], data: new TextEncoder().encode(memoPayload) });
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey }).add(instruction);
    const signed = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction({ signature: signed.signature, blockhash, lastValidBlockHeight }, 'confirmed');
    els.pawprintOutput.innerHTML = `🐾 Pawprint preserved on Solana devnet. <a href="https://explorer.solana.com/tx/${signed.signature}?cluster=devnet" target="_blank" rel="noreferrer">View proof →</a>`;
  } catch (error) {
    els.pawprintOutput.textContent = `Pawprint is ready, but the wallet step needs attention: ${error.message}. Use Phantom on Solana devnet to preserve it.`;
  } finally { els.pawprintBtn.disabled = false; }
}

els.observatoryBtn.addEventListener('click', async () => {
  setLoading(els.observatoryBtn, true, 'Querying observatory…');
  try {
    const response = await fetch('/api/observatory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dog: state.dog }) });
    const data = await response.json();
    const s = data.stats || {};
    els.observatoryOutput.innerHTML = [
      ['Dogs connected', Number(s.dogsConnected || 0).toLocaleString()],
      ['Humans investigated', Number(s.humansInvestigated || 0).toLocaleString()],
      ['Average zoomies', `${s.averageZoomies || 0}%`],
      ['Sofa ownership claims', `${s.sofaOwnershipClaims || 0}%`],
      ['Snack inspections', `${s.snackInspections || 0}%`]
    ].map(([label, value]) => `<div><b>${value}</b><span>${label}</span></div>`).join('');
  } catch { els.observatoryOutput.textContent = 'The dog internet is temporarily too busy chasing squirrels.'; }
  setLoading(els.observatoryBtn, false);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}
