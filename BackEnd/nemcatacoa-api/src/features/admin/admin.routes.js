const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { requireRole } = require('../../middlewares/requireRole');
const { asyncHandler } = require('../../utils/asyncHandler');
const {
  listUsuarios, updateUsuario,
  crearCiudad, actualizarCiudad, desactivarCiudad,
  listSugerencias, resolverSugerencia
} = require('./admin.controller');

const router = express.Router();
router.use(authJwt, requireRole('admin'));

router.get('/admin/usuarios', asyncHandler(listUsuarios));
router.put('/admin/usuarios/:id', asyncHandler(updateUsuario));

router.post('/admin/ciudades', asyncHandler(crearCiudad));
router.put('/admin/ciudades/:id', asyncHandler(actualizarCiudad));
router.delete('/admin/ciudades/:id', asyncHandler(desactivarCiudad));

router.get('/admin/sugerencias', asyncHandler(listSugerencias));
router.put('/admin/sugerencias/:id', asyncHandler(resolverSugerencia));

module.exports = router;
