# 🎯 Instrucciones Exactas - Configurar App Platform Manualmente

## ❌ El Error

App Platform muestra: "No components detected"

**Esto es NORMAL** - solo necesitas configurar manualmente.

---

## ✅ Solución: Configurar Manualmente

### PASO 1: Encontrar el Botón para Agregar Componentes

En la pantalla de App Platform que muestra "No components detected":

1. **Busca en la parte SUPERIOR** de la pantalla
2. Busca uno de estos botones/enlaces:
   - **"Edit Plan"** (botón azul o verde)
   - **"Configure"** 
   - **"Add Component"**
   - **"Skip detection"**
   - **"Configure manually"**

3. Si NO ves ningún botón:
   - **Scroll hacia abajo** en la página
   - Busca en el **menú lateral izquierdo**
   - Busca un enlace que diga **"Continue"** o **"Next"**

### PASO 2: Click en "Edit Plan" o "Configure"

1. **Click en "Edit Plan"** o el botón que encuentres
2. Esto te llevará a la pantalla de configuración

### PASO 3: Agregar Backend (Web Service)

#### 3.1 Agregar el Componente

1. Busca el botón **"Add Component"** o **"Add Service"**
2. Click en él
3. Selecciona **"Web Service"** del dropdown

#### 3.2 Llenar los Campos del Backend

**IMPORTANTE**: Copia y pega EXACTAMENTE estos valores:

**Name:**
```
backend
```

**Source Directory:**
```
backend
```

**⚠️ NOTA**: Si tu código está directamente en la raíz del repositorio, usa `backend`. Si está en un subdirectorio, usa la ruta completa.

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
Selecciona: **Python**

#### 3.3 Configurar Route

Busca la sección **"HTTP Routes"** o **"Routes"**:

- **Path**: `/api`
- **Component**: `backend`

#### 3.4 Guardar Backend

Click en **"Save"** o **"Done"**

---

### PASO 4: Agregar Frontend (Static Site)

#### 4.1 Agregar el Componente

1. Click en **"Add Component"** nuevamente
2. Selecciona **"Static Site"**

#### 4.2 Llenar los Campos del Frontend

**Name:**
```
frontend
```

**Source Directory:**
```
frontend
```

**⚠️ NOTA**: Si tu código está directamente en la raíz, usa `frontend`. Si está en subdirectorio, usa la ruta completa.

**Build Command:**
```
npm ci && npm run build
```

**Output Directory:**
```
dist
```

#### 4.3 Configurar Route

- **Path**: `/`
- **Component**: `frontend`

#### 4.4 Guardar Frontend

Click en **"Save"** o **"Done"**

---

### PASO 5: Agregar Base de Datos

#### 5.1 Agregar Database

1. Busca **"Add Resource"** o **"Add Database"**
2. Click en él
3. Selecciona **"PostgreSQL"**

#### 5.2 Configurar Database

**Name:**
```
db
```

**Engine:**
```
PostgreSQL
```

**Version:**
Selecciona: **15**

**Plan:**
Selecciona: **Basic** ($15/mes)

**Database Name:**
```
kelly_app
```

**Database User:**
```
kelly_app_user
```

#### 5.3 Guardar Database

Click en **"Save"** o **"Done"**

---

### PASO 6: Agregar Variables de Entorno

#### 6.1 Variables del Backend

1. **Click en el componente "backend"** para editarlo
2. Busca **"Environment Variables"** o **"Variables"**
3. Click en **"Add Variable"** o el botón **"+"**

Agrega estas variables **una por una**:

**Variable 1:**
- Key: `PYTHONUNBUFFERED`
- Value: `1`
- Scope: `Run Time`

**Variable 2:**
- Key: `SECRET_KEY`
- Value: `88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df`
- Scope: `Run Time`
- Type: `Secret` (marca esta opción)

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

#### 6.2 Variables del Frontend

1. **Click en el componente "frontend"**
2. Busca **"Environment Variables"**
3. Click en **"Add Variable"**

**Variable:**
- Key: `VITE_API_URL`
- Value: `${backend.PUBLIC_URL}/api`
- Scope: `Build Time`

---

### PASO 7: Verificar y Deploy

#### 7.1 Verificar Configuración

Antes de hacer deploy, verifica:

- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos agregada
- [ ] Variables de entorno configuradas
- [ ] Rutas configuradas

#### 7.2 Hacer Deploy

1. Busca el botón **"Create Resources"** o **"Deploy"** o **"Save"**
2. Click en él
3. Confirma si te pide confirmación

#### 7.3 Esperar

- El deploy tomará **5-10 minutos**
- Verás logs de construcción
- Espera a que termine

---

## 🔍 Si NO Encuentras el Botón "Add Component"

### Opción 1: Buscar "Edit Plan"

1. En la parte superior de la pantalla
2. Busca un botón que diga **"Edit Plan"**
3. Click en él

### Opción 2: Buscar en el Menú

1. Busca un menú lateral o panel
2. Puede haber una sección **"Components"** o **"Services"**

### Opción 3: Click en "Continue" o "Next"

1. Si hay un botón **"Continue"** o **"Next"**
2. Click en él
3. Te llevará a la configuración

### Opción 4: Buscar "Skip Detection"

1. Si hay un enlace que diga **"Skip detection"** o **"Configure manually"**
2. Click en él

---

## 📸 ¿Qué Deberías Ver?

Después de hacer click en "Edit Plan" o "Configure", deberías ver una pantalla con:

- Una lista de componentes (vacía al inicio)
- Un botón **"Add Component"** o **"Add Service"**
- Opciones para configurar cada componente

---

## 🆘 Si Aún No Funciona

**Dime exactamente qué ves en la pantalla:**

1. ¿Qué botones o enlaces ves?
2. ¿Hay algún menú o panel lateral?
3. ¿Qué texto aparece en la pantalla?
4. ¿Hay algún botón de "Continue" o "Next"?

Con esa información puedo darte instrucciones más específicas.

---

## ✅ Checklist Final

- [ ] Encontré el botón "Edit Plan" o "Configure"
- [ ] Agregué el backend con source directory correcto
- [ ] Agregué el frontend con source directory correcto
- [ ] Agregué la base de datos PostgreSQL
- [ ] Configuré las 6 variables del backend
- [ ] Configuré la 1 variable del frontend
- [ ] Configuré las rutas
- [ ] Click en "Create Resources"
- [ ] Deploy iniciado

---

¿Puedes ver algún botón o enlace en la pantalla? Dime qué ves y te ayudo a encontrarlo.
