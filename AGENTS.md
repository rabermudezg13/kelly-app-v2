# Reglas de trabajo — Kelly App

Estas instrucciones aplican a todo el repositorio. Leer también `docs/ARCHITECTURE.md`,
`docs/HARNESS.md` y las entradas recientes de `docs/CHANGELOG.md` antes de editar.

## Proteger los flujos existentes

- La lista principal de NHO sigue mostrando la semana actual de Miami
  (`America/New_York`). Conservar `getNewHireOrientations(7, true)` y el filtro
  `current_week`; no sustituirlos por una consulta histórica.
- La búsqueda histórica tiene consulta, paginación y estado independientes. Es de
  solo lectura y requiere sesión de staff autorizada. Buscar o cerrar el diálogo
  no debe cambiar la lista semanal, sus contadores ni los estados de asistencia.
- Interpretar fechas del historial como días de Miami, incluidos cambios de horario.
  Mantener las rutas estáticas antes de `/{orientation_id}`.
- Cambiar solo los dashboards afectados por el alcance solicitado. No propagar
  automáticamente una función a todos los roles.
- No añadir migraciones ni modificar datos de producción para probar una interfaz.
  Revisar expresamente cualquier cambio de esquema: `create_all` no migra columnas.

## Documentar cada cambio (obligatorio)

- Cada cambio de código, configuración, dependencias, pruebas o documentación debe
  incluir una entrada en `docs/CHANGELOG.md` dentro del mismo commit o PR. Agrupar
  modificaciones de una misma tarea en una entrada; actualizarla al avanzar.
- CI comprueba que la bitácora cambie; revisar además que la entrada sea concreta
  y completa, porque una modificación vacía no cumple esta regla.
- Registrar fecha, objetivo, qué se cambió, por qué, comprobaciones y resultados,
  estado real y pendientes. Usar la plantilla de esa bitácora.
- Actualizar los documentos de arquitectura, operación o harness cuando cambie lo
  que describen. Una entrada en la bitácora no sustituye esa actualización.
- Distinguir implementado, verificado localmente, publicado y comprobado en
  producción. Nunca marcar como terminado algo que falta probar o desplegar.
- No incluir credenciales, tokens, datos personales ni volcados de producción en
  documentación, fixtures, capturas o reportes. Usar personas ficticias.

## Verificación y entrega

- Ejecutar `python scripts/verify.py` con el entorno de desarrollo preparado.
  Consultar `docs/HARNESS.md`. Documentar cualquier comprobación que no pudo correr.
- Para cambios funcionales añadir pruebas de comportamiento y regresiones relevantes;
  para texto o estilos simples no inventar pruebas que repitan la implementación.
- No ampliar la referencia de errores TypeScript para ocultar regresiones. Resolver
  los errores nuevos; cualquier modificación de la referencia exige explicación.
- El harness usa exclusivamente una base SQLite temporal y no requiere secretos.
  No importar `main.py` apuntando a producción: su arranque crea tablas y usuarios.
- Un merge no prueba que el despliegue esté sano. Revisar el servicio afectado,
  `/health` y el flujo cambiado antes de declarar verificado en producción.
- Respetar cambios ajenos, evitar limpiezas masivas y no incorporar archivos `.env`.
