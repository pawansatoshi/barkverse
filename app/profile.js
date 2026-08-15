(() => {
  const state = { profile: null };
  const esc = (v) => String(v ?? '').replace(/[&<>\'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const clean = (v, max = 120) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);
  const storageKey = 'barkverse.dog-profile.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } };
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state.profile)); } catch {} };
  const currentDog = () => window.BARKVERSE_DOG || {};
  const styles = document.createElement('style');
  styles.textContent = `
    .passport-card{margin-top:14px;background:#fffdf7;border:1px solid var(--line);border-radius:26px;padding:24px;box-shadow:var(--shadow)}
    .passport-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.passport-head h3{margin:7px 0 5px;font-size:30px;letter-spacing:-.045em}.passport-head p{margin:0;color:var(--muted);line-height:1.45}.passport-badge{padding:8px 11px;border-radius:999px;background:#191919;color:#fff;font-size:10px;font-weight:900;white-space:nowrap}.passport-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.passport-section{border:1px solid var(--line);border-radius:20px;padding:18px;background:#fff}.passport-section h4{margin:0 0 12px;font-size:16px}.passport-row{display:flex;justify-content:space-between;gap:15px;padding:8px 0;border-bottom:1px solid #eee8dc;font-size:12px}.passport-row:last-child{border-bottom:0}.passport-row span:first-child{color:var(--muted)}.passport-row span:last-child{text-align:right;font-weight:800;max-width:65%;overflow-wrap:anywhere}.privacy-lock{color:#7d725f!important}.socials{display:flex;flex-wrap:wrap;gap:7px}.social-chip{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;border-radius:999px;background:#f4eee2;font-size:10px;font-weight:800}.passport-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.passport-actions button{min-height:40px;padding:9px 13px;border-radius:11px;border:1px solid var(--line);background:#fff;font-weight:900}.passport-actions .passport-primary{background:#191919;color:#fff;border-color:#191919}.passport-form{display:none;margin-top:16px;padding:17px;border-radius:20px;background:#f7f1e6;border:1px solid var(--line)}.passport-form.open{display:block}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.form-field label{display:block;font-size:10px;font-weight:900;color:var(--muted);margin:0 0 5px;text-transform:uppercase;letter-spacing:.08em}.form-field input,.form-field select{width:100%;min-height:42px;border:1px solid var(--line);border-radius:11px;padding:9px 10px;background:#fff;font:inherit;font-size:14px}.form-full{grid-column:1/-1}.privacy-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;font-size:11px;color:var(--muted)}.privacy-toggle input{width:18px;height:18px}.passport-note{font-size:10px;color:var(--muted);line-height:1.5;margin-top:12px}.passport-toast{margin-top:10px;min-height:18px;font-size:11px;font-weight:800}.care-good{color:#267641}.care-private{color:#7d725f}.passport-empty{color:var(--muted)}
    @media(max-width:720px){.passport-head{flex-direction:column}.passport-badge{align-self:flex-start}.passport-grid,.form-grid{grid-template-columns:1fr}.form-full{grid-column:auto}.passport-section{padding:15px}}
  `;
  document.head.appendChild(styles);

  function ensureCard() {
    if (document.querySelector('#dogPassport')) return document.querySelector('#dogPassport');
    const world = document.querySelector('#world'); const community = document.querySelector('#community'); if (!world) return null;
    const card = document.createElement('section'); card.id = 'dogPassport'; card.className = 'passport-card';
    card.innerHTML = `
      <div class="passport-head"><div><span class="tag">BARKVERSE DOG PASSPORT</span><h3>Your dog's identity, care & social life</h3><p>A richer profile without turning your dog's world into a public owner-data form.</p></div><div class="passport-badge">🐾 DOG PROFILE</div></div>
      <div class="passport-grid">
        <article class="passport-section"><h4>🐶 About</h4><div id="passportAbout"></div></article>
        <article class="passport-section"><h4>💉 Care</h4><div id="passportCare"></div></article>
        <article class="passport-section"><h4>🌐 Dog Social</h4><div id="passportSocial"></div></article>
        <article class="passport-section"><h4>👤 Human</h4><div id="passportHuman"></div></article>
      </div>
      <div class="passport-actions"><button id="passportEdit" class="passport-primary" type="button">✎ Edit profile</button><button id="passportVisit" type="button">🐾 Visit my world</button><button id="passportShare" type="button">🔒 Privacy settings</button></div>
      <form id="passportForm" class="passport-form">
        <div class="form-grid">
          <div class="form-field"><label for="pSex">Sex</label><select id="pSex"><option value="">Not specified</option><option>Female</option><option>Male</option><option>Unknown</option></select></div>
          <div class="form-field"><label for="pDob">Date of birth</label><input id="pDob" type="date" max="9999-12-31"></div>
          <div class="form-field"><label for="pWeight">Weight (optional)</label><input id="pWeight" inputmode="decimal" maxlength="8" placeholder="e.g. 12 kg"></div>
          <div class="form-field"><label for="pLocation">Broad location (optional)</label><input id="pLocation" maxlength="60" placeholder="City / country only"></div>
          <div class="form-field"><label for="pVaccination">Vaccination status</label><select id="pVaccination"><option value="">Not specified</option><option>Up to date</option><option>Partially up to date</option><option>Due for review</option><option>Not vaccinated</option><option>Private</option></select></div>
          <div class="form-field"><label for="pVaccinationDate">Last vaccination</label><input id="pVaccinationDate" type="date"></div>
          <div class="form-field form-full"><label for="pAllergies">Allergies / special care (private by default)</label><input id="pAllergies" maxlength="180" placeholder="Optional — do not add sensitive human information"></div>
          <div class="form-field"><label for="pInstagram">Instagram</label><input id="pInstagram" maxlength="120" placeholder="Dog's profile only"></div>
          <div class="form-field"><label for="pX">X / Twitter</label><input id="pX" maxlength="120" placeholder="Dog's profile only"></div>
          <div class="form-field"><label for="pYoutube">YouTube</label><input id="pYoutube" maxlength="120" placeholder="Dog's profile only"></div>
          <div class="form-field"><label for="pWebsite">Dog website</label><input id="pWebsite" maxlength="160" placeholder="https://…"></div>
          <div class="form-field"><label for="pEmail">Human email</label><input id="pEmail" type="email" maxlength="160" placeholder="Private contact"></div>
          <div class="form-field"><label for="pPhone">Human mobile</label><input id="pPhone" type="tel" maxlength="30" placeholder="Private contact"></div>
          <div class="form-field form-full"><label for="pHuman">Human display name</label><input id="pHuman" maxlength="60" placeholder="Optional public display name"></div>
        </div>
        <div class="privacy-toggle"><span>Show care details to friends</span><input id="pCarePublic" type="checkbox"></div>
        <div class="privacy-toggle"><span>Show dog social links publicly</span><input id="pSocialPublic" type="checkbox"></div>
        <div class="privacy-toggle"><span>Show broad city/country to friends</span><input id="pLocationPublic" type="checkbox"></div>
        <div class="privacy-toggle"><span>Allow private contact requests (never reveal phone/email)</span><input id="pContactRequests" type="checkbox" checked></div>
        <div class="privacy-toggle"><span>Show human email or phone publicly</span><input id="pContactPublic" type="checkbox"></div>
        <div class="passport-actions"><button class="passport-primary" type="submit">Save profile</button><button id="passportCancel" type="button">Cancel</button></div>
        <div id="passportToast" class="passport-toast"></div>
        <p class="passport-note">Privacy defaults are conservative. Phone and email remain hidden even when a profile is visible. BARKVERSE community features should use account/contact requests rather than exposing personal contact details.</p>
      </form>
      <p class="passport-note">Dog health/care information is user-provided, not veterinary advice. Breed is an AI visual estimate with confidence. Exact address and live location are never requested here. Private human contact fields stay out of the community API.</p>`;
    if (community) world.insertBefore(card, community); else world.appendChild(card);
    bind(card); return card;
  }

  function getBaseProfile() {
    const dog = currentDog(); const saved = load() || {};
    return { sex: saved.sex || '', dob: saved.dob || '', weight: saved.weight || '', location: saved.location || '', vaccination: saved.vaccination || '', vaccinationDate: saved.vaccinationDate || '', allergies: saved.allergies || '', socials: saved.socials || {}, human: saved.human || {}, privacy: { carePublic: Boolean(saved.privacy?.carePublic), socialPublic: Boolean(saved.privacy?.socialPublic), locationPublic: Boolean(saved.privacy?.locationPublic), contactRequests: saved.privacy?.contactRequests !== false, contactPublic: false } };
  }
  function render() {
    const card = ensureCard(); if (!card) return; const dog = currentDog(); const p = state.profile || getBaseProfile();
    const age = p.dob ? (() => { const d = new Date(`${p.dob}T00:00:00`); if (Number.isNaN(d.getTime())) return ''; const now = new Date(); let years = now.getFullYear()-d.getFullYear(); const m=now.getMonth()-d.getMonth(); if(m<0||(m===0&&now.getDate()<d.getDate())) years--; return years >= 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : ''; })() : '';
    const breed = dog.breed?.label || 'Unknown / mixed breed';
    card.querySelector('#passportAbout').innerHTML = `<div class="passport-row"><span>Name</span><span>${esc(dog.name || 'Your Dog')}</span></div><div class="passport-row"><span>Sex</span><span>${esc(p.sex || 'Not specified')}</span></div><div class="passport-row"><span>Age</span><span>${esc(age || 'Not specified')}</span></div><div class="passport-row"><span>Breed estimate</span><span>${esc(breed)}</span></div><div class="passport-row"><span>Personality</span><span>${esc((dog.traits || []).slice(0,4).join(' · ') || 'Discovering')}</span></div>`;
    const careVisible = p.privacy.carePublic || !p.vaccination;
    card.querySelector('#passportCare').innerHTML = careVisible ? `<div class="passport-row"><span>Vaccination</span><span class="care-good">${esc(p.vaccination || 'Not specified')}</span></div><div class="passport-row"><span>Last vaccination</span><span>${esc(p.vaccinationDate || 'Not specified')}</span></div><div class="passport-row"><span>Weight</span><span>${esc(p.weight || 'Not specified')}</span></div><div class="passport-row"><span>Special care</span><span class="care-private">${p.allergies ? 'Added · visibility controlled' : 'Not specified'}</span></div>` : `<div class="passport-row"><span>Care details</span><span class="privacy-lock">🔒 Private</span></div><div class="passport-row"><span>Vaccination</span><span class="privacy-lock">🔒 Hidden</span></div>`;
    const socialItems = [['Instagram',p.socials.instagram],['X',p.socials.x],['YouTube',p.socials.youtube],['Website',p.socials.website]].filter(([,v]) => v);
    card.querySelector('#passportSocial').innerHTML = p.privacy.socialPublic && socialItems.length ? `<div class="socials">${socialItems.map(([k,v]) => `<span class="social-chip">${esc(k)} · ${esc(v)}</span>`).join('')}</div>` : `<div class="passport-row"><span>Dog socials</span><span class="privacy-lock">${socialItems.length ? '🔒 Private' : 'Not added'}</span></div>`;
    const humanName = p.human.displayName || 'Dog Human';
    card.querySelector('#passportHuman').innerHTML = `<div class="passport-row"><span>Human</span><span>${esc(humanName)}</span></div><div class="passport-row"><span>Location</span><span>${p.privacy.locationPublic && p.location ? esc(p.location) : '<span class="privacy-lock">🔒 Private</span>'}</span></div><div class="passport-row"><span>Contact</span><span class="privacy-lock">${p.privacy.contactRequests ? 'Contact request · no details exposed' : '🔒 Private'}</span></div>`;
    window.BARKVERSE?.setProfile?.(p);
  }
  function fillForm() {
    const card = document.querySelector('#dogPassport'); const p = state.profile || getBaseProfile(); if (!card) return;
    const map = {pSex:'sex',pDob:'dob',pWeight:'weight',pLocation:'location',pVaccination:'vaccination',pVaccinationDate:'vaccinationDate',pAllergies:'allergies'}; Object.entries(map).forEach(([id,key]) => { const el=card.querySelector(`#${id}`); if(el) el.value=p[key]||''; });
    card.querySelector('#pInstagram').value=p.socials.instagram||''; card.querySelector('#pX').value=p.socials.x||''; card.querySelector('#pYoutube').value=p.socials.youtube||''; card.querySelector('#pWebsite').value=p.socials.website||''; card.querySelector('#pEmail').value=p.human.email||''; card.querySelector('#pPhone').value=p.human.phone||''; card.querySelector('#pHuman').value=p.human.displayName||''; card.querySelector('#pCarePublic').checked=Boolean(p.privacy.carePublic); card.querySelector('#pSocialPublic').checked=Boolean(p.privacy.socialPublic); card.querySelector('#pLocationPublic').checked=Boolean(p.privacy.locationPublic); card.querySelector('#pContactRequests').checked=p.privacy.contactRequests !== false; card.querySelector('#pContactPublic').checked=false; // never enable public contact from stored data
  }
  function bind(card) {
    card.querySelector('#passportEdit').addEventListener('click', () => { fillForm(); card.querySelector('#passportForm').classList.add('open'); card.querySelector('#pSex').focus(); });
    card.querySelector('#passportShare').addEventListener('click', () => { fillForm(); card.querySelector('#passportForm').classList.toggle('open'); card.querySelector('#pCarePublic').focus(); });
    card.querySelector('#passportCancel').addEventListener('click', () => card.querySelector('#passportForm').classList.remove('open'));
    card.querySelector('#passportVisit').addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    card.querySelector('#passportForm').addEventListener('submit', (event) => { event.preventDefault(); state.profile = { sex:clean(card.querySelector('#pSex').value,20), dob:clean(card.querySelector('#pDob').value,10), weight:clean(card.querySelector('#pWeight').value,20), location:clean(card.querySelector('#pLocation').value,60), vaccination:clean(card.querySelector('#pVaccination').value,40), vaccinationDate:clean(card.querySelector('#pVaccinationDate').value,10), allergies:clean(card.querySelector('#pAllergies').value,180), socials:{instagram:clean(card.querySelector('#pInstagram').value,120),x:clean(card.querySelector('#pX').value,120),youtube:clean(card.querySelector('#pYoutube').value,120),website:clean(card.querySelector('#pWebsite').value,160)}, human:{displayName:clean(card.querySelector('#pHuman').value,60),email:clean(card.querySelector('#pEmail').value,160),phone:clean(card.querySelector('#pPhone').value,30)}, privacy:{carePublic:card.querySelector('#pCarePublic').checked,socialPublic:card.querySelector('#pSocialPublic').checked,locationPublic:card.querySelector('#pLocationPublic').checked,contactRequests:card.querySelector('#pContactRequests').checked,contactPublic:false}}; save(); render(); card.querySelector('#passportForm').classList.remove('open'); card.querySelector('#passportToast').textContent='Profile saved. Human phone/email remain private.'; });
  }
  state.profile = load();
  window.addEventListener('barkverse:dog-ready', () => { state.profile = load() || state.profile || getBaseProfile(); render(); });
  window.addEventListener('barkverse:profile-ready', () => render());
})();
