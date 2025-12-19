function requireRole(...roles) {
  // Normalizamos roles para comparaciones robustas (sin mayúsculas ni espacios)
  const allowedRoles = roles.flat().map((r) => String(r).toLowerCase().trim());

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    const userRoleRaw = req.user?.rol;
    const userRole = String(userRoleRaw || '').toLowerCase().trim();

    // Debug logging para investigar discrepancias de rol
    // (se puede remover cuando se confirme el comportamiento)
    console.log('[requireRole] allowed:', allowedRoles, 'userRoleRaw:', userRoleRaw, 'normalized:', userRole);

    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      console.warn('[requireRole] acceso denegado. allowed:', allowedRoles, 'userRole:', userRole);
      return res.status(403).json({ error: `No autorizado (rol detectado: ${userRoleRaw || 'desconocido'})`, detectedRole: userRole });
    }
    next();
  };
}

module.exports = { requireRole };
