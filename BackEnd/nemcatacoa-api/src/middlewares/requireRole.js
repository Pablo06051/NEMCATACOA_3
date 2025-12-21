function requireRole(...roles) {
  // Normalizamos roles para comparaciones robustas (sin mayúsculas ni espacios)
  const allowedRoles = roles.flat().map((r) => String(r).toLowerCase().trim());

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    // Aceptar distintas formas de que el token incluya el rol (rol, role o estructuras anidadas)
    let userRoleRaw = req.user?.rol ?? req.user?.role ?? null;

    // Si por algún motivo el objeto completo fue seteado como rol, intentar extraer
    if (!userRoleRaw && typeof req.user === 'object') {
      userRoleRaw = req.user.rol ?? req.user.role ?? req.user;
    }

    // Manejar arrays u objetos en el campo rol
    if (Array.isArray(userRoleRaw)) userRoleRaw = userRoleRaw[0];
    if (userRoleRaw && typeof userRoleRaw === 'object') {
      userRoleRaw = userRoleRaw.rol ?? userRoleRaw.role ?? JSON.stringify(userRoleRaw);
    }

    const userRole = String(userRoleRaw || '').toLowerCase().trim();

    // Debug logging para investigar discrepancias de rol (remover si se desea)
    console.log('[requireRole] allowed:', allowedRoles, 'userRoleRaw:', userRoleRaw, 'normalized:', userRole, 'req.user:', req.user);

    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      console.warn('[requireRole] acceso denegado. allowed:', allowedRoles, 'userRole:', userRole);
      // Responder con los roles permitidos para depurar diferencias de espacios/mayúsculas
      return res.status(403).json({
        error: `No autorizado (rol detectado: ${userRoleRaw || 'desconocido'})`,
        detectedRole: userRole,
        allowedRoles,
      });
    }
    next();
  };
}

module.exports = { requireRole };
