// Pequeño script para comprobar la conexión a la base de datos usando el helper query.
const { query, pool } = require('../db');

async function runQueryExample() {
  const result = await query('SELECT 1 AS ok');
  console.log(result.rows); // [{ ok: 1 }]
  return result.rows;
}

if (require.main === module) {
  runQueryExample()
    .catch((err) => {
      console.error('Error al ejecutar la consulta de prueba:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}

module.exports = { runQueryExample };
