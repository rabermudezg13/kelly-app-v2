# 📝 Pasos Rápidos - Sources y Route

## 🎯 Lo que Debes Hacer

### 1. Configurar Source

Si ves **"Sources"** o **"Add Source"**:

1. Click en **"Add Source"** o el botón **"+"**
2. Selecciona **"GitHub"**
3. Repository: `rabermudezg13/NewKellyApp2026`
4. Branch: `main`
5. Guarda

### 2. Agregar Backend

1. Click en **"Add Component"** o **"Add Service"**
2. Selecciona **"Web Service"**
3. Llena:
   - Name: `backend`
   - Source Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Run: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
   - Port: `8080`
   - Environment: `Python`

### 3. Agregar Frontend

1. Click en **"Add Component"**
2. Selecciona **"Static Site"**
3. Llena:
   - Name: `frontend`
   - Source Directory: `frontend`
   - Build: `npm ci && npm run build`
   - Output: `dist`

### 4. Configurar Route

En la sección **"Route"**:

- `/api` → `backend`
- `/` → `frontend`

### 5. Agregar Base de Datos

1. Click en **"Add Resource"** o **"Add Database"**
2. Selecciona **"PostgreSQL"**
3. Plan: `Basic`
4. Name: `db`

### 6. Variables de Entorno

**Backend:**
- `PYTHONUNBUFFERED=1`
- `SECRET_KEY=88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df`
- `ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=43200`
- `DATABASE_URL=${db.DATABASE_URL}`
- `CORS_ORIGINS=${frontend.PUBLIC_URL}`

**Frontend:**
- `VITE_API_URL=${backend.PUBLIC_URL}/api`

### 7. Deploy

Click en **"Create Resources"** o **"Deploy"**

---

¿Qué opciones específicas ves en "Sources" y "Route"?
