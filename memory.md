# Memoria del proyecto — Kelly App v2

Última actualización: 2026-10-03 (America/New_York).

## Compromisos permanentes

- Toda función nueva debe comenzar en **modo plan**: definir objetivo, alcance,
  dependencias, riesgos, criterios de aceptación y pruebas antes de implementarla.
  Si el modo Plan de la herramienta no está disponible, elaborar y registrar el
  plan explícitamente antes de editar; no afirmar que se activó ese modo.
- Implementar y probar primero en una rama o entorno aislado. Comprobar que la
  función cumple los criterios de aceptación y que los flujos existentes siguen
  funcionando mediante pruebas de regresión relevantes.
- Solo integrar al flujo principal o desplegar cuando la función opere como se
  espera y las comprobaciones pasen. Si falla algo o falta una validación necesaria,
  corregir y repetir las pruebas; mantener el cambio aislado hasta resolverlo.
  Registrar el plan, resultados, límites y estado en esta memoria y la bitácora.
  Las pruebas reducen el riesgo; no garantizan ausencia absoluta de errores.

- Mantener el proyecto funcional y consistente. Antes de cambiar algo, revisar
  el estado de Git, las instrucciones, esta memoria y los flujos afectados.
- Evaluar el impacto y verificar que el cambio no rompa funciones existentes,
  autenticación, datos ni despliegues. No prometer ausencia de errores sin pruebas;
  registrar expresamente lo que no pudo verificarse.
- Proteger la lista NHO de la semana actual de Miami. La búsqueda histórica debe
  conservar consulta y estado independientes, ser de solo lectura y exigir permisos.
- Documentar cualquier cambio en `docs/CHANGELOG.md` y actualizar la documentación
  del área afectada. No guardar secretos ni datos personales en estos archivos.
- Documentar aquí cada versión o revisión realizada, con fecha, referencia Git o
  PR, cambios, verificación, estado y pendientes. Usar la versión/tag real cuando
  exista; si no existe, identificar la revisión por PR o commit, sin inventar releases.
- Actualizar esta memoria al terminar **cada tarea**, incluidas tareas de análisis,
  documentación, mantenimiento o tareas que queden incompletas. Registrar resultados,
  limitaciones y el siguiente paso antes de entregar la respuesta final.
- Conservar el historial: añadir revisiones nuevas arriba y actualizar el resumen
  del estado actual. No borrar decisiones anteriores; explicar cuándo se sustituyen.

## Cómo usar esta memoria

Leerla junto con `AGENTS.md` al comenzar. Contrastar el estado guardado con Git y
las verificaciones actuales: esta memoria es continuidad de trabajo, no evidencia
por sí sola de que producción esté sana. Al cerrar, actualizar el estado actual y
la entrada de la tarea, enlazando la bitácora para los detalles. Mantener ambos
registros coherentes. No se requiere un commit adicional solo para escribir el
hash del propio commit: el PR o un identificador de revisión sirve como referencia.

## Estado actual

- Modernización horizontal implementada en rama aislada; verificación local en
  `docs/DASHBOARD_VERIFICATION.md`. Publicado en PR #11 (borrador), dependiente
  de PR #10. Pendiente de CI, aceptación autenticada e integración.
  La elección horizontal sustituye la propuesta inicial de sidebar.

- Frontend React/Vite en Vercel; backend FastAPI/SQLAlchemy en Railway.
- El historial NHO está publicado mediante PR #9 y correcciones posteriores.
  Falta verificar la búsqueda en producción con una sesión válida de staff.
- Las reglas, documentación y harness están en PR #10, pendientes de integración.
  Su primera ejecución CI pasó; no confundir una verificación anterior con la
  verificación de revisiones posteriores.
- Deuda conocida: 21 diagnósticos TypeScript tras corregir cinco referencias
  indefinidas de Staff; advertencia
  de migración SQLite sobre `conn` no definido. El harness no cubre navegador ni
  una conexión real a PostgreSQL. Consultar `docs/HARNESS.md`.

## Historial de versiones y revisiones

### 2026-10-03 — Revisión horizontal de dashboards
- Objetivo: aplicar el estilo translúcido conservando navegación horizontal y datos.
- Cambios: presentación compartida de siete roles y estadísticas; aislamiento del
  tema antiguo; superficies legibles. Corrección del fallo previo de Staff.
- Verificación: harness correcto, 11 pruebas NHO, build y 21 errores TypeScript
  conocidos sin errores nuevos; navegador en siete rutas, NHO semanal/historial,
  guardado ficticio de Staff, estadísticas y tamaños 390/768/1440.
- Estado: implementado y verificado localmente; publicado en PR #11 (borrador).
- Referencia: https://github.com/rabermudezg13/kelly-app-v2/pull/11
- Pendientes: CI, revisión e integración; aceptación con sesiones autorizadas.
  No desplegado. Límites específicos en `docs/DASHBOARD_VERIFICATION.md`.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — Análisis de dashboards translúcidos
- Objetivo: estudiar el rediseño según la imagen del usuario sin alterar funciones.
- Hallazgos: siete dashboards de roles, navegación propia, estilos repetidos y
  diferencia entre filtro semanal explícito del reclutador y llamadas de otros roles.
- Cambios: plan en `docs/DASHBOARD_REDESIGN_PLAN.md`; sin modificaciones de app.
- Verificación: lectura de rutas, navegación, estilos y consultas; revisión documental.
- Estado: análisis terminado; diseño aún no implementado ni probado en navegador.
- Pendientes: inventario detallado, preview aislada, implementación progresiva y
  verificación por rol antes de integrar.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — Revisión local: plan y validación de nuevas funciones
- Objetivo: planificar, probar y verificar regresiones antes de aplicar funciones.
- Cambios: regla permanente en esta memoria y referencia explícita en `AGENTS.md`.
- Verificación: revisión de coherencia de las instrucciones y `git diff --check`.
- Estado: documentado localmente; sin cambios funcionales.
- Pendientes: aplicar esta regla en las siguientes tareas de desarrollo.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — Revisión local: carpeta `.codex/commands`
- Objetivo: crear `commands` dentro de `.codex` por solicitud del usuario.
- Cambios: directorio `.codex/commands`; sin cambios funcionales.
- Verificación: existencia del directorio comprobada.
- Estado: creado localmente; una carpeta vacía no se versiona en Git.
- Pendientes: ninguno para esta tarea.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — Revisión local: carpeta `.codex`
- Objetivo: crear la carpeta solicitada en la raíz del proyecto.
- Cambios: directorio `.codex`, sin mover archivos ni modificar la aplicación.
- Verificación: existencia del directorio comprobada.
- Estado: creado localmente; una carpeta vacía no se versiona en Git.
- Pendientes: ninguno para esta tarea.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — PR #10, revisión de memoria del proyecto
- Objetivo: mantener continuidad, registrar cada versión y documentar cada tarea.
- Cambios: creación de `memory.md`, lectura y actualización obligatorias en
  `AGENTS.md`, enlace en README y entrada en `docs/CHANGELOG.md`.
- Verificación: harness completo correcto (11 pruebas NHO, drivers, arranque/health
  y build); 26 diagnósticos TypeScript conocidos y cero nuevos. Control de
  bitácora y `git diff --check` correctos. CI de esta revisión aún no comprobado.
- Estado: verificado localmente; revisión destinada a PR #10.
- Pendientes: integrar PR #10 y realizar las verificaciones de producción indicadas
  arriba cuando se trabaje en ese flujo.

### 2026-10-03 — PR #10, reglas y harness (`c90f33e`, `0079cf7`)
- Cambios: instrucciones de agentes, arquitectura, bitácora obligatoria, harness,
  workflow CI y lockfile sincronizado. Reloj fijo en pruebas semanales.
- Verificación: 11 pruebas NHO, drivers, arranque/health y build correctos; cero
  diagnósticos TypeScript nuevos. CI del commit `c90f33e` pasó (run `37124376590`).
- Estado: publicado en PR #10; pendiente de integración.
- Pendientes: protección de rama opcional y deuda conocida del estado actual.

### 2026-10-02 — PR #9 y correcciones (`858f02e`, `56e7426`)
- Cambios: búsqueda histórica NHO independiente y autenticada, fechas de Miami,
  paginación, driver PostgreSQL y aviso de inicio de sesión.
- Verificación: pruebas locales y build correctos; backend/health disponible;
  lista semanal conserva su filtro. Sin sesión, el historial devuelve 401.
- Estado: publicado; verificación autenticada en producción pendiente.
- Detalles: `docs/CHANGELOG.md`.

## Plantilla para próximas tareas

```markdown
### AAAA-MM-DD — Versión/tag real o revisión y referencia PR/commit
- Objetivo:
- Cambios o hallazgos:
- Verificación y límites:
- Estado real:
- Pendientes y siguiente paso:
- Detalle en bitácora:
```
