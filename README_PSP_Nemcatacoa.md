# Personal Software Process (PSP) – Proyecto Nemcatacoa

## 📌 Objetivo del PSP
El **Personal Software Process (PSP)** se aplicó en el desarrollo del proyecto **Nemcatacoa – Plataforma Cultural Interactiva**, con el propósito de mejorar la calidad del software, optimizar las estimaciones de esfuerzo, reducir defectos y fortalecer las habilidades de planificación y seguimiento del desarrollo.

Este README documenta cómo se integró PSP en cada etapa del proyecto.

---

# 1. 🧠 Diagnóstico Personal del Proceso

### 🔎 Proceso inicial antes del PSP
1. Recepción del requerimiento.  
2. Lectura y comprensión del módulo.  
3. Diseño rápido sin documentación.  
4. Codificación directa.  
5. Pruebas manuales básicas.  
6. Corrección de errores.  
7. Entrega del módulo.

### ⭐ Fortalezas identificadas
- Buena capacidad de análisis técnico.
- Experiencia en backend con Node.js y PostgreSQL.
- Flujo rápido para construir CRUDs.

### ⚠️ Debilidades detectadas
- Estimaciones poco precisas.
- Ausencia de registros de defectos.
- Falta de planificación detallada.
- Poca documentación del proceso.
- No existía control del tiempo por actividad.

---

# 2. 📏 Método PROBE (Estimaciones)

Se compararon módulos nuevos con proyectos o funcionalidades previas para estimar tamaño (LOC) y esfuerzo (horas).

### 📌 Tabla resumen PROBE

| Módulo | Proxy usado | Similitud | LOC estimado |
|-------|-------------|-----------|--------------|
| Usuarios | CRUD básico | 4 | 450 |
| Comentarios | CRUD comentarios | 3 | 380 |
| Agenda | CRUD avanzado | 3 | 520 |
| Guías | CRUD + validación | 4 | 480 |
| Preferencias | CRUD simple | 3 | 350 |
| Contenido cultural | Lecturas filtradas | 4 | 600 |
| Integración y seguridad | Sin proxy | 5 | 620 |

**Total estimado:** 3.400 LOC  
**Esfuerzo estimado:** 142 horas

---

# 3. 📊 Métricas del PSP

### ⏱ Productividad
```
LOC / Hora = 21 LOC/h
```

### 🐛 Densidad de defectos
```
1.75 defectos / KLOC
```

### 📐 Precisión de estimaciones
Promedio de error total: **+11%**.

### 📈 Gráficos generados en PSP
- Productividad real vs estimada  
- Defectos por fase  
- Tiempo por módulo  
- Progreso semanal  

*(Los gráficos están incluidos en los documentos PDF del PSP.)*

---

# 4. 🛠 Herramientas Utilizadas

### ⏳ Time Tracking
- Clockify  
- Toggl  

### 🐞 Gestión de Defectos
- GitHub Issues  
- Jira (registro de bugs por módulo)

### 📊 Estadísticas
- Google Sheets  
- Excel  
- Python (pandas + matplotlib)

---

# 5. 🏗 Aplicación del PSP al Proyecto

El PSP se aplicó de la siguiente manera:

## ✔ PSP0 – Registro de tiempos y defectos
Se documentaron todas las fases:
- **Planificación**
- **Codificación**
- **Pruebas**
- **Corrección**
- **Revisión final**

## ✔ PSP1 – Estimaciones con PROBE
Se usaron proyectos anteriores como base para estimar LOC y esfuerzo.

## ✔ PSP2 – Calidad y revisiones
- Revisión de código antes de ejecutar.  
- Revisión de arquitectura.  
- Revisión de endpoints y validaciones.

## ✔ PSP3 – Pruebas y defectos
- Pruebas con Postman para API.  
- Pruebas en React para consumo de API.  
- Registro de defectos con fechas, causas y soluciones.

---

# 6. 🔄 Postmortem – Lecciones aprendidas

### 👍 Lo que funcionó bien
- Integrar pruebas constantes.  
- Tener métricas claras del tiempo invertido.  
- Uso de PROBE mejoró la precisión.  
- Reducción de retrabajo gracias a revisiones previas.

### 👎 Lo que necesito mejorar
- Dividir mejor las tareas grandes.  
- Documentar mientras desarrollo.  
- Mantener consistencia en estándares de código.

### 🎯 Acciones a implementar
- Implementar pruebas automatizadas básicas.  
- Crear funciones reutilizables para reducir LOC.  
- Mantener un registro continuo de defectos.

---

# 7. 🚀 Conclusión

Aplicar el **Personal Software Process (PSP)** en Nemcatacoa permitió:

- Mejorar la planificación.  
- Aumentar la calidad del backend.  
- Disminuir defectos tempranos.  
- Crear una estructura clara de estimación y registro.  
- Obtener métricas reales para futuras mejoras.

El PSP se convierte en una herramienta clave para aplicar buenas prácticas y elevar el nivel profesional del desarrollo.

---

## 📁 Autor
**Luz Stefanny Herrera Rodríguez y pablo julian bernal **  
Proyecto Nemcatacoa – SENA  
2025
