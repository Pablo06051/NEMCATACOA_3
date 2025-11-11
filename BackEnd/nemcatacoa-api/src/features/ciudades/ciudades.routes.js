const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { listCiudades, getCiudad } = require('./ciudades.controller');

const router = express.Router();
router.get('/', asyncHandler(listCiudades));
router.get('/:id', asyncHandler(getCiudad));

module.exports = router;
