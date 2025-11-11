const jwt = require('jsonwebtoken');
const { query } = require('../../db');
const { hashPassword, verifyPassword } = require('../../utils/passwords');
const { config } = require('../../config/env');

async function register(req, res) {
  const { email, password, nombres, apellidos } = req.body;

  const hash = await hashPassword(password);
  try {
    const r = await query(
      `INSERT INTO usuario (email, password_hash, nombres, apellidos)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, rol`,
      [email, hash, nombres, apellidos]
    );
    const u = r.rows[0];
    const token = jwt.sign({ id: u.id, email: u.email, rol: u.rol }, config.jwtSecret, { expiresIn: '2h' });
    return res.status(201).json({ token });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    throw e;
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const r = await query(
    `SELECT id, email, rol, password_hash
     FROM usuario
     WHERE email = $1 AND estado = 'activo'`,
    [email]
  );
  if (r.rowCount === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

  const u = r.rows[0];
  const ok = await verifyPassword(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: u.id, email: u.email, rol: u.rol }, config.jwtSecret, { expiresIn: '2h' });
  res.json({ token });
}

module.exports = { register, login };
