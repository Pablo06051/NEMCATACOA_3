const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { pool, query } = require('../../db');
const { hashPassword, verifyPassword } = require('../../utils/passwords');
const { config } = require('../../config/env');

const RESET_TOKEN_TTL_MINUTES = 60;

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

async function forgotPassword(req, res) {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await query(
    `SELECT id
     FROM usuario
     WHERE lower(email) = $1 AND estado = 'activo'`,
    [normalizedEmail]
  );

  if (existing.rowCount > 0) {
    const userId = existing.rows[0].id;
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await query(
      `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  return res
    .status(202)
    .json({ message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña.' });
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const tokenResult = await client.query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_reset_tokens
       WHERE token = $1
       FOR UPDATE`,
      [token]
    );

    if (tokenResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const tokenRow = tokenResult.rows[0];
    const now = new Date();
    if (tokenRow.used_at || new Date(tokenRow.expires_at) <= now) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashed = await hashPassword(password);

    await client.query(
      `UPDATE usuario SET password_hash = $1 WHERE id = $2`,
      [hashed, tokenRow.user_id]
    );

    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [tokenRow.id]
    );

    await client.query(
      `DELETE FROM password_reset_tokens
       WHERE user_id = $1 AND id <> $2`,
      [tokenRow.user_id, tokenRow.id]
    );

    await client.query('COMMIT');
    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
