(() => {
  const KEY = 'barkverse.community.v1';
  const state = { account: null, members: [], timer: null };
  const esc = (v) => String(v ?? '').replace(/[&<>\'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ account: state.account })); } catch {} };
  const makeId = () => `guest-${crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  const currentDog = () => {
    const dog = window.BARKVERSE_DOG || null;
    const name = document.querySelector('#dogName')?.textContent || 'Your Dog';
    const breed = document.querySelector('#breedLabel')?.textContent || 'Unknown / mixed breed';
    const traits = [...document.querySelectorAll('#traits .trait')].map((x) => x.textContent).slice(0, 5);
    return dog || { name, breed, traits };
  };
  const account = load();
  state.account = account?.account || null;

  const style = document.createElement('style');
  style.textContent = `
    .community-card{margin-top:14px;background:#fffdf7;border:1px solid var(--line);border-radius:24px;padding:23px;box-shadow:var(--shadow)}
    .community-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.community-head h3{margin:8px 0 5px;font-size:28px;letter-spacing:-.045em}.community-head p{margin:0;color:var(--muted);line-height:1.45}
    .login-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:15px}.login-btn{padding:12px;border-radius:12px;border:1px solid var(--line);background:#fff;font-size:12px}.login-btn strong{display:block;font-size:13px}.login-btn small{color:var(--muted)}
    .community-status{margin-top:11px;padding:10px 12px;border-radius:12px;background:#f2eadc;color:#5f584f;font-size:12px;line-height:1.4}.community-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:15px}.member{display:flex;align-items:center;gap:11px;padding:12px;border:1px solid var(--line);border-radius:17px;background:#fff}.member-avatar{width:48px;height:48px;border-radius:15px;background:#fff3d6;display:grid;place-items:center;font-size:25px;flex:none}.member-copy{min-width:0;flex:1}.member-copy b,.member-copy span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.member-copy span{font-size:11px;color:var(--muted);margin-top:3px}.member-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.member-actions button{min-height:34px;padding:7px 9px;border-radius:9px;font-size:10px;background:#efe8da}.member-actions button.primary-mini{background:#191919;color:#fff}.community-empty{margin-top:14px;padding:20px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:var(--muted);font-size:12px}.community-note{margin-top:12px;font-size:10px;color:var(--muted);line-height:1.5}.account-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:#e9f8ed;color:#267641;font-size:10px;font-weight:900;white-space:nowrap}.online-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--good);animation:ambientPulse 1.4s ease-in-out infinite}
    @media(max-width:720px){.login-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.community-list{grid-template-columns:1fr}.community-head{flex-direction:column}.account-pill{align-self:flex-start}}
  `;
  document.head.appendChild(style);

  const world = document.querySelector('#world');
  const observatory = document.querySelector('#observatory');
  if (!world || !observatory) return;
  const card = document.createElement('section');
  card.className = 'community-card';
  card.id = 'community';
  card.innerHTML = `
    <div class="community-head"><div><span class="tag">BARKVERSE COMMUNITY</span><h3>Humans connect. Dogs connect.</h3><p>Meet the people and dogs already inside the network. Wave, play and start a playful dog-to-dog moment.</p></div><div id="accountPill" class="account-pill"><span class="online-dot"></span> not signed in</div></div>
    <div class="login-grid">
      <button class="login-btn" id="guestLogin"><strong>🐾 Guest</strong><small>instant profile</small></button>
      <button class="login-btn" id="walletLogin"><strong>👛 Wallet</strong><small>optional identity</small></button>
      <button class="login-btn" id="googleLogin"><strong>G Google</strong><small>account login</small></button>
      <button class="login-btn" id="githubLogin"><strong>◉ GitHub</strong><small>account login</small></button>
    </div>
    <div id="communityStatus" class="community-status">Sign in to place your human + dog inside the community.</div>
    <div id="communityList" class="community-list"></div>
    <div class="community-note">Privacy-first: BARKVERSE stores a pseudonymous account ID and community profile fields only. Uploaded dog photos are not stored in the community database. No location is collected. Login is never required to use the core dog-discovery experience.</div>`;
  world.insertBefore(card, observatory);

  const ui = { pill: card.querySelector('#accountPill'), status: card.querySelector('#communityStatus'), list: card.querySelector('#communityList') };
  const setStatus = (text) => { ui.status.textContent = text; };
  const localProfile = (type = 'guest') => {
    const existing = state.account;
    const dog = currentDog();
    const displayName = existing?.displayName || (type === 'wallet' ? 'Wallet Human' : 'Dog Human');
    return { accountId: existing?.accountId || makeId(), type, displayName, dogName: dog.name || 'Your Dog', breed: dog.breed || 'Unknown / mixed breed', traits: dog.traits || [] };
  };
  const sync = async (action, extra = {}) => {
    const profile = localProfile(state.account?.type || 'guest');
    try {
      const response = await fetch(`/api/community?action=${encodeURIComponent(action)}`, { method: action === 'list' ? 'GET' : 'POST', headers: action === 'list' ? undefined : { 'Content-Type': 'application/json' }, body: action === 'list' ? undefined : JSON.stringify({ ...profile, ...extra }) });
      const data = await response.json();
      if (data.members) state.members = data.members;
      return data;
    } catch { return { mode: 'local', members: [] }; }
  };
  const setAccount = (profile) => {
    state.account = profile; save();
    ui.pill.innerHTML = `<span class="online-dot"></span>${esc(profile.displayName)} · online`;
  };
  const join = async (type = 'guest') => {
    const profile = localProfile(type);
    setAccount(profile);
    const data = await sync('join');
    setStatus(data.mode === 'snowflake' ? 'You are live on the BARKNET. Friends using BARKVERSE can appear here.' : 'Your local dog-world profile is saved. Cross-device community sync needs the configured community datastore.');
    await refresh();
  };

  card.querySelector('#guestLogin').addEventListener('click', () => join('guest'));
  card.querySelector('#walletLogin').addEventListener('click', async () => {
    try {
      if (!window.solana?.isPhantom) throw new Error('Phantom wallet not detected');
      await window.solana.connect();
      const key = String(window.solana.publicKey || 'wallet');
      const profile = localProfile('wallet'); profile.accountId = `wallet-${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)).then((b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2,'0')).join('').slice(0,32))}`; profile.displayName = `Wallet ${key.slice(0,4)}…${key.slice(-4)}`;
      setAccount(profile); const data = await sync('join'); setStatus(data.mode === 'snowflake' ? 'Wallet identity connected and dog world joined.' : 'Wallet identity connected locally.'); await refresh();
    } catch (e) { setStatus(`Wallet login unavailable: ${e.message}`); }
  });
  const oauthNotice = (provider) => setStatus(`${provider} login is reserved for the production OAuth configuration. No external account is contacted until that provider is configured.`);
  card.querySelector('#googleLogin').addEventListener('click', () => oauthNotice('Google'));
  card.querySelector('#githubLogin').addEventListener('click', () => oauthNotice('GitHub'));

  function memberEmoji(member) {
    const breed = String(member.breed || '').toLowerCase();
    if (/husky|shepherd/.test(breed)) return '🐺'; if (/poodle|shih|maltese/.test(breed)) return '🐩'; if (/retriever|lab/.test(breed)) return '🦮'; if (/pug|bulldog/.test(breed)) return '🐕'; return '🐶';
  }
  function renderMembers() {
    const others = state.members.filter((m) => m.accountId !== state.account?.accountId);
    if (!others.length) { ui.list.innerHTML = '<div class="community-empty">No other live profiles yet. Invite a friend to join and their dog will appear here.</div>'; return; }
    ui.list.innerHTML = others.slice(0, 20).map((m) => `<article class="member"><div class="member-avatar">${memberEmoji(m)}</div><div class="member-copy"><b>${esc(m.dogName || 'Dog')}</b><span>${esc(m.displayName || 'Dog Human')} · ${esc(m.breed || 'mixed breed')}</span><div class="member-actions"><button data-action="wave" data-id="${esc(m.accountId)}">👋 Wave</button><button data-action="play" data-id="${esc(m.accountId)}" class="primary-mini">🎾 Play</button><button data-action="talk" data-id="${esc(m.accountId)}">💬 Dog talk</button></div></div></article>`).join('');
    ui.list.querySelectorAll('button[data-action]').forEach((button) => button.addEventListener('click', () => interact(button.dataset.action, button.dataset.id)));
  }
  async function interact(action, targetId) {
    if (!state.account) { setStatus('Sign in first so your dog can join the interaction network.'); return; }
    const target = state.members.find((m) => m.accountId === targetId); if (!target) return;
    const me = currentDog();
    const lines = action === 'play' ? [`${me.name || 'Your Dog'} sprinted toward ${target.dogName || 'the other dog'} with a tennis ball.`, `${target.dogName || 'The other dog'} accepted the challenge. BARKCADE rules now apply: maximum zoomies.`] : action === 'talk' ? [`${me.name || 'Your Dog'}: “Hello ${target.dogName || 'friend'}! Treat exchange?”`, `${target.dogName || 'The other dog'}: “Absolutely. But first, tell me where the biscuits are.”`] : [`${me.name || 'Your Dog'} waved at ${target.dogName || 'the other dog'}.`, `${target.dogName || 'The other dog'} waved back. Human networking achieved.`];
    setStatus(lines.join(' ')); barkDogForCommunity(action);
    await sync('event', { targetId, eventAction: action });
  }
  function barkDogForCommunity(action) { try { if (typeof window.BARKVERSE_BARK === 'function') window.BARKVERSE_BARK(action); } catch {} }
  async function refresh() {
    const data = await sync('list');
    renderMembers();
    if (data.mode === 'snowflake') ui.status.textContent = state.account ? 'BARKNET synced · live community profiles are visible.' : 'Live community detected. Sign in to connect your dog.';
  }
  window.addEventListener('beforeunload', () => { if (state.account) navigator.sendBeacon?.(`/api/community?action=leave`, JSON.stringify({ accountId: state.account.accountId })); });
  setInterval(() => { refresh().catch(() => {}); }, 12000);
  refresh();
  window.BARKVERSE_COMMUNITY = { refresh, getAccount: () => state.account };
})();
