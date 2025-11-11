// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
});

// Helper para consultas parametrizadas
async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}


// Cierre elegante del pool cuando se detenga el proceso
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('🛑 Pool de PostgreSQL cerrado');
  } finally {
    process.exit(0);
  }
});

module.exports = {
  pool,
  query,
};
