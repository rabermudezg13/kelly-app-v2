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

## Smart Capture
El harness ejecuta `npm run test:capture`: nombre/apellido, nombre seguro con FP,
límites de cobertura y detección del marco del perfil. Se requiere Node 22.6+.
Para navegador usar imágenes ficticias; comprobar apertura/pegado, X/teclado,
confirmación invalidada tras cambiar cobertura, PNG opaco sin X y limpieza.
Smart Capture admite pegar y abrir imágenes; ya no solicita compartir pantalla.
El build obtiene un modelo público versionado; debe tener red al prepararse por
primera vez. Las imágenes del usuario nunca intervienen en ese proceso.

## Onboarding Tracker
`npm run test:tracker` prueba reglas originales de pendientes, escape HTML/CSV y recursos PDF/Help. Para navegador usar Excel ficticio, verificar selección de hojas, filtros/plantillas, descargas Drug Screen/Scanner/Checklist, Help y conservación al cambiar pestañas. No usar datos reales.

## Importación exclusiva por reclutador — 2026-10-19
El perfil del dashboard determina la hoja mediante correspondencias explícitas. Primero se leen los nombres del libro y después se parsea solo la hoja asignada. No hay selector, CSV ni fallback a primera hoja. Encabezados detectados dentro de la hoja seleccionada; errores limpian resultados anteriores. El nombre editable del remitente no influye. Este es un filtro local de importación, no una nueva frontera de autorización del servidor. Pruebas: correspondencias, XLSX/XLS, desconocidos, ambigüedad, falta de hoja, CSV y cargas consecutivas.

## Pegado Smart Capture — 2026-10-19
El editor escucha eventos paste en su ventana y en el dashboard padre del mismo origen. No usa lectura programática del portapapeles para el atajo. Se extrae una imagen desde items o files; el texto sigue su comportamiento normal. Al desmontar el iframe se retiran ambos listeners. Probar foco en pestaña padre y dentro del editor, pegado de texto, aislamiento entre orígenes y limpieza.

Para reconocimiento Smart Capture, probar también un perfil ficticio reducido y desplazado dentro de una pantalla completa: nombre y cubierta deben recuperarse. El caso geométrico rechaza una barra horizontal y una imagen vacía. En navegador comprobar el recorte original, la captura completa y que una falla OCR conserve la sugerencia de cubierta y permita edición manual.

## Retirada de módulos — 2026-10-23
Verificar los seis dashboards (Staff, Management, Frontdesk, Talent, User, Recruiter): sin pestañas Storage/TV Kiosk, con NHO y sus demás secciones. Info Session Progress normal no debe ofrecer Open TV Kiosk. Enlaces antiguos redirigen a progreso normal y al inicio respectivamente. Usar usuarios y respuestas ficticios locales; no crear registros de producción. Backend Storage y snapshots históricos se conservan.

## Text Talents
El harness incluye test:text-talents: partición en máximo 180, formato CSV, teléfonos/duplicados/excluidos, selección de hoja/encabezados y plantilla. Prueba web: abrir desde los siete roles, importar workbook ficticio/real local sin registrar PII, revisar y descargar primer/último lote, cambiar hoja, limpiar y copiar prompt con nueva fecha/CTA. Ver docs/TEXT_TALENTS.md para límites y privacidad.

## Alfred
`npm run test:alfred` included in harness: backup compatibility/schema/size limits,
URL protocols/credentials, content preservation and user key isolation. Browser
checks use synthetic data across seven roles, edit/copy/reload, groups, backup,
links and mobile layout. No production data writes.
