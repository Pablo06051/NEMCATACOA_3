require('dotenv/config');

function required(name, value) {
  if (!value) throw new Error(`Falta variable de entorno: ${name}`);
  return value;
}

const config = {
  port: Number(process.env.PORT || 4000),
  db: {
    host: required('DB_HOST', process.env.DB_HOST),
    port: Number(process.env.DB_PORT || 5432),
    database: required('DB_NAME', process.env.DB_NAME),
    user: required('DB_USER', process.env.DB_USER),
    password: required('DB_PASSWORD', process.env.DB_PASSWORD),
  },
  jwtSecret: required('JWT_SECRET', process.env.JWT_SECRET),
  bcryptCost: Number(process.env.BCRYPT_COST || 12),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = { config };
