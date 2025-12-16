const Joi = require('joi');

const crearReservaSchema = Joi.object({
  id_paquete: Joi.string().guid({ version: 'uuidv4' }).required(),
  cantidad_personas: Joi.number().integer().min(1).required(),
});

module.exports = { crearReservaSchema };
