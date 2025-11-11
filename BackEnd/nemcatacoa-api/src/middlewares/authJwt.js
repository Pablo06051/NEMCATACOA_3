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
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { authJwt };
