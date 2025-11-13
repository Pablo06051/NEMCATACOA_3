const { query } = require('../../db');

/* ===========================
   USUARIOS
   =========================== */

async function listUsuarios(_req, res) {
  const r = await query(`
    SELECT id, email, rol, estado, fecha_registro 
    FROM usuario 
    ORDER BY fecha_registro DESC
  `);
  res.json(r.rows);
}

async function updateUsuario(req, res) {
  const { id } = req.params;
  const { rol, estado } = req.body || {};

  await query(
    `UPDATE usuario 
     SET rol = COALESCE($2, rol), 
         estado = COALESCE($3, estado) 
     WHERE id = $1`,
    [id, rol || null, estado || null]
  );

  res.json({ ok: true, message: "Usuario actualizado" });
}

// 🔻 Desactivar usuario
async function desactivarUsuario(req, res) {
  const { id } = req.params;

  await query(
    `UPDATE usuario SET estado = 'inactivo' WHERE id = $1`,
    [id]
  );

  res.json({ ok: true, message: "Usuario desactivado" });
}

// 🔼 Reactivar usuario
async function reactivarUsuario(req, res) {
  const { id } = req.params;

  await query(
    `UPDATE usuario SET estado = 'activo' WHERE id = $1`,
    [id]
  );

  res.json({ ok: true, message: "Usuario reactivado" });
}


/* ===========================
   CIUDADES
   =========================== */

async function crearCiudad(req, res) {
  const {
    id, slug, nombre, resumen, imagenes = [], etiquetas = [],
    duracion, coordenadas, descripcion, mejor_epoca, puntos_interes
  } = req.body || {};

  await query(
    `INSERT INTO ciudad 
      (id, slug, nombre, resumen, imagenes, etiquetas, duracion, coordenadas, descripcion, mejor_epoca, puntos_interes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      id, slug, nombre, resumen, imagenes, etiquetas, duracion,
      coordenadas ? JSON.stringify(coordenadas) : null,
      descripcion, mejor_epoca,
      puntos_interes ? JSON.stringify(puntos_interes) : null
    ]
  );

  res.status(201).json({ ok: true, message: "Ciudad creada" });
}

async function actualizarCiudad(req, res) {
  const { id } = req.params;
  const {
    slug, nombre, resumen, imagenes, etiquetas, duracion,
    coordenadas, descripcion, mejor_epoca, puntos_interes, estado
  } = req.body || {};

  await query(
    `UPDATE ciudad SET
       slug = COALESCE($2, slug),
       nombre = COALESCE($3, nombre),
       resumen = COALESCE($4, resumen),
       imagenes = COALESCE($5, imagenes),
       etiquetas = COALESCE($6, etiquetas),
       duracion = COALESCE($7, duracion),
       coordenadas = COALESCE($8, coordenadas),
       descripcion = COALESCE($9, descripcion),
       mejor_epoca = COALESCE($10, mejor_epoca),
       puntos_interes = COALESCE($11, puntos_interes),
       estado = COALESCE($12, estado)
     WHERE id = $1`,
    [
      id, slug || null, nombre || null, resumen || null, imagenes || null,
      etiquetas || null, duracion || null,
      coordenadas ? JSON.stringify(coordenadas) : null,
      descripcion || null, mejor_epoca || null,
      puntos_interes ? JSON.stringify(puntos_interes) : null,
      estado || null
    ]
  );

  res.json({ ok: true, message: "Ciudad actualizada" });
}

async function desactivarCiudad(req, res) {
  const { id } = req.params;

  await query(`UPDATE ciudad SET estado = 'inactivo' WHERE id = $1`, [id]);

  res.json({ ok: true, message: "Ciudad desactivada" });
}

// 🔼 Reactivar ciudad
async function reactivarCiudad(req, res) {
  const { id } = req.params;

  await query(`UPDATE ciudad SET estado = 'activo' WHERE id = $1`, [id]);

  res.json({ ok: true, message: "Ciudad reactivada" });
}


/* ===========================
   SUGERENCIAS
   =========================== */

async function listSugerencias(_req, res) {
  const r = await query(
    `SELECT s.*, u.email
     FROM sugerencia s 
     JOIN usuario u ON u.id = s.id_usuario
     ORDER BY s.fecha_sugerencia DESC`
  );

  res.json(r.rows);
}

async function resolverSugerencia(req, res) {
  const { id } = req.params;
  const { estado, respuesta_admin } = req.body || {};

  await query(
    `UPDATE sugerencia 
     SET estado = COALESCE($2, estado), 
         respuesta_admin = $3,
         id_admin_respuesta = $4
     WHERE id = $1`,
    [id, estado || null, respuesta_admin || null, req.user.id]
  );

  res.json({ ok: true, message: "Sugerencia actualizada" });
}


/* ===========================
   EXPORTS
   =========================== */
module.exports = {
  listUsuarios,
  updateUsuario,
  desactivarUsuario,
  reactivarUsuario,
  crearCiudad,
  actualizarCiudad,
  desactivarCiudad,
  reactivarCiudad,
  listSugerencias,
  resolverSugerencia
};
