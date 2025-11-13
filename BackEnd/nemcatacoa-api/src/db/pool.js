const { Pool } = require('pg');
const { config } = require('../config/env');

const pool = new Pool(config.db);

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// cierre elegante si quieres
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

module.exports = { pool, query };
