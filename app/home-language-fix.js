(() => {
  'use strict';
  const STORAGE='barkverse.experience.v2';
  const SUPPORTED=['en','hi','es','fr','de','ja','ko'];
  const VOICES={en:'en-US',hi:'hi-IN',es:'es-ES',fr:'fr-FR',de:'de-DE',ja:'ja-JP',ko:'ko-KR'};
  const HOME={
    en:{badge:'🐾 BARKVERSE · DOG NETWORK',kicker:'A tiny secret has been hiding in plain sight.',title:'What if dogs had<br><span>their own internet?</span>',lead:'Every dog has a world we never get to see. BARKVERSE opens the door — with a little help from AI, a lot of imagination, and absolutely no permission from the humans.',dogs:'dogs allegedly online',cats:'cats fully trusted',cases:'unanswered biscuit cases',meet:'Meet your dog',hint:"Choose a clear photo and we'll open their secret world.",name:"Dog's name (optional)",enter:'Enter BARKVERSE →',privacy:'Your photo is sent only to the configured AI provider for this request. It is not written to the blockchain.',scroll:'Upload or take a dog photo to begin ↓'},
    hi:{badge:'🐾 BARKVERSE · डॉग नेटवर्क',kicker:'एक छोटा सा राज़ सबकी नज़रों के सामने छिपा था।',title:'अगर कुत्तों का भी<br><span>अपना इंटरनेट होता तो?</span>',lead:'हर डॉग की एक ऐसी दुनिया होती है जिसे हम देख नहीं पाते। BARKVERSE AI, कल्पना और थोड़ी शरारत की मदद से उस दुनिया का दरवाज़ा खोलता है।',dogs:'कुत्ते ऑनलाइन',cats:'भरोसेमंद बिल्लियाँ',cases:'अनसुलझे बिस्किट केस',meet:'अपने डॉग से मिलें',hint:'एक साफ़ फोटो चुनें और हम उसकी गुप्त दुनिया खोलेंगे।',name:'डॉग का नाम (वैकल्पिक)',enter:'BARKVERSE में प्रवेश →',privacy:'आपकी फोटो केवल इस अनुरोध के लिए configured AI provider को भेजी जाती है। इसे blockchain पर नहीं लिखा जाता।',scroll:'डॉग की फोटो लें या अपलोड करें ↓'},
    es:{badge:'🐾 BARKVERSE · RED CANINA',kicker:'Un pequeño secreto estaba a la vista.',title:'¿Y si los perros tuvieran<br><span>su propia internet?</span>',lead:'Cada perro tiene un mundo que no podemos ver. BARKVERSE abre la puerta con IA, imaginación y mucha diversión.',dogs:'perros supuestamente conectados',cats:'gatos de confianza',cases:'casos de galletas sin resolver',meet:'Conoce a tu perro',hint:'Elige una foto clara y abriremos su mundo secreto.',name:'Nombre del perro (opcional)',enter:'Entrar en BARKVERSE →',privacy:'Tu foto solo se envía al proveedor de IA configurado para esta solicitud. No se escribe en la blockchain.',scroll:'Haz o sube una foto de un perro ↓'},
    fr:{badge:'🐾 BARKVERSE · RÉSEAU CANIN',kicker:'Un petit secret était caché sous nos yeux.',title:'Et si les chiens avaient<br><span>leur propre internet ?</span>',lead:'Chaque chien a un monde que nous ne voyons jamais. BARKVERSE ouvre la porte avec IA, imagination et beaucoup de jeu.',dogs:'chiens prétendument en ligne',cats:'chats totalement fiables',cases:'affaires de biscuits non résolues',meet:'Rencontrez votre chien',hint:'Choisissez une photo nette et nous ouvrirons son monde secret.',name:'Nom du chien (facultatif)',enter:'Entrer dans BARKVERSE →',privacy:"Votre photo est envoyée uniquement au fournisseur d'IA configuré pour cette demande. Elle n'est pas inscrite sur la blockchain.",scroll:'Prenez ou importez une photo de chien ↓'},
    de:{badge:'🐾 BARKVERSE · HUNDE-NETZWERK',kicker:'Ein kleines Geheimnis war offen sichtbar.',title:'Was wäre, wenn Hunde<br><span>ihr eigenes Internet hätten?</span>',lead:'Jeder Hund hat eine Welt, die wir nie sehen. BARKVERSE öffnet die Tür mit KI, Fantasie und viel Spaß.',dogs:'angeblich online',cats:'voll vertrauenswürdige Katzen',cases:'ungelöste Keksfälle',meet:'Deinen Hund treffen',hint:'Wähle ein klares Foto und wir öffnen seine geheime Welt.',name:'Name des Hundes (optional)',enter:'BARKVERSE betreten →',privacy:'Dein Foto wird nur für diese Anfrage an den konfigurierten KI-Anbieter gesendet. Es wird nicht auf die Blockchain geschrieben.',scroll:'Mach oder lade ein Hundefoto hoch ↓'},
    ja:{badge:'🐾 BARKVERSE · 犬ネットワーク',kicker:'小さな秘密が、目の前に隠れていました。',title:'もし犬たちにも<br><span>自分たちのインターネットがあったら？</span>',lead:'すべての犬には私たちが見ることのできない世界があります。BARKVERSEはAIと想像力でその扉を開きます。',dogs:'オンラインの犬',cats:'信頼できる猫',cases:'未解決のビスケット事件',meet:'愛犬に会う',hint:'鮮明な写真を選ぶと秘密の世界を開きます。',name:'犬の名前（任意）',enter:'BARKVERSEへ →',privacy:'写真はこのリクエストのために設定されたAIプロバイダーへ送信されるだけで、ブロックチェーンには書き込まれません。',scroll:'犬の写真を撮影またはアップロード ↓'},
    ko:{badge:'🐾 BARKVERSE · 강아지 네트워크',kicker:'작은 비밀이 바로 눈앞에 숨어 있었습니다.',title:'강아지에게도<br><span>자신만의 인터넷이 있다면?</span>',lead:'모든 강아지에게는 우리가 볼 수 없는 세계가 있습니다. BARKVERSE는 AI와 상상력으로 그 문을 엽니다.',dogs:'온라인 강아지',cats:'완전히 믿는 고양이',cases:'미해결 간식 사건',meet:'강아지 만나기',hint:'선명한 사진을 선택하면 비밀 세계를 열어드립니다.',name:'강아지 이름 (선택)',enter:'BARKVERSE 입장 →',privacy:'사진은 이 요청을 위해 설정된 AI 제공자에게만 전송되며 블록체인에는 기록되지 않습니다.',scroll:'강아지 사진을 찍거나 업로드하세요 ↓'}
  };
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}};
  const write=(patch)=>{try{localStorage.setItem(STORAGE,JSON.stringify({...read(),...patch}))}catch{}};
  const getLang=()=>{const s=read();return SUPPORTED.includes(s.lang)?s.lang:'en'};
  const apply=()=>{
    const l=getLang(),x=HOME[l]||HOME.en; document.documentElement.lang=l;
    const set=(s,v,html=false)=>{const e=document.querySelector(s);if(e)e[html?'innerHTML':'textContent']=v};
    const attr=(s,a,v)=>{const e=document.querySelector(s);if(e)e.setAttribute(a,v)};
    set('.hero-badge',x.badge);set('.kicker',x.kicker);set('#heroTitle',x.title,true);set('.lead',x.lead);
    const w=document.querySelectorAll('.hero-world-preview small');if(w[0])w[0].textContent=x.dogs;if(w[1])w[1].textContent=x.cats;if(w[2])w[2].textContent=x.cases;
    set('#uploadTitle',x.meet);set('#uploadHint',x.hint);attr('#dogNameInput','placeholder',x.name);attr('#dogNameInput','aria-label',x.name);set('#demoBtn',x.enter);set('.privacy-note',x.privacy);set('.scroll-hint',x.scroll);
  };
  const wire=()=>{
    const country=document.querySelector('#bvCountry'); const language=document.querySelector('#bvLanguage');
    if(language&&!language.dataset.homeLanguageWired){
      language.dataset.homeLanguageWired='1';
      language.addEventListener('change',e=>{const next=e.target.value;if(!SUPPORTED.includes(next))return;write({lang:next});apply();window.BARKVERSE_I18N?.setLanguage?.(next);window.dispatchEvent(new CustomEvent('barkverse:languagechange',{detail:{language:next,voice:VOICES[next]}}));});
    }
    if(country&&!country.dataset.homeCountryWired){
      country.dataset.homeCountryWired='1';
      /* Country is regional/community metadata, not the UI language. */
      country.addEventListener('change',e=>{write({country:e.target.value});});
      country.title='Country controls your community region. Language controls the website, dog replies and voice.';
    }
    apply();
  };
  let tries=0;const tick=()=>{wire();if((!document.querySelector('#bvLanguage')||!document.querySelector('#bvCountry'))&&tries++<80)setTimeout(tick,100);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
  window.addEventListener('barkverse:languagechange',()=>setTimeout(apply,0));
})();
