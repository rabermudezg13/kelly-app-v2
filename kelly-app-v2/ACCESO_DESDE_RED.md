# 🌐 Acceso desde Otros Equipos en la Red

## ✅ Configuración Completada

Los servidores están configurados para permitir acceso desde otros equipos en tu red local.

## 🚀 Iniciar Servidores

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
./iniciar-servidores.sh
```

## 📍 URLs de Acceso

### Desde el Equipo del Servidor (localhost)
- **Frontend:** http://localhost:3025
- **Backend:** http://localhost:3026
- **API Docs:** http://localhost:3026/docs

### Desde Otros Equipos en la Red
- **Frontend:** http://192.168.0.183:3025
- **Backend:** http://192.168.0.183:3026
- **API Docs:** http://192.168.0.183:3026/docs

> **Nota:** La IP `192.168.0.183` es la IP de tu servidor. Si cambia, usa `./verificar-servidores.sh` para ver la IP actual.

## 🔧 Cambios Realizados

### 1. CORS Actualizado
- El backend ahora permite acceso desde cualquier origen (configurado para desarrollo)
- En producción, puedes restringir esto usando la variable de entorno `CORS_ORIGINS`

### 2. Frontend con Detección Automática
- El frontend detecta automáticamente la IP del servidor
- Si accedes desde `localhost`, usa `localhost` para el backend
- Si accedes desde una IP (ej: `192.168.0.183`), usa esa misma IP para el backend

### 3. Scripts de Gestión
- `./iniciar-servidores.sh` - Inicia ambos servidores
- `./stop-servidores.sh` - Detiene ambos servidores
- `./verificar-servidores.sh` - Verifica el estado y muestra URLs

## 🛑 Detener Servidores

```bash
./stop-servidores.sh
```

## 📋 Ver Logs

```bash
# Backend
tail -f backend.log

# Frontend
tail -f frontend.log
```

## ⚠️ Solución de Problemas

### El backend no responde desde otro equipo

1. **Verificar que el backend está corriendo:**
   ```bash
   ./verificar-servidores.sh
   ```

2. **Verificar firewall:**
   ```bash
   # macOS - Verificar que el puerto 3026 está abierto
   sudo lsof -i :3026
   ```

3. **Verificar logs:**
   ```bash
   tail -f backend.log
   ```

### El frontend no puede conectar al backend

1. **Verificar la IP del servidor:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Asegúrate de acceder al frontend usando la IP del servidor:**
   - ❌ No uses: `http://localhost:3025` desde otro equipo
   - ✅ Usa: `http://192.168.0.183:3025` (o la IP de tu servidor)

3. **Verificar que ambos servidores están corriendo:**
   ```bash
   ./verificar-servidores.sh
   ```

## 🔒 Seguridad

**Para Desarrollo:**
- ✅ CORS permite cualquier origen (conveniente para desarrollo)
- ✅ Servidores accesibles desde la red local

**Para Producción:**
- ⚠️ Configura `CORS_ORIGINS` con dominios específicos
- ⚠️ Considera usar HTTPS
- ⚠️ Configura un firewall apropiado
- ⚠️ Usa autenticación adecuada

## 📝 Variables de Entorno (Opcional)

Si quieres configurar CORS específicamente, crea un archivo `.env` en `backend/`:

```bash
# backend/.env
CORS_ORIGINS=http://192.168.0.183:3025,http://localhost:3025
```

O para permitir cualquier origen (desarrollo):
```bash
CORS_ORIGINS=*
```
