const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function authJwt(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret); // { id, email, rol }
    // Log minimal payload for debugging (id/email/rol) — temporal
    console.log('[authJwt] token payload:', { id: payload.id, email: payload.email, rol: payload.rol });
    req.user = payload;
    next();
  } catch (err) {
    console.error('[authJwt] token verify error:', err && err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { authJwt };
