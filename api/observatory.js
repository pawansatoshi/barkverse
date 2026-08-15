const { jsonResponse } = require('../lib/ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });
  const hasSnowflake = process.env.SNOWFLAKE_ACCOUNT && process.env.SNOWFLAKE_TOKEN;
  if (!hasSnowflake) {
    return jsonResponse(res, 200, {
      mode: 'demo',
      stats: { dogsConnected: 8421903221, humansInvestigated: 14392821, averageZoomies: 91, sofaOwnershipClaims: 73, snackInspections: 58 },
      source: 'BARKVERSE demo analytics'
    });
  }
  try {
    const account = process.env.SNOWFLAKE_ACCOUNT.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const statement = `SELECT COUNT(*) AS EVENTS, COUNT(DISTINCT DOG_ID) AS DOGS, AVG(COALESCE(ZOOMIES,0)) AS AVG_ZOOMIES FROM ${process.env.SNOWFLAKE_DATABASE}.${process.env.SNOWFLAKE_SCHEMA}.${process.env.SNOWFLAKE_EVENTS_TABLE || 'BARK_EVENTS'}`;
    const response = await fetch(`https://${account}/api/v2/statements`, {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.SNOWFLAKE_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ statement, timeout: 20, database: process.env.SNOWFLAKE_DATABASE, schema: process.env.SNOWFLAKE_SCHEMA, warehouse: process.env.SNOWFLAKE_WAREHOUSE, role: process.env.SNOWFLAKE_ROLE })
    });
    if (!response.ok) throw new Error(`Snowflake ${response.status}`);
    const payload = await response.json();
    return jsonResponse(res, 200, { mode: 'snowflake', data: payload.data || [], source: 'Snowflake SQL API' });
  } catch (error) {
    return jsonResponse(res, 200, { mode: 'demo-fallback', error: error.message, stats: { dogsConnected: 8421903221, humansInvestigated: 14392821, averageZoomies: 91, sofaOwnershipClaims: 73, snackInspections: 58 } });
  }
};
