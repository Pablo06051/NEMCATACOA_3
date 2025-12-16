const { query } = require('../../db');

async function listPaquetes(req, res) {
  const { ciudad, estado, limit = '10', offset = '0' } = req.query;

  const params = [];
  const where = [];
  let i = 1;

  if (estado) {
    where.push(`p.estado = $${i}`);
    params.push(estado);
    i++;
  } else {
    where.push("p.estado IN ('activo','aprobado')");
  }

  if (ciudad) {
    where.push(`p.id_ciudad = $${i}`);
    params.push(ciudad);
    i++;
  }

  const sql = `
    SELECT p.*, COALESCE(
      SUM(CASE WHEN r.estado IN ('reservada','pagada') THEN r.cantidad_personas ELSE 0 END),
      0
    ) AS cupos_ocupados
    FROM paquete p
    LEFT JOIN reserva r ON r.id_paquete = p.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY p.id
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
    SELECT p.*, COALESCE(
      SUM(CASE WHEN r.estado IN ('reservada','pagada') THEN r.cantidad_personas ELSE 0 END),
      0
    ) AS cupos_ocupados
    FROM paquete p
    LEFT JOIN reserva r ON r.id_paquete = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `;

  const r = await query(sql, [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'Paquete no encontrado' });

  res.json(r.rows[0]);
}

module.exports = { listPaquetes, getPaquete };
