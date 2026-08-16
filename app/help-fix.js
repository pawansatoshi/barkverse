(() => {
  'use strict';
  if (document.querySelector('#barkverseHelpFix')) return;
  const lang = () => window.BARKVERSE_I18N?.getLanguage?.() || 'en';
  const copy = {
    en:{title:'BARKVERSE HELPER',welcome:'Hi! I can show you around BARKVERSE.',placeholder:'Ask how BARKVERSE works…',send:'Ask',fallback:'I can help with photos, breed estimates, Talk, Voice, Memory, Pawprint, BARKINDER, games, language, privacy, or getting started.'},
    hi:{title:'BARKVERSE हेल्पर',welcome:'नमस्ते! मैं BARKVERSE इस्तेमाल करने में आपकी मदद कर सकता हूँ।',placeholder:'पूछें BARKVERSE कैसे काम करता है…',send:'पूछें',fallback:'मैं फोटो, नस्ल, Talk, Voice, Memory, Pawprint, BARKINDER, games, language, privacy और शुरुआत के बारे में बता सकता हूँ।'},
    es:{title:'AYUDA BARKVERSE',welcome:'¡Hola! Puedo enseñarte BARKVERSE.',placeholder:'Pregunta cómo funciona BARKVERSE…',send:'Preguntar',fallback:'Puedo ayudarte con fotos, raza, Talk, Voice, Memory, Pawprint, BARKINDER, juegos, idioma y privacidad.'},
    fr:{title:'AIDE BARKVERSE',welcome:'Bonjour ! Je peux vous faire découvrir BARKVERSE.',placeholder:'Demandez comment fonctionne BARKVERSE…',send:'Demander',fallback:'Je peux vous aider avec les photos, la race, Talk, Voice, Memory, Pawprint, BARKINDER, les jeux et la langue.'},
    de:{title:'BARKVERSE HELFER',welcome:'Hallo! Ich kann dir BARKVERSE zeigen.',placeholder:'Frage, wie BARKVERSE funktioniert…',send:'Fragen',fallback:'Ich kann bei Fotos, Rasse, Talk, Voice, Memory, Pawprint, BARKINDER, Spielen und Sprache helfen.'},
    ja:{title:'BARKVERSEヘルパー',welcome:'こんにちは！BARKVERSEをご案内します。',placeholder:'BARKVERSEの使い方を聞いてください…',send:'聞く',fallback:'写真、犬種、Talk、Voice、Memory、Pawprint、BARKINDER、ゲーム、言語について案内できます。'},
    ko:{title:'BARKVERSE 도우미',welcome:'안녕하세요! BARKVERSE를 안내해 드릴게요.',placeholder:'BARKVERSE 사용법을 물어보세요…',send:'질문',fallback:'사진, 품종, Talk, Voice, Memory, Pawprint, BARKINDER, 게임과 언어에 대해 도와드릴 수 있어요.'}
  };
  const answers = {
    en:[[/photo|camera|upload|gallery/i,'Use Meet your dog to take a camera photo or choose one from your gallery.'],[/talk|chat|speak/i,'Open Talk to your dog, type a question, and press Ask. The dog replies in the selected language.'],[/voice|audio|sound/i,'Dog voice follows the selected website language. The browser fallback also uses the selected language locale.'],[/language|hindi|english|spanish|french|german|japanese|korean/i,'Choose a language from the selector. The interface, dog conversation and dog voice follow that language.'],[/memory/i,'Memory Vault creates a small personalized memory with the selected language.'],[/barkinder|community/i,'BARKINDER lets you discover registered dogs and interact with them.'],[/privacy|security|data/i,'Your dog photo is sent only to the configured AI provider for the requested analysis and is not written to the blockchain.'],[/help|how|use|start|begin/i,'Start with a dog photo, enter BARKVERSE, then explore the profile, investigation, Barkcade, Talk, Memory Vault, Pawprint, Observatory and BARKINDER.']],
    hi:[[/photo|फोटो|कैमरा|गैलरी/i,'Meet your dog से कैमरा फोटो लें या गैलरी से फोटो चुनें।'],[/talk|chat|बात|बोल/i,'Talk to your dog में सवाल लिखें। जवाब चुनी हुई भाषा में आएगा।'],[/voice|आवाज|ऑडियो/i,'Dog voice चुनी हुई वेबसाइट भाषा के अनुसार बोलेगी। Browser fallback भी उसी भाषा का voice locale इस्तेमाल करेगा।'],[/language|भाषा|हिंदी|अंग्रेजी/i,'ऊपर language selector से भाषा चुनें। पूरी UI, dog conversation और dog voice उसी भाषा के अनुसार बदलेंगे।'],[/memory|मेमोरी|याद/i,'Memory Vault चुनी हुई भाषा में personalized memory बनाएगा।'],[/barkinder|community|कम्युनिटी/i,'BARKINDER में registered dogs खोजें और उनके साथ interact करें।'],[/privacy|सुरक्षा|डेटा/i,'Dog photo केवल configured AI provider को analysis के लिए भेजी जाती है और blockchain पर नहीं लिखी जाती।'],[/help|कैसे|शुरू/i,'पहले dog photo लें, Enter BARKVERSE दबाएँ और फिर profile, Talk, Barkcade, Memory, Pawprint, Observatory और BARKINDER explore करें.']]
  };
  const fallbackAnswer = (q) => { const list = answers[lang()] || answers.en; const match = list.find(([re]) => re.test(q)); return match ? match[1] : (copy[lang()] || copy.en).fallback; };

  const style = document.createElement('style');
  style.textContent = `
    /* There is exactly one canonical helper. The legacy living-world helper is intentionally hidden. */
    .bv-bot,.bv-chat{display:none!important}
    #barkverseHelpFix{position:fixed;right:14px;bottom:14px;z-index:2147483647;width:58px;height:58px;border:0;border-radius:50%;background:#191919;color:#fff;font-size:24px;box-shadow:0 12px 35px #0003;cursor:pointer;touch-action:manipulation}
    #barkverseHelpFixPanel{position:fixed;right:14px;bottom:82px;width:min(360px,calc(100vw - 28px));z-index:2147483646;background:#fffdf7;color:#191919;border:1px solid #ded6c8;border-radius:22px;box-shadow:0 22px 60px #0003;padding:16px;display:none}
    #barkverseHelpFixPanel.open{display:block}
    #barkverseHelpFixPanel h3{margin:0 0 4px;font-size:16px}
    #barkverseHelpFixPanel p{margin:0 0 12px;color:#666;font-size:12px;line-height:1.45}
    #barkverseHelpFixPanel form{display:flex;gap:7px}
    #barkverseHelpFixPanel input{min-width:0;flex:1;border:1px solid #ddd4c5;border-radius:12px;padding:11px;font:inherit;font-size:12px}
    #barkverseHelpFixPanel button{border:0;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer;touch-action:manipulation}
    #barkverseHelpFixPanel form button{background:#191919;color:#fff}
    .bv-fix-answer{margin-top:11px;padding:11px 12px;border-radius:13px;background:#f5efe3;font-size:12px;line-height:1.5}
    .bv-fix-close{position:absolute;right:10px;top:8px;background:transparent;font-size:16px}
    @media(max-width:600px){#barkverseHelpFixPanel{right:10px;bottom:78px;width:calc(100vw - 20px)}}
  `;
  document.head.appendChild(style);

  const button=document.createElement('button'); button.id='barkverseHelpFix'; button.type='button'; button.textContent='💬'; button.setAttribute('aria-label','BARKVERSE helper'); document.body.appendChild(button);
  const panel=document.createElement('section'); panel.id='barkverseHelpFixPanel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','BARKVERSE helper'); panel.innerHTML='<button class="bv-fix-close" type="button" aria-label="Close">×</button><h3></h3><p></p><form><input maxlength="300" autocomplete="off"><button type="submit"></button></form><div class="bv-fix-answer" aria-live="polite"></div>'; document.body.appendChild(panel);
  const h=panel.querySelector('h3'),p=panel.querySelector('p'),input=panel.querySelector('input'),send=panel.querySelector('form button'),answer=panel.querySelector('.bv-fix-answer');
  const refresh=()=>{const c=copy[lang()]||copy.en;h.textContent=c.title;p.textContent=c.welcome;input.placeholder=c.placeholder;send.textContent=c.send;button.setAttribute('aria-label',c.title);panel.setAttribute('aria-label',c.title)}; refresh();
  const keepSingleton=()=>{ document.querySelectorAll('#barkverseHelpFix').forEach((el,i)=>{if(i>0)el.remove()}); document.querySelectorAll('#barkverseHelpFixPanel').forEach((el,i)=>{if(i>0)el.remove()}); if(!document.body.contains(button))document.body.appendChild(button); if(!document.body.contains(panel))document.body.appendChild(panel); };
  button.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))setTimeout(()=>input.focus(),0)};
  panel.querySelector('.bv-fix-close').onclick=()=>panel.classList.remove('open');
  panel.querySelector('form').onsubmit=e=>{e.preventDefault();const q=input.value.trim();if(!q){input.focus();return;}answer.textContent=fallbackAnswer(q);answer.hidden=false;input.value='';};
  window.addEventListener('barkverse:languagechange',()=>{refresh();keepSingleton();});
  new MutationObserver(keepSingleton).observe(document.body,{childList:true,subtree:true});
})();
