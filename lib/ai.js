const OPENROUTER_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL || 'openrouter/free';
const OPENROUTER_VISION_MODELS = [
  process.env.OPENROUTER_VISION_MODEL || 'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  OPENROUTER_TEXT_MODEL
];
const AI_TIMEOUT_MS = 18000;
function jsonResponse(res,status,payload){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload));}
function extractOpenRouterText(payload){const content=payload?.choices?.[0]?.message?.content;if(typeof content==='string')return content.trim();if(Array.isArray(content))return content.map(part=>typeof part==='string'?part:part?.text||'').join('').trim();return '';}
function parseJsonText(text){if(!text)return null;try{return JSON.parse(text)}catch{}const fenced=text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);if(fenced)try{return JSON.parse(fenced[1])}catch{}const object=text.match(/\{[\s\S]*\}/);if(object)try{return JSON.parse(object[0])}catch{}return null;}
function timeoutSignal(ms=AI_TIMEOUT_MS){if(typeof AbortSignal?.timeout==='function')return AbortSignal.timeout(ms);const controller=new AbortController();setTimeout(()=>controller.abort(),ms);return controller.signal;}
async function callOpenRouter({prompt,image,model}){
  const key=process.env.OPENROUTER_API_KEY;
  if(!key)throw new Error('OPENROUTER_API_KEY is not configured');
  const content=[{type:'text',text:prompt}];
  if(image?.data)content.push({type:'image_url',image_url:{url:`data:${image.mimeType||'image/jpeg'};base64,${image.data}`}});
  const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`,'HTTP-Referer':process.env.APP_URL||'https://barkverse.vercel.app','X-Title':'BARKVERSE'},
    body:JSON.stringify({model,messages:[{role:'user',content}],temperature:0.4,max_tokens:1800,provider:{allow_fallbacks:true,data_collection:'deny'}}),
    signal:timeoutSignal()
  });
  if(!response.ok){let detail='';try{const body=await response.json();detail=body?.error?.message||''}catch{}throw new Error(`OpenRouter ${response.status}${detail?`: ${detail}`:''}`);}
  const text=extractOpenRouterText(await response.json());
  if(!text)throw new Error('OpenRouter returned no text');
  return{text,provider:model};
}
async function generate({prompt,image,audio}){
  if(!process.env.OPENROUTER_API_KEY)throw new Error('OPENROUTER_API_KEY is not configured');
  const errors=[];
  // BARKVERSE intentionally uses OpenRouter only. No Google credential is required.
  // For image requests, try known free multimodal models in order, then the free router.
  const models=image?.data?OPENROUTER_VISION_MODELS:['openrouter/free'];
  for(const model of [...new Set(models)]){
    try{return await callOpenRouter({prompt,image,model})}
    catch(error){errors.push(error?.name==='TimeoutError'||error?.name==='AbortError'?`${model} timed out`:error.message)}
  }
  throw new Error(errors.join(' | ')||'No OpenRouter model completed the request');
}
module.exports={generate,parseJsonText,jsonResponse};
