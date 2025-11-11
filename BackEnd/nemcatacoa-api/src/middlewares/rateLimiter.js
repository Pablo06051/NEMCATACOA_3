const rateLimit = require('express-rate-limit');

// Límite estricto para /auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
