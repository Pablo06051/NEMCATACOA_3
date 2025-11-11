const { query } = require('../../db');

async function upsertComentario(req, res) {
  const { id } = req.params; // id_ciudad
  const { calificacion, comentario } = req.body || {};
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'calificacion debe ser entero 1..5' });
  }

  try {
    await query(
      `INSERT INTO comentario (id_usuario, id_ciudad, calificacion, comentario)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (id_usuario, id_ciudad)
       DO UPDATE SET calificacion = EXCLUDED.calificacion,
                     comentario   = EXCLUDED.comentario,
                     updated_at   = CURRENT_TIMESTAMP,
                     estado       = 'activo'`,
      [req.user.id, id, calificacion, comentario || null]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === '23503') return res.status(404).json({ error: 'Ciudad no existe' });
    throw e;
  }
}

module.exports = { upsertComentario };
