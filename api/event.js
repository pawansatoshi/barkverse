const { jsonResponse } = require('../lib/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const event = req.body || {};
  const allowed = new Set(['discover','investigation','talk','memory','pawprint','observatory']);
  if (!allowed.has(event.type)) return jsonResponse(res, 400, { error: 'Unsupported event' });
  const account = process.env.SNOWFLAKE_ACCOUNT;
  const token = process.env.SNOWFLAKE_TOKEN;
  if (!account || !token || !process.env.SNOWFLAKE_DATABASE || !process.env.SNOWFLAKE_SCHEMA || !process.env.SNOWFLAKE_WAREHOUSE) {
    return jsonResponse(res, 200, { stored: false, mode: 'demo' });
  }
  try {
    const host = account.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const statement = `INSERT INTO ${process.env.SNOWFLAKE_DATABASE}.${process.env.SNOWFLAKE_SCHEMA}.${process.env.SNOWFLAKE_EVENTS_TABLE || 'BARK_EVENTS'} (EVENT_ID, SESSION_ID, EVENT_TYPE, CHAOS, ZOOMIES, LOYALTY, CREATED_AT) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`;
    const bindings = {
      '1': { type: 'TEXT', value: String(event.eventId || crypto.randomUUID()) },
      '2': { type: 'TEXT', value: String(event.sessionId || 'anonymous').slice(0, 80) },
      '3': { type: 'TEXT', value: event.type },
      '4': { type: 'FIXED', value: String(Number(event.chaos || 0)) },
      '5': { type: 'FIXED', value: String(Number(event.zoomies || 0)) },
      '6': { type: 'FIXED', value: String(Number(event.loyalty || 0)) }
    };
    const response = await fetch(`https://${host}/api/v2/statements`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ statement, bindings, timeout: 20, database: process.env.SNOWFLAKE_DATABASE, schema: process.env.SNOWFLAKE_SCHEMA, warehouse: process.env.SNOWFLAKE_WAREHOUSE, role: process.env.SNOWFLAKE_ROLE })
    });
    if (!response.ok) throw new Error(`Snowflake ${response.status}`);
    return jsonResponse(res, 200, { stored: true, mode: 'snowflake' });
  } catch (error) {
    return jsonResponse(res, 200, { stored: false, mode: 'snowflake-fallback', error: error.message });
  }
};
