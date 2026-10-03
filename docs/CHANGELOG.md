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
