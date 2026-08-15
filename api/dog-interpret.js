const { generate, parseJsonText, jsonResponse } = require('../lib/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const { audioBase64, mimeType, dog } = req.body || {};
  const audio = String(audioBase64 || '');
  const allowed = new Set(['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/ogg;codecs=opus']);
  if (!audio || audio.length > 7 * 1024 * 1024 || !allowed.has(String(mimeType || '').toLowerCase())) {
    return jsonResponse(res, 400, { error: 'Use a short supported dog-audio recording.' });
  }
  const dogName = String(dog?.name || 'Your Dog').slice(0, 40);
  const prompt = `You are BARKVERSE Master AI, an entertainment interpreter for dog sounds. Analyze the supplied audio as a dog-sound interpretation request. Return ONLY valid JSON with exactly: interpretation, mood, confidence. Explain what the dog might be trying to communicate in warm, funny, child-safe language. Never claim that dog vocalizations have a literal universal translation. Say it is an estimate based on sound/context. Do not diagnose health problems. Dog name: ${JSON.stringify(dogName)}. Keep interpretation under 300 characters and confidence as high, medium, or low.`;
  try {
    const result = await generate({ prompt, audio: { data: audio, mimeType: String(mimeType) } });
    const parsed = parseJsonText(result.text) || {};
    return jsonResponse(res, 200, {
      interpretation: String(parsed.interpretation || `${dogName} sounds like they have something important to say — probably “come here, human, the snack situation requires immediate attention.”`).slice(0, 500),
      mood: String(parsed.mood || 'curious').slice(0, 80),
      confidence: ['high','medium','low'].includes(parsed.confidence) ? parsed.confidence : 'low',
      provider: result.provider
    });
  } catch {
    return jsonResponse(res, 200, {
      interpretation: `${dogName} sounds like they have something important to say — probably “come here, human, the snack situation requires immediate attention.”`,
      mood: 'curious / expressive', confidence: 'low', provider: 'deterministic-fallback', degraded: true
    });
  }
};
