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
const { updatePaqueteEstado } = require('./admin.controller');
const {
  createCiudadSchema,
  updateCiudadSchema,
  updateUsuarioSchema,
} = require('./admin.schemas');

const router = express.Router();

// Solo administradores pueden acceder
router.use(authJwt, requireRole('admin'));

// 🧩 Usuarios
router.get('/usuarios', asyncHandler(listUsuarios));
router.put('/usuarios/:id', validate(updateUsuarioSchema), asyncHandler(updateUsuario));
router.put('/usuarios/:id/desactivar', asyncHandler(desactivarUsuario));
router.put('/usuarios/:id/reactivar', asyncHandler(reactivarUsuario));

// 🏙️ Ciudades
router.get('/ciudades', asyncHandler(require('./admin.controller').listCiudadesAdmin));
router.get('/ciudades/:id', asyncHandler(require('./admin.controller').getCiudadDetail));
router.post('/ciudades', validate(createCiudadSchema), asyncHandler(crearCiudad));
router.put('/ciudades/:id', validate(updateCiudadSchema), asyncHandler(actualizarCiudad));
router.delete('/ciudades/:id', asyncHandler(desactivarCiudad));
router.put('/ciudades/:id/reactivar', asyncHandler(reactivarCiudad));

// 🧾 Proveedores
router.get('/proveedores', asyncHandler(require('./admin.controller').listProveedores));
router.get('/proveedores/:id', asyncHandler(require('./admin.controller').getProveedorDetail));
router.put('/proveedores/:id/verificar', asyncHandler(require('./admin.controller').verificarProveedor));
router.put('/proveedores/:id/desverificar', asyncHandler(require('./admin.controller').desverificarProveedor));

// 💬 Sugerencias
router.get('/sugerencias', asyncHandler(listSugerencias));
router.put('/sugerencias/:id', asyncHandler(resolverSugerencia));

// 📦 Paquetes (cambiar estado)
router.put('/paquetes/:id/estado', asyncHandler(updatePaqueteEstado));

module.exports = router;
