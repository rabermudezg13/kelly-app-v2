# Onboarding Tracker integration

## Plan — 2026-10-18
Integrate all functionality from `rabermudezg13/dashtracker` revision
`eb3ad565f75f0ec88ee46f998c6f931949f3e57b` in a recruiter-only tab after Smart Capture.
Keep the original module isolated in an iframe: Excel/CSV import, recruiter sheets,
module filters, email/SMS templates, KSN/email copying, phone CSV, Drug Screen PDF,
photo-to-PDF scanner, checklist PDF/printing, and Help.

Acceptance: all five internal sections work, PDF template is included, import and
exports run locally, weekly NHO queries are unchanged, no parent CSS collisions.
Retain imported data while switching Kelly tabs; release it when leaving dashboard.
Only sender/branch preferences persist, scoped by recruiter. Candidate data stays in
memory. No API/database changes and no migration of data from the old website.

Integration repairs: missing upstream manual, escape spreadsheet values rendered
as HTML, safe CSV quoting, same-origin vendor assets and scoped preference keys.
Use fictitious data for browser and behavior tests. Run the complete harness and
verify Vercel preview before production. No automatic sending of messages.

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
