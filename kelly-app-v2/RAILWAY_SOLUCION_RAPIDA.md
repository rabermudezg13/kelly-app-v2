# ⚡ Solución Rápida para Railway

## 🎯 Pasos Inmediatos

### 1. Obtener la URL Correcta del Backend

1. En Railway, ve al servicio **backend**
2. Ve a **"Settings"** → **"Networking"** o **"Domains"**
3. **Copia la URL completa** que aparece allí
4. Ejemplo: `https://kelly-backend-production-abc123.up.railway.app`

---

### 2. Actualizar URL en el Código del Frontend

Abre el archivo:
```
kelly-app-v2/frontend/src/services/api.ts
```

Busca la línea 30 (aproximadamente) que dice:
```typescript
const url = 'https://perceptive-nourishment-production-e92a.up.railway.app/api'
```

**Cámbiala por la URL correcta** de tu backend (con `/api` al final):
```typescript
const url = 'https://tu-backend-url-correcta.up.railway.app/api'
```

**Guarda el archivo**

---

### 3. Verificar que el Backend Funcione

1. Abre en tu navegador la URL del backend (sin `/api`):
   ```
   https://tu-backend-url.up.railway.app/health
   ```

2. Deberías ver:
   ```json
   {"status": "healthy"}
   ```

Si ves un error o no responde:
- Ve al Paso 4 (verificar logs del backend)

---

### 4. Verificar Logs del Backend

1. En Railway, ve al servicio **backend**
2. Ve a **"Deployments"** → Click en el último deployment
3. Ve a **"Logs"**
4. Busca errores como:
   - `DATABASE_URL not found`
   - `Port already in use`
   - `Module not found`
   - `Failed to connect to database`

**Si ves errores**, compártelos y te ayudo a resolverlos.

---

### 5. Verificar Variables de Entorno del Backend

1. En el servicio **backend** → **"Variables"**
2. Verifica que exista:
   - ✅ `DATABASE_URL` (Railway la crea automáticamente si tienes PostgreSQL)
   - ✅ `SECRET_KEY` (si usas autenticación)

**Si falta `DATABASE_URL`:**
- Ve al servicio **PostgreSQL** → **"Variables"**
- Copia `DATABASE_URL`
- Ve al servicio **backend** → **"Variables"** → **"+ New Variable"**
- Nombre: `DATABASE_URL`
- Valor: Pega la URL que copiaste
- **Guarda**

**Si falta `SECRET_KEY`:**
- Genera uno: Abre terminal y ejecuta:
  ```bash
  openssl rand -hex 32
  ```
- Copia el resultado
- Ve al servicio **backend** → **"Variables"** → **"+ New Variable"**
- Nombre: `SECRET_KEY`
- Valor: Pega el resultado
- **Guarda**

---

### 6. Subir Cambios del Frontend a GitHub

Si actualizaste la URL en el código:

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
git add frontend/src/services/api.ts
git commit -m "Update backend URL for Railway"
git push origin main
```

Railway redeployará automáticamente.

---

### 7. Verificar Frontend

1. Espera a que Railway termine de redeployar el frontend (verás "Deployed" en verde)
2. Ve a la URL del frontend
3. Abre la **consola del navegador** (F12 → Console)
4. Deberías ver un log que dice:
   ```
   🚂 Using Railway backend (hardcoded): https://tu-backend-url.up.railway.app/api
   ```

Si ves esto, la configuración está correcta.

---

## 🆘 Si Aún No Funciona

### Verificar Logs del Frontend

1. En Railway, ve al servicio **frontend**
2. Ve a **"Deployments"** → Click en el último deployment
3. Ve a **"Logs"**
4. Busca errores como:
   - `Build failed`
   - `Cannot find module`
   - `VITE_API_URL`

---

### Verificar CORS

Si ves errores de CORS:

1. En el servicio **backend** → **"Variables"** → **"+ New Variable"**
2. Agrega:
   - **Nombre**: `CORS_ORIGINS`
   - **Valor**: `https://tu-frontend-url.up.railway.app,https://*.up.railway.app,*`
3. **Guarda**

Railway redeployará automáticamente.

---

## 📋 Checklist Rápida

- [ ] URL del backend obtenida de Railway
- [ ] URL actualizada en `api.ts`
- [ ] Backend responde en `/health`
- [ ] `DATABASE_URL` configurada en backend
- [ ] `SECRET_KEY` configurada en backend (si usas auth)
- [ ] Cambios subidos a GitHub (si actualizaste código)
- [ ] Frontend redeployado
- [ ] Console del navegador muestra la URL correcta
- [ ] Probar guardar respuesta → funciona

---

## 🎯 Información que Necesito

Para ayudarte mejor, comparte:

1. **¿Cuál es la URL del backend** que aparece en Railway? (Settings → Networking)
2. **¿El backend responde** cuando visitas `/health`?
3. **¿Qué errores ves en los logs** del backend y frontend?
4. **¿Tienes PostgreSQL** configurado en Railway?

Con esta información puedo darte una solución exacta.
