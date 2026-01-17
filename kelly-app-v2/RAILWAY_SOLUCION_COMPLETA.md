# ✅ Solución Completa para Railway

## 🎯 Problema Actual

El frontend muestra error: "Cannot connect to backend server. Please make sure the backend is running on port 3026."

---

## 🔧 Solución en 3 Pasos

### Paso 1: Obtener URL del Backend

1. En Railway, **click en el servicio backend**
2. Ve a **"Settings"** → **"Networking"** o **"Domains"**
3. Copia la URL completa, ejemplo:
   ```
   https://kelly-backend-production-abc123.up.railway.app
   ```

---

### Paso 2: Configurar Variable de Entorno en Frontend

1. **Click en el servicio frontend**
2. Ve a **"Variables"** → **"+ New Variable"**
3. Agrega:
   - **Nombre**: `VITE_API_URL`
   - **Valor**: `https://tu-backend-url.up.railway.app/api`
   
   ⚠️ **IMPORTANTE**: Agrega `/api` al final

4. **Guarda**

Railway redeployará automáticamente.

---

### Paso 3: Verificar Backend Usa Puerto Correcto

El backend ya está configurado con `railway.json` que usa `$PORT` (Railway lo asigna automáticamente).

Si el backend no inicia correctamente:

1. Ve al servicio **backend** → **"Variables"**
2. Verifica que `DATABASE_URL` esté configurada (Railway la crea automáticamente)
3. Agrega `SECRET_KEY`:
   - **Nombre**: `SECRET_KEY`
   - **Valor**: Genera uno con `openssl rand -hex 32`

---

## 🔍 Verificar que Funcione

### 1. Backend

1. Ve a: `https://tu-backend-url.up.railway.app`
2. Deberías ver: `{"status": "healthy"}` o la documentación de FastAPI

### 2. Frontend

1. Ve a la URL del frontend
2. Abre consola (F12 → Console)
3. Deberías ver: `✅ Using VITE_API_URL: https://tu-backend-url.up.railway.app/api`

### 3. Probar Guardar Respuesta

1. Intenta guardar una respuesta de info session
2. Debería funcionar sin errores

---

## 🆘 Si Aún No Funciona

### Verificar Logs

1. **Backend** → **"Deployments"** → Click en el último → **"Logs"**
2. Busca errores de:
   - `DATABASE_URL`
   - `Port already in use`
   - `Connection refused`

3. **Frontend** → **"Deployments"** → Click en el último → **"Logs"**
4. Busca:
   - `VITE_API_URL`
   - `Cannot connect`

### Verificar Variables

1. En **frontend**, verifica que `VITE_API_URL` tenga:
   - `https://` (no `http://`)
   - `/api` al final
   - La URL correcta del backend

2. En **backend**, verifica:
   - `DATABASE_URL` existe (automático)
   - `SECRET_KEY` existe (si usas autenticación)

---

## 📋 Checklist Final

- [ ] URL del backend obtenida
- [ ] `VITE_API_URL` configurada en frontend con `/api`
- [ ] Frontend redeployado
- [ ] Backend responde en su URL
- [ ] Console muestra `✅ Using VITE_API_URL`
- [ ] Probar guardar respuesta → funciona

---

## 💡 Información Importante

1. **Railway asigna puertos automáticamente** - no uses `3026` en Railway
2. **Cada servicio tiene su propia URL** - el frontend necesita la URL del backend
3. **Las variables `VITE_*` se incluyen en el build** - deben configurarse ANTES del build
4. **Railway redeploya automáticamente** cuando cambias variables

---

¿Ya configuraste `VITE_API_URL` en el frontend? ¿Qué URL del backend tienes?
