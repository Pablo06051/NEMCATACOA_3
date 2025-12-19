const Joi = require('joi');

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const idSchema = Joi.string().trim().min(3).pattern(slugPattern);
const slugSchema = Joi.string().trim().min(3).pattern(slugPattern);
const nombreSchema = Joi.string().trim().min(3);
const resumenSchema = Joi.string().trim().min(10);
const duracionSchema = Joi.string().trim().min(3);
const descripcionSchema = Joi.string().trim().min(10);
const mejorEpocaSchema = Joi.string().trim().min(3);
const estadoSchema = Joi.string().valid('activo', 'inactivo');

const coordenadasSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
}).prefs({ stripUnknown: true });

const puntoInteresSchema = Joi.object({
  nombre: Joi.string().trim().min(3).required(),
  descripcion: Joi.string().trim().min(5).required(),
}).prefs({ stripUnknown: true });

const stringArraySchema = Joi.array()
  .items(Joi.string().trim().min(2))
  .min(1);

const puntosInteresArraySchema = Joi.array()
  .items(puntoInteresSchema)
  .min(1);

function jsonField(baseSchema) {
  return Joi.alternatives().try(
    baseSchema,
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error, value: validated } = baseSchema.validate(parsed, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          return helpers.error('any.invalid', {
            message: error.details.map(d => d.message).join(', '),
          });
        }
        return validated;
      } catch (err) {
        return helpers.error('any.invalid', { message: 'Formato JSON inválido' });
      }
    })
  );
}

const createCiudadSchema = Joi.object({
  id: idSchema.required(),
  slug: slugSchema.required(),
  nombre: nombreSchema.required(),
  resumen: resumenSchema.required(),
  imagenes: jsonField(stringArraySchema).required(),
  etiquetas: jsonField(stringArraySchema).required(),
  duracion: duracionSchema.optional(),
  coordenadas: jsonField(coordenadasSchema).optional(),
  descripcion: descripcionSchema.required(),
  mejor_epoca: mejorEpocaSchema.required(),
  puntos_interes: jsonField(puntosInteresArraySchema).required(),
  estado: estadoSchema.optional(),
}).prefs({ abortEarly: false, stripUnknown: true });

const updateCiudadSchema = Joi.object({
  slug: slugSchema,
  nombre: nombreSchema,
  resumen: resumenSchema,
  imagenes: jsonField(stringArraySchema),
  etiquetas: jsonField(stringArraySchema),
  duracion: duracionSchema,
  coordenadas: jsonField(coordenadasSchema).allow(null),
  descripcion: descripcionSchema,
  mejor_epoca: mejorEpocaSchema,
  puntos_interes: jsonField(puntosInteresArraySchema),
  estado: estadoSchema,
}).min(1).prefs({ abortEarly: false, stripUnknown: true });

const updateUsuarioSchema = Joi.object({
  rol: Joi.string().valid('admin', 'usuario'),
  estado: estadoSchema,
})
  .or('rol', 'estado')
  .prefs({ abortEarly: false, stripUnknown: true });

module.exports = {
  createCiudadSchema,
  updateCiudadSchema,
  updateUsuarioSchema,
};
