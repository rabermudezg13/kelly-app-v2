# 🔍 Diagnóstico de Errores en Railway

## 🎯 Problema: Web Caída y Muchos Errores

---

## 🔧 Paso 1: Verificar que el Backend Esté Funcionando

### 1.1 Verificar URL del Backend

La URL actual hardcodeada es:
```
https://perceptive-nourishment-production-e92a.up.railway.app/api
```

**Verifica si esta URL es correcta:**

1. En Railway, ve al servicio **backend**
2. Ve a **"Settings"** → **"Networking"** o **"Domains"**
3. Copia la URL que aparece allí

Si la URL es diferente, necesitas actualizar el código del frontend.

### 1.2 Probar el Backend Directamente

Abre en tu navegador:
```
https://perceptive-nourishment-production-e92a.up.railway.app/health
```

Deberías ver:
```json
{"status": "healthy"}
```

Si ves un error:
- El backend está caído → Ve al Paso 2
- La URL es incorrecta → Actualiza la URL en el código

---

## 🔧 Paso 2: Verificar Estado del Backend en Railway

### 2.1 Revisar Logs del Backend

1. En Railway, ve al servicio **backend**
2. Ve a **"Deployments"** → Click en el deployment más reciente
3. Ve a **"Logs"**
4. Busca errores como:
   - `DATABASE_URL`
   - `Port already in use`
   - `Module not found`
   - `Connection refused`
   - `Failed to start`

### 2.2 Verificar Variables de Entorno del Backend

1. En el servicio **backend** → **"Variables"**
2. Verifica que existan:
   - ✅ `DATABASE_URL` (Railway la crea automáticamente para PostgreSQL)
   - ✅ `SECRET_KEY` (si usas autenticación JWT)
   - ✅ `PORT` (Railway la asigna automáticamente, NO la configures manualmente)

Si falta `DATABASE_URL`:
- Ve al servicio **PostgreSQL** → **"Variables"**
- Copia la `DATABASE_URL` completa
- Agrégalo al servicio backend

Si falta `SECRET_KEY`:
- Genera uno: `openssl rand -hex 32`
- Agrégala como variable de entorno

---

## 🔧 Paso 3: Verificar Configuración de Inicio del Backend

El backend debe usar `$PORT` (no `3026`) en Railway.

### Verificar que Exista `railway_start.sh`

El archivo `backend/railway_start.sh` debe contener:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Verificar `Procfile`

El archivo `backend/Procfile` debe contener:
```
web: bash railway_start.sh
```

O directamente:
```
web: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🔧 Paso 4: Verificar el Frontend

### 4.1 Revisar Logs del Frontend

1. En Railway, ve al servicio **frontend**
2. Ve a **"Deployments"** → Click en el deployment más reciente
3. Ve a **"Logs"**
4. Busca errores como:
   - `VITE_API_URL`
   - `Cannot connect`
   - `Build failed`
   - `Module not found`

### 4.2 Verificar Build del Frontend

Si el build falla:
- Verifica que `package.json` exista
- Verifica que todas las dependencias estén listadas
- Verifica que no haya errores de sintaxis en TypeScript

---

## 🔧 Paso 5: Configurar Variable de Entorno en Frontend

### Opción 1: Usar Variable de Entorno (Recomendado)

1. En el servicio **frontend** → **"Variables"** → **"+ New Variable"**
2. Agrega:
   - **Nombre**: `VITE_API_URL`
   - **Valor**: `https://url-tu-backend.up.railway.app/api`
3. **Guarda**

Railway redeployará automáticamente.

### Opción 2: Actualizar URL Hardcodeada (Temporal)

Si no quieres usar variables de entorno, actualiza la URL en:
```
frontend/src/services/api.ts
```

Línea 30, cambia:
```typescript
const url = 'https://perceptive-nourishment-production-e92a.up.railway.app/api'
```

Por la URL correcta de tu backend.

---

## 🆘 Errores Comunes y Soluciones

### Error: "Cannot connect to backend server"

**Causa**: El frontend no puede alcanzar el backend.

**Solución**:
1. Verifica que el backend esté funcionando (Paso 1)
2. Verifica que la URL del backend sea correcta
3. Configura `VITE_API_URL` en el frontend

---

### Error: "DATABASE_URL not found"

**Causa**: El backend no tiene la URL de PostgreSQL.

**Solución**:
1. Ve al servicio PostgreSQL → **"Variables"**
2. Copia `DATABASE_URL`
3. Ve al servicio backend → **"Variables"** → Agrégala

---

### Error: "Port already in use" o "Address already in use"

**Causa**: El backend está intentando usar un puerto fijo en lugar de `$PORT`.

**Solución**:
1. Verifica que `railway_start.sh` use `$PORT` (no `3026`)
2. Verifica que `Procfile` apunte a `railway_start.sh`
3. O configura el Start Command directamente en Railway:
   ```
   python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

---

### Error: "Build failed" en Frontend

**Causa**: Errores en el código o dependencias faltantes.

**Solución**:
1. Revisa los logs del build
2. Verifica que `package.json` tenga todas las dependencias
3. Ejecuta `npm install` localmente y sube los cambios

---

### Error: CORS

**Causa**: El backend no permite requests del frontend.

**Solución**:
1. En el backend, agrega variable de entorno:
   - `CORS_ORIGINS` = `https://url-tu-frontend.up.railway.app,https://*.up.railway.app`
2. O modifica `main.py` para permitir todos los orígenes en Railway

---

## 📋 Checklist de Verificación

### Backend
- [ ] Backend responde en `/health`
- [ ] Variable `DATABASE_URL` configurada
- [ ] Variable `SECRET_KEY` configurada (si usas auth)
- [ ] `railway_start.sh` usa `$PORT`
- [ ] `Procfile` existe y está correcto
- [ ] Logs del backend no muestran errores

### Frontend
- [ ] Build del frontend exitoso
- [ ] Variable `VITE_API_URL` configurada (o URL hardcodeada correcta)
- [ ] Logs del frontend no muestran errores
- [ ] Frontend puede conectarse al backend

### Base de Datos
- [ ] Servicio PostgreSQL existe
- [ ] Variable `DATABASE_URL` se crea automáticamente
- [ ] Tablas se crean correctamente

---

## 🎯 Acciones Inmediatas

1. **Verifica la URL del backend** en Railway → Settings → Networking
2. **Prueba el backend** directamente en el navegador: `/health`
3. **Revisa los logs** de ambos servicios (backend y frontend)
4. **Configura `VITE_API_URL`** en el frontend con la URL correcta del backend
5. **Verifica que `DATABASE_URL`** esté configurada en el backend

---

## 💡 Información Necesaria

Para ayudarte mejor, necesito saber:

1. **¿Cuál es la URL del backend** que aparece en Railway? (Settings → Networking)
2. **¿Qué errores ves en los logs** del backend?
3. **¿Qué errores ves en los logs** del frontend?
4. **¿El backend responde** cuando visitas `/health` directamente?

Con esta información puedo darte una solución exacta.
