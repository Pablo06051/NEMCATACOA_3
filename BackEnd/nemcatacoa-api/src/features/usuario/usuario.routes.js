const express = require('express');
const { authJwt } = require('../../middlewares/authJwt');
const { asyncHandler } = require('../../utils/asyncHandler');
const { getHistorial, addFavorito, deleteFavorito, listFavoritos } = require('./usuario.controller');

const router = express.Router();

router.get('/usuario/historial',  authJwt, asyncHandler(getHistorial));
router.post('/usuario/favoritos/:id', authJwt, asyncHandler(addFavorito));
router.delete('/usuario/favoritos/:id', authJwt, asyncHandler(deleteFavorito));
router.get('/usuario/favoritos', authJwt, asyncHandler(listFavoritos));

module.exports = router;
