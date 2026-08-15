const { generate, parseJsonText, jsonResponse } = require('../lib/ai');

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const stat = (value, fallback) => value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? fallback : clamp(value);

function sanitizeDog(data, requestedName) {
  const breed = data?.breed && typeof data.breed === 'object' ? data.breed : {};
  return {
    name: requestedName || (typeof data?.name === 'string' && data.name.trim() ? data.name.slice(0, 40) : 'Your Dog'),
    breed: {
      label: typeof breed.label === 'string' ? breed.label.slice(0, 80) : 'Unknown / mixed breed',
      confidence: ['high', 'medium', 'low'].includes(breed.confidence) ? breed.confidence : 'low',
      note: typeof breed.note === 'string' ? breed.note.slice(0, 180) : 'Visual estimate only; appearance can overlap across breeds.'
    },
    appearance: Array.isArray(data?.appearance) ? data.appearance.filter(v => typeof v === 'string').slice(0, 5) : [],
    occupation: typeof data?.occupation === 'string' ? data.occupation.slice(0, 80) : 'Chief Sofa Security Officer',
    tagline: typeof data?.tagline === 'string' ? data.tagline.slice(0, 180) : 'Professional snack inspector. Part-time human supervisor.',
    traits: Array.isArray(data?.traits) ? data.traits.filter(v => typeof v === 'string').slice(0, 5) : ['loyal', 'chaotic', 'curious'],
    stats: { chaos: stat(data?.stats?.chaos, 72), treats: stat(data?.stats?.treats, 92), zoomies: stat(data?.stats?.zoomies, 84), loyalty: stat(data?.stats?.loyalty, 98) },
    news: { headline: typeof data?.news?.headline === 'string' ? data.news.headline.slice(0, 140) : 'Human opened the refrigerator.', body: typeof data?.news?.body === 'string' ? data.news.body.slice(0, 300) : 'Millions of dogs are monitoring the situation.' },
    caseTitle: typeof data?.caseTitle === 'string' ? data.caseTitle.slice(0, 100) : 'The Missing Biscuit',
    caseClue: typeof data?.caseClue === 'string' ? data.caseClue.slice(0, 300) : 'The evidence mysteriously disappeared immediately after the investigation began.'
  };
}

const fallback = (name) => sanitizeDog({ breed: { label: 'Unknown / mixed breed', confidence: 'low', note: 'Add a clear front-facing dog photo for a better visual estimate.' }, appearance: ['adorable', 'expressive', 'ready for adventure'], occupation: 'Chief Sofa Security Officer', tagline: 'Professional snack inspector. Part-time human supervisor.', traits: ['loyal', 'chaotic', 'curious'], stats: { chaos: 72, treats: 92, zoomies: 84, loyalty: 98 }, news: { headline: 'Human opened the refrigerator.', body: 'Millions of dogs are monitoring the situation. No treats have been confirmed.' }, caseTitle: 'The Missing Biscuit', caseClue: 'The evidence mysteriously disappeared immediately after the investigation began.' }, name);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  try {
    const { name, imageBase64, mimeType } = req.body || {};
    const dogName = typeof name === 'string' ? name.trim().slice(0, 40) : '';
    if (!imageBase64) return jsonResponse(res, 400, { error: 'Please upload or take a photo of a dog first.', code: 'DOG_PHOTO_REQUIRED' });
    if (!ALLOWED_MIME.has(mimeType) || imageBase64.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3)) return jsonResponse(res, 400, { error: 'Unsupported or oversized image. Use a JPEG, PNG, or WebP under 3 MB.', code: 'INVALID_IMAGE' });

    const prompt = `You are BARKVERSE canine visual gatekeeper and dog discovery intelligence. Analyze the supplied image. First determine whether the main subject is a real dog/canine. Return ONLY valid JSON with exactly these keys: isDog, dogConfidence, rejectionReason, name, breed, appearance, occupation, tagline, traits, stats, news, caseTitle, caseClue.

isDog MUST be true only when the image clearly contains a dog as the primary subject. For cats, people, cars, toys, scenery, food, screenshots, objects, or ambiguous/non-canine images set isDog=false. dogConfidence is a number 0-100. If isDog=false, rejectionReason must be a short friendly message such as "That photo is not a dog. BARKVERSE only accepts dogs 🐶 Try a dog photo instead." Do not generate a dog profile for rejected images.

If isDog=true, estimate visible breed/type from visual evidence. The breed object MUST contain label, confidence, note. Allowed confidence values: high, medium, low. Never claim exact breed as certain; mixed-breed/uncertain is valid. Do not infer health, ownership, identity, protected traits, or other sensitive attributes. appearance is 3-5 visual observations. traits are fictional playful personality words. stats are integers 0-100. news and case fields must be funny, affectionate and child-safe.

The name is ${dogName ? JSON.stringify(dogName) : 'not provided'}. If no name is provided, return "Your Dog" and do not invent a personal name. This is a fictional entertainment experience, not veterinary advice or identity recognition.`;

    let result;
    try { result = await generate({ prompt, image: { data: imageBase64, mimeType } }); }
    catch { return jsonResponse(res, 503, { error: 'Dog vision is temporarily unavailable. Please try again.', code: 'VISION_UNAVAILABLE' }); }

    const parsed = parseJsonText(result.text) || {};
    if (parsed.isDog !== true || Number(parsed.dogConfidence) < 55) {
      return jsonResponse(res, 422, { error: typeof parsed.rejectionReason === 'string' ? parsed.rejectionReason.slice(0, 220) : 'That photo is not clearly a dog. BARKVERSE only accepts dog photos 🐶', code: 'NOT_A_DOG', dogConfidence: Number(parsed.dogConfidence) || 0 });
    }
    return jsonResponse(res, 200, { ...sanitizeDog(parsed, dogName), provider: result.provider, degraded: false });
  } catch { return jsonResponse(res, 500, { error: 'We could not inspect that photo. Please try a clear dog photo.', code: 'DISCOVERY_ERROR' }); }
};
