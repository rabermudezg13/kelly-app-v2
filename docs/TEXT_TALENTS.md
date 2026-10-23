# Text Talents

## Alcance
Pestaña común de Admin, Staff, Management, Frontdesk, Talent, User y Recruiter. StatisticsDashboard es una vista interna de estos paneles, no otro rol. UI en inglés. Sin rutas públicas nuevas, endpoints, migraciones ni envíos a Sense o IA.

## Excel y CSV
- Workbook .xlsx/.xls hasta 20 MB; hoja seleccionada de menos de 100,000 filas. El encabezado se detecta dentro de las primeras 25 filas y puede ajustarse manualmente (1–50).
- Detección de Substitute/Name/Full Name/Candidate Name y Phone/Mobile; selección manual por índice disponible. Nombres y teléfonos deben usar columnas diferentes.
- Omite filas vacías y señala número de fila/reason para nombre ausente, teléfono US no admitido o duplicado. Por defecto conserva el primer contacto válido por teléfono; deduplicación se puede desactivar explícitamente.
- Números de diez dígitos o once con país 1; elimina puntuación y normaliza a diez dígitos. Puede exportar once con país 1. No valida existencia, móvil, capacidad SMS ni estado de contacto en Sense.
- Exporta únicamente Name,Phone, en UTF-8 sin BOM, con CRLF, campos entre comillas y escape de comillas/nuevas líneas. Prefijo seguro para nombres que podrían convertirse en fórmulas al abrir Excel. Conserva orden de la fuente y exige revisar preview/filas omitidas antes de descargar.
- Cada archivo contiene como máximo 180 contactos más encabezado; se descarga individualmente para evitar bloqueos de múltiples descargas. Nombre incluye fecha de trabajo, lote y total de lotes.
- La lista vive en estado React del componente; se monta al abrir por primera vez y se oculta al cambiar de pestaña. Clear workbook, recarga o desmontaje del dashboard libera la lista. Un remontaje del panel también la libera; no hay persistencia entre sesiones.

## Prompt
Fecha inicial de Miami, área, remitente, idioma, tono, detalles verificados y CTA editables. Plantilla para tres opciones SMS breves, engagement y reactivación respetuosa. Pide no inventar pagos, disponibilidad, enlaces ni asignaciones confirmadas. Se copia texto; si falla Clipboard API selecciona el textarea para copiar manualmente. No se llama a modelos ni se agrega información del Excel al prompt.

## Integración Sense
Los encabezados Name/Phone deben mapearse a la plantilla/configuración de la cuenta. La guía oficial describe descargar la plantilla y mapear los campos; el formato exacto de una cuenta no se verifica sin su plantilla. 180 es el máximo solicitado por el usuario, no una afirmación del límite de Sense.
Fuente: https://support.sensehq.co/hc/en-us/articles/360044249812-Custom-List
No se ha enviado un broadcast ni se ha importado una lista real en Sense como prueba.

## Validación
`npm run test:text-talents` incluido en scripts/verify.py. Casos: límites 0/180/181/360/1204, orden, formato de dos columnas, comillas/Unicode/nuevas líneas, seguridad de celdas, teléfonos, duplicados, columnas/hojas y prompt.
Usar fixtures ficticios para screenshots. Archivo real solo lectura/procesamiento local; no contactos en Git, logs o reportes. Comprobar importación, revisión, descargas, cambio de hoja, clear, copia, navegación de roles y vista móvil en navegador antes de publicar.

## Cierre — Text Talents, 2026-10-23
- PR #22 integrado: `252d87bd606605aeff1dd53636757c5978e3ac2f`; CI `39993209047` PASS. Vercel producción READY `dpl_FGnQewM5x4ataJGV31PGtWVwWvQe`, alias principal asignado; backend health 200.
- Recursos JS/CSS publicados HTTP 200; CSS idéntico al local y código del módulo idéntico al normalizar nombres de dependencias generados por build. Navegación/funcionalidad probadas en siete roles con API ficticia local, no con sesiones autenticadas reales de producción.
- Libro real leído/exportado solo localmente; no contactos en Git, capturas ni reportes. CSV inicial/final verificados independientemente. Screenshots usan contactos ficticios. No se envió ningún SMS, ni contactos a IA/Sense.
- Disponible en todos los dashboards de roles; prompt con fecha, tono, idioma y CTA. Importación real de Sense pendiente de validar con plantilla de cuenta. Mantener revisión de excluidos y mapeo antes de usar los CSV.
- Plan, implementación y pruebas publicados en PR #22; este cierre posterior al deploy queda local para próxima sincronización documental.
