const { pool, query } = require('../../db');

async function createReserva(req, res) {
  const { id_paquete, cantidad_personas } = req.body;
  const client = await pool.connect();

    if (cantidad_personas > 5) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Máximo 5 cupos por reserva' });
    }

    const existing = await client.query(
      `SELECT id FROM reserva
       WHERE id_paquete = $1 AND id_cliente = $2
       AND estado IN ('reservada','pagada')`,
      [id_paquete, req.user.id]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Ya tienes una reserva activa para este paquete' });
    }


  try {
    await client.query('BEGIN');

    const paquete = await client.query(
      `SELECT id, cupo_max, estado FROM paquete WHERE id = $1 FOR UPDATE`,
      [id_paquete]
    );

    if (paquete.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Paquete no existe' });
    }

    const pkg = paquete.rows[0];
    if (!['activo', 'aprobado'].includes(pkg.estado)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Paquete no disponible' });
    }

    const ocupadosResult = await client.query(
      `SELECT COALESCE(SUM(cantidad_personas), 0) AS ocupados
         FROM reserva
        WHERE id_paquete = $1 AND estado IN ('reservada','pagada')`,
      [id_paquete]
    );

    const ocupados = Number(ocupadosResult.rows[0].ocupados);
    const cupoMax = Number(pkg.cupo_max);

    if (ocupados + cantidad_personas > cupoMax) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No hay cupo suficiente' });
    }

    const nuevaReserva = await client.query(
      `INSERT INTO reserva (id_paquete, id_cliente, cantidad_personas, estado)
       VALUES ($1,$2,$3,'reservada')
       RETURNING *`,
      [id_paquete, req.user.id, cantidad_personas]
    );

    await client.query('COMMIT');
    return res.status(201).json(nuevaReserva.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: e?.message || 'Error al crear la reserva' });
  } finally {
    client.release();
  }
}

async function listMisReservas(req, res) {
  const r = await query(
    `SELECT r.*, p.titulo, p.id_ciudad
       FROM reserva r
       JOIN paquete p ON p.id = r.id_paquete
      WHERE r.id_cliente = $1
      ORDER BY r.fecha DESC`,
    [req.user.id]
  );

  res.json(r.rows);
}

async function cancelReserva(req, res) {
  const { id } = req.params;
  const r = await query(
    `UPDATE reserva
        SET estado = 'cancelada'
      WHERE id = $1 AND id_cliente = $2 AND estado = 'reservada'
      RETURNING id, estado`,
    [id, req.user.id]
  );

  if (r.rowCount === 0) {
    return res.status(404).json({ error: 'Reserva no encontrada o no cancelable' });
  }

  res.json(r.rows[0]);
}

module.exports = { createReserva, listMisReservas, cancelReserva };
