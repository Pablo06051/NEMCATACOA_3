const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { requireRole } = require('../../middlewares/requireRole');
const { validate } = require('../../middlewares/validate');
const { asyncHandler } = require('../../utils/asyncHandler');
const {
  listUsuarios,
  updateUsuario,
  desactivarUsuario,
  reactivarUsuario,
  crearCiudad,
  actualizarCiudad,
  desactivarCiudad,
  reactivarCiudad,
  listSugerencias,
  resolverSugerencia
} = require('./admin.controller');
const {
  createCiudadSchema,
  updateCiudadSchema,
  updateUsuarioSchema,
} = require('./admin.schemas');

const router = express.Router();

// Solo administradores pueden acceder
router.use(authJwt, requireRole('admin'));

// 🧩 Usuarios
router.get('/admin/usuarios', asyncHandler(listUsuarios));
router.put('/admin/usuarios/:id', validate(updateUsuarioSchema), asyncHandler(updateUsuario));
router.put('/admin/usuarios/:id/desactivar', asyncHandler(desactivarUsuario));
router.put('/admin/usuarios/:id/reactivar', asyncHandler(reactivarUsuario));

// 🏙️ Ciudades
router.post('/admin/ciudades', validate(createCiudadSchema), asyncHandler(crearCiudad));
router.put('/admin/ciudades/:id', validate(updateCiudadSchema), asyncHandler(actualizarCiudad));
router.delete('/admin/ciudades/:id', asyncHandler(desactivarCiudad));
router.put('/admin/ciudades/:id/reactivar', asyncHandler(reactivarCiudad));

// 💬 Sugerencias
router.get('/admin/sugerencias', asyncHandler(listSugerencias));
router.put('/admin/sugerencias/:id', asyncHandler(resolverSugerencia));

module.exports = router;
