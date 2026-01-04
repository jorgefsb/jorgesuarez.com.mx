---
description: Proceso de cierre de hitos y sincronización de progreso (Kaizen Workflow)
---

# Workflow: Cierre de Milestone

Este workflow asegura que cada fase del proyecto termine con una base sólida, documentada y sincronizada tanto en local como en la nube.

## Pasos del Workflow

1. **Actualización de Tareas**:
   - Revisar `task.md` y marcar todas las tareas completadas del hito actual con `[x]`.
   - Asegurar que la fecha de actualización al final del archivo sea la correcta.

2. **Documentación Técnica**:
   - Actualizar `README.md` si se añadieron nuevas funcionalidades o cambios en el Tech Stack.
   - Sincronizar cambios en `brand-guidelines.md` si el tono de voz o el ADN visual han evolucionado.

3. **Verificación Visual**:
   - Correr el servidor local (`python3 -m http.server 8080`) y verificar en browser.
   - Realizar una auditoría rápida de links y interactividad.

4. **Sincronización Git (Commit & Push)**:
   - Realizar un commit con un mensaje descriptivo que mencione el hito (ej: `feat: close milestone [Nombre del Hito]`).
   - Hacer push a `origin main`.

5. **Reporte de Log**:
   - Informar al usuario sobre los logros alcanzados y los archivos actualizados.

// turbo
6. **Ejecución de Cierre**:
   `git add . && git commit -m "chore: milestone closure and documentation sync" && git push origin main`
