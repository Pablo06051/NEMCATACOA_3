const { query } = require('../../db');

async function listPaquetes(req, res) {
  const { ciudad, estado, limit = '10', offset = '0', all } = req.query;

  const params = [];
  const where = [];
  let i = 1;

  if (estado) {
    where.push(`p.estado = $${i}`);
    params.push(estado);
    i++;
  } else if (all !== 'true') {
    where.push("p.estado IN ('activo','aprobado')");
  }

  if (ciudad) {
    where.push(`p.id_ciudad = $${i}`);
    params.push(ciudad);
    i++;
  }

  const sql = `
    SELECT 
      p.*, 
      pr.nombre_comercial AS proveedor_nombre,
      u.email AS proveedor_email,
      COALESCE(
        SUM(CASE WHEN r.estado IN ('reservada','pagada') THEN r.cantidad_personas ELSE 0 END),
        0
      ) AS cupos_ocupados
    FROM paquete p
    LEFT JOIN reserva r ON r.id_paquete = p.id
    LEFT JOIN proveedor pr ON pr.id = p.id_proveedor
    LEFT JOIN usuario u ON u.id = p.id_proveedor
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY p.id, pr.nombre_comercial, u.email
    ORDER BY p.fecha_creacion DESC
    LIMIT $${i} OFFSET $${i + 1}
  `;

  params.push(Number(limit), Number(offset));
  const r = await query(sql, params);
  res.json(r.rows);
}

async function getPaquete(req, res) {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.*,
      pr.nombre_comercial AS proveedor_nombre,
      u.email AS proveedor_email,
      COALESCE(
        SUM(CASE WHEN r.estado IN ('reservada','pagada') THEN r.cantidad_personas ELSE 0 END),
        0
      ) AS cupos_ocupados
    FROM paquete p
    LEFT JOIN reserva r ON r.id_paquete = p.id
    LEFT JOIN proveedor pr ON pr.id = p.id_proveedor
    LEFT JOIN usuario u ON u.id = p.id_proveedor
    WHERE p.id = $1
    GROUP BY p.id, pr.nombre_comercial, u.email
  `;

  const r = await query(sql, [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'Paquete no encontrado' });

  res.json(r.rows[0]);
}

module.exports = { listPaquetes, getPaquete };
