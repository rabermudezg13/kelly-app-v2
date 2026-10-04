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
