const barkSession = (() => {
  const key = 'barkverse-session-id';
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch { return `session-${Date.now()}`; }
})();

function barkEvent(type) {
  const number = (id) => Number(document.querySelector(id)?.textContent || 0);
  fetch('/api/event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ type, sessionId: barkSession, eventId: `${barkSession}-${type}-${Date.now()}`, chaos: number('#chaos'), zoomies: number('#zoomies'), loyalty: number('#loyalty') })
  }).catch(() => {});
}

/* Canonical help assistant. Removes stale implementations that may survive a mobile browser cache. */
(() => {
  const removeLegacy = () => {
    document.querySelectorAll('[data-barkverse-help-panel],[data-barkverse-help]').forEach(el => el.remove());
    document.querySelectorAll('button,[role="button"]').forEach(el => {
      const text = `${el.textContent || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.toLowerCase().trim();
      const s = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (s.position === 'fixed' && r.width <= 100 && r.height <= 100 && (text === '🐾' || text.includes('help bot') || text.includes('barkverse help'))) el.remove();
    });
    /* Old cached helper used the visible heading “How can I help?”. Remove its fixed panel. */
    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length > 8 || !el.textContent) return;
      const text = el.textContent.trim().toLowerCase();
      if (!text.includes('how can i help?')) return;
      const s = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (s.position === 'fixed' || (r.width > 300 && r.height > 180 && r.bottom > 0)) el.remove();
    });
  };

  const boot = () => {
    removeLegacy();
    const copy = {
      en: { title:'BARKVERSE HELPER', welcome:'Hi! I can show you around BARKVERSE.', placeholder:'Ask how BARKVERSE works…', send:'Ask',
        answers:[
          [/photo|camera|upload|gallery/i,'Use Meet your dog to take a camera photo or choose one from your gallery. BARKVERSE checks that the image is a dog before discovery.'],
          [/breed|race|species/i,'After discovery, the AI gives a visual breed estimate with a confidence level. It is an estimate, not a definitive identification.'],
          [/talk|chat|speak|conversation/i,'Open Talk to your dog, type a question, and press Ask. Hear my dog can turn the response into voice when voice is available.'],
          [/voice|sound|microphone|bark/i,'Hear my dog uses the available voice system, while Bark adds a playful local dog sound. Live Voice can use your microphone after permission.'],
          [/memory|remember/i,'Memory Vault lets you write a small moment with your dog and turn it into a personalized memory. If AI is unavailable, the app uses a safe fallback instead of freezing.'],
          [/solana|pawprint|wallet|phantom|nightly|brave|solflare|backpack/i,'Pawprint can preserve a memory on Solana devnet. Connect a compatible wallet, review the estimated network fee, approve the transaction, and wait for confirmation.'],
          [/barkinder|friend|community|dog social/i,'BARKINDER lets you discover registered dogs and use playful Pass, Like, or Play interactions. Private phone numbers, emails, and exact locations are not exposed.'],
          [/game|barkcade|treat|zoomie/i,'Open Barkcade and start Treat Dash. You have a short challenge to collect treats before your human notices.'],
          [/language|hindi|english|spanish|french|german|japanese|korean/i,'Use the country and language controls near the top of the experience. The interface follows the selected language.'],
          [/privacy|data|security/i,'Your dog photo is sent only to the configured AI provider for the requested analysis. It is not written to the blockchain.'],
          [/help|how|use|start|begin/i,'Start with a dog photo, enter BARKVERSE, then explore the profile, investigation, Barkcade, Talk, Memory Vault, Pawprint, Observatory, and BARKINDER.']
        ]},
      hi: { title:'BARKVERSE हेल्पर', welcome:'नमस्ते! मैं BARKVERSE इस्तेमाल करने में आपकी मदद कर सकता हूँ।', placeholder:'पूछें BARKVERSE कैसे काम करता है…', send:'पूछें',
        answers:[
          [/photo|camera|upload|gallery|फोटो|कैमरा|गैलरी/i,'Meet your dog से कैमरा फोटो लें या गैलरी से फोटो चुनें। BARKVERSE पहले जांचता है कि फोटो में डॉग है।'],
          [/breed|नस्ल/i,'Discovery के बाद AI visual breed estimate और confidence देता है। यह अनुमान है, अंतिम पहचान नहीं।'],
          [/talk|chat|बात|बोल/i,'Talk to your dog में सवाल लिखें और Ask दबाएँ। Hear my dog उपलब्ध voice system से जवाब सुना सकता है।'],
          [/voice|sound|microphone|bark|आवाज|माइक/i,'Hear my dog voice देता है और Bark playful dog sound चलाता है। Live Voice के लिए microphone permission देनी होगी।'],
          [/memory|याद|मेमोरी/i,'Memory Vault में अपने dog की छोटी memory लिखें। AI unavailable होने पर safe fallback चलता है।'],
          [/solana|pawprint|wallet|phantom|nightly|brave|solflare|backpack|वॉलेट/i,'Pawprint Solana devnet पर memory preserve कर सकता है। Compatible wallet connect करें, fee देखें, transaction approve करें और confirmation का इंतजार करें।'],
          [/barkinder|friend|community|दोस्त|कम्युनिटी/i,'BARKINDER में registered dogs discover कर सकते हैं और Pass, Like या Play कर सकते हैं।'],
          [/game|barkcade|treat|zoomie|गेम/i,'Barkcade खोलकर Treat Dash खेलें और treats collect करें।'],
          [/language|हिंदी|अंग्रेजी|भाषा/i,'ऊपर country और language controls से भाषा बदलें।'],
          [/privacy|security|data|प्राइवेसी|सुरक्षा/i,'Dog photo केवल configured AI provider को requested analysis के लिए भेजी जाती है और blockchain पर नहीं लिखी जाती।'],
          [/help|how|use|start|शुरू|कैसे/i,'पहले dog photo लें, फिर Enter BARKVERSE दबाएँ। इसके बाद profile, investigation, Barkcade, Talk, Memory Vault, Pawprint, Observatory और BARKINDER explore करें।']
        ]}
    };
    const lang = () => ((document.documentElement.lang || '').toLowerCase().startsWith('hi') ? 'hi' : 'en');
    const t = () => copy[lang()];
    const style = document.createElement('style');
    style.textContent = `[data-barkverse-help-panel]{position:fixed;right:14px;bottom:78px;width:min(360px,calc(100vw - 28px));z-index:2147483000;background:#fffdf7;color:#191919;border:1px solid #ded6c8;border-radius:22px;box-shadow:0 22px 60px #0003;padding:16px;display:none;font-family:inherit}[data-barkverse-help-panel].open{display:block;animation:bvHelpIn .2s ease-out}[data-barkverse-help-panel] h3{margin:0 0 4px;font-size:16px}[data-barkverse-help-panel] p{margin:0 0 12px;color:#666;font-size:12px;line-height:1.45}[data-barkverse-help-panel] form{display:flex;gap:7px}[data-barkverse-help-panel] input{min-width:0;flex:1;border:1px solid #ddd4c5;border-radius:12px;padding:11px 12px;font:inherit;font-size:12px;background:#fff}[data-barkverse-help-panel] button{border:0;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer;touch-action:manipulation}[data-barkverse-help-panel] form button{background:#191919;color:#fff;min-width:48px}[data-barkverse-help-panel] .answer{margin-top:11px;padding:11px 12px;border-radius:13px;background:#f5efe3;font-size:12px;line-height:1.5;min-height:18px}[data-barkverse-help-panel] .close{position:absolute;right:10px;top:8px;background:transparent;font-size:16px;padding:4px}@keyframes bvHelpIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(max-width:600px){[data-barkverse-help-panel]{right:10px;bottom:72px;width:calc(100vw - 20px)}}@media(prefers-reduced-motion:reduce){[data-barkverse-help-panel].open{animation:none}}`;
    document.head.appendChild(style);

    const trigger = document.createElement('button');
    trigger.type='button'; trigger.textContent='🐾'; trigger.setAttribute('aria-label','BARKVERSE help');
    Object.assign(trigger.style,{position:'fixed',right:'14px',bottom:'14px',zIndex:'2147482999',width:'58px',height:'58px',borderRadius:'50%',border:'0',background:'#191919',color:'#fff',fontSize:'25px',boxShadow:'0 12px 35px #0003',cursor:'pointer',touchAction:'manipulation'});
    trigger.dataset.barkverseHelp='1'; document.body.appendChild(trigger);

    const panel=document.createElement('section'); panel.dataset.barkverseHelpPanel='1'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label',t().title);
    panel.innerHTML='<button class="close" type="button" aria-label="Close">×</button><h3></h3><p></p><form><input maxlength="300" autocomplete="off"><button type="submit"></button></form><div class="answer" aria-live="polite"></div>';
    document.body.appendChild(panel);
    const title=panel.querySelector('h3'), intro=panel.querySelector('p'), input=panel.querySelector('input'), form=panel.querySelector('form'), send=panel.querySelector('button[type="submit"]'), answer=panel.querySelector('.answer');
    const refresh=()=>{const c=t(); title.textContent=c.title; intro.textContent=c.welcome; input.placeholder=c.placeholder; send.textContent=c.send; trigger.setAttribute('aria-label',c.title);}; refresh();
    const reply=()=>{const q=input.value.trim(); if(!q){input.focus();return;} const c=t(); const match=c.answers.find(([re])=>re.test(q)); answer.textContent=match?match[1]:(lang()==='hi'?'मैं फोटो, breed, Talk, Voice, Memory, Pawprint, BARKINDER, games, language, privacy और शुरुआत के बारे में बता सकता हूँ।':'I can help with photos, breed estimates, Talk, Voice, Memory, Pawprint, BARKINDER, games, language, privacy, or getting started.'); answer.hidden=false; input.value='';};
    trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();panel.classList.toggle('open');if(panel.classList.contains('open'))setTimeout(()=>input.focus(),0);});
    panel.querySelector('.close').addEventListener('click',e=>{e.preventDefault();panel.classList.remove('open');});
    form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();reply();});
    send.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();reply();});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();reply();}});
    window.addEventListener('barkverse:languagechange',refresh);
    /* Catch legacy UI injected after boot. */
    const observer=new MutationObserver(()=>removeLegacy()); observer.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

window.addEventListener('load', () => {
  document.querySelector('#demoBtn')?.addEventListener('click', () => barkEvent('discover'));
  document.querySelector('#caseBtn')?.addEventListener('click', () => barkEvent('investigation'));
  document.querySelector('#talkBtn')?.addEventListener('click', () => barkEvent('talk'));
  document.querySelector('#memoryBtn')?.addEventListener('click', () => barkEvent('memory'));
  document.querySelector('#pawprintBtn')?.addEventListener('click', () => barkEvent('pawprint'));
  document.querySelector('#observatoryBtn')?.addEventListener('click', () => barkEvent('observatory'));
});
