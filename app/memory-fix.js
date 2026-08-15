(()=>{
  'use strict';
  const oldButton=document.getElementById('memoryBtn');
  const input=document.getElementById('memoryInput');
  const output=document.getElementById('memoryOutput');
  const pawprint=document.getElementById('pawprintBtn');
  if(!oldButton||!input||!output)return;

  // Replace the original listener so a slow AI provider can never leave
  // the Memory Vault button permanently stuck on "Writing memory…".
  const button=oldButton.cloneNode(true);
  oldButton.replaceWith(button);

  const fallback=(memory)=>({
    title:`${window.BARKVERSE_EXPERIENCE?.getLanguage?.()==='hi'?'आपके डॉग की प्यारी याद':`${window.__barkverseDogName||'Your Dog'}'s Little Moment`}`,
    story:`Some memories are small enough to fit inside an ordinary day, yet somehow become the ones we keep. ${memory}`,
    closing:'A little moment worth keeping.'
  });

  const escape=(value)=>String(value).replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const setState=(loading)=>{
    button.disabled=loading;
    button.textContent=loading?'Writing memory…':'Create memory →';
    button.setAttribute('aria-busy',String(loading));
  };

  button.addEventListener('click',async()=>{
    const memory=input.value.trim().slice(0,500);
    if(!memory){
      input.focus();
      output.textContent='Write one small thing you love first.';
      return;
    }
    setState(true);
    output.textContent='🐾 Turning that moment into a memory…';
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('/api/memory',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({dog:window.BARKVERSE_STATE?.dog||null,memory}),
        signal:controller.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Memory service unavailable');
      output.innerHTML=`<strong>${escape(data.title||'A Little Moment')}</strong><p>${escape(data.story||memory)}</p><em>${escape(data.closing||'A little moment worth keeping.')}</em>`;
      if(pawprint)pawprint.classList.remove('hidden');
      output.setAttribute('data-state','success');
    }catch(error){
      const data=fallback(memory);
      output.innerHTML=`<strong>${escape(data.title)}</strong><p>${escape(data.story)}</p><em>${escape(data.closing)}</em><small style="display:block;margin-top:8px;color:var(--muted)">AI was unavailable, so BARKVERSE preserved the memory locally for this session.</small>`;
      if(pawprint)pawprint.classList.remove('hidden');
      output.setAttribute('data-state','fallback');
    }finally{
      clearTimeout(timer);
      setState(false);
    }
  });
})();
