# Proyecto NEMCATACOA_3

Panorama técnico completo del repositorio: API en Node/Express con PostgreSQL, landing web en React/Vite y esqueleto móvil Expo. Incluye rutas, configuraciones y dependencias clave para operar y extender el sistema.

## Estructura general
- `BackEnd/nemcatacoa-api`: API REST (Node 20+, Express 5, PostgreSQL, JWT, Joi, bcrypt, rate limiting). Arranque con `npm run dev` o `npm start`.
- `FrondEnd/NEMCATACOA`: Landing y formularios de autenticación en React 19 + Vite + Tailwind v4, con llamadas HTTP al backend.
- `nemcatacoa_movil`: App móvil Expo Router (React Native), aún en estado de plantilla con servicios HTTP definidos.
- `database/backup.sql`: Dump de la base de datos (esquema y datos de ejemplo).
- Documentos de apoyo: `BackEnd/README.md`, `FrondEnd/INSTALACION.md`, análisis de UI (`FrondEnd/ANALISIS_*.md`) y cambios previos (`GUIA_CAMBIOS_CODEX.md`).

## Backend (BackEnd/nemcatacoa-api)
- **Configuración**: Variables en `.env` leídas por `src/config/env.js` (`PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `BCRYPT_COST`, `CORS_ORIGIN`). Pool de PG en `src/db/pool.js` y helper alterno en `src/db.js`.
- **Arranque**: `src/server.js` monta `src/app.js`. Middlewares globales: `helmet`, `cors` (origen configurable), `express.json` (1 MB), `morgan` y `errorHandler`.
- **Seguridad**: JWT en `authJwt` (requiere `Authorization: Bearer`), control de rol con `requireRole`, validación de payloads con Joi (`middlewares/validate`), rate limiting para `/auth` (`middlewares/rateLimiter`).
- **Rutas principales** (todas JSON):
  - `/health`: ping básico.
  - `/auth` (`features/auth`): `POST /register`, `POST /login`, `POST /forgot-password`, `POST /reset-password`. Registra usuario, emite JWT (2 h), genera tokens de reseteo en `password_reset_tokens` (TTL 60 min).
  - `/ciudades` (`features/ciudades`): `GET /` con filtros `q`, `etiquetas`, `minRating`, paginado `limit/offset`; `GET /:id` para detalle activo.
  - `/ciudades/:id/comentarios` (`features/comentarios`): `POST` autenticado para crear/actualizar reseña 1–5 con upsert sobre `(id_usuario,id_ciudad)`.
  - `/usuario` (`features/usuario`): autenticado; `GET /historial` (consultas recientes), `GET /favoritos`, `POST /favoritos/:id` agrega, `DELETE /favoritos/:id` elimina.
  - `/sugerencias` (`features/sugerencias`): `POST /sugerencias` autenticado con lugar, ciudad, opcional descripción/coordenadas.
  - `/admin` (`features/admin`, protegido con JWT + rol admin):
    - Usuarios: `GET /admin/usuarios`, `PUT /admin/usuarios/:id` (rol/estado), `PUT /admin/usuarios/:id/desactivar` / `reactivar`.
    - Ciudades: `POST /admin/ciudades`, `PUT /admin/ciudades/:id`, `DELETE /admin/ciudades/:id` (marca inactivo), `PUT /admin/ciudades/:id/reactivar`. Validaciones en `admin.schemas.js` (JSON strings permitidos para campos compuestos).
    - Sugerencias: `GET /admin/sugerencias`, `PUT /admin/sugerencias/:id` (estado/respuesta_admin, id_admin_respuesta se toma del JWT).
- **Utilidades**: `utils/passwords` (bcrypt), `utils/asyncHandler` para evitar try/catch repetido.
- **Scripts de diagnóstico**: `src/scripts/testDb.js` y `src/examples/queryExample.js` ejecutan `SELECT 1` y cierran el pool. Jest configurado pero sin cobertura activada.
- **Migraciones**: `src/db/migrations/202502150001_create_password_reset_tokens.sql` crea tabla de tokens de reseteo con índices y extensión `pgcrypto`.

## Esquema de base de datos (database/backup.sql)
Principales tablas y campos:
- `usuario`: `id` (UUID), `email` único, `password_hash`, `nombres`, `apellidos`, `rol` (`admin|usuario`), `estado` (`activo|inactivo`), `ubicacion` JSON opcional, `fecha_registro`.
- `ciudad`: identificador `id` y `slug`, `nombre`, `resumen`, arrays `imagenes` y `etiquetas`, `duracion`, `calificacion_promedio` y `calificacion_count`, `coordenadas` JSON, `descripcion`, `mejor_epoca`, `puntos_interes` JSON, `estado` y timestamps.
- `comentario`: `id`, FK `id_usuario`, FK `id_ciudad`, `calificacion` (1–5), `comentario`, `estado`, `updated_at`.
- `favorito`: `id`, `id_usuario`, `id_ciudad`, `fecha_agregado` (clave compuesta evita duplicados por constraint ON CONFLICT en código).
- `historial_ruta`: registro de consultas de rutas por usuario con `tipo_consulta` y `detalles` JSON.
- `ruta_predefinida`: rutas asociadas a ciudad con `puntos_parada` JSON, `dificultad`, `tipo`, `estado`.
- `sugerencia`: propuestas de lugares con `estado` (`pendiente`, etc.), `respuesta_admin`, `id_admin_respuesta`.
- `password_reset_tokens` (migración): `token` UUID único, `user_id`, `expires_at`, `used_at`, con borrado de tokens previos al usar uno.
Incluye datos de ejemplo (p. ej. ciudad `bogota` con imagen `/IMG/BOGOTA.png`).

## Frontend web (FrondEnd/NEMCATACOA)
- **Stack**: React 19, Vite 7, Tailwind 4 (@tailwindcss/cli y postcss), framer-motion y lucide-react para animaciones/íconos en el footer.
- **Entradas**: `src/main.jsx` monta `App`. Se usa `window.location.pathname` en `App.jsx` para rutear sin React Router a `/` (home), `/login`, `/registro`, `/admin`.
- **Páginas y componentes**:
  - `pages/home.jsx`: landing con secciones ancladas (`#inicio`, `#destinos`, `#experiencias`, `#comunidad`, `#soporte`), tarjetas de stats, destinos, testimonios y CTAs. Usa `Navbar_-general` y `Footer`.
  - `components/Navbar_general.jsx`: navbar sticky con menú responsive, enlaces a anclas y CTAs de autenticación.
  - `components/login.jsx` y `components/registro.jsx`: formularios que llaman `apiRequest` (`services/api.js`) a `/auth/login` y `/auth/register`. Guardan JWT en `localStorage` (`nemcatacoaToken`). Validan contraseñas coincidentes.
  - `pages/admin.jsx`: dashboard estático con métricas de ejemplo; sin llamadas reales aún.
  - `components/Footer.jsx` + `assets/css/Footer.css`: pie animado con framer-motion e íconos lucide.
- **Servicio HTTP**: `services/api.js` toma `VITE_API_URL` (por defecto `http://localhost:4000`), añade `Content-Type` y `Authorization` opcional, parsea JSON y lanza error con mensaje del backend.
- **Estilos**: Tailwind importado en `index.css`; restos de estilos de plantilla en `App.css` (no usados por el home actual).
- **Docs frontend**: `INSTALACION.md` (setup y `.env.local`), `ANALISIS_HOME.md`, `ANALISIS_NAVBAR.md`, `ANALISIS_INTEGRACION.md`.

## App móvil (nemcatacoa_movil)
- **Stack**: Expo Router 6, React Native 0.81, React 19, Tabs y Stack por archivo. Scripts típicos (`npm start`, `npm run android/ios/web`).
- **Estado actual**: Mayormente plantilla de Expo:
  - Navegación por tabs en `app/(tabs)` con pantallas demo `index.tsx` y `explore.tsx`.
  - Rutas de autenticación en `app/(auth)/login.tsx` y `register.tsx` con texto placeholder; layout oculta el header.
  - `app/modal.tsx` modal de ejemplo.
- **Servicios**: `components/api.ts` fija `API_BASE_URL` a `http://10.0.2.2:4000/api` (host local en emulador Android). `services/http.ts` es wrapper de `fetch` (JSON, manejo de errores). `services/auth.ts` define llamadas a `/auth/*` coherentes con el backend.
- **Tema**: `constants/theme.ts` define colores y fuentes por plataforma; hooks `use-color-scheme` gestionan tema claro/oscuro.
- **Scripts útiles**: `npm run reset-project` mueve la plantilla a `app-example` para limpiar el directorio `app`.

## Cómo ejecutar rápidamente
- **API**: `cd BackEnd/nemcatacoa-api && npm install && cp .env.example .env` (crear vars), luego `npm run dev`. Endpoint de salud: `GET /health`.
- **Frontend**: `cd FrondEnd/NEMCATACOA && npm install && npm run dev` con `VITE_API_URL` apuntando al backend.
- **Móvil**: `cd nemcatacoa_movil && npm install && npm start` (ajusta `API_BASE_URL` o usa túnel de Expo).

## Observaciones y próximos pasos
- El navbar y home ya están integrados; login/registro web persisten el token pero no consumen rutas protegidas aún.
- Rutas móviles y dashboard admin son maquetas: requieren conectar con los servicios existentes y aplicar el diseño de producto.
- Existe duplicidad de helpers de BD (`src/db.js` y `src/db/pool.js`); conviene unificar para evitar configuraciones divergentes.
- Dump SQL incluye funciones/tipos (`estado_general`, `estado_sugerencia`, etc.) que deben cargarse antes de usar migraciones adicionales.
