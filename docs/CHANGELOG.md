# Bitácora de cambios

Registrar cada tarea aquí, con las entradas más recientes primero. Actualizar su
estado cuando existan pruebas nuevas; conservar las limitaciones pendientes.

## Plantilla

```markdown
## AAAA-MM-DD — Título
- Estado: en curso / implementado / verificado localmente / publicado / verificado en producción.
- Objetivo y motivo:
- Cambios (archivos o áreas):
- Verificación (comando, resultado y límites):
- Pendientes:
- Referencia: commit o PR, cuando esté disponible.
```

## 2026-10-03 — Despliegue de dashboards horizontales
- Estado: desplegado en producción, autorizado expresamente por el usuario.
- Cambios: integración de PR #10 y PR #11; versión funcional `b9d274a` en main.
- Verificación: CI heads `cdc1c43` y `1a120c5` aprobado; Vercel READY,
  deployment `dpl_Ew75QMtAMpTK6GjCj9k8aKN8DTzq`, dominio HTTP 200 y CSS nuevo.
  Railway backend/frontend success; `/health` HTTP 200 con status healthy.
  Navegador confirma diseño horizontal en producción (13 opciones de reclutador).
- Pendientes: comprobación de acciones autenticadas con sesiones reales; no se
  ejecutaron operaciones sobre registros de producción ni escaneo de logs runtime.
- Referencia: https://kelly-app-v2.vercel.app; PR #10 y #11 integrados.

## 2026-10-03 — Carpeta `.Agents`
- Estado: creada localmente.
- Objetivo y motivo: añadir la carpeta solicitada por el usuario.
- Cambios: `.Agents` en la raíz y actualización de la memoria.
- Verificación: directorio existente; sin cambios funcionales.
- Pendientes: ninguno. La carpeta vacía no se versiona en Git.

## 2026-10-03 — Dashboards horizontales translúcidos
- Estado: implementado, verificado localmente y publicado en PR #11 (borrador),
  dependiente de PR #10; sin despliegue.
- Objetivo: modernizar los siete roles conservando el ancho y los flujos operativos.
- Cambios: CSS acotado, atributos visuales/accesibles, estadísticas, fondos opacos
  para datos y protección frente al tema antiguo. Staff tenía `refreshing` y dos
  handlers indefinidos: se restauran siguiendo el patrón existente. Se retiran
  cinco diagnósticos resueltos de la referencia TypeScript.
- Verificación: harness correcto (11 pruebas, drivers, startup/health, build);
  21 diagnósticos conocidos, cero nuevos. Navegador en siete roles; NHO e historial,
  guardado ficticio Staff, estadísticas, teclado y anchos 390/768/1440. Comparación
  AST confirma lógica intacta en los otros siete componentes.
- Pendientes: CI y revisión antes de integrar; aceptación autenticada en preview.
- Referencia: rama `codex/horizontal-glass-dashboards`; evidencia y límites en
  `docs/DASHBOARD_VERIFICATION.md`.

## 2026-10-03 — Análisis de modernización visual
- Estado: plan documentado; sin implementación.
- Objetivo: dashboards con estilo translúcido inspirado en la imagen del usuario.
- Cambios: `docs/DASHBOARD_REDESIGN_PLAN.md` y memoria actualizada.
- Verificación: inspección de rutas, siete dashboards, estilos y consultas NHO;
  `git diff --check`. Sin cambios ejecutables; no se repitió el harness.
- Pendientes: preview, inventario detallado por rol y pruebas de interacción.

## 2026-10-03 — Plan y validación antes de aplicar funciones
- Estado: documentado localmente.
- Objetivo y motivo: exigir planificación y comprobación de nuevas funciones
  antes de integrarlas al flujo principal.
- Cambios: reglas en `memory.md` y `AGENTS.md` para planificar, trabajar aislado,
  validar criterios y regresiones, y corregir fallos antes de aplicar.
- Verificación: coherencia de instrucciones y `git diff --check`; solo documentación.
- Pendientes: cumplir el proceso en las próximas funciones.

## 2026-10-03 — Carpeta `.codex/commands`
- Estado: creada localmente.
- Objetivo y motivo: crear el subdirectorio solicitado por el usuario.
- Cambios: `.codex/commands` y actualización de la memoria.
- Verificación: existencia del directorio comprobada; sin cambios funcionales.
- Pendientes: ninguno. La carpeta vacía no se versiona en Git.

## 2026-10-03 — Carpeta `.codex`
- Estado: creada localmente.
- Objetivo y motivo: añadir el directorio solicitado por el usuario.
- Cambios: carpeta `.codex` en la raíz; memoria actualizada.
- Verificación: directorio existente; sin cambios funcionales ni pruebas nuevas.
- Pendientes: ninguno. La carpeta vacía no se versiona en Git.

## 2026-10-03 — Memoria permanente del proyecto
- Estado: verificado localmente; revisión destinada a PR #10.
- Objetivo y motivo: conservar continuidad, proteger los flujos existentes y
  registrar el estado de cada tarea y versión.
- Cambios: `memory.md` con compromisos, estado, historial y plantilla; `AGENTS.md`
  exige leerla al iniciar y actualizarla al terminar cada tarea. README la enlaza.
- Verificación: harness completo correcto (11 pruebas NHO, drivers, arranque/health
  y build); 26 diagnósticos TypeScript conocidos y cero nuevos. Control de
  bitácora y `git diff --check` correctos. CI de esta revisión aún no comprobado.
- Pendientes: comprobar CI de esta revisión e integrar PR #10.
- Referencia: https://github.com/rabermudezg13/kelly-app-v2/pull/10

## 2026-10-03 — Reglas, documentación y harness
- Estado: implementado, verificado localmente y publicado en PR #10.
- Objetivo y motivo: hacer el trabajo reproducible y conservar una historia clara
  de lo realizado sin afectar el flujo semanal.
- Cambios: `AGENTS.md`, README, arquitectura, esta bitácora, guía y script de
  verificación, dependencias de pruebas y workflow de CI. Prueba semanal con reloj
  fijo para que no dependa del día de ejecución. Lockfile sincronizado con la
  dependencia `xlsx` ya declarada para permitir `npm ci`; CI exige actualizar la bitácora.
- Verificación: `npm ci` y `python scripts/verify.py` correctos: 11 pruebas NHO,
  ambos drivers, arranque/health y build. TypeScript: 26 diagnósticos anteriores
  (18 mensajes distintos), cero nuevos. Siete comprobaciones del control de
  documentación y normalización de diagnósticos pasaron; `git diff --check` limpio.
  Ejecución local con Python 3.9. CI con Python 3.12 y Node 22 completado
  correctamente en el run `37124376590` para el commit `c90f33e`.
- Referencia: https://github.com/rabermudezg13/kelly-app-v2/pull/10
- Pendientes: integrar el PR y configuración opcional de protección de rama. El harness no cubre navegador ni conexión real a PostgreSQL. El
  arranque conserva una advertencia anterior de migración SQLite (`conn` no definido),
  sin impedir el health check; no se ha modificado esa migración.

## 2026-10-02 — Historial NHO independiente
- Estado: publicado; backend y frontend comprobados disponibles.
- Objetivo y motivo: consultar orientaciones pasadas conservando la lista semanal.
- Cambios: endpoint autenticado `/history`, diálogo de búsqueda independiente,
  filtros de nombre/fecha, paginación y aviso de inicio de sesión. Se añadió
  `psycopg` tras detectar un fallo de arranque del backend desplegado.
- Verificación: 11 pruebas de API y build frontend pasaron durante la implementación;
  `/health` respondió correctamente. La lista semanal excluyó registros históricos.
- Pendientes: confirmar la búsqueda en producción con una sesión de staff válida;
  la comprobación sin sesión obtuvo el 401 esperado. Existen errores TypeScript
  anteriores a este trabajo, registrados por el harness como deuda conocida.
- Referencia: PR #9; commits `858f02e` y `56e7426`.
