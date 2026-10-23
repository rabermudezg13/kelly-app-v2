# Memoria del proyecto — Kelly App v2

Última actualización: 2026-10-23 (America/New_York).

## Estado actual — 2026-10-23
- TV Kiosk y Storage retirados de los seis dashboards y pantallas frontend. PR #21 (`163c4cd`), Vercel READY. Datos y backend históricos conservados; Info Session Progress normal permanece.
- Inicio: Register Visit y Staff visibles directamente en móvil y escritorio. Categorías solo después de Register Visit. Publicado PR #20 (`2b5d8fd`), Vercel READY, navegación comprobada.
- Smart Capture: reconocimiento de capturas completas y cubierta independiente publicado en PR #19 (`0b24d96`), Vercel READY. Captura real validada localmente; prueba ficticia en producción y harness PASS. Pegado corregido previamente en PR #18.
- Onboarding Tracker: filtro por reclutador publicado en PR #17 (`cd8c0c9`).
- Detalles y límites en los cierres de cada tarea al final de este archivo.

## Estado de publicación — 2026-10-18 (historial)
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

Tracker por reclutador publicado (PR #17, `cd8c0c9`): solo hoja asignada para los cuatro perfiles confirmados; Nicolette excluida del importador. Sin selector ni fallback.

Onboarding Tracker publicado (PR #16, `54959a7`), después de Smart Capture, con Tracker/Drug Screen/Scanner/Checklist/Help. Pruebas y límites en `docs/DASHTRACKER.md`.

Smart Capture publicado y comprobado en producción: PR #13 y #14, commit `8efc03b`. Ver cierre de publicación al final.

- Smart Capture simplificado publicado (PR #15, `5b2cbc9`): solo pegar/abrir; pestaña después de New Hire Orientation. Captura directa retirada por solicitud del usuario.

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

- Publicación completada: PR #15, commit `5b2cbc9309abea58600eb72cd25705a845ddf121`, Vercel READY `dpl_HLe9jmTuct9GAShV7oZHwZNs3ue3`; CI run `39171766776` PASS. Navegador de producción confirma ausencia de Take screenshot y botones Paste image/Open image. Orden de pestañas comprobado en diff; no se probó dashboard autenticado en producción.

## 2026-10-18 — Onboarding Tracker
- Plan y alcance: `docs/DASHTRACKER.md`; rama `codex/recruiter-dashtracker`.
- Integración completa del HTML y PDF de Dashtracker, dependencias locales, ayuda faltante, preferencias por reclutador y retención en memoria al cambiar pestañas. Sin API ni cambios en consultas NHO.
- Pruebas iniciales: 3 tests de reglas, escape/CSV y recursos correctos. Harness y navegador en curso.

- Verificación: harness completo PASS (16 backend, 4 Smart Capture, 4 Tracker, build, 21 TS conocidos/0 nuevos). Navegador: Excel multireclutador, pendientes, texto escapado, plantillas, Help y descargas Drug Screen/Scanner/Checklist correctas. Los tres PDFs se abrieron con pdf-lib y tienen una página válida.
- Corrección adicional: FP Info Requested ahora cuenta en tarjeta y lista; prueba de regresión incluida. Sin impresión física ni prueba de cámara móvil.

## Cierre Onboarding Tracker — 2026-10-18
- PR #16 integrado: `54959a7097d014987295b3a5db21609f5496dff0`. Vercel producción READY `dpl_32vGnooKesioVtHjKu7uuskF9QeF`. CI run `39172715705` PASS.
- Preview: Excel y contador FP verificados. Producción: página con las cinco secciones visible en `/dashtracker/index.html`.
- Límites: dashboard autenticado y retención al cambiar pestañas revisados en código, no ejercitados con sesión de producción. Cámara móvil e impresión física no probadas. El navegador bloqueó la comprobación independiente de health; no hubo cambios de backend.
- Datos originales de GitHub Pages no se migran; cada reclutador abre su archivo. Se preservan todas las funciones del módulo.

## 2026-10-19 — Importación por reclutador (plan)
- Leer solo la hoja asignada al perfil del dashboard: Rodrigo → Rodrigo, Miccael Val → Miccael, Jorge Silva → Jorge, Demetrius Lee → Demetrius. No usar el remitente editable para seleccionar datos.
- Inspeccionar nombres de hojas antes de parsear; seleccionar solo la hoja correspondiente. Retirar selector/fallback a primera hoja. Perfil no reconocido, hoja faltante/ambigua o CSV sin hojas: rechazar y limpiar datos anteriores.
- Detectar encabezado por Applicant Name dentro de la hoja seleccionada. Probar correspondencias, hojas generales ignoradas, errores y cargas consecutivas. Excel real solo para lectura local; ningún dato de candidatos en Git.
- Rama: `codex/tracker-recruiter-sheet`.

- Confirmación del usuario: Nicolette ya no pertenece al equipo; se elimina del selector de importación sin cambiar cuentas ni historial.
- Implementado: selección por perfil, lectura selectiva, encabezado dinámico, rechazo explícito sin coincidencia/CSV y limpieza de resultados. 11 pruebas Tracker PASS.

- Verificación final local: harness PASS (16 backend, 4 captura, 11 tracker, build y 0 TS nuevos). Excel proporcionado leído localmente: las cuatro correspondencias cargan exclusivamente su hoja y detectan encabezados válidos; sin datos personales en pruebas/reportes. Navegador ficticio: carga automática sin selector y aviso de hoja faltante correctos.

## Cierre — filtro por reclutador, 2026-10-19
- PR #17 integrado: `cd8c0c919f80f04e0e5ef0e28516b4357cb958b8`; Vercel READY `dpl_E3aaAnkTewkCDP2ogwo2fAmmkyra`, backend health 200. CI run `39245551039` PASS.
- Navegador local: Rodrigo automático y error de hoja Miccael ausente en fixture. Preview/producción: perfil de prueba Jorge Silva carga exclusivamente Jorge, sin selector. Prueba local con libro proporcionado: cuatro correspondencias PASS, ningún dato de candidatos guardado.
- Límites: prueba web con perfiles sintéticos mediante el mismo fragmento que genera el dashboard; no se inició sesión como cada reclutador en producción. Correspondencias confirmadas expresamente por el usuario.

## 2026-10-19 — Smart Capture Ctrl+V (plan)
- Causa probable: el evento paste del dashboard padre no llega al listener del iframe cuando el foco permanece en la pestaña.
- Plan: escuchar pegado en editor y padre del mismo origen, retirar ambos listeners al desmontar; admitir items y files del portapapeles. No interceptar texto ni depender de permisos clipboard.read para Ctrl+V.
- Validar foco fuera/dentro del marco, limpieza al salir y OCR/descarga conservados. Harness completo y prueba web con imagen ficticia antes de publicar.

- Reproducción confirmada con iframe local y captura ficticia: pegado con foco en botón padre no carga imagen. Corrección: listener de paste en padre del mismo origen, fallback files, limpieza al desmontar y área de pegado enfocable. No cambia OCR, cobertura ni exportación. Pruebas de comportamiento añadidas; harness en curso.

- Validación local: harness completo PASS (16 backend, 8 Smart Capture, 11 Tracker, build; 21 diagnósticos TS conocidos, 0 nuevos). Navegador con captura ficticia: pegado nativo con foco en padre y dentro del editor carga imagen y reconoce ANA PEREZ; texto normal conserva su pegado y la descarga se habilita tras revisión. Pruebas unitarias confirman limpieza y aislamiento de origen. Prueba nativa realizada en macOS, no en Windows. Publicación pendiente.

## Cierre — Smart Capture Ctrl+V, 2026-10-19
- PR #18 integrado: `9f00e301574ba8b151e598b2b5cf0228a727f565`; CI run `39291180526` PASS. Vercel producción READY `dpl_GXJXa9K3UysqZw1ZJCXV1W8aYoPZ`, alias kelly-app-v2.vercel.app asignado; backend health 200.
- Archivo JS de producción coincide por SHA-256 con build local verificado. Navegador de producción: pegado nativo de imagen ficticia, OCR ANA PEREZ, cubierta sugerida y descarga habilitada tras revisión correctos.
- Foco del padre y texto normal comprobados en iframe local del mismo origen. No se ejercitó dashboard autenticado en producción ni teclado nativo de Windows; pruebas realizadas en macOS. No se cambió backend ni datos.
- Código, pruebas y plan documentados en PR #18. Este cierre posterior al despliegue queda guardado localmente para la próxima sincronización documental.

## 2026-10-19 — Reconocimiento tras pegado (plan)
- Usuario informa imagen pegada sin nombre ni cuadro. Revisar lectura limitada al 55% superior, dependencia del cuadro respecto del nombre y esperas sin límite en reconocimiento/detector.
- Criterios: aceptar perfil desplazado dentro de una captura de pantalla completa; sugerir cuadro aunque OCR falle; mostrar resultados parciales y liberar modo manual si falla un recurso. Mantener procesamiento local, revisión y formato de descarga.
- Implementar en rama aislada, reproducir con perfil ficticio desplazado, probar regresiones y harness antes de publicar. No asumir que la causa local confirma todavía el mensaje concreto del usuario.

- Reproducción confirmada en producción anterior con perfil ficticio reducido y desplazado dentro de pantalla 1920×1300: aparecen exactamente los avisos de nombre vacío y foto ausente. Nueva versión local encuentra el cuadro antes del OCR; verificación de nombre en curso. Harness completo PASS (16 backend, 9 captura, 11 tracker, build, 0 TS nuevos).

- Verificación completada: misma captura completa que fallaba reconoce ANA PEREZ y ubica cuadro en (596,758); recorte original conserva nombre y cuadro. En origen local nuevo con idioma OCR forzado a HTTP 503, la cubierta permanece y se habilita nombre manual con aviso claro. Harness final PASS (16 backend, 9 Smart Capture, 11 Tracker, build; 21 TS conocidos/0 nuevos). Pendiente publicación.

## Prueba con captura proporcionada — 2026-10-19
- Imagen IMG_5541.PNG procesada exclusivamente en navegador local: ambos campos reconocidos correctamente y cuadro automático (65,89,200,200). PNG descargado al equipo con nombre esperado.
- Verificación del PNG: dimensiones originales conservadas, toda la región de foto (68,94)-(259,284) opaca uniforme, tabla sin cambios. La captura se limpió del editor y portapapeles. No se incorporaron datos personales, imágenes ni nombre del candidato a Git/documentación.
- PR #19 integrado en `0b24d96288f12d2c2c33e1642343ae20b8acbd21`; CI `39294396070` PASS. Despliegue y verificación final pendientes en este punto.

## Cierre — reconocimiento de capturas, 2026-10-19
- PR #19: `0b24d96288f12d2c2c33e1642343ae20b8acbd21`; CI `39294396070` PASS; Vercel producción READY `dpl_4epNgAA9WDFAd6w1hX8haLNtj9Sz`, alias principal asignado. Backend health 200.
- Bundle de producción idéntico por SHA-256 al build local verificado. Navegador publicado con captura ficticia completa reconoce nombre y sugiere cuadro correcto. Imagen real del usuario comprobada exclusivamente en entorno local: nombre, opacidad completa, dimensiones y tabla preservadas.
- Límites: no se probó teclado nativo Windows ni dashboard autenticado de producción. Detección es una sugerencia que exige revisión; texto ilegible puede necesitar entrada manual. No cambios de backend/datos. Cierre posterior al deploy guardado localmente para próxima sincronización documental.

## 2026-10-21 — Registros visibles en inicio (plan)
- Objetivo: facilitar registro desde el contenido principal; en móvil estaba escondido en menú de la derecha.
- Plan explícito (modo de herramienta Plan no disponible): mostrar las seis opciones de visita bajo bienvenida en móvil/escritorio, mantener acceso de staff separado y reutilizar las mismas rutas actuales. Compartir catálogo con /register-visit para no divergir.
- Criterios: opciones sin abrir menú, nombres legibles, enlaces correctos, navegación atrás y formularios existentes sin envíos de prueba a producción. Verificar móvil/escritorio, teclado, build y harness antes de publicar.

- Corrección de alcance indicada por usuario: inicio debe mostrar únicamente Register Visit y Staff, iguales a las opciones del menú; las seis categorías siguen apareciendo solo tras elegir Register Visit. Se retiró la propuesta de accesos directos y catálogo compartido. /register-visit queda sin modificaciones.

- Implementado: dos tarjetas principales visibles en todos los tamaños; menú móvil retirado, sin espacio de 43vh; registros antes de anuncios. /register-visit y formularios sin cambios. Pruebas: harness PASS (16 backend, 9 captura, 11 tracker, build; 21 TS conocidos/0 nuevos); navegador 390×844 y 375×667 sin desbordamiento, escritorio, Tab/Enter → categorías → formulario Info Session y Staff → login correctos. Sin enviar registros ni credenciales. Pendiente publicación.

## Cierre — accesos de inicio, 2026-10-21
- PR #20 integrado: `2b5d8fd9bfaa6ba39eb266958fbf407444961ce8`; CI `39598337726` PASS. Vercel producción READY `dpl_9kTzuhohe68fnZokhGh66qixs3WM`, alias kelly-app-v2.vercel.app asignado. Backend health 200.
- Navegador de producción en móvil: dos tarjetas Register Visit/Staff visibles en inicio; Register Visit abre las seis categorías y Staff abre login. Sin envíos de formularios ni credenciales. Escritorio/teclado y ausencia de desbordamiento comprobados localmente.
- Formularios, categorías, APIs y datos sin cambios. Plan y validación previa publicados en PR #20; este cierre posterior al deploy se guarda localmente para próxima sincronización documental.

## 2026-10-23 — Retirar TV Kiosk y Storage (plan)
- Alcance: retirar pestañas, renders e imports de los seis dashboards que los ofrecen; eliminar acceso Open TV Kiosk en Info Session Progress. Conservar Info Session Progress normal.
- Retirar pantallas/componentes frontend obsoletos y cliente Storage sin consumidores. Enlaces antiguos /info-session-progress/tv → /info-session-progress y /storage/scan/:code → inicio, con replace.
- No eliminar tablas, registros, snapshots de archivo ni API backend histórica. Sin migraciones. Validar navegación con datos ficticios, redirecciones y harness completo antes de publicar.

- Implementado y verificado: harness completo PASS (16 backend, 9 Smart Capture, 11 Tracker, build; 21 TS conocidos/0 nuevos). Navegador mediante login UI con seis roles ficticios y API local: pestañas retiradas ausentes, NHO y módulos vigentes presentes; Info Session Progress abre sin Open TV Kiosk. Ambas rutas antiguas redirigen correctamente. Sin sesiones ni datos reales de producción. Pendiente publicación.

## Cierre — TV Kiosk y Storage retirados, 2026-10-23
- PR #21 integrado: `163c4cd78099d75b316de741c0b07de0375b5ccf`; CI `39986280212` PASS. Vercel producción READY `dpl_BofHuRnPAFrgbstqH4J3YiS1rYb4`, alias principal asignado. Backend health 200.
- Publicación comprobada: ruta Storage antigua redirige a inicio en navegador; bundle publicado contiene redirecciones TV → progreso normal y Storage → inicio. TV Kiosk solo aparece en metadatos Git de Vercel, no como etiqueta de interfaz. El bundle no coincide por hash con local debido a metadatos Vercel; no se afirma identidad binaria.
- Seis dashboards verificados mediante login UI con perfiles ficticios y API local; no se inició sesión en dashboards reales de producción. Info Session Progress normal conservado. No se tocaron tablas, registros ni snapshots Storage.
- Plan y pruebas previas están publicados en PR #21; cierre posterior al despliegue guardado localmente para próxima sincronización documental.

## 2026-10-23 — Text Talents (plan)
- Usuario solicita pestaña en todos los dashboards: Excel → CSV con máximo 180 registros (más encabezado) y prompt copiable para invitar sustitutos a trabajar un día concreto, con engagement/CTA. Confirmó exportar solo nombre y teléfono.
- Estructura revisada localmente: Substitute/Identifier/Email/Phone/Address/Substitute Creation Date/Call Details. No guardar contactos en Git, fixtures ni reportes. Una fila sin teléfono requiere revisión explícita.
- Plan explícito: módulo común local, selección de hoja y columnas, resumen de válidos/excluidos/duplicados, lotes ordenados de 180, encabezados Name/Phone, CSV UTF-8 con escape y conservación de teléfonos; revisión previa. No importar automáticamente columnas privadas.
- Prompt independiente de los contactos, con fecha, zona, tono, idioma, detalles verificados y CTA; copiar para IA externa a elección sin llamada IA ni envío de SMS. English UI. Conservar archivo al cambiar pestañas durante la sesión, liberar al salir.
- Integrar Staff/Management/Frontdesk/Talent/User/Recruiter/Admin sin tocar consultas semanales ni formularios. Pruebas de límites, formato, teléfonos, hojas/columnas faltantes, cambio de archivo, prompt sin contactos; harness y navegador antes de publicar. Sense requiere mapear columnas usando su plantilla/configuración de cuenta, no se afirma envío probado.

- Implementación: pestaña común de carga diferida en los siete dashboards; solo Name/Phone, deduplicación opcional, teléfono US 10/11 dígitos, revisión obligatoria y lotes individuales. Prompt editable separado, copia/fallback manual. Sin dependencias nuevas ni API IA/Sense.
- Validación: harness PASS (16 backend, 9 captura, 11 tracker, 6 Text Talents; build y 21 TS conocidos/0 nuevos). Libro real procesado solo localmente: 1204 contactos válidos, 1 fila omitida, lotes 180×6 +124. Descargas reales primer/último CSV validadas con lector independiente: dos columnas y 180/124 filas; no PII en logs/reportes.
- Navegador: siete roles ficticios con API local, pestañas abiertas y Admin vuelve a sus herramientas; cambio de hoja y limpieza; retención normal al cambiar pestaña Staff; fecha seleccionada con calendario y CTA actualizan prompt y copia sin teléfonos; móvil 390×844 sin desbordamiento. Capturas solo con fixture ficticio. Pendiente publicación; importación real en Sense no probada.
