const { query } = require('../../db');

async function getHistorial(req, res) {
  const { limit = '20', offset = '0' } = req.query;
  const r = await query(
    `SELECT h.*, c.nombre, c.slug
     FROM historial_ruta h
     JOIN ciudad c ON c.id = h.id_ciudad
     WHERE h.id_usuario = $1
     ORDER BY h.fecha_consulta DESC
     LIMIT $2 OFFSET $3`,
    [req.user.id, Number(limit), Number(offset)]
  );
  res.json(r.rows);
}

async function addFavorito(req, res) {
  const { id } = req.params;
  await query(
    `INSERT INTO favorito (id_usuario, id_ciudad)
     VALUES ($1,$2)
     ON CONFLICT (id_usuario, id_ciudad) DO NOTHING`,
    [req.user.id, id]
  );
  res.status(201).json({ ok: true });
}

async function deleteFavorito(req, res) {
  const { id } = req.params;
  await query(`DELETE FROM favorito WHERE id_usuario = $1 AND id_ciudad = $2`, [req.user.id, id]);
  res.json({ ok: true });
}

async function listFavoritos(req, res) {
  const r = await query(
    `SELECT f.id_ciudad, c.nombre, c.slug, c.calificacion_promedio
     FROM favorito f JOIN ciudad c ON c.id = f.id_ciudad
     WHERE f.id_usuario = $1
     ORDER BY c.nombre`,
    [req.user.id]
  );
  res.json(r.rows);
}

module.exports = { getHistorial, addFavorito, deleteFavorito, listFavoritos };
