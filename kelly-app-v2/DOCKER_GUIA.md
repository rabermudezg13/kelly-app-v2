# 🐳 Guía de Uso de Docker

## 📋 Requisitos Previos

1. **Instalar Docker Desktop** (si no lo tienes):
   - Descarga desde: https://www.docker.com/products/docker-desktop
   - Instala y reinicia tu Mac
   - Verifica la instalación:
     ```bash
     docker --version
     docker-compose --version
     ```

## 🚀 Inicio Rápido

### 1. Construir e Iniciar los Contenedores
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
docker-compose up --build
```

**Primera vez:** Esto puede tardar 5-10 minutos (descarga imágenes, instala dependencias)

**Siguientes veces:** Solo tarda unos segundos

### 2. Acceder a la Aplicación
- **Frontend:** http://localhost:3025
- **Backend:** http://localhost:3026
- **API Docs:** http://localhost:3026/docs

### 3. Detener los Contenedores
```bash
# Presiona Ctrl+C en la terminal donde está corriendo
# O en otra terminal:
docker-compose down
```

## 📝 Comandos Útiles

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Ver Estado de los Contenedores
```bash
docker-compose ps
```

### Reiniciar un Servicio
```bash
# Reiniciar backend
docker-compose restart backend

# Reiniciar frontend
docker-compose restart frontend

# Reiniciar todo
docker-compose restart
```

### Detener y Eliminar Contenedores
```bash
# Detener (mantiene datos)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes (⚠️ elimina datos)
docker-compose down -v
```

### Reconstruir Imágenes
```bash
# Reconstruir sin caché (útil si cambias dependencias)
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up --build
```

### Ejecutar Comandos Dentro del Contenedor
```bash
# Backend - Abrir shell
docker-compose exec backend bash

# Backend - Ejecutar comando Python
docker-compose exec backend python -c "print('Hello')"

# Frontend - Ejecutar comando npm
docker-compose exec frontend npm run build
```

## 🔧 Modo Desarrollo vs Producción

### Desarrollo (con hot reload)
```bash
docker-compose up
```
- ✅ Cambios en código se reflejan automáticamente
- ✅ Logs en tiempo real
- ✅ Fácil de debuggear

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```
- ✅ Frontend optimizado (build de producción)
- ✅ Sin hot reload
- ✅ Mejor rendimiento

## 🗄️ Base de Datos

### La base de datos se guarda en:
```
./backend/kelly_app.db
```

### Backup de Base de Datos
```bash
# Copiar la base de datos
cp backend/kelly_app.db backend/kelly_app.db.backup

# O desde dentro del contenedor
docker-compose exec backend cp kelly_app.db kelly_app.db.backup
```

### Restaurar Base de Datos
```bash
# Copiar el backup
cp backend/kelly_app.db.backup backend/kelly_app.db

# Reiniciar el contenedor
docker-compose restart backend
```

## 🐛 Solución de Problemas

### Error: "Port already in use"
```bash
# Ver qué está usando el puerto
lsof -ti:3026  # Backend
lsof -ti:3025  # Frontend

# Detener procesos
docker-compose down
```

### Error: "Cannot connect to Docker daemon"
- Abre Docker Desktop
- Espera a que inicie completamente
- Intenta de nuevo

### Los cambios no se reflejan
```bash
# Reconstruir sin caché
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Limpiar Todo (empezar de cero)
```bash
# ⚠️ Esto elimina TODO (contenedores, imágenes, volúmenes)
docker-compose down -v --rmi all

# Luego reconstruir
docker-compose up --build
```

### Ver qué está pasando
```bash
# Logs en tiempo real
docker-compose logs -f

# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats
```

## 📊 Ventajas para Tu Flujo de Trabajo

### Antes (sin Docker):
1. Activar venv
2. Instalar dependencias
3. Iniciar backend
4. Abrir otra terminal
5. Iniciar frontend
6. Si algo falla, debuggear dependencias

### Ahora (con Docker):
1. `docker-compose up`
2. ¡Listo!

## 🎯 Workflow Recomendado

### Al Iniciar el Día
```bash
docker-compose up
```

### Durante el Día
- Edita código normalmente
- Los cambios se reflejan automáticamente (hot reload)
- Ver logs: `docker-compose logs -f`

### Al Finalizar el Día
```bash
# Opción 1: Detener (mantiene contenedores)
docker-compose stop

# Opción 2: Detener y eliminar
docker-compose down
```

### Si Cambias Dependencias
```bash
# Backend (requirements.txt)
docker-compose build backend
docker-compose up

# Frontend (package.json)
docker-compose build frontend
docker-compose up
```

## 🔐 Variables de Entorno

Para agregar variables de entorno, edita `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - DATABASE_URL=sqlite:///app/kelly_app.db
      - SECRET_KEY=tu-secret-key
```

O crea un archivo `.env`:
```bash
# .env
DATABASE_URL=sqlite:///app/kelly_app.db
SECRET_KEY=tu-secret-key
```

Y referencia en `docker-compose.yml`:
```yaml
env_file:
  - .env
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/)
