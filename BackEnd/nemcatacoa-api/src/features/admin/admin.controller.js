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

// Listado de proveedores (con datos del perfil y su usuario)
async function listProveedores(_req, res) {
  try {
    const r = await query(
      `SELECT p.id as id_proveedor, p.nombre_comercial, p.telefono, p.descripcion, p.verificado, p.fecha_creacion, u.email, u.estado as usuario_estado
       FROM proveedor p
       JOIN usuario u ON u.id = p.id
       ORDER BY p.nombre_comercial ASC`
    );
    res.json(r.rows);
  } catch (err) {
    console.error('[admin.listProveedores] error:', err);
    res.status(500).json({ error: 'Error al listar proveedores' });
  }
}

// 🔼 Verificar proveedor
function isValidUUID(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}

async function verificarProveedor(req, res) {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    console.warn('[admin.verificarProveedor] invalid id:', id);
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  try {
    console.log('[admin.verificarProveedor] id:', id);
    const r = await query(
      `UPDATE proveedor SET verificado = true WHERE id = $1 RETURNING id, verificado`,
      [id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    console.log('[admin.verificarProveedor] updated rows:', r.rowCount);
    res.json({ ok: true, message: 'Proveedor verificado', proveedor: r.rows[0] });
  } catch (err) {
    console.error('[admin.verificarProveedor] id:', id, 'error:', err);
    res.status(500).json({ error: 'Error al verificar el proveedor' });
  }
}

// 🔻 Desverificar proveedor
async function desverificarProveedor(req, res) {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    console.warn('[admin.desverificarProveedor] invalid id:', id);
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  try {
    console.log('[admin.desverificarProveedor] id:', id);
    const r = await query(
      `UPDATE proveedor SET verificado = false WHERE id = $1 RETURNING id, verificado`,
      [id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    console.log('[admin.desverificarProveedor] updated rows:', r.rowCount);
    res.json({ ok: true, message: 'Proveedor desverificado', proveedor: r.rows[0] });
  } catch (err) {
    console.error('[admin.desverificarProveedor] id:', id, 'error:', err);
    res.status(500).json({ error: 'Error al desverificar el proveedor' });
  }
}

// Detalle de proveedor: perfil, paquetes y reservas
async function getProveedorDetail(req, res) {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    console.warn('[admin.getProveedorDetail] invalid id:', id);
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  try {
    console.log('[admin.getProveedorDetail] id:', id, 'fetching perfil');
    // Perfil
    const perfilRes = await query(
      `SELECT p.id as id_proveedor, p.nombre_comercial, p.telefono, p.descripcion, p.verificado, p.fecha_creacion, u.email, u.estado as usuario_estado
       FROM proveedor p
       JOIN usuario u ON u.id = p.id
       WHERE p.id = $1`,
      [id]
    );
    console.log('[admin.getProveedorDetail] perfil rows:', perfilRes.rowCount);
    if (perfilRes.rowCount === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    const perfil = perfilRes.rows[0];

    console.log('[admin.getProveedorDetail] fetching paquetes');
    // Paquetes del proveedor
    const paquetesRes = await query(
      `SELECT * FROM paquete WHERE id_proveedor = $1 ORDER BY fecha_creacion DESC`,
      [id]
    );
    console.log('[admin.getProveedorDetail] paquetes rows:', paquetesRes.rowCount);

    console.log('[admin.getProveedorDetail] fetching reservas');
    // Reservas para los paquetes del proveedor
    const reservasRes = await query(
      `SELECT r.*, p.titulo, p.id_ciudad
       FROM reserva r
       JOIN paquete p ON p.id = r.id_paquete
       WHERE p.id_proveedor = $1
       ORDER BY r.fecha DESC`,
      [id]
    );
    console.log('[admin.getProveedorDetail] reservas rows:', reservasRes.rowCount);

    res.json({ proveedor: perfil, paquetes: paquetesRes.rows, reservas: reservasRes.rows });
  } catch (err) {
    console.error('[admin.getProveedorDetail] id:', id, 'error:', err);
    console.error(err.stack);
    res.status(500).json({ error: 'Error al obtener el detalle del proveedor' });
  }
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

// Listado de ciudades (incluye inactivas) para administración
async function listCiudadesAdmin(_req, res) {
  try {
    const r = await query(
      `SELECT id, slug, nombre, resumen, imagenes, estado
       FROM ciudad
       ORDER BY nombre ASC`
    );
    res.json(r.rows);
  } catch (err) {
    console.error('[admin.listCiudadesAdmin] error:', err);
    res.status(500).json({ error: 'Error al listar ciudades' });
  }
}

// Detalle de ciudad + paquetes asociados
async function getCiudadDetail(req, res) {
  const { id } = req.params; // id is slug or city id
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de ciudad inválido' });
  }
  try {
    const ciudadRes = await query(
      `SELECT id, slug, nombre, resumen, imagenes, etiquetas, duracion, coordenadas, descripcion, mejor_epoca, puntos_interes, estado, fecha_creacion
       FROM ciudad WHERE id = $1`,
      [id]
    );
    if (ciudadRes.rowCount === 0) return res.status(404).json({ error: 'Ciudad no encontrada' });
    const ciudad = ciudadRes.rows[0];

    const paquetesRes = await query(
      `SELECT id, titulo, precio, estado, fecha_creacion FROM paquete WHERE id_ciudad = $1 ORDER BY fecha_creacion DESC`,
      [id]
    );

    res.json({ ciudad, paquetes: paquetesRes.rows });
  } catch (err) {
    console.error('[admin.getCiudadDetail] id:', id, 'error:', err);
    console.error(err.stack);
    res.status(500).json({ error: 'Error al obtener detalle de la ciudad' });
  }
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
  listProveedores,
  verificarProveedor,
  desverificarProveedor,
  updateUsuario,
  desactivarUsuario,
  reactivarUsuario,
  crearCiudad,
  actualizarCiudad,
  desactivarCiudad,
  reactivarCiudad,
  listCiudadesAdmin,
  // Detail endpoints
  getCiudadDetail,
  getProveedorDetail,
  listSugerencias,
  resolverSugerencia
};
