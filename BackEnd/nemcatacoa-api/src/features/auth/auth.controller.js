const jwtLib = require('jsonwebtoken');
const { randomUUID: defaultRandomUUID } = require('crypto');
const { pool: defaultPool, query: defaultQuery } = require('../../db');
const {
  hashPassword: defaultHashPassword,
  verifyPassword: defaultVerifyPassword,
} = require('../../utils/passwords');
const { config } = require('../../config/env');

const RESET_TOKEN_TTL_MINUTES = 60;
function createAuthController({
  db = {},
  passwords = {},
  jwt = jwtLib,
  randomUUID = defaultRandomUUID,
  dateProvider = () => new Date(),
  tokenTtlMinutes = RESET_TOKEN_TTL_MINUTES,
} = {}) {
  const dbQuery = db.query || defaultQuery;
  const dbPool = db.pool || defaultPool;
  const hash = passwords.hashPassword || defaultHashPassword;
  const verify = passwords.verifyPassword || defaultVerifyPassword;

  async function register(req, res) {
    const { email, password, nombres, apellidos } = req.body;

    const passwordHash = await hash(password);
    try {
      const r = await dbQuery(
        `INSERT INTO usuario (email, password_hash, nombres, apellidos)
         VALUES ($1,$2,$3,$4)
         RETURNING id, email, rol`,
        [email, passwordHash, nombres, apellidos]
      );
      const u = r.rows[0];
      const token = jwt.sign(
        { id: u.id, email: u.email, rol: u.rol },
        config.jwtSecret,
        { expiresIn: '2h' }
      );
      return res.status(201).json({ token, user: u });
    } catch (e) {
      if (e.code === '23505') {
        return res.status(409).json({ error: 'Email ya registrado' });
      }
      throw e;
    }
  }

  async function login(req, res) {
    const { email, password } = req.body;
    const r = await dbQuery(
      `SELECT id, email, rol, password_hash
       FROM usuario
       WHERE email = $1 AND estado = 'activo'`,
      [email]
    );
    if (r.rowCount === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const u = r.rows[0];
    const ok = await verify(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: u.id, email: u.email, rol: u.rol }, config.jwtSecret, { expiresIn: '2h' });
    res.json({ token, user: { id: u.id, email: u.email, rol: u.rol } });
  }

  async function registerProveedor(req, res) {
    const { email, password, nombres, apellidos, nombre_comercial, telefono, descripcion } = req.body;
    const client = await dbPool.connect();

    try {
      await client.query('BEGIN');

      const passwordHash = await hash(password);

      const usuarioResult = await client.query(
        `INSERT INTO usuario (email, password_hash, nombres, apellidos, rol, estado)
         VALUES ($1,$2,$3,$4,'proveedor','activo')
         RETURNING id, email, rol`,
        [email, passwordHash, nombres, apellidos]
      );

      const user = usuarioResult.rows[0];

      await client.query(
        `INSERT INTO proveedor (id, nombre_comercial, telefono, descripcion, verificado)
         VALUES ($1,$2,$3,$4,false)`,
        [user.id, nombre_comercial, telefono || null, descripcion || null]
      );

      const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, config.jwtSecret, { expiresIn: '2h' });
      await client.query('COMMIT');
      return res.status(201).json({ token, user });
    } catch (e) {
      await client.query('ROLLBACK');
      if (e.code === '23505') {
        return res.status(409).json({ error: 'Email ya registrado' });
      }
      throw e;
    } finally {
      client.release();
    }
  }

  async function forgotPassword(req, res) {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await dbQuery(
      `SELECT id
       FROM usuario
       WHERE lower(email) = $1 AND estado = 'activo'`,
      [normalizedEmail]
    );

    if (existing.rowCount > 0) {
      const userId = existing.rows[0].id;
      const token = randomUUID();
      const now = dateProvider();
      const expiresAt = new Date(now.getTime() + tokenTtlMinutes * 60 * 1000);

      await dbQuery(
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
    const client = await dbPool.connect();

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
      const now = dateProvider();
      if (tokenRow.used_at || new Date(tokenRow.expires_at) <= now) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      const hashed = await hash(password);

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

  return { register, login, forgotPassword, resetPassword, registerProveedor };
}

const defaultController = createAuthController();

module.exports = {
  ...defaultController,
  createAuthController,
};
