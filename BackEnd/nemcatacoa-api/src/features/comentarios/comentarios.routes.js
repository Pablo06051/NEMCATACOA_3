const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { asyncHandler } = require('../../utils/asyncHandler');
const { upsertComentario } = require('./comentarios.controller');

const router = express.Router();
router.post('/ciudades/:id/comentarios', authJwt, asyncHandler(upsertComentario));

module.exports = router;
