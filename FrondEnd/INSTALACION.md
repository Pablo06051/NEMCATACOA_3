# Guía de instalación FrontEnd

Este documento resume los pasos necesarios para preparar el entorno del cliente Nemcatacoa e instalar las dependencias adicionales que usa la interfaz (Navbar, Home y Footer).

## Requisitos previos

- Node.js 18 o superior.
- npm 10+ (incluido con Node).

## Instalación base

```bash
cd FrondEnd/NEMCATACOA
npm install
```

## Dependencias adicionales

El componente `Footer` utiliza animaciones y un set de íconos externos. Instala ambos paquetes para evitar errores de importación:

```bash
npm install framer-motion lucide-react
```

## Variables de entorno FrontEnd

Crea un archivo `.env.local` (o `.env`) dentro de `FrondEnd/NEMCATACOA` con la URL del backend:

```
VITE_API_URL=http://localhost:4000
```

> Ajusta el puerto o dominio al despliegue real de tu API. Si no configuras esta variable, el frontend intentará conectarse a `http://localhost:4000` por defecto.

## Ejecutar en desarrollo

```bash
npm run dev
```

Esto inicia Vite con la página de inicio que integra `Navbar_general`, `home.jsx` y `Footer`.
