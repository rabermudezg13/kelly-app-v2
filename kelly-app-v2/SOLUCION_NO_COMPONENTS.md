# 🔧 Solución: "No components detected"

## ❌ Problema

App Platform muestra:
```
No components detected: Here are some things to check:
- Verify the repo contains supported file types...
- If your app isn't in the root, enter the source directory.
```

## ✅ Solución: Configurar Manualmente

Como tu app está en `new Kelly App/kelly-app-v2/`, necesitas configurar los componentes manualmente.

---

## 🎯 Paso 1: Configurar Backend Manualmente

### 1.1 Agregar Componente Backend

1. En la pantalla de App Platform, busca el botón **"Edit Plan"** o **"Add Component"**
2. Click en **"Add Component"** o **"Add Service"**
3. Selecciona **"Web Service"**

### 1.2 Configurar Backend

Completa estos campos:

**Source Directory:**
```
new Kelly App/kelly-app-v2/backend
```

**Build Command:**
```
pip install -r requirements.txt
```

**Run Command:**
```
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

**HTTP Port:**
```
8080
```

**Environment:**
```
Python
```

**Name:**
```
backend
```

### 1.3 Agregar Variables de Entorno del Backend

Click en **"Environment Variables"** o **"Variables"** y agrega:

```
PYTHONUNBUFFERED=1
SECRET_KEY=88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Nota**: `DATABASE_URL` se agregará después cuando crees la base de datos.

---

## 🎯 Paso 2: Configurar Frontend Manualmente

### 2.1 Agregar Componente Frontend

1. Click en **"Add Component"** nuevamente
2. Selecciona **"Static Site"**

### 2.2 Configurar Frontend

Completa estos campos:

**Source Directory:**
```
new Kelly App/kelly-app-v2/frontend
```

**Build Command:**
```
npm ci && npm run build
```

**Output Directory:**
```
dist
```

**Name:**
```
frontend
```

### 2.3 Agregar Variable de Entorno del Frontend

Click en **"Environment Variables"** y agrega:

```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

**Scope**: `Build Time`

---

## 🎯 Paso 3: Agregar Base de Datos

### 3.1 Agregar Base de Datos

1. Click en **"Add Resource"** o **"Add Database"**
2. Selecciona **"PostgreSQL"**

### 3.2 Configurar Base de Datos

- **Version**: 15 (o la más reciente)
- **Plan**: Basic ($15/mes)
- **Database Name**: `kelly_app`
- **Database User**: `kelly_app_user`
- **Name**: `db`

### 3.3 Conectar Base de Datos al Backend

1. Ve a la configuración del **backend**
2. En **Environment Variables**, agrega:

```
DATABASE_URL=${db.DATABASE_URL}
```

**Scope**: `Run Time`

---

## 🎯 Paso 4: Configurar CORS

1. Ve a la configuración del **backend**
2. En **Environment Variables**, agrega o actualiza:

```
CORS_ORIGINS=${frontend.PUBLIC_URL}
```

**Scope**: `Run Time`

---

## 🎯 Paso 5: Configurar Rutas

### 5.1 Rutas del Backend

En la configuración del backend, busca **"Routes"** o **"HTTP Routes"**:

- **Path**: `/api`
- **Component**: `backend`

### 5.2 Rutas del Frontend

En la configuración del frontend, busca **"Routes"**:

- **Path**: `/`
- **Component**: `frontend`

---

## 📋 Resumen de Configuración

### Backend (Web Service)
```
Source Directory: new Kelly App/kelly-app-v2/backend
Build Command: pip install -r requirements.txt
Run Command: python -m uvicorn main:app --host 0.0.0.0 --port 8080
HTTP Port: 8080
Environment: Python
Name: backend

Variables:
- PYTHONUNBUFFERED=1
- SECRET_KEY=88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
- ALGORITHM=HS256
- ACCESS_TOKEN_EXPIRE_MINUTES=43200
- DATABASE_URL=${db.DATABASE_URL}
- CORS_ORIGINS=${frontend.PUBLIC_URL}

Route: /api → backend
```

### Frontend (Static Site)
```
Source Directory: new Kelly App/kelly-app-v2/frontend
Build Command: npm ci && npm run build
Output Directory: dist
Name: frontend

Variables:
- VITE_API_URL=${backend.PUBLIC_URL}/api

Route: / → frontend
```

### Base de Datos (PostgreSQL)
```
Engine: PostgreSQL
Version: 15
Plan: Basic ($15/mes)
Database Name: kelly_app
Database User: kelly_app_user
Name: db
```

---

## ✅ Checklist Final

- [ ] Backend configurado con source directory correcto
- [ ] Frontend configurado con source directory correcto
- [ ] Base de datos PostgreSQL agregada
- [ ] Variables de entorno del backend configuradas
- [ ] Variable de entorno del frontend configurada
- [ ] Rutas configuradas
- [ ] Click en **"Create Resources"** o **"Save"**

---

## 🆘 Si aún no funciona

### Verificar que los archivos estén en GitHub

1. Ve a: https://github.com/rabermudezg13/KellyApp2026
2. Verifica que veas:
   - `new Kelly App/kelly-app-v2/backend/requirements.txt`
   - `new Kelly App/kelly-app-v2/frontend/package.json`

### Verificar permisos

1. En App Platform, verifica que tengas acceso al repositorio
2. Si es privado, asegúrate de haber autorizado a DigitalOcean

### Alternativa: Mover archivos a la raíz

Si prefieres, puedes crear un branch donde los archivos estén en la raíz:

```bash
# Crear branch para deploy
git checkout -b deploy-simple

# Mover archivos (opcional, solo si quieres simplificar)
# Esto es opcional, mejor usa source directory
```

---

## 💡 Tip

Una vez configurado, App Platform recordará estas configuraciones. Los próximos deploys serán automáticos si usas `.do/app.yaml` o si mantienes la misma estructura.

---

¿Necesitas ayuda con algún paso específico?
