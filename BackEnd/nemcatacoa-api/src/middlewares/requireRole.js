function requireRole(...roles) {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (allowedRoles.length && !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = { requireRole };
