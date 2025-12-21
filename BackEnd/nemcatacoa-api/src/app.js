require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./features/auth/auth.routes');
const ciudadesRoutes = require('./features/ciudades/ciudades.routes');
const comentariosRoutes = require('./features/comentarios/comentarios.routes');
const usuarioRoutes = require('./features/usuario/usuario.routes');
const sugerenciasRoutes = require('./features/sugerencias/sugerencias.routes');
const adminRoutes = require('./features/admin/admin.routes');
const paquetesRoutes = require('./features/paquetes/paquetes.routes');
const proveedorRoutes = require('./features/proveedor/proveedor.routes');
const reservasRoutes = require('./features/reservas/reservas.routes');

const { config } = require('./config/env');

const app = express();

// Seguridad y utilidades
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Rutas
app.use('/auth', authRoutes);
app.use('/ciudades', ciudadesRoutes);
app.use('/paquetes', paquetesRoutes);
app.use('/', comentariosRoutes);
app.use('/', usuarioRoutes);
app.use('/', sugerenciasRoutes);
app.use('/admin', adminRoutes);
app.use('/', proveedorRoutes);
app.use('/', reservasRoutes);

// Manejo de errores (al final)
app.use(errorHandler);

module.exports = app;
