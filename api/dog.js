const { generate, parseJsonText, jsonResponse } = require('../lib/ai');

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

function sanitizeDog(data, requestedName) {
  const breed = data?.breed && typeof data.breed === 'object' ? data.breed : {};
  return {
    name: requestedName || (typeof data?.name === 'string' ? data.name.slice(0, 40) : 'Your Dog'),
    breed: {
      label: typeof breed.label === 'string' ? breed.label.slice(0, 80) : 'Unknown / mixed breed',
      confidence: ['high', 'medium', 'low'].includes(breed.confidence) ? breed.confidence : 'low',
      note: typeof breed.note === 'string' ? breed.note.slice(0, 180) : 'Visual estimate only; appearance can overlap across breeds.'
    },
    appearance: Array.isArray(data?.appearance) ? data.appearance.filter(v => typeof v === 'string').slice(0, 5) : [],
    occupation: typeof data?.occupation === 'string' ? data.occupation.slice(0, 80) : 'Chief Sofa Security Officer',
    tagline: typeof data?.tagline === 'string' ? data.tagline.slice(0, 180) : 'Professional snack inspector. Part-time human supervisor.',
    traits: Array.isArray(data?.traits) ? data.traits.filter(v => typeof v === 'string').slice(0, 5) : ['loyal', 'chaotic', 'curious'],
    stats: {
      chaos: clamp(data?.stats?.chaos), treats: clamp(data?.stats?.treats),
      zoomies: clamp(data?.stats?.zoomies), loyalty: clamp(data?.stats?.loyalty)
    },
    news: {
      headline: typeof data?.news?.headline === 'string' ? data.news.headline.slice(0, 140) : 'Human opened the refrigerator.',
      body: typeof data?.news?.body === 'string' ? data.news.body.slice(0, 300) : 'Millions of dogs are monitoring the situation.'
    },
    caseTitle: typeof data?.caseTitle === 'string' ? data.caseTitle.slice(0, 100) : 'The Missing Biscuit',
    caseClue: typeof data?.caseClue === 'string' ? data.caseClue.slice(0, 300) : 'The evidence mysteriously disappeared immediately after the investigation began.'
  };
}

const fallback = (name) => sanitizeDog({
  breed: { label: 'Unknown / mixed breed', confidence: 'low', note: 'Add a clear front-facing photo for a better visual estimate.' },
  appearance: ['adorable', 'expressive', 'ready for adventure'],
  occupation: 'Chief Sofa Security Officer',
  tagline: 'Professional snack inspector. Part-time human supervisor.',
  traits: ['loyal', 'chaotic', 'curious'],
  stats: { chaos: 92, treats: 98, zoomies: 95, loyalty: 100 },
  news: { headline: 'Human opened the refrigerator.', body: 'Millions of dogs are monitoring the situation. No treats have been confirmed.' },
  caseTitle: 'The Missing Biscuit', caseClue: 'The evidence mysteriously disappeared immediately after the investigation began.'
}, name);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  try {
    const { name, imageBase64, mimeType } = req.body || {};
    const dogName = typeof name === 'string' ? name.trim().slice(0, 40) : '';

    if (imageBase64 && (!ALLOWED_MIME.has(mimeType) || imageBase64.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3))) {
      return jsonResponse(res, 400, { error: 'Unsupported or oversized image. Use a JPEG, PNG, or WebP under 7 MB.' });
    }

    const prompt = `You are BARKVERSE's multimodal dog-discovery intelligence. Analyze the supplied dog photo visually when one is provided. Return ONLY valid JSON with exactly these keys: name, breed, appearance, occupation, tagline, traits, stats, news, caseTitle, caseClue.

The breed object MUST contain label, confidence, note. Estimate the visible breed/type only from visual evidence. Allowed confidence values: high, medium, low. If the photo is unclear, mixed-breed, or insufficient for a responsible visual estimate, use "Unknown / mixed breed" and low confidence. Never present breed, age, health, ownership, identity, or other sensitive attributes as certain facts. Do not infer health conditions or protected/sensitive traits.

The name is ${dogName ? `"${dogName}"` : 'not provided'}. If no name was provided, return "Your Dog" and do not invent a human-style personal name.

appearance: 3-5 short visual observations only. traits: 3-5 playful personality words inferred from the visible expression/pose, clearly fictional. stats: chaos, treats, zoomies, loyalty as integers 0-100. news and caseTitle/caseClue should be funny, affectionate, child-safe, and specific to the visible dog. Keep the fictional comedy harmless. This is entertainment, not veterinary advice or identity recognition.`;

    let result;
    try {
      result = await generate({
        prompt,
        image: imageBase64 ? { data: imageBase64, mimeType } : null
      });
    } catch (error) {
      return jsonResponse(res, 200, { ...fallback(dogName), provider: 'deterministic-fallback', degraded: true, aiError: 'AI provider unavailable' });
    }

    const parsed = parseJsonText(result.text);
    const dog = sanitizeDog(parsed || {}, dogName);
    return jsonResponse(res, 200, { ...dog, provider: result.provider, degraded: false });
  } catch (error) {
    return jsonResponse(res, 200, { ...fallback(''), provider: 'deterministic-fallback', degraded: true, aiError: 'Discovery fallback' });
  }
};
