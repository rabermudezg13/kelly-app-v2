# Harness de verificación

Desde la raíz del repositorio, usar Python 3.12 y Node 22 (las versiones de CI):

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r kelly-app-v2/backend/requirements-dev.txt
npm --prefix kelly-app-v2/frontend ci
python scripts/verify.py
```

Si el entorno Python está en otro directorio:

```bash
python3 scripts/verify.py --python /ruta/al/venv/bin/python
```

El script no instala dependencias ni publica cambios. Termina con código 0 si todas
las comprobaciones pasan y 1 ante fallos, dependencias faltantes o timeout. Guarda
resumen Markdown, JSON y logs en `.harness/`, ignorado por Git. Tras ejecutarlo,
registrar resultados y pendientes en `docs/CHANGELOG.md`.

## Qué comprueba

1. Pruebas backend: filtros, paginación, límites de fechas de Miami, DST,
   autenticación y conservación de la lista semanal tras una búsqueda.
2. Disponibilidad de ambos drivers PostgreSQL, sin abrir conexiones.
3. Importación real de la aplicación y respuesta 200 de `/health`, con SQLite
   temporal y administrador ficticio. La base se elimina al terminar.
4. Build de producción del frontend.
5. TypeScript contra `scripts/typescript-baseline.json`: falla con errores nuevos,
   permite resolver errores existentes y muestra cuántos quedan. Esta referencia
   documenta deuda previa; no equivale a una comprobación de tipos limpia.

El entorno fija `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `SECRET_KEY`
para no usar configuración de producción. El reloj de las pruebas NHO se fija al
2 de octubre de 2026; así el caso histórico no se convierte en semanal por la
fecha de ejecución.

## Límites y revisión manual

El harness no ejecuta un navegador, no prueba conexiones reales a PostgreSQL ni
valida un despliegue. Para cambios de NHO, comprobar también en un entorno seguro:
abrir el panel con sesión de staff, anotar la lista semanal, buscar una persona
histórica por fecha, abrir sus detalles y cerrar el diálogo. Confirmar que la lista
semanal no cambia. Comprobar también resultados vacíos y sesión vencida.

Después de desplegar, verificar estado de Vercel/Railway, `/health` y el flujo
modificado con permisos reales. No registrar datos personales en reportes.

## CI y mantenimiento

`.github/workflows/verify.yml` ejecuta el mismo harness en pull requests y en main,
sin secretos. También exige modificar la bitácora al cambiar archivos. Esta
comprobación detecta presencia del cambio; el contenido requiere revisión humana.
Puede ejecutarse localmente con `python scripts/check_change_log.py origin/main`.
El resumen se conserva como artifact. No despliega ni modifica bases.
Para impedir merges con fallos hay que configurar esta comprobación como requerida
en las reglas de la rama de GitHub; crear el workflow no activa esa protección.

La referencia TypeScript almacena archivo, código, mensaje y multiplicidad, sin
números de línea. Al resolver deuda, retirar los diagnósticos correspondientes y
explicar el cambio en la bitácora. No regenerarla para aceptar errores nuevos.
