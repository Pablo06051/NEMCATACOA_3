const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { requireRole } = require('../../middlewares/requireRole');
const { validate } = require('../../middlewares/validate');
const { asyncHandler } = require('../../utils/asyncHandler');
const { crearReservaSchema } = require('./reservas.schemas');
const { createReserva, listMisReservas, cancelReserva } = require('./reservas.controller');

const router = express.Router();

// Aplicar auth + rol únicamente a rutas que comiencen con /reservas
router.use('/reservas', authJwt, requireRole('usuario'));

router.post('/reservas', validate(crearReservaSchema), asyncHandler(createReserva));
router.get('/reservas/mias', asyncHandler(listMisReservas));
router.put('/reservas/:id/cancelar', asyncHandler(cancelReserva));

module.exports = router;
