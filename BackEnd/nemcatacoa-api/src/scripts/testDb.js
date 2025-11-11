const { query, pool } = require('../db');

async function main() {
  try {
    const result = await query('SELECT 1 AS ok');
    console.log('Resultado de la consulta:', result.rows);
    console.log('Conexión a PostgreSQL OK');
  } catch (error) {
    console.error('No se pudo consultar la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
