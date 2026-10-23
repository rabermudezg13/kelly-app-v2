# Arquitectura y flujos protegidos

## Mapa

| Área | Ubicación | Responsabilidad |
| --- | --- | --- |
| Arranque backend | `kelly-app-v2/backend/main.py` | Routers, tablas e inicialización |
| Datos | `backend/app/database/` y `backend/app/models/` | SQLAlchemy; SQLite local, PostgreSQL en Railway |
| NHO API | `backend/app/api/new_hire_orientation.py` | Lista semanal, historial, pasos y asistencia |
| Cliente HTTP | `frontend/src/services/api.ts` | Axios y `VITE_API_URL` |
| Panel reclutador | `frontend/src/pages/RecruiterDashboard.tsx` | Operación semanal |
| Búsqueda histórica | `frontend/src/components/NhoHistorySearch.tsx` | Diálogo y resultados de solo lectura |

Las rutas abreviadas `backend/` y `frontend/` parten de `kelly-app-v2/`.

## New Hire Orientation

Los registros se conservan en `new_hire_orientations`; los pasos están en
`new_hire_orientation_steps`. Que un registro desaparezca de la lista semanal
no implica que haya sido eliminado.

La lista operativa usa `current_week=true`, con el inicio de semana calculado en
Miami. El historial usa `GET /api/new-hire-orientation/history`: nombre (`q`),
`date_from`, `date_to`, `offset` y `limit` (máximo 100). Devuelve `items`, `total`,
`offset` y `limit`. Las fechas incluyen el día completo de Miami mediante límites
UTC, teniendo en cuenta el horario de verano. Debe existir nombre o fecha.

El endpoint requiere usuario autenticado con rol admin, management, recruiter,
frontdesk o staff. Sin sesión responde 401; un rol no autorizado recibe 403.
El diálogo mantiene sus propios resultados; no reutiliza el estado de la lista
semanal. La búsqueda no modifica asistencia ni pasos.

## Operación

El frontend activo está en Vercel: `https://kelly-app-v2.vercel.app`.
El backend está en Railway: `https://perceptive-nourishment-production-e92a.up.railway.app`.
`VITE_API_URL` termina en `/api`. `DATABASE_URL` y `SECRET_KEY` son configuración
privada del backend; no se guardan en Git.

Los cambios en `main` pueden activar despliegues automáticos. Consultar el estado
real de Vercel y del servicio backend de Railway, y comprobar `/health` después.
El servicio frontend antiguo de Railway no representa el frontend activo de Vercel.

El arranque importa modelos, crea tablas y puede inicializar el administrador.
No usarlo como prueba contra una base real. Los drivers PostgreSQL `psycopg` y
`psycopg2` están declarados: su disponibilidad se comprueba sin conectar a una base.

## Presentación horizontal de dashboards (en producción)

`frontend/src/dashboard.css` contiene el tema acotado a `.dashboard-glass`.
Los dashboards conservan handlers, estados y consultas; los botones existentes
usan `aria-pressed`. `public/dashboard-modern.js` omite el tema antiguo cuando
React aplica esta clase, pero mantiene la estabilización de Row Generator.
Ver `DASHBOARD_REDESIGN_PLAN.md` y `DASHBOARD_VERIFICATION.md`.

## Smart Capture (en producción)

La pestaña de reclutadores monta `/smart-capture.html` en un iframe del mismo
origen. Vite produce una segunda entrada que no importa servicios API, analítica
ni el estado del dashboard. Su CSP limita recursos al propio sitio; no hay
endpoints, almacenamiento persistente ni transmisión de imágenes/nombres.
El navegador puede almacenar recursos estáticos en caché, nunca se persisten
capturas en el código de la aplicación. La descarga usa un canvas PNG aplanado.

`frontend/src/smart-capture/` implementa el editor, OCR Tesseract local y detección
por formato de perfil, con MediaPipe como alternativa. El usuario revisa nombre y
cobertura; la X es un control del DOM y no se dibuja en el PNG.
`frontend/scripts/prepare-capture.mjs` copia motores/datos de dependencias fijadas
y obtiene el modelo oficial versionado, verificando SHA-256 al preparar dev/build.
Los recursos generados se excluyen de Git y se incluyen en `dist/capture-assets`.
No se instala software en los equipos de los reclutadores.

Smart Capture se ubica después de New Hire Orientation. Las entradas son pegar o abrir imagen; se retiró getDisplayMedia y el permiso display-capture.

## Onboarding Tracker
Pestaña exclusiva de reclutadores después de Smart Capture. Monta `public/dashtracker/index.html` al abrir por primera vez y conserva el iframe oculto al cambiar de pestaña. Desmontar el dashboard libera archivos. El fragmento URL inicializa nombre/email y ámbito de preferencias; no envía credenciales. Excel, PDFs y fotos se procesan en navegador. Solo preferencias de remitente/sucursal usan localStorage por reclutador. `prepare-dashtracker.mjs` copia xlsx/pdf-lib de versiones del lockfile. CSP limita las cargas a recursos locales. Ver `docs/DASHTRACKER.md`.

## Importación exclusiva por reclutador — 2026-10-19
El perfil del dashboard determina la hoja mediante correspondencias explícitas. Primero se leen los nombres del libro y después se parsea solo la hoja asignada. No hay selector, CSV ni fallback a primera hoja. Encabezados detectados dentro de la hoja seleccionada; errores limpian resultados anteriores. El nombre editable del remitente no influye. Este es un filtro local de importación, no una nueva frontera de autorización del servidor. Pruebas: correspondencias, XLSX/XLS, desconocidos, ambigüedad, falta de hoja, CSV y cargas consecutivas.

## Pegado Smart Capture — 2026-10-19
El editor escucha eventos paste en su ventana y en el dashboard padre del mismo origen. No usa lectura programática del portapapeles para el atajo. Se extrae una imagen desde items o files; el texto sigue su comportamiento normal. Al desmontar el iframe se retiran ambos listeners. Probar foco en pestaña padre y dentro del editor, pegado de texto, aislamiento entre orígenes y limpieza.

## Reconocimiento de capturas completas — 2026-10-19
Smart Capture busca primero el marco del perfil y, si falta, amplía la búsqueda a la imagen completa con límites de tamaño y proporción. Esta sugerencia es independiente del OCR. La lectura amplía texto pequeño y reintenta sobre toda la captura cuando el encabezado no contiene ambos campos. Los resultados parciales se publican solo para la generación de imagen activa. Cada reconocimiento tiene límite de 30 segundos; procesamiento y recursos permanecen en el navegador.

## Inicio y acceso al registro — 2026-10-21
HomePage muestra Register Visit y Staff como tarjetas principales en todos los tamaños. Se elimina el menú móvil de tres puntos y el espacio inicial de 43vh; las tarjetas preceden a los anuncios. Register Visit continúa en /register-visit y allí se elige categoría; Staff continúa en /staff/login. No cambia ningún formulario ni endpoint.

## Módulos retirados — 2026-10-23
Se retiraron TV Kiosk y Storage de los dashboards y sus pantallas frontend. Los enlaces antiguos redirigen mediante replace: TV a Info Session Progress normal, códigos Storage al inicio. Info Session Progress permanece. El backend Storage, sus tablas y snapshots históricos se conservan sin modificaciones; no hay migraciones ni borrados de datos.

## Text Talents
TextTalentsPanel compartido en los siete dashboards, con carga diferida de React y XLSX al abrir. No importa servicios API ni persiste contactos. El componente genera CSVs de dos columnas de hasta 180 contactos y un prompt independiente de los datos. Estado local mientras siga montado; sin caché de contactos entre sesiones. Ver TEXT_TALENTS.md.

## Alfred
Shared lazy AlfredPanel in seven role dashboards. Browser-local versioned preferences
scoped by authenticated user ID; copy text/open http(s) links only. Groups, search,
JSON backups with schema/size validation; legacy KeyForge script becomes text.
No API/schema changes or command execution. See ALFRED.md.
