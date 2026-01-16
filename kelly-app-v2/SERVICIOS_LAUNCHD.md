# 🔧 Inicio Automático con launchd (macOS)

## 📋 ¿Qué es launchd?

`launchd` es el sistema de gestión de servicios de macOS. Permite que los servidores se inicien automáticamente al arrancar tu Mac, sin necesidad de ejecutar comandos manualmente.

## 🎯 Instalación Rápida

### Instalar Servicios (Inicio Automático)
```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
chmod +x install-launchd.sh uninstall-launchd.sh
./install-launchd.sh
```

### Desinstalar Servicios
```bash
./uninstall-launchd.sh
```

## 📝 Comandos de launchd

### Ver Estado de los Servicios
```bash
launchctl list | grep kellyapp
```

### Iniciar Servicios Manualmente
```bash
launchctl start com.kellyapp.backend
launchctl start com.kellyapp.frontend
```

### Detener Servicios Manualmente
```bash
launchctl stop com.kellyapp.backend
launchctl stop com.kellyapp.frontend
```

### Recargar Configuración (después de editar .plist)
```bash
launchctl unload ~/Library/LaunchAgents/com.kellyapp.backend.plist
launchctl load ~/Library/LaunchAgents/com.kellyapp.backend.plist

launchctl unload ~/Library/LaunchAgents/com.kellyapp.frontend.plist
launchctl load ~/Library/LaunchAgents/com.kellyapp.frontend.plist
```

## 🔄 Flujo de Trabajo

### Opción 1: Solo Modo Daemon (Recomendado para Desarrollo)
```bash
# Iniciar manualmente cuando necesites
./start-daemon.sh

# Detener cuando termines
./stop-daemon.sh
```

**Ventajas:**
- ✅ Control total sobre cuándo corren los servidores
- ✅ Fácil de iniciar/detener
- ✅ No consume recursos cuando no los necesitas

### Opción 2: launchd (Recomendado para Producción Local)
```bash
# Instalar una vez
./install-launchd.sh

# Los servidores se iniciarán automáticamente al reiniciar
```

**Ventajas:**
- ✅ Inicio automático al arrancar el Mac
- ✅ Se reinician automáticamente si se caen
- ✅ No necesitas recordar iniciarlos manualmente

**Desventajas:**
- ❌ Consumen recursos incluso cuando no los usas
- ❌ Más difícil de detener/iniciar manualmente

## ⚠️ Notas Importantes

1. **Ruta de npm**: El archivo `com.kellyapp.frontend.plist` usa `/usr/local/bin/npm`. Si npm está en otra ubicación, edita el archivo `.plist` y cambia la ruta.

2. **Verificar ruta de npm**:
   ```bash
   which npm
   ```

3. **Si npm está en otra ubicación**, edita `com.kellyapp.frontend.plist`:
   ```xml
   <string>/ruta/a/npm</string>
   ```

4. **Logs**: Los logs se guardan en:
   - Backend: `backend.log`
   - Frontend: `frontend.log`

## 🆚 Comparación: Daemon vs launchd

| Característica | Modo Daemon | launchd |
|----------------|-------------|---------|
| Inicio manual | ✅ `./start-daemon.sh` | ❌ Automático |
| Inicio al arrancar | ❌ No | ✅ Sí |
| Reinicio automático | ❌ No | ✅ Sí |
| Control manual | ✅ Fácil | ⚠️ Más complejo |
| Uso de recursos | Solo cuando activo | Siempre activo |
| Mejor para | Desarrollo | Producción local |

## 💡 Recomendación

- **Para desarrollo diario**: Usa `start-daemon.sh` (modo daemon)
- **Para servidor local permanente**: Usa `install-launchd.sh` (launchd)
