const { query } = require('../../db');

async function crearSugerencia(req, res) {
  const { nombre_lugar, ciudad, descripcion, coordenadas } = req.body || {};
  if (!nombre_lugar || !ciudad) {
    return res.status(400).json({ error: 'nombre_lugar y ciudad son requeridos' });
  }
  await query(
    `INSERT INTO sugerencia (id_usuario, nombre_lugar, ciudad, descripcion, coordenadas)
     VALUES ($1,$2,$3,$4,$5)`,
    [req.user.id, nombre_lugar, ciudad, descripcion || null, coordenadas ? JSON.stringify(coordenadas) : null]
  );
  res.status(201).json({ ok: true });
}

module.exports = { crearSugerencia };
