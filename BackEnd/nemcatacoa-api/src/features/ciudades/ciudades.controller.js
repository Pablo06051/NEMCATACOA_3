const { query } = require('../../db');

async function listCiudades(req, res) {
  const { q, etiquetas, minRating, limit = '10', offset = '0' } = req.query;

  const where = [`estado = 'activo'`];
  const params = [];
  let i = 1;

  if (q) {
    where.push(`(search @@ plainto_tsquery('spanish', $${i}) OR nombre ILIKE '%' || $${i} || '%')`);
    params.push(q);
    i++;
  }
  if (etiquetas) {
    const arr = String(etiquetas).split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length) {
      where.push(`etiquetas @> $${i}`);
      params.push(arr);
      i++;
    }
  }
  if (minRating) {
    where.push(`calificacion_promedio >= $${i}`);
    params.push(Number(minRating));
    i++;
  }

  const sql = `
    SELECT id, slug, nombre, resumen, imagenes, etiquetas, duracion,
           calificacion_promedio, calificacion_count
    FROM ciudad
    WHERE ${where.join(' AND ')}
    ORDER BY calificacion_promedio DESC, id
    LIMIT $${i} OFFSET $${i + 1}
  `;
  params.push(Number(limit), Number(offset));

  const r = await query(sql, params);
  res.json(r.rows);
}

async function getCiudad(req, res) {
  const { id } = req.params;
  const r = await query(`SELECT * FROM ciudad WHERE id = $1 AND estado = 'activo'`, [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'Ciudad no encontrada' });
  res.json(r.rows[0]);
}

module.exports = { listCiudades, getCiudad };
