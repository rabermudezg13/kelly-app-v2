# Memoria del proyecto — Kelly App v2

Última actualización: 2026-10-18 (America/New_York).

## Estado de publicación — 2026-10-18
- Smart Capture publicado mediante PR #13 (`3d7d2e3`). Usuario autorizó producción después de la prueba real.
- Corrección de inicio OCR validada en navegador: reconocimiento automático y fallback manual ante HTTP 503.
- Selección nativa de ventana pendiente de prueba manual; pegado, apertura, cobertura y exportación ya comprobados.

## 2026-10-18 — Kelly Smart Capture (primera versión; historial)
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

Smart Capture publicado y comprobado en producción: PR #13 y #14, commit `8efc03b`. Ver cierre de publicación al final.

- Smart Capture implementado en rama aislada; validación de captura directa pendiente.

- Modernización horizontal desplegada en producción: PR #10 y #11 integrados.
  Versión funcional `b9d274a`, Vercel READY y backend healthy.
  Evidencia en `docs/DASHBOARD_VERIFICATION.md`.
  La elección horizontal sustituye la propuesta inicial de sidebar.

- Frontend React/Vite en Vercel; backend FastAPI/SQLAlchemy en Railway.
- El historial NHO está publicado mediante PR #9 y correcciones posteriores.
  Falta verificar la búsqueda en producción con una sesión válida de staff.
- Reglas, documentación y harness integrados mediante PR #10. CI del head final
  de PR #10 y PR #11 pasó antes del despliegue.
- Deuda conocida: 21 diagnósticos TypeScript tras corregir cinco referencias
  indefinidas de Staff; advertencia
  de migración SQLite sobre `conn` no definido. El harness no cubre navegador ni
  una conexión real a PostgreSQL. Consultar `docs/HARNESS.md`.

## Historial de versiones y revisiones

### 2026-10-03 — Revisión local: carpeta `.Agents/Skills`
- Objetivo: crear Skills dentro de la carpeta de agentes existente.
- Cambios: directorio `.Agents/Skills`, conservando la carpeta padre existente.
- Verificación: existencia del directorio comprobada; sin cambios funcionales.
- Estado: creado localmente; una carpeta vacía no se versiona en Git.
- Pendientes: ninguno para esta tarea.
- Detalle en bitácora: `docs/CHANGELOG.md`.

### 2026-10-03 — Despliegue a producción (`b9d274a`)
- Objetivo: publicar los cambios pendientes, por instrucción expresa del usuario.
- Cambios: PR #10 integrado con merge `7c7030c`; PR #11 integrado con `b9d274a`.
- Verificación: CI de los heads finales aprobado. Vercel READY para `b9d274a`,
  dominio principal HTTP 200, CSS horizontal servido; backend HTTP 200/healthy.
  Checks Railway backend y frontend correctos. Navegador confirma encabezado,
  13 botones horizontales y ausencia del tema antiguo en dashboard de reclutador.
- Estado: desplegado en https://kelly-app-v2.vercel.app.
- Pendientes: validación de operaciones autenticadas con sesiones reales; no se
  modificaron registros de producción. No se realizó escaneo de logs de runtime.
- Detalle: `docs/CHANGELOG.md` y `docs/DASHBOARD_VERIFICATION.md`.

### 2026-10-03 — Revisión local: carpeta `.Agents`
- Objetivo: crear la carpeta solicitada, respetando la A mayúscula.
- Cambios: directorio `.Agents` en la raíz del proyecto.
- Verificación: existencia del directorio comprobada; sin cambios funcionales.
- Estado: creado localmente; una carpeta vacía no se versiona en Git.
- Pendientes: ninguno para esta tarea.
- Detalle en bitácora: `docs/CHANGELOG.md`.

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

Verificación web adicional (2026-10-18): preview Vercel reconoció el nombre ficticio
y cubrió automáticamente el marco de foto. Solo falta la selección nativa de ventana.

## 2026-10-18 — Smart Capture en inglés
- Solicitud: toda la interfaz del módulo en inglés.
- Cambios: botones, instrucciones, estados, errores, etiquetas accesibles, placeholder, nombre de archivo vacío y atributo lang. Se conserva el sufijo FP y la lógica.
- Verificación: harness PASS (16 backend, 4 Smart Capture, build, 0 errores TS nuevos). Preview Vercel READY y pantalla en inglés comprobada. Commit `6039538`, PR #13. Continúa pendiente la selección nativa de ventana; no integrado en producción.

## 2026-10-18 — Prueba solicitada con captura proporcionada
- Autorización: el usuario solicitó expresamente probar su imagen real en la preview.
- Resultado: OCR reconoció nombre/apellido; cobertura automática completa sin ajuste manual; descarga con sufijo FP.
- Verificación: PNG de 1555×679, foto opaca al 100%, sin X exportada, comparación RGB confirmó que el resto permanece igual.
- Privacidad: archivo abierto y procesado en navegador; resultado guardado solo en Descargas del usuario. Sin nombres, imagen ni datos personales en Git, fixtures o bitácora.
- Código: sin cambios; preview `6039538`, PR #13. La selección nativa de ventana sigue pendiente; producción no modificada.

## 2026-10-18 — Publicación y protección ante fallo de carga OCR
- Plan: verificar producción; resolver espera indefinida si falla la descarga de datos OCR antes de dar por terminada la publicación.
- PR #13 integrado (`3d7d2e3`), Vercel producción READY y backend health 200.
- Hallazgo: fallo de red en carga interna de idioma podía dejar pendiente la inicialización de Tesseract.
- Corrección: capturar errores de inicialización y limitar la espera a 30 segundos; un fallo ofrece ajuste manual en vez de bloquear la interfaz. No se envían imágenes ni nombres.
- Usuario autorizó explícitamente publicación tras probar su captura. Selección nativa de ventana sigue sin verificar por automatización.
- Estado: corrección en rama aislada. Harness PASS (16 backend, 4 de captura, build, 0 TS nuevos). Fallo HTTP 503 simulado: editor muestra aviso y habilita ajustes manuales, sin espera indefinida.

- Verificación adicional del inicio acotado: OCR recuperado con nombre ficticio y cubierta automática; HTTP 503 vuelve a edición manual. No cambia consultas semanales, permisos ni base de datos.

## Cierre de publicación — 2026-10-18
- PR #14 integrado: `8efc03b5053971840ab6a0649d9990b96d757cce`. Vercel producción READY (`dpl_6u13dLyPPLQtwtwyBzPheXYRT62j`).
- URL: https://kelly-app-v2.vercel.app/smart-capture.html
- Navegador de producción: pegado de captura ficticia, nombre y cubierta automática correctos; interfaz en inglés.
- Harness local y CI run `39170009560` PASS: 16 backend, 4 captura, build, 21 diagnósticos TS conocidos y 0 nuevos.
- Selector nativo de pantalla sigue pendiente de validación manual. No se modificó la consulta semanal.

## 2026-10-18 — Simplificar Smart Capture
- Plan: retirar captura mediante Share screen, conservar pegar/abrir y mover la pestaña después de New Hire Orientation. Verificar build, harness y navegador sin cambiar consultas.
- Estado: implementación aislada en `codex/smart-capture-simplify`.

- Cambios: retirados botón, video, getDisplayMedia y permiso del iframe; pestaña movida inmediatamente después de New Hire Orientation.
- Validación: harness PASS (16 backend, 4 captura, build, 0 TS nuevos); navegador confirma solo Paste image/Open image. Consultas semanales sin cambios.
