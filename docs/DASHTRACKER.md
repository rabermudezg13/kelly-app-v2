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
