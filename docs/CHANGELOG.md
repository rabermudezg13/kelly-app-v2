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
