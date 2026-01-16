# 📝 Configuración Manual en App Platform

## 🎯 Cuando App Platform no detecta componentes automáticamente

Si ves el mensaje "No components detected", sigue estos pasos para configurar manualmente.

---

## 🔧 Paso a Paso

### 1. Agregar Backend (Web Service)

1. Click en **"Edit Plan"** o **"Add Component"**
2. Selecciona **"Web Service"** o **"Add Service"**

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Name** | `backend` |
| **Source Directory** | `new Kelly App/kelly-app-v2/backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Run Command** | `python -m uvicorn main:app --host 0.0.0.0 --port 8080` |
| **HTTP Port** | `8080` |
| **Environment** | `Python` |

**Variables de Entorno:**
```
PYTHONUNBUFFERED=1
SECRET_KEY=88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Route:**
- Path: `/api`
- Component: `backend`

---

### 2. Agregar Frontend (Static Site)

1. Click en **"Add Component"** nuevamente
2. Selecciona **"Static Site"**

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Name** | `frontend` |
| **Source Directory** | `new Kelly App/kelly-app-v2/frontend` |
| **Build Command** | `npm ci && npm run build` |
| **Output Directory** | `dist` |

**Variables de Entorno:**
```
VITE_API_URL=${backend.PUBLIC_URL}/api
```
Scope: `Build Time`

**Route:**
- Path: `/`
- Component: `frontend`

---

### 3. Agregar Base de Datos PostgreSQL

1. Click en **"Add Resource"** o **"Add Database"**
2. Selecciona **"PostgreSQL"**

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Name** | `db` |
| **Engine** | `PostgreSQL` |
| **Version** | `15` |
| **Plan** | `Basic` ($15/mes) |
| **Database Name** | `kelly_app` |
| **Database User** | `kelly_app_user` |

**Después de crear la base de datos:**

Agrega esta variable al backend:
```
DATABASE_URL=${db.DATABASE_URL}
```
Scope: `Run Time`

---

### 4. Configurar CORS

En las variables de entorno del backend, agrega:
```
CORS_ORIGINS=${frontend.PUBLIC_URL}
```
Scope: `Run Time`

---

## 📸 Visualización de Campos

### Backend - Configuración Básica
```
┌─────────────────────────────────────────┐
│ Name: backend                           │
│                                         │
│ Source Directory:                      │
│ new Kelly App/kelly-app-v2/backend     │
│                                         │
│ Build Command:                         │
│ pip install -r requirements.txt        │
│                                         │
│ Run Command:                           │
│ python -m uvicorn main:app --host      │
│   0.0.0.0 --port 8080                  │
│                                         │
│ HTTP Port: 8080                        │
│                                         │
│ Environment: Python                   │
└─────────────────────────────────────────┘
```

### Frontend - Configuración Básica
```
┌─────────────────────────────────────────┐
│ Name: frontend                          │
│                                         │
│ Source Directory:                      │
│ new Kelly App/kelly-app-v2/frontend    │
│                                         │
│ Build Command:                         │
│ npm ci && npm run build                │
│                                         │
│ Output Directory:                      │
│ dist                                   │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist Completo

### Backend
- [ ] Componente agregado como "Web Service"
- [ ] Source Directory: `new Kelly App/kelly-app-v2/backend`
- [ ] Build Command configurado
- [ ] Run Command configurado
- [ ] HTTP Port: 8080
- [ ] Variables de entorno agregadas
- [ ] Route `/api` configurada

### Frontend
- [ ] Componente agregado como "Static Site"
- [ ] Source Directory: `new Kelly App/kelly-app-v2/frontend`
- [ ] Build Command configurado
- [ ] Output Directory: `dist`
- [ ] Variable VITE_API_URL configurada
- [ ] Route `/` configurada

### Base de Datos
- [ ] PostgreSQL agregado
- [ ] Plan seleccionado
- [ ] DATABASE_URL agregada al backend

### Final
- [ ] CORS_ORIGINS configurado
- [ ] Click en "Create Resources" o "Save"
- [ ] Esperar a que termine el deploy

---

## 🚀 Después del Deploy

1. Espera 5-10 minutos
2. Ve a **Runtime Logs** del backend para verificar
3. Prueba: `https://tu-app.ondigitalocean.app/api/health`
4. Prueba: `https://tu-app.ondigitalocean.app`

---

¿Necesitas ayuda con algún campo específico?
