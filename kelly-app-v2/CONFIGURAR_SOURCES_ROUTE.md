# 🎯 Configurar desde "Sources" y "Route"

## ✅ Perfecto - Estás en la Pantalla Correcta

Si ves **"Sources"** y **"Route"**, estás en la configuración correcta. Vamos a configurar desde ahí.

---

## 🎯 Paso 1: Configurar Source (Fuente)

### 1.1 Agregar Source del Backend

1. Busca la sección **"Sources"** o **"Add Source"**
2. Click en **"Add Source"** o el botón **"+"**

Configura:

**Type:**
```
GitHub
```

**Repository:**
```
rabermudezg13/NewKellyApp2026
```

**Branch:**
```
main
```

**Source Directory (si aparece):**
```
backend
```

O si no aparece Source Directory, lo configurarás después en el componente.

### 1.2 Guardar Source

Click en **"Save"** o **"Done"**

---

## 🎯 Paso 2: Agregar Componente Backend

### 2.1 Agregar Web Service

1. Busca **"Add Component"** o **"Add Service"** o **"Components"**
2. Click en **"Add Component"**
3. Selecciona **"Web Service"**

### 2.2 Configurar Backend

**Name:**
```
backend
```

**Source:**
Selecciona el source que acabas de crear (o el repositorio)

**Source Directory:**
```
backend
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

### 2.3 Configurar Route

En la sección **"Route"** o **"HTTP Routes"**:

**Path:**
```
/api
```

**Component:**
```
backend
```

---

## 🎯 Paso 3: Agregar Source del Frontend

### 3.1 Agregar Source (si es necesario)

Si necesitas agregar otro source:

1. Click en **"Add Source"** nuevamente
2. O usa el mismo source pero con diferente Source Directory

**Type:**
```
GitHub
```

**Repository:**
```
rabermudezg13/NewKellyApp2026
```

**Branch:**
```
main
```

**Source Directory:**
```
frontend
```

### 3.2 Agregar Componente Frontend

1. Click en **"Add Component"**
2. Selecciona **"Static Site"**

**Name:**
```
frontend
```

**Source:**
Selecciona el source (puede ser el mismo)

**Source Directory:**
```
frontend
```

**Build Command:**
```
npm ci && npm run build
```

**Output Directory:**
```
dist
```

### 3.3 Configurar Route

**Path:**
```
/
```

**Component:**
```
frontend
```

---

## 🎯 Paso 4: Agregar Base de Datos

### 4.1 Agregar Database

1. Busca **"Add Resource"** o **"Add Database"** o **"Databases"**
2. Click en él
3. Selecciona **"PostgreSQL"**

**Name:**
```
db
```

**Engine:**
```
PostgreSQL
```

**Version:**
```
15
```

**Plan:**
```
Basic
```

**Database Name:**
```
kelly_app
```

**Database User:**
```
kelly_app_user
```

---

## 🎯 Paso 5: Variables de Entorno

### 5.1 Variables del Backend

1. **Click en el componente "backend"** para editarlo
2. Busca **"Environment Variables"** o **"Variables"**
3. Click en **"Add Variable"**

Agrega estas variables:

**Variable 1:**
- Key: `PYTHONUNBUFFERED`
- Value: `1`
- Scope: `Run Time`

**Variable 2:**
- Key: `SECRET_KEY`
- Value: `88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df`
- Scope: `Run Time`
- Type: `Secret` ✓

**Variable 3:**
- Key: `ALGORITHM`
- Value: `HS256`
- Scope: `Run Time`

**Variable 4:**
- Key: `ACCESS_TOKEN_EXPIRE_MINUTES`
- Value: `43200`
- Scope: `Run Time`

**Variable 5:**
- Key: `DATABASE_URL`
- Value: `${db.DATABASE_URL}`
- Scope: `Run Time`

**Variable 6:**
- Key: `CORS_ORIGINS`
- Value: `${frontend.PUBLIC_URL}`
- Scope: `Run Time`

### 5.2 Variables del Frontend

1. **Click en el componente "frontend"**
2. Busca **"Environment Variables"**
3. Click en **"Add Variable"**

**Variable:**
- Key: `VITE_API_URL`
- Value: `${backend.PUBLIC_URL}/api`
- Scope: `Build Time`

---

## 🎯 Paso 6: Deploy

### 6.1 Verificar

Antes de hacer deploy, verifica:

- [ ] Source configurado
- [ ] Backend agregado con Source Directory: `backend`
- [ ] Frontend agregado con Source Directory: `frontend`
- [ ] Base de datos agregada
- [ ] Variables de entorno configuradas
- [ ] Routes configuradas

### 6.2 Hacer Deploy

1. Busca el botón **"Create Resources"** o **"Deploy"** o **"Save"**
2. Click en él
3. Confirma si te pide

---

## 📸 Visualización

La pantalla debería verse así:

```
┌─────────────────────────────────────────┐
│ Sources                                  │
│ ┌─────────────────────────────────────┐ │
│ │ GitHub                              │ │
│ │ rabermudezg13/NewKellyApp2026       │ │
│ │ Branch: main                        │ │
│ └─────────────────────────────────────┘ │
│ [+ Add Source]                           │
│                                          │
│ Components                               │
│ ┌─────────────────────────────────────┐ │
│ │ backend (Web Service)               │ │
│ │ Source: [GitHub source ▼]          │ │
│ │ Source Directory: backend          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ frontend (Static Site)              │ │
│ │ Source: [GitHub source ▼]          │ │
│ │ Source Directory: frontend         │ │
│ └─────────────────────────────────────┘ │
│ [+ Add Component]                        │
│                                          │
│ Routes                                   │
│ /api → backend                           │
│ / → frontend                             │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Source agregado (GitHub: rabermudezg13/NewKellyApp2026)
- [ ] Backend agregado con Source Directory: `backend`
- [ ] Frontend agregado con Source Directory: `frontend`
- [ ] Base de datos PostgreSQL agregada
- [ ] Variables de entorno configuradas
- [ ] Routes configuradas
- [ ] Click en "Create Resources"

---

¿Puedes ver la sección "Sources" y "Route"? Dime qué opciones ves y te ayudo a configurarlas.
