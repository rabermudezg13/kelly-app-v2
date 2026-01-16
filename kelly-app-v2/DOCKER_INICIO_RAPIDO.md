# 🚀 Inicio Rápido con Docker

## ✅ Docker está instalado y listo

## 🎯 Comandos Esenciales

### Iniciar la Aplicación
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
docker-compose up --build
```

**Primera vez:** Tardará 5-10 minutos (descarga imágenes, instala dependencias)  
**Siguientes veces:** Solo unos segundos

### Acceder a la Aplicación
Una vez iniciado, abre en tu navegador:
- **Frontend:** http://localhost:3025
- **Backend:** http://localhost:3026
- **API Docs:** http://localhost:3026/docs

### Detener
```bash
# Presiona Ctrl+C en la terminal
# O en otra terminal:
docker-compose down
```

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Reiniciar
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend

# Reiniciar solo frontend
docker-compose restart frontend
```

## 🔄 Flujo de Trabajo Diario

### Al Iniciar el Día
```bash
docker-compose up
```

### Durante el Día
- Edita código normalmente
- Los cambios se reflejan automáticamente (hot reload)
- Ver logs si hay problemas: `docker-compose logs -f`

### Al Finalizar el Día
```bash
# Opción 1: Detener (mantiene contenedores)
docker-compose stop

# Opción 2: Detener y eliminar
docker-compose down
```

## 🐛 Solución Rápida de Problemas

### Los servidores no inician
```bash
# Ver qué está pasando
docker-compose logs

# Reconstruir desde cero
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Los cambios no se reflejan
```bash
docker-compose restart
```

### Limpiar todo y empezar de nuevo
```bash
docker-compose down -v
docker-compose up --build
```

## 📚 Más Información

- **`DOCKER_VENTAJAS.md`** - ¿Por qué usar Docker?
- **`DOCKER_GUIA.md`** - Guía completa con todos los comandos

## 💡 Tip

**Ejecuta en background (detached mode):**
```bash
docker-compose up -d
```

Los servidores correrán en background y puedes cerrar la terminal. Para ver logs:
```bash
docker-compose logs -f
```
