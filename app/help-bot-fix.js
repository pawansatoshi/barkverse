(()=>{'use strict';
function init(){
  if(document.getElementById('barkverseHelpBotFix')) return;
  // Remove/hide every previous floating paw trigger and its open panel so only one help bot survives.
  document.querySelectorAll('button,[role="button"]').forEach(el=>{
    const t=(el.textContent||'').trim();
    const a=(el.getAttribute('aria-label')||'').toLowerCase();
    if(t==='🐾' || a.includes('help bot') || a==='help' || a.includes('how can i help')){
      let box=el;
      for(let i=0;i<4&&box.parentElement;i++){
        const s=getComputedStyle(box);
        if(s.position==='fixed' || s.position==='absolute') break;
        box=box.parentElement;
      }
      if(box!==el && /how can i help|ask me how barkverse works/i.test(box.textContent||'')) box.remove();
      else el.remove();
    }
  });
  document.querySelectorAll('*').forEach(el=>{
    if(el.children.length===0 && (el.textContent||'').trim()==='How can I help?'){
      let p=el.parentElement;
      for(let i=0;i<5&&p;i++,p=p.parentElement){
        if(getComputedStyle(p).position==='fixed'){p.remove();break;}
      }
    }
  });
  const style=document.createElement('style');
  style.textContent=`#barkverseHelpBotFix{position:fixed;right:14px;bottom:18px;z-index:2147483000;font-family:inherit}#barkverseHelpBotFix .hb-button{width:58px;height:58px;border:0;border-radius:50%;background:#171717;color:#fff;box-shadow:0 12px 30px #0004;display:grid;place-items:center;font-size:26px;cursor:pointer;touch-action:manipulation}#barkverseHelpBotFix .hb-panel{position:absolute;right:0;bottom:70px;width:min(350px,calc(100vw - 28px));background:#fffdf7;border:1px solid #e7dfd2;border-radius:24px;padding:16px;box-shadow:0 20px 60px #0003;display:none}#barkverseHelpBotFix.open .hb-panel{display:block}.hb-title{font-size:18px;font-weight:900;margin:0 0 7px}.hb-sub{font-size:12px;line-height:1.5;color:#666;margin:0 0 12px}.hb-form{display:flex;gap:8px}.hb-form input{min-width:0;flex:1;border:1px solid #ddd4c5;border-radius:14px;padding:13px;font:inherit;font-size:13px;outline:none}.hb-form button{width:54px;border:0;border-radius:14px;background:#171717;color:#fff;font-size:20px;cursor:pointer}.hb-answer{margin-top:12px;padding:11px 12px;border-radius:14px;background:#f5f0e7;font-size:12px;line-height:1.55;color:#242424;display:none}.hb-answer.show{display:block}@media(max-width:600px){#barkverseHelpBotFix{right:10px;bottom:12px}.hb-button{width:56px!important;height:56px!important}.hb-panel{bottom:66px!important}}`;
  document.head.appendChild(style);
  const root=document.createElement('div');root.id='barkverseHelpBotFix';
  root.innerHTML=`<div class="hb-panel"><p class="hb-title">🐾 How can I help?</p><p class="hb-sub">Ask about any BARKVERSE feature. This helper works locally, so it does not depend on an AI provider.</p><form class="hb-form"><input maxlength="300" placeholder="Ask me how BARKVERSE works…" aria-label="BARKVERSE help question"><button type="submit" aria-label="Send help question">→</button></form><div class="hb-answer"></div></div><button class="hb-button" type="button" aria-label="Open BARKVERSE help">🐾</button>`;
  document.body.appendChild(root);
  const button=root.querySelector('.hb-button'),form=root.querySelector('.hb-form'),input=root.querySelector('input'),answer=root.querySelector('.hb-answer');
  const replies=[
    [/upload|photo|camera|dog photo/i,'To start, use Meet your dog and choose a clear JPEG, PNG or WebP photo. Then tap Enter BARKVERSE.'],
    [/breed|pug|labrador|husky|golden/i,'The Visual Breed Estimate is an AI visual estimate. Confidence depends on the photo and should not be treated as a definitive breed test.'],
    [/talk|speak|voice|bark|hear/i,'Use Talk to your dog, type a question, then tap Ask. Hear my dog uses the configured voice service with a browser/local fallback.'],
    [/memory|remember|pawprint/i,'Memory Vault lets you create a playful memory. The Pawprint button is separate and uses Solana devnet when wallet support is available.'],
    [/wallet|solana|phantom|nightly|brave|connect/i,'Wallet features are for the Solana devnet Pawprint flow. A wallet should only be asked to approve the transaction you explicitly started.'],
    [/barkinder|friend|match|play/i,'BARKINDER is the dog discovery area where registered dogs can be explored for playful connections.'],
    [/game|barkcade|treat/i,'Barkcade contains the Treat Dash game. Start Zoomies and catch the treats before the timer ends.'],
    [/observatory|snowflake|stats|analytics/i,'The Observatory shows aggregate BARKVERSE activity and fictional dog-network signals.'],
    [/language|hindi|english|country/i,'Use the Country and Language controls at the top of the experience to change your interface language and locale.'],
    [/help|work|start|begin|how/i,'Start with a dog photo, discover the profile, then explore Investigation, Barkcade, Talk, Memory Vault, BARKINDER and Observatory.'],
  ];
  function respond(q){const hit=replies.find(([re])=>re.test(q));return hit?hit[1]:'I can help with BARKVERSE navigation, dog discovery, breed estimates, Talk, voice, Memory Vault, Pawprints, wallets, BARKINDER, Barkcade and Observatory. Try asking about one of those.';}
  button.addEventListener('click',()=>{root.classList.toggle('open');if(root.classList.contains('open'))setTimeout(()=>input.focus(),30)});
  form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;answer.textContent=respond(q);answer.classList.add('show');input.value='';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')root.classList.remove('open')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
