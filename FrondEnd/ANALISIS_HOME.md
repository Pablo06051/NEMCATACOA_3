# Análisis Home (`src/pages/home.jsx`)

## Objetivo
Construir la landing principal de Nemcatacoa con un enfoque moderno basado en Tailwind v4, reutilizando componentes globales (Navbar y Footer) y resaltando el diferencial del producto.

## Cambios principales

1. **Estructura general**
   - Se incorpora `NavbarGeneral` y `Footer` para mantener consistencia y reutilización.
   - Se define `main` con un contenedor central (`max-w-6xl`) y espaciado vertical uniforme para cada sección.

2. **Hero y métricas**
   - Copy orientado a beneficios (“Diseña el viaje ideal…”).
   - Botones con gradientes que apuntan a secciones internas (CTA “Comenzar planificación” y “Ver cómo funciona”).
   - Tarjetas de estadísticas (`stats`) para dar credibilidad (viajeros felices, rutas, aliados).
   - Mock UI (panel de ruta + dashboard) en el costado derecho para reforzar el concepto de planificación inteligente.

3. **Sección de funcionalidades**
   - `highlights` describe tres pilares (itinerarios inteligentes, experiencias locales, asistencia continua).
   - Tarjetas con íconos SVG y hover states para mayor dinamismo.

4. **Destinos destacados**
   - Arreglo `destinations` muestra curaduría por categorías (“Sol & playa”, etc.).
   - Cada tarjeta incluye CTA “Ver ruta sugerida” que futura­mente puede conectar con un flujo real.

5. **Comunidad y testimonios**
   - Fondo oscuro para contraste, lista de beneficios (`experiences`) y citas agregan prueba social.

6. **Soporte continuo**
   - `supportChannels` describe múltiples canales (chat, comunidades, academia) + CTA doble (crear cuenta, email).

## Razonamiento de diseño
- Se priorizó la narrativa de producto (planificación, datos en vivo, soporte) alineada al objetivo del proyecto (mejorar la experiencia de viaje en Colombia).
- El uso de datos en arrays simplifica la futura internacionalización o conexión con APIs.
- Se mantuvo un layout responsive usando grid/flex y clases de Tailwind para evitar CSS adicional.
