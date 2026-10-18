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

## 2026-10-18 — Kelly Smart Capture (primera versión)
- Estado: PR #13 en borrador; preview Vercel READY para `1eaadeb0`. No integrado en producción.
- Cambios: pestaña independiente de reclutadores, pegar/abrir imagen/capturar pantalla,
  OCR local, detección del marco de foto y alternativa MediaPipe, X central y tamaño
  ajustables, revisión obligatoria y PNG aplanado `Nombre Apellido FP.png`.
- Privacidad: sin API de imágenes, sin persistir capturas o nombres. Recursos de OCR
  y detección servidos por el sitio; no requiere instalar aplicaciones/extensiones.
- Pruebas: 4 pruebas de nombre/geometría/formato; navegador con datos ficticios:
  apertura, pegado, OCR, detección del cuadro, arrastre de X, teclado y revisión.
  PNG descargado comprobado píxel a píxel: foto opaca completa, dimensiones originales,
  sin X en exportación. Harness final correcto: 16 tests backend, 4 de Smart Capture, build y cero TS nuevos.
  Servidor estático de prueba registró solo GET de recursos: ningún envío de imagen/nombre.
- CI: run `39139437093` correcto. Preview: `dpl_DhmmxCoTCzVKL3ikuEp4xU9dboaY`.
- Pendientes: comprobación del selector real de captura de pantalla;
  el control del navegador no permitió completar la selección de ventana.
  No publicar en main hasta terminar la validación necesaria.
- Detalles: `docs/SMART_CAPTURE.md`. No se guardaron ni publicaron datos de la captura real.

## 2026-10-05 — Corrección Session Configurations
- Estado: PR #12 integrado y desplegado; backend y frontend verificados en producción.
- Causa: horarios antiguos codificados como texto JSON fallaban antes de normalizarse.
- Cambios: lectura compatible con texto y arrays; guardado de arrays nativos,
  validación antes del commit y rollback ante fallo. Formularios bloqueados si
  falla la carga, con reintento para evitar sobrescribir datos con valores iniciales.
- Verificación: harness completo correcto, 16 pruebas backend, build y health;
  21 diagnósticos TypeScript conocidos y cero nuevos. Navegador con SQLite ficticio:
  carga de formato antiguo, edición, guardado, persistencia al recargar y reintento
  tras error correctos. No se modificaron configuraciones reales ni lista semanal NHO.
- Referencia: rama `codex/fix-session-configurations`; plan `docs/SESSION_CONFIG_FIX.md`.
- Verificación final: CI run `37311369636` correcto. Commit desplegado
  `c2f71f5a4b1e3832ad08571ab1fb678ae8d67ef4`; Vercel READY y health/las tres
  configuraciones GET 200. No se hicieron escrituras de prueba en producción.
- Pendientes: ninguno para esta corrección; se conserva la deuda TypeScript conocida.

## 2026-10-03 — Carpeta `.Agents/Skills`
- Estado: creada localmente.
- Objetivo y motivo: añadir Skills dentro de la carpeta de agentes existente.
- Cambios: `.Agents/Skills` y memoria actualizada.
- Verificación: directorio existente; sin cambios funcionales.
- Pendientes: ninguno. La carpeta vacía no se versiona en Git.

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

Verificación web adicional (2026-10-18): preview Vercel reconoció el nombre ficticio
y cubrió automáticamente el marco de foto. Solo falta la selección nativa de ventana.

## 2026-10-18 — Smart Capture en inglés
- Solicitud: toda la interfaz del módulo en inglés.
- Cambios: botones, instrucciones, estados, errores, etiquetas accesibles, placeholder, nombre de archivo vacío y atributo lang. Se conserva el sufijo FP y la lógica.
- Verificación: pendiente de harness y preview actualizada; continúa pendiente la selección nativa de ventana.
