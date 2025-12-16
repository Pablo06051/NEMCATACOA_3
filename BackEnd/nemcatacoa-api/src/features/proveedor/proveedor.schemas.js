const Joi = require('joi');

const paqueteSchema = Joi.object({
  id_ciudad: Joi.string().required(),
  titulo: Joi.string().max(200).required(),
  descripcion: Joi.string().allow('', null),
  incluye: Joi.any(),
  no_incluye: Joi.any(),
  precio: Joi.number().min(0).required(),
  fecha_inicio: Joi.date().allow(null),
  fecha_fin: Joi.date().allow(null),
  cupo_max: Joi.number().integer().min(1).required(),
  imagenes: Joi.array().items(Joi.string()).default([]),
});

module.exports = { paqueteSchema };
