const { query } = require('../../db');

async function myPackages(req, res) {
  const r = await query(
    `SELECT * FROM paquete WHERE id_proveedor = $1 ORDER BY fecha_creacion DESC`,
    [req.user.id]
  );
  res.json(r.rows);
}

async function createPackage(req, res) {
  // Debug: mostrar información mínima de usuario y headers al recibir la petición
  try {
    console.log('[proveedor.createPackage] req.user:', { id: req.user?.id, email: req.user?.email, rol: req.user?.rol });
    console.log('[proveedor.createPackage] Authorization header present:', !!req.headers.authorization);
  } catch (err) {
    console.error('[proveedor.createPackage] debug log error:', err && err.message);
  }

  const p = req.body;
  const r = await query(
    `INSERT INTO paquete (
       id_proveedor, id_ciudad, titulo, descripcion, incluye, no_incluye,
       precio, fecha_inicio, fecha_fin, cupo_max, imagenes, estado
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pendiente')
     RETURNING *`,
    [
      req.user.id,
      p.id_ciudad,
      p.titulo,
      p.descripcion || null,
      p.incluye || null,
      p.no_incluye || null,
      p.precio,
      p.fecha_inicio || null,
      p.fecha_fin || null,
      p.cupo_max,
      p.imagenes || [],
    ]
  );

  res.status(201).json(r.rows[0]);
}

async function updatePackage(req, res) {
  const { id } = req.params;
  const p = req.body;

  const r = await query(
    `UPDATE paquete SET
       id_ciudad = $1,
       titulo = $2,
       descripcion = $3,
       incluye = $4,
       no_incluye = $5,
       precio = $6,
       fecha_inicio = $7,
       fecha_fin = $8,
       cupo_max = $9,
       imagenes = $10,
       fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id = $11 AND id_proveedor = $12
     RETURNING *`,
    [
      p.id_ciudad,
      p.titulo,
      p.descripcion || null,
      p.incluye || null,
      p.no_incluye || null,
      p.precio,
      p.fecha_inicio || null,
      p.fecha_fin || null,
      p.cupo_max,
      p.imagenes || [],
      id,
      req.user.id,
    ]
  );

  if (r.rowCount === 0) {
    return res.status(404).json({ error: 'Paquete no encontrado o no autorizado' });
  }

  res.json(r.rows[0]);
}

async function deactivatePackage(req, res) {
  const { id } = req.params;

  const r = await query(
    `UPDATE paquete
       SET estado = 'inactivo', fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id = $1 AND id_proveedor = $2
     RETURNING id, estado`,
    [id, req.user.id]
  );

  if (r.rowCount === 0) {
    return res.status(404).json({ error: 'Paquete no encontrado o no autorizado' });
  }

  res.json(r.rows[0]);
}

async function reactivatePackage(req, res) {
  const { id } = req.params;

  const r = await query(
    `UPDATE paquete
       SET estado = 'pendiente', fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id = $1 AND id_proveedor = $2
     RETURNING id, estado`,
    [id, req.user.id]
  );

  if (r.rowCount === 0) {
    return res.status(404).json({ error: 'Paquete no encontrado o no autorizado' });
  }

  res.json(r.rows[0]);
}

async function myBookings(req, res) {
  const r = await query(
    `SELECT r.*, p.titulo, p.id_ciudad
       FROM reserva r
       JOIN paquete p ON p.id = r.id_paquete
      WHERE p.id_proveedor = $1
      ORDER BY r.fecha DESC`,
    [req.user.id]
  );

  res.json(r.rows);
}

module.exports = {
  myPackages,
  createPackage,
  updatePackage,
  deactivatePackage,
  reactivatePackage,
  myBookings,
};
