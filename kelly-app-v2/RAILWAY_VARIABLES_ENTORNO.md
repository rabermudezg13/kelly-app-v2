# 🔧 Configurar Variables de Entorno en Railway

## 🎯 Problema

El frontend no puede conectarse al backend porque no sabe su URL en Railway.

---

## ✅ Solución: Configurar Variables de Entorno

### Paso 1: Obtener la URL del Backend en Railway

1. **Ve a tu proyecto en Railway**
2. **Click en el servicio backend** (puede llamarse `backend` o el nombre de tu app)
3. Ve a la pestaña **"Settings"** o **"Variables"**
4. Busca la sección **"Domains"** o **"Networking"**
5. Verás algo como: `https://tu-backend-xxx.up.railway.app`
6. **Copia esa URL completa** (incluye `https://`)

Ejemplo:
```
https://kelly-backend-production-abc123.up.railway.app
```

---

### Paso 2: Agregar Variable de Entorno en Frontend

1. **Click en el servicio frontend** en Railway
2. Ve a **"Variables"** o **"Settings"** → **"Environment Variables"**
3. Haz click en **"New Variable"** o **"Add Variable"**
4. Agrega:

   **Nombre (Key):**
   ```
   VITE_API_URL
   ```

   **Valor (Value):**
   ```
   https://tu-backend-xxx.up.railway.app/api
   ```

   ⚠️ **IMPORTANTE**: Agrega `/api` al final de la URL del backend

5. **Guarda** la variable

---

### Paso 3: Variables Necesarias en Backend

Ve al servicio **backend** y verifica que tenga estas variables:

#### Base de Datos PostgreSQL

Railway debería haber creado automáticamente:

- `DATABASE_URL` - URL de conexión a PostgreSQL

#### Otras Variables Importantes

1. **SECRET_KEY** (para JWT):

   **Nombre:**
   ```
   SECRET_KEY
   ```

   **Valor:**
   ```
   tu-secret-key-muy-segura-aqui-cambiar-en-produccion
   ```

   Puedes generar una con:
   ```bash
   openssl rand -hex 32
   ```

2. **CORS Origins** (opcional, para permitir requests del frontend):

   **Nombre:**
   ```
   CORS_ORIGINS
   ```

   **Valor:**
   ```
   https://tu-frontend-xxx.up.railway.app,https://*.up.railway.app
   ```

---

### Paso 4: Redeploy

Después de agregar las variables:

1. Railway **automáticamente** redeployará el servicio
2. Si no redeploya automáticamente, ve a **"Deployments"** y haz click en **"Redeploy"**

---

## 🔍 Verificar que Funcione

### 1. Verificar Backend

1. Ve a la URL del backend (sin `/api`)
   Ejemplo: `https://tu-backend-xxx.up.railway.app`
2. Deberías ver algo como:
   ```json
   {"message": "Kelly Education API"}
   ```
   O el JSON de la documentación de FastAPI

### 2. Verificar Frontend

1. Ve a la URL del frontend
2. Abre la **consola del navegador** (F12 → Console)
3. Deberías ver un log que dice:
   ```
   ✅ Using VITE_API_URL: https://tu-backend-xxx.up.railway.app/api
   ```

Si ves esto, la configuración está correcta.

---

## 🆘 Si Sigue Sin Funcionar

### Opción 1: Usar Railway Service URL

Railway puede compartir variables entre servicios:

1. En el servicio **frontend**, ve a **"Variables"**
2. Haz click en **"Add Reference"** o **"Reference Variable"**
3. Busca `RAILWAY_SERVICE_URL` del servicio backend
4. O crea una variable compartida:
   - **Nombre**: `BACKEND_URL`
   - **Valor**: La URL del backend
   - Selecciona **"Share with other services"** (si está disponible)

### Opción 2: Verificar CORS

Si ves errores de CORS:

1. Ve al servicio **backend**
2. Agrega o modifica `CORS_ORIGINS`:
   ```
   https://tu-frontend-xxx.up.railway.app,https://*.up.railway.app,*
   ```

### Opción 3: Verificar Logs

1. Ve a **"Deployments"** en Railway
2. Click en el deployment más reciente
3. Ve a **"Logs"**
4. Busca errores relacionados con:
   - `DATABASE_URL`
   - `VITE_API_URL`
   - `Connection refused`
   - `Port`

---

## 📋 Checklist

- [ ] URL del backend obtenida
- [ ] Variable `VITE_API_URL` agregada en frontend con `/api` al final
- [ ] Variable `DATABASE_URL` configurada en backend (automática en Railway)
- [ ] Variable `SECRET_KEY` configurada en backend
- [ ] Servicios redeployados
- [ ] Backend responde en su URL
- [ ] Frontend muestra `VITE_API_URL` en consola
- [ ] Prueba guardar una respuesta → debería funcionar

---

## 🎯 Ejemplo Completo

**Backend Service:**
- URL: `https://kelly-backend-prod-abc123.up.railway.app`
- Variables:
  - `DATABASE_URL` = `postgresql://user:pass@host:port/db` (automático)
  - `SECRET_KEY` = `mi-secret-key-segura`

**Frontend Service:**
- URL: `https://kelly-frontend-prod-xyz789.up.railway.app`
- Variables:
  - `VITE_API_URL` = `https://kelly-backend-prod-abc123.up.railway.app/api`

---

¿Tienes la URL del backend? Si la compartes, te ayudo a configurarla exactamente.
