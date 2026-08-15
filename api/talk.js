const { generate, jsonResponse } = require('../lib/ai');

const fallbackReplies = [
  'I investigated the sofa. It belongs to me now.',
  'I did not eat the biscuit. I merely relocated it internally.',
  'You went to work without me. I have opened a formal complaint.',
  'The cat knows too much. We should discuss this privately.'
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const { dog, message } = req.body || {};
  const dogName = String(dog?.name || 'Bruno').slice(0, 40);
  const userMessage = String(message || '').slice(0, 500);
  if (!userMessage) return jsonResponse(res, 400, { error: 'Message is required' });
  const prompt = `You are ${dogName}, a hilarious but loving dog living in BARKVERSE. Reply to the human in 1-3 short sentences. Stay in character. Be funny, child-safe, affectionate and never claim real-world facts about health or safety. Dog personality: ${JSON.stringify(dog || {})}. Human says: ${userMessage}`;
  try {
    const result = await generate({ prompt });
    return jsonResponse(res, 200, { reply: result.text, provider: result.provider });
  } catch {
    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return jsonResponse(res, 200, { reply, provider: 'deterministic-fallback', degraded: true });
  }
};
