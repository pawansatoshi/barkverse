const { generate, parseJsonText, jsonResponse } = require('../lib/ai');

const fallback = (name) => ({
  name: name || 'Bruno',
  occupation: 'Chief Sofa Security Officer',
  tagline: 'Professional snack inspector. Part-time human supervisor.',
  traits: ['loyal', 'chaotic', 'curious'],
  stats: { chaos: 92, treats: 98, zoomies: 95, loyalty: 100 },
  news: {
    headline: 'Human opened the refrigerator.',
    body: 'Millions of dogs are monitoring the situation. No treats have been confirmed.'
  },
  caseTitle: 'The Missing Biscuit',
  caseClue: 'The evidence mysteriously disappeared immediately after the investigation began.'
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  try {
    const { name, imageBase64, mimeType } = req.body || {};
    const dogName = String(name || 'Bruno').slice(0, 40);
    const prompt = `You are the world-building intelligence for BARKVERSE, a fictional internet run by dogs. Analyze the dog image if provided. Return ONLY valid JSON with exactly these keys: name, occupation, tagline, traits (array of 3 short words), stats (chaos,treats,zoomies,loyalty integers 0-100), news (headline,body), caseTitle, caseClue. Make it funny, affectionate, child-safe and specific to the visible dog. Never make health, breed, age or identity claims as facts. This is playful fiction. Dog name: ${dogName}.`;
    let result;
    try {
      result = await generate({
        prompt,
        image: imageBase64 ? { data: imageBase64, mimeType: mimeType || 'image/jpeg' } : null
      });
    } catch (error) {
      return jsonResponse(res, 200, { ...fallback(dogName), provider: 'deterministic-fallback', degraded: true });
    }
    const parsed = parseJsonText(result.text) || fallback(dogName);
    return jsonResponse(res, 200, { ...parsed, provider: result.provider, degraded: false });
  } catch (error) {
    return jsonResponse(res, 200, { ...fallback('Bruno'), provider: 'deterministic-fallback', degraded: true });
  }
};
