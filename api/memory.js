const { generate, jsonResponse } = require('../lib/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const { dog, memory } = req.body || {};
  const text = String(memory || '').slice(0, 500);
  if (!text) return jsonResponse(res, 400, { error: 'Memory is required' });
  const dogName = String(dog?.name || 'Bruno').slice(0, 40);
  const prompt = `Write a tiny emotional BARKVERSE memory for ${dogName}. The human memory is: ${text}. Return only JSON: {"title":string,"story":string,"closing":string}. The story should be warm, 60-100 words, child-safe, sincere, and avoid claims about medical conditions or real-world events beyond what the user supplied.`;
  try {
    const result = await generate({ prompt });
    let parsed;
    try { parsed = JSON.parse(result.text); } catch { parsed = null; }
    if (!parsed) parsed = {
      title: `${dogName}'s Little Moment`,
      story: `Some memories are small enough to fit inside an ordinary day, yet somehow become the ones we keep. ${text}`,
      closing: `${dogName} will remember this one forever.`
    };
    return jsonResponse(res, 200, { ...parsed, provider: result.provider });
  } catch {
    return jsonResponse(res, 200, {
      title: `${dogName}'s Little Moment`,
      story: `Some memories are small enough to fit inside an ordinary day, yet somehow become the ones we keep. ${text}`,
      closing: `${dogName} will remember this one forever.`,
      provider: 'deterministic-fallback', degraded: true
    });
  }
};
