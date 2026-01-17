# Configuración del Backend en Railway

## Problema Actual
El backend muestra "Port 3026" fijo en Railway, pero necesita usar el puerto dinámico que Railway asigna.

## SOLUCIÓN RÁPIDA:

### Opción 1: Eliminar puerto manual
1. Railway → Servicio Backend → **Settings**
2. Busca **"Networking"** o donde dice **"Port: 3026"**
3. Si hay un botón de eliminar (X), elimínalo
4. Railway redesplegará automáticamente

### Opción 2: Si Railway no te deja cambiar el puerto
El Dockerfile ya está configurado correctamente para usar `${PORT:-3026}`, lo que significa:
- Si Railway define `PORT`, usa ese valor
- Si no, usa 3026 por defecto

**Verifica que Railway esté exponiendo el servicio correctamente:**
1. Settings → Networking
2. Debe decir "Public Networking: Enabled"
3. No debe tener un puerto custom fijo

## Próximo paso:
Espera a que el deployment actual termine y prueba de nuevo el botón "Finish Session".
