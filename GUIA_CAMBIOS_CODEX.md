# Guía detallada de cambios (Codex)

Este documento explica en profundidad cada pieza del trabajo realizado en el FrontEnd de Nemcatacoa para que puedas adaptarlo según tus necesidades. Está separado por componentes/secciones y destaca qué modificar si quieres personalizar textos, estilos o comportamiento.

---

## 1. App.jsx (`FrondEnd/NEMCATACOA/src/App.jsx`)
- **Qué hace**: convierte la app en una SPA centrada en la nueva página de inicio (`HomePage`) y actúa como router mínimo para `/login` y `/registro`. Usa `window.location.pathname` para decidir qué vista mostrar y mantiene un layout consistente con el logo.
- **Cómo cambiarlo**:
  1. Si agregas un router formal (React Router, TanStack Router, etc.), reemplaza el render condicional por tus rutas y deja el layout de autenticación como wrapper de esas vistas.
  2. Para manejar redirecciones o “protected routes”, aprovecha el token guardado en `localStorage` (`nemcatacoaToken`) dentro de tu lógica de navegación.

---

## 2. Navbar_general.jsx (`FrondEnd/NEMCATACOA/src/components/Navbar_general.jsx`)

### Estructura
- `navLinks`: arreglo con nombre y ancla interna. Para nuevos apartados, añadir `{ name: "Nuevo", href: "#nuevo" }`.
- `NavbarGeneral`: componente funcional con estado `isOpen` (controla menú móvil).

### Personalización rápida
1. **Branding**: Cambia el bloque con el gradiente (líneas ~18-23) por un logo `<img>` o SVG propio.
2. **Botones Login/Registro**: Sustituye los `href` por rutas reales una vez que exista el router; también puedes usar `<Link>` si ocupas React Router.
3. **Menú móvil**: Estilos están en clases Tailwind; para animaciones podrías envolver el contenedor en `motion.div` o usar transiciones CSS.

### Por qué se hizo así
- Sticky header mantiene la navegación visible.
- Gradientes y blur aportan una estética moderna sin requerir CSS externo.
- Se sustituyó el placeholder por el logo real (`/IMG/LOGO.png`) para que el branding sea consistente con el layout de autenticación.

---

## 3. Home.jsx (`FrondEnd/NEMCATACOA/src/pages/home.jsx`)

### Dependencias importadas
- `NavbarGeneral` y `Footer` para mantener consistencia visual.
- Varios arrays (`stats`, `highlights`, etc.) definen el contenido de cada sección.

### Secciones clave
1. **Hero / Presentación**
   - Textos enfocados en “planificación inteligente”.
   - CTA primaria lleva al bloque de destinos; CTA secundaria muestra cómo opera la plataforma.
   - Tarjetas de estadísticas reforzando credibilidad.
   - Mock UI (lado derecho) sugiere cómo luce el panel de control.
   - **Modificar**: ajusta el copy, números o lista de bullet points directamente en el JSX. Los colores están definidos con Tailwind, así que puedes cambiar `from-sky-500` por otras paletas.

2. **Plataforma integral (highlights)**
   - Se basa en el arreglo `highlights`; cada objeto tiene `title`, `description` e `icon`.
   - **Modificar**: reemplaza los textos o el SVG inline por íconos de librerías (Lucide, Heroicons). El diseño de tarjeta se controla con clases `rounded-3xl`, `border`, etc.

3. **Destinos destacados**
   - `destinations` define tres tarjetas con `name`, `badge`, `description`.
   - CTA “Ver ruta sugerida” es actualmente un botón sin funcionalidad; puedes conectarlo a modales, páginas o anclas específicas.

4. **Comunidad / Testimonios**
   - Fondo oscuro (`bg-slate-900`) para contrastar.
   - `experiences` es el listado de beneficios; testimonios están hardcodeados (puedes convertirlos en un array similar si planeas varios).
   - **Modificar**: sustituye testimonios por datos reales, o agrega un carrusel.

5. **Soporte continuo**
   - `supportChannels` describe los tres canales principales.
   - Caja final con CTA doble para registro o contacto directo.
   - **Modificar**: cambia correos, textos o añade un formulario.

### Consideraciones de estilo
- Todo usa Tailwind v4. No hay CSS adicional aparte del Footer.
- Los IDs (`inicio`, `destinos`, etc.) sincronizan con el Navbar para scroll automático.

---

## 4. Footer.jsx (`FrondEnd/NEMCATACOA/src/components/Footer.jsx`)

- Usa `framer-motion` para animar cada sección (fade + slide).
- Íconos de `lucide-react` para contacto y redes.
- **Personalización**:
  - Cambia el texto “Mi Compañía” por tu marca.
  - Actualiza los enlaces social/email/teléfono.
  - Si no deseas `framer-motion`, reemplaza los `<motion.div>` por `<div>` normales y elimina las props de animación.
- Estilos provienen de `src/assets/css/Footer.css`. Puedes adaptar colores o tipografías ahí.

---

## 5. Servicios y formularios de autenticación

- **`src/services/api.js`**: helper genérico que toma `VITE_API_URL` (o `http://localhost:4000`) y centraliza fetch, cabeceras, token JWT y manejo de errores. Cualquier componente puede reutilizarlo (`apiRequest(path, { method, data, token })`).
- **`src/components/login.jsx`**:
  - Inputs controlados para `email` y `password`.
  - Llama a `/auth/login`, guarda `nemcatacoaToken` en `localStorage` y expone `onSuccess` para ejecutar redirecciones u otras acciones.
  - Incluye feedback de error/éxito y enlace hacia `/registro`.
- **`src/components/registro.jsx`**:
  - Captura nombres, apellidos, correo y doble contraseña (validación básica).
  - Envía datos a `/auth/register`, guarda el token y resetea los campos tras la creación.
  - Muestra errores como “Email ya registrado” y ofrece enlace a `/login`.

> Ambos formularios están montados directamente según la URL gracias al layout en `App.jsx`. Hasta que implementes un router real, basta con navegar manualmente a `/login` o `/registro`.

---

## 6. Documentación y dependencias

- `FrondEnd/INSTALACION.md`: pasos para instalar dependencias generales, `framer-motion`, `lucide-react` y configurar `VITE_API_URL` para consumir el backend.
- `FrondEnd/ANALISIS_HOME.md`, `ANALISIS_NAVBAR.md`, `ANALISIS_INTEGRACION.md`: resúmenes rápidos por componente.
- Este archivo (`GUIA_CAMBIOS_CODEX.md`) amplía cada detalle para que puedas modificar texto/estilos sin buscar en múltiples archivos.

---

## Próximos pasos sugeridos
1. Integrar un router y crear páginas reales para login/registro.
2. Conectar los datos (destinos, testimonios, stats) a APIs o a un CMS si necesitas actualizarlos dinámicamente.
3. Añadir pruebas visuales o snapshots si el proyecto crecerá con más colaboradores.

Si necesitas que convierta esta guía a otra ubicación/formato o agregue diagramas, avísame.
