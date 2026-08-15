const { jsonResponse } = require('../lib/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return jsonResponse(res, 503, { error: 'ElevenLabs is not configured', fallback: true });
  const { text, voiceId } = req.body || {};
  const clean = String(text || '').slice(0, 900);
  if (!clean) return jsonResponse(res, 400, { error: 'Text is required' });
  const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: clean, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2' })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return jsonResponse(res, response.status, { error: `ElevenLabs request failed: ${detail.slice(0, 300)}` });
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  res.statusCode = 200;
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  res.end(buffer);
};
