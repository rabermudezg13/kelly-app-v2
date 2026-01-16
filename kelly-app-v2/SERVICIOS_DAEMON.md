# 🚀 Servidores en Modo Daemon (Persistentes)

## 📋 ¿Qué es el Modo Daemon?

El modo daemon permite que los servidores sigan corriendo **incluso cuando cierras la terminal**. Los procesos se ejecutan en background y puedes cerrar la terminal sin problemas.

## 🎯 Uso Rápido

### Iniciar Servidores (Modo Daemon)
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
chmod +x start-daemon.sh stop-daemon.sh status-daemon.sh
./start-daemon.sh
```

### Ver Estado de los Servidores
```bash
./status-daemon.sh
```

### Detener Servidores
```bash
./stop-daemon.sh
```

## 📝 Comandos Disponibles

### 1. `start-daemon.sh` - Iniciar en Background
Inicia ambos servidores (backend y frontend) en modo daemon. Los procesos seguirán corriendo aunque cierres la terminal.

```bash
./start-daemon.sh
```

**Características:**
- ✅ Los servidores corren en background
- ✅ Puedes cerrar la terminal sin problemas
- ✅ Los logs se guardan en `backend.log` y `frontend.log`
- ✅ Los PIDs se guardan en `backend.pid` y `frontend.pid`

### 2. `status-daemon.sh` - Ver Estado
Verifica si los servidores están corriendo y si responden correctamente.

```bash
./status-daemon.sh
```

**Muestra:**
- ✅ Estado de cada servidor (corriendo/detenido)
- ✅ PID del proceso
- ✅ Si el servidor responde a peticiones HTTP
- ✅ Ubicación de los archivos de log

### 3. `stop-daemon.sh` - Detener Servidores
Detiene ambos servidores de forma segura.

```bash
./stop-daemon.sh
```

**Características:**
- ✅ Detiene los procesos de forma segura
- ✅ Limpia los archivos PID
- ✅ Si un proceso no responde, lo fuerza con `kill -9`

## 📊 Ver Logs en Tiempo Real

### Backend
```bash
tail -f backend.log
```

### Frontend
```bash
tail -f frontend.log
```

### Ambos (en terminales separadas)
```bash
# Terminal 1
tail -f backend.log

# Terminal 2
tail -f frontend.log
```

## 🔄 Flujo de Trabajo Recomendado

### Al Iniciar el Día
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
./start-daemon.sh
```

### Durante el Día
```bash
# Verificar que todo está bien
./status-daemon.sh

# Ver logs si hay problemas
tail -f backend.log
tail -f frontend.log
```

### Al Finalizar el Día
```bash
./stop-daemon.sh
```

## ⚠️ Solución de Problemas

### Los Servidores No Inician
1. Verifica que los puertos estén libres:
   ```bash
   lsof -ti:3026  # Backend
   lsof -ti:3025  # Frontend
   ```

2. Si están ocupados, detén los procesos:
   ```bash
   ./stop-daemon.sh
   ```

3. Verifica los logs:
   ```bash
   tail -20 backend.log
   tail -20 frontend.log
   ```

### Los Servidores Se Detienen Solos
1. Verifica los logs para ver el error:
   ```bash
   tail -50 backend.log
   tail -50 frontend.log
   ```

2. Verifica que el entorno virtual esté activado correctamente:
   ```bash
   cd backend
   source venv/bin/activate
   python -c "import fastapi; print('OK')"
   ```

### No Puedo Detener los Servidores
1. Intenta detener manualmente:
   ```bash
   ./stop-daemon.sh
   ```

2. Si no funciona, fuerza la detención:
   ```bash
   pkill -9 -f "uvicorn.*main:app"
   pkill -9 -f "vite"
   rm -f backend.pid frontend.pid
   ```

## 🆚 Comparación: Modo Normal vs Daemon

| Característica | Modo Normal (`start.sh`) | Modo Daemon (`start-daemon.sh`) |
|----------------|-------------------------|--------------------------------|
| Cerrar terminal | ❌ Se detienen | ✅ Siguen corriendo |
| Ver output | ✅ En tiempo real | ❌ Solo en logs |
| Ctrl+C | ✅ Detiene servidores | ❌ No funciona (están en background) |
| Uso | Desarrollo activo | Desarrollo pasivo / Producción local |

## 💡 Recomendaciones

1. **Para desarrollo activo**: Usa `start.sh` (modo normal) para ver los logs en tiempo real
2. **Para desarrollo pasivo**: Usa `start-daemon.sh` (modo daemon) para que sigan corriendo
3. **Para producción local**: Usa `start-daemon.sh` y configura `launchd` (ver abajo)

## 🔧 Inicio Automático al Arrancar el Sistema (Opcional)

Si quieres que los servidores se inicien automáticamente al encender tu Mac, puedes usar `launchd`. Ver el archivo `SERVICIOS_LAUNCHD.md` para más detalles.
