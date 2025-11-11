const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { asyncHandler } = require('../../utils/asyncHandler');
const { crearSugerencia } = require('./sugerencias.controller');

const router = express.Router();
router.post('/sugerencias', authJwt, asyncHandler(crearSugerencia));

module.exports = router;
