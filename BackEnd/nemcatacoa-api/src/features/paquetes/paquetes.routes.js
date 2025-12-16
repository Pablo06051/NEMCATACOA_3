const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { listPaquetes, getPaquete } = require('./paquetes.controller');

const router = express.Router();

router.get('/', asyncHandler(listPaquetes));
router.get('/:id', asyncHandler(getPaquete));

module.exports = router;
