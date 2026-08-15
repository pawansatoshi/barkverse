const GOOGLE_MODEL = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';
const OPENROUTER_MODEL = 'openrouter/free';

function jsonResponse(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function extractText(payload) {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();
  return text || '';
}

function extractOpenRouterText(payload) {
  return payload?.choices?.[0]?.message?.content?.trim?.() || '';
}

function parseJsonText(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch {}
  }
  const object = text.match(/\{[\s\S]*\}/);
  if (object) {
    try { return JSON.parse(object[0]); } catch {}
  }
  return null;
}

async function callGoogle({ prompt, image }) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('GOOGLE_AI_API_KEY is not configured');

  const contents = [];
  if (image?.data) contents.push({ inlineData: { mimeType: image.mimeType || 'image/jpeg', data: image.data } });
  contents.push({ text: prompt });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.9, responseMimeType: 'application/json' }
    })
  });
  if (!response.ok) throw new Error(`Google AI ${response.status}`);
  const payload = await response.json();
  const text = extractText(payload);
  if (!text) throw new Error('Google AI returned no text');
  return { text, provider: 'google-ai' };
}

async function callOpenRouter({ prompt, image }) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');

  const content = [{ type: 'text', text: prompt }];
  if (image?.data) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${image.mimeType || 'image/jpeg'};base64,${image.data}` }
    });
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.APP_URL || 'https://barkverse.vercel.app',
      'X-Title': 'BARKVERSE'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content }],
      temperature: 0.9
    })
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
  const payload = await response.json();
  const text = extractOpenRouterText(payload);
  if (!text) throw new Error('OpenRouter returned no text');
  return { text, provider: 'openrouter/free' };
}

async function generate({ prompt, image }) {
  const errors = [];
  try { return await callGoogle({ prompt, image }); }
  catch (error) { errors.push(error.message); }
  try { return await callOpenRouter({ prompt, image }); }
  catch (error) { errors.push(error.message); }
  throw new Error(errors.join(' | '));
}

module.exports = { generate, parseJsonText, jsonResponse };
