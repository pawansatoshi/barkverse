(() => {
  const input = document.querySelector('#dogPhoto');
  const hint = document.querySelector('#uploadHint');
  const title = document.querySelector('#uploadTitle');
  const preview = document.querySelector('#preview');
  const button = document.querySelector('#demoBtn');
  if (!input) return;

  const originalFetch = window.fetch.bind(window);
  let preflight = null;
  const setStatus = (headline, message, bad = false) => { if (title) title.textContent = headline; if (hint) { hint.textContent = message; hint.dataset.state = bad ? 'error' : 'ok'; } };

  // Give mobile users two explicit choices: live camera or an existing gallery/file photo.
  const uploadBox = document.querySelector('#uploadBox');
  if (uploadBox && !document.querySelector('#dogPhotoChoices')) {
    const choices = document.createElement('div'); choices.id='dogPhotoChoices';
    choices.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px';
    choices.innerHTML='<button type="button" id="dogCameraChoice" class="secondary">📷 Take photo</button><button type="button" id="dogGalleryChoice" class="secondary">🖼️ Upload photo</button>';
    uploadBox.insertAdjacentElement('afterend', choices);
    const camera=choices.querySelector('#dogCameraChoice'), gallery=choices.querySelector('#dogGalleryChoice');
    camera.addEventListener('click',e=>{e.stopPropagation();input.value='';input.setAttribute('accept','image/jpeg,image/png,image/webp');input.setAttribute('capture','environment');input.click();});
    gallery.addEventListener('click',e=>{e.stopPropagation();input.value='';input.setAttribute('accept','image/jpeg,image/png,image/webp');input.removeAttribute('capture');input.click();});
  }

  window.fetch = async (url, options = {}) => {
    if (String(url) === '/api/dog' && preflight?.response) {
      const cached=JSON.parse(JSON.stringify(preflight.response.body));
      const requested=(()=>{try{return JSON.parse(options.body||'{}').name||''}catch{return ''}})();
      if(requested) cached.name=requested; preflight=null;
      return new Response(JSON.stringify(cached),{status:200,headers:{'Content-Type':'application/json'}});
    }
    return originalFetch(url, options);
  };

  input.setAttribute('accept','image/jpeg,image/png,image/webp');
  input.addEventListener('change', async () => {
    const file=input.files?.[0]; preflight=null; if(!file)return;
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)){setStatus('Dog photo required','That file is not supported. Choose JPEG, PNG or WebP.',true);input.value='';return;}
    if(file.size>3*1024*1024){setStatus('Photo is too large','Choose a dog photo under 3 MB. We optimize it before AI inspection.',true);input.value='';return;}
    setStatus('Checking the visitor…','AI is making sure this really is a dog before BARKVERSE opens.'); if(button)button.disabled=true;
    try{
      const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)});
      const response=await originalFetch('/api/dog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'',imageBase64:dataUrl.split(',')[1],mimeType:file.type})});
      const json=await response.json();
      if(!response.ok){setStatus('Nope. Not a dog. 🐶',json.error||'BARKVERSE only accepts dog photos. Try a photo of a dog.',true);if(preview)preview.classList.add('hidden');input.value='';preflight=null;return;}
      preflight={response:{status:response.status,body:json}};
      if(preview){preview.replaceChildren();const img=document.createElement('img');img.src=dataUrl;img.alt='Dog photo preview';preview.appendChild(img);preview.classList.remove('hidden');}
      const breed=json.breed?.label||'Unknown / mixed breed';const confidence=String(json.breed?.confidence||'low').toUpperCase();
      setStatus(`🐶 ${breed}`,`Dog detected · breed estimate: ${confidence} confidence. Add a name if you want, then enter the BARKVERSE.`);
    }catch{preflight=null;setStatus('Dog check unavailable','We could not inspect that image right now. Try again with a clear dog photo.',true)}finally{if(button)button.disabled=false}
  });

  document.addEventListener('click',event=>{if(event.target===button&&(!input.files?.length||!preflight)){event.preventDefault();event.stopImmediatePropagation();if(!input.files?.length)setStatus('Bring a dog first 🐾','Upload a dog photo or use the camera. BARKVERSE accepts dogs only.',true);else setStatus('Dog check needed 🐾','Please wait for the AI dog check to finish, then enter BARKVERSE.',true)}},true);
})();
