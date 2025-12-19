const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { requireRole } = require('../../middlewares/requireRole');
const { validate } = require('../../middlewares/validate');
const { asyncHandler } = require('../../utils/asyncHandler');
const {
  myPackages,
  createPackage,
  updatePackage,
  deactivatePackage,
  myBookings,
} = require('./proveedor.controller');
const { paqueteSchema } = require('./proveedor.schemas');

const router = express.Router();

// Aplicar auth + rol únicamente a rutas que comiencen con /proveedor
router.use('/proveedor', authJwt, requireRole('proveedor'));

router.get('/proveedor/paquetes', asyncHandler(myPackages));
router.post('/proveedor/paquetes', validate(paqueteSchema), asyncHandler(createPackage));
router.put('/proveedor/paquetes/:id', validate(paqueteSchema), asyncHandler(updatePackage));
router.delete('/proveedor/paquetes/:id', asyncHandler(deactivatePackage));

router.get('/proveedor/reservas', asyncHandler(myBookings));

module.exports = router;
