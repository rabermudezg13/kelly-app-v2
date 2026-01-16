# 🚀 Guía Completa Paso a Paso - Deploy en DigitalOcean App Platform

## 📋 Índice

1. [Paso 0: Preparación](#paso-0-preparación)
2. [Paso 1: Crear Cuenta en DigitalOcean](#paso-1-crear-cuenta-en-digitalocean)
3. [Paso 2: Subir Código a GitHub](#paso-2-subir-código-a-github)
4. [Paso 3: Crear App en App Platform](#paso-3-crear-app-en-app-platform)
5. [Paso 4: Configurar Backend](#paso-4-configurar-backend)
6. [Paso 5: Configurar Frontend](#paso-5-configurar-frontend)
7. [Paso 6: Agregar Base de Datos](#paso-6-agregar-base-de-datos)
8. [Paso 7: Configurar Variables de Entorno](#paso-7-configurar-variables-de-entorno)
9. [Paso 8: Deploy y Verificación](#paso-8-deploy-y-verificación)

---

## 🎯 Paso 0: Preparación

### 0.1 Verificar que tienes todo listo

Antes de empezar, asegúrate de tener:

- [x] Cuenta de GitHub (ya tienes: `rabermudezg13`)
- [x] Repositorio en GitHub (ya tienes: `KellyApp2026`)
- [ ] Cuenta en DigitalOcean (la crearemos)
- [ ] Código listo para subir

### 0.2 Verificar estructura del código

Tu código debe estar en:
```
kelly-app-v2/
├── backend/
│   ├── requirements.txt  ← Debe tener psycopg2-binary
│   ├── main.py
│   └── ...
├── frontend/
│   ├── package.json
│   └── ...
└── .do/
    └── app.yaml  ← Configuración (opcional)
```

### 0.3 Generar SECRET_KEY

Abre tu terminal y ejecuta:

```bash
openssl rand -hex 32
```

**Copia el resultado** - lo necesitarás más adelante.

**Ejemplo de resultado:**
```
88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
```

**Guarda esta clave en un lugar seguro** (notas, documento de texto, etc.)

---

## 🎯 Paso 1: Crear Cuenta en DigitalOcean

### 1.1 Ir a DigitalOcean

1. Abre tu navegador
2. Ve a: https://cloud.digitalocean.com
3. Click en **"Sign Up"** o **"Create Account"**

### 1.2 Registrarse

1. Ingresa tu **email**
2. Crea una **contraseña**
3. Verifica tu email si es necesario
4. Completa el perfil (opcional)

### 1.3 Agregar Método de Pago

1. Ve a **Settings** > **Billing**
2. Click en **"Add Payment Method"**
3. Agrega tu tarjeta de crédito o PayPal
4. **No te preocupes** - no se cobrará nada hasta que uses recursos

**Nota**: DigitalOcean te da $200 de crédito gratis por 60 días para nuevos usuarios.

### 1.4 Verificar Cuenta

Una vez que tengas la cuenta creada y verificada, continúa al siguiente paso.

---

## 🎯 Paso 2: Subir Código a GitHub

### 2.1 Abrir Terminal

Abre la terminal en tu Mac (Terminal.app o iTerm).

### 2.2 Navegar al Proyecto

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
```

### 2.3 Verificar Estado de Git

```bash
git status
```

Deberías ver una lista de archivos modificados o nuevos.

### 2.4 Agregar Archivos

```bash
git add .
```

Esto agrega todos los archivos nuevos y modificados.

### 2.5 Hacer Commit

```bash
git commit -m "Prepare for DigitalOcean App Platform deployment

- Add PostgreSQL support
- Add App Platform configuration
- Add deployment documentation"
```

### 2.6 Subir a GitHub

```bash
git push origin main
```

Si te pide credenciales:
- Username: `rabermudezg13`
- Password: Usa un **Personal Access Token** (no tu contraseña de GitHub)

**Si no tienes Personal Access Token:**
1. Ve a GitHub.com
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. Generate new token
4. Selecciona permisos: `repo`
5. Copia el token y úsalo como password

### 2.7 Verificar en GitHub

1. Ve a: https://github.com/rabermudezg13/KellyApp2026
2. Verifica que veas:
   - ✅ `new Kelly App/kelly-app-v2/backend/`
   - ✅ `new Kelly App/kelly-app-v2/frontend/`
   - ✅ `.do/app.yaml` (si lo creaste)

---

## 🎯 Paso 3: Crear App en App Platform

### 3.1 Acceder a App Platform

1. Ve a: https://cloud.digitalocean.com
2. En el menú lateral izquierdo, busca **"App Platform"**
3. Click en **"App Platform"**

### 3.2 Crear Nueva App

1. Click en el botón **"Create App"** (arriba a la derecha, verde)

### 3.3 Conectar GitHub

1. Selecciona **"GitHub"** como fuente
2. Si es la primera vez, te pedirá autorizar DigitalOcean
   - Click en **"Authorize DigitalOcean"**
   - Selecciona los permisos necesarios
   - Click en **"Authorize"**
3. Busca tu repositorio: `rabermudezg13/KellyApp2026`
4. Selecciona el repositorio
5. Selecciona branch: `main`
6. Click en **"Next"**

### 3.4 Ver Pantalla de Configuración

Ahora deberías ver una pantalla que dice:
- **"No components detected"** o
- Una pantalla para configurar componentes

**Si ves "No components detected"** → Continúa con el Paso 4 (Configuración Manual)

**Si detecta componentes automáticamente** → Revisa la configuración y ajusta según sea necesario

---

## 🎯 Paso 4: Configurar Backend

### 4.1 Agregar Componente Backend

1. En la pantalla de configuración, busca el botón **"Edit Plan"** o **"Add Component"**
2. Click en **"Add Component"** o **"Add Service"**
3. Selecciona **"Web Service"**

### 4.2 Configurar Campos del Backend

Completa estos campos **exactamente** como se muestra:

#### Name
```
backend
```

#### Source Directory
```
new Kelly App/kelly-app-v2/backend
```

**⚠️ IMPORTANTE**: Este es el campo más importante. Debe ser exactamente esta ruta.

#### Build Command
```
pip install -r requirements.txt
```

#### Run Command
```
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

#### HTTP Port
```
8080
```

#### Environment
Selecciona: **Python**

### 4.3 Configurar Route del Backend

Busca la sección **"HTTP Routes"** o **"Routes"**:

- **Path**: `/api`
- **Component**: `backend` (debería seleccionarse automáticamente)

### 4.4 Guardar Backend

Click en **"Save"** o **"Done"** si hay un botón.

---

## 🎯 Paso 5: Configurar Frontend

### 5.1 Agregar Componente Frontend

1. Click en **"Add Component"** nuevamente
2. Selecciona **"Static Site"**

### 5.2 Configurar Campos del Frontend

Completa estos campos:

#### Name
```
frontend
```

#### Source Directory
```
new Kelly App/kelly-app-v2/frontend
```

**⚠️ IMPORTANTE**: Debe ser exactamente esta ruta.

#### Build Command
```
npm ci && npm run build
```

#### Output Directory
```
dist
```

### 5.3 Configurar Route del Frontend

Busca la sección **"HTTP Routes"** o **"Routes"**:

- **Path**: `/`
- **Component**: `frontend` (debería seleccionarse automáticamente)

### 5.4 Guardar Frontend

Click en **"Save"** o **"Done"**.

---

## 🎯 Paso 6: Agregar Base de Datos

### 6.1 Agregar Base de Datos

1. Busca el botón **"Add Resource"** o **"Add Database"**
2. Click en él
3. Selecciona **"PostgreSQL"**

### 6.2 Configurar Base de Datos

Completa estos campos:

#### Name
```
db
```

#### Engine
```
PostgreSQL
```

#### Version
Selecciona: **15** (o la más reciente disponible)

#### Plan
Selecciona: **Basic** ($15/mes)
- 1GB RAM
- 10GB storage
- 1 vCPU

#### Database Name
```
kelly_app
```

#### Database User
```
kelly_app_user
```

### 6.3 Guardar Base de Datos

Click en **"Save"** o **"Done"**.

---

## 🎯 Paso 7: Configurar Variables de Entorno

### 7.1 Variables del Backend

1. Ve a la configuración del **backend** (click en él)
2. Busca la sección **"Environment Variables"** o **"Variables"**
3. Click en **"Add Variable"** o **"+"**

Agrega estas variables **una por una**:

#### Variable 1: PYTHONUNBUFFERED
```
Key: PYTHONUNBUFFERED
Value: 1
Scope: Run Time
```

#### Variable 2: SECRET_KEY
```
Key: SECRET_KEY
Value: [PEGA AQUÍ LA CLAVE QUE GENERASTE EN EL PASO 0.3]
Scope: Run Time
Type: Secret (marca esta opción si está disponible)
```

**Ejemplo:**
```
Key: SECRET_KEY
Value: 88b0d5c8b20890da700df12be7242042addd658b751e6907dae65916824356df
Scope: Run Time
Type: Secret ✓
```

#### Variable 3: ALGORITHM
```
Key: ALGORITHM
Value: HS256
Scope: Run Time
```

#### Variable 4: ACCESS_TOKEN_EXPIRE_MINUTES
```
Key: ACCESS_TOKEN_EXPIRE_MINUTES
Value: 43200
Scope: Run Time
```

#### Variable 5: DATABASE_URL
```
Key: DATABASE_URL
Value: ${db.DATABASE_URL}
Scope: Run Time
```

**Nota**: `${db.DATABASE_URL}` es una variable especial que App Platform inyecta automáticamente.

#### Variable 6: CORS_ORIGINS
```
Key: CORS_ORIGINS
Value: ${frontend.PUBLIC_URL}
Scope: Run Time
```

**Nota**: `${frontend.PUBLIC_URL}` se inyecta automáticamente.

### 7.2 Variables del Frontend

1. Ve a la configuración del **frontend**
2. Busca **"Environment Variables"**
3. Click en **"Add Variable"**

#### Variable: VITE_API_URL
```
Key: VITE_API_URL
Value: ${backend.PUBLIC_URL}/api
Scope: Build Time
```

**Nota**: `${backend.PUBLIC_URL}` se inyecta automáticamente.

### 7.3 Verificar Variables

Asegúrate de que todas las variables estén configuradas:

**Backend:**
- ✅ PYTHONUNBUFFERED = 1
- ✅ SECRET_KEY = (tu clave)
- ✅ ALGORITHM = HS256
- ✅ ACCESS_TOKEN_EXPIRE_MINUTES = 43200
- ✅ DATABASE_URL = ${db.DATABASE_URL}
- ✅ CORS_ORIGINS = ${frontend.PUBLIC_URL}

**Frontend:**
- ✅ VITE_API_URL = ${backend.PUBLIC_URL}/api

---

## 🎯 Paso 8: Deploy y Verificación

### 8.1 Revisar Configuración

Antes de hacer deploy, revisa:

1. **Backend configurado** con source directory correcto
2. **Frontend configurado** con source directory correcto
3. **Base de datos** agregada
4. **Variables de entorno** configuradas
5. **Rutas** configuradas

### 8.2 Crear Recursos

1. Busca el botón **"Create Resources"** o **"Deploy"**
2. Click en él
3. Confirma si te pide confirmación

### 8.3 Esperar el Deploy

1. Verás una pantalla de progreso
2. El proceso tomará **5-10 minutos**
3. Verás logs de construcción (build logs)

**Fases del Deploy:**
1. **Building** - Construyendo los componentes
2. **Deploying** - Desplegando la aplicación
3. **Live** - Aplicación en vivo

### 8.4 Verificar Deploy

#### 8.4.1 Verificar Backend

1. Ve a la sección del **backend**
2. Click en **"Runtime Logs"**
3. Verifica que no haya errores
4. Deberías ver mensajes como:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8080
   INFO:     Application startup complete.
   ```

#### 8.4.2 Probar Backend

1. Ve a la URL de tu app (algo como: `https://tu-app-xxxxx.ondigitalocean.app`)
2. Agrega `/api/health` al final
3. Deberías ver una respuesta JSON

**Ejemplo:**
```
https://kelly-app-abc123.ondigitalocean.app/api/health
```

#### 8.4.3 Probar Frontend

1. Ve a la URL de tu app (sin `/api`)
2. Deberías ver la página de inicio de tu aplicación

**Ejemplo:**
```
https://kelly-app-abc123.ondigitalocean.app
```

### 8.5 Verificar Base de Datos

1. Ve a la sección de la **base de datos**
2. Click en **"Connection Details"**
3. Verifica que la información esté disponible
4. El backend debería conectarse automáticamente

---

## ✅ Checklist Final

### Antes del Deploy
- [ ] Cuenta de DigitalOcean creada
- [ ] Código subido a GitHub
- [ ] SECRET_KEY generada y guardada
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos agregada
- [ ] Variables de entorno configuradas

### Después del Deploy
- [ ] Deploy completado sin errores
- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] Puedes hacer login
- [ ] Base de datos funciona

---

## 🆘 Solución de Problemas

### Error: "Build failed"

**Causa**: Error en el build del backend o frontend

**Solución**:
1. Ve a **Build Logs** del componente que falló
2. Revisa los errores
3. Verifica que:
   - `requirements.txt` tenga `psycopg2-binary`
   - `package.json` esté correcto
   - Source directory sea correcto

### Error: "Runtime error"

**Causa**: Error al iniciar la aplicación

**Solución**:
1. Ve a **Runtime Logs** del backend
2. Revisa los errores
3. Verifica variables de entorno
4. Verifica que `DATABASE_URL` esté configurada

### Error: "Frontend no carga"

**Causa**: Error en el build o configuración del frontend

**Solución**:
1. Verifica **Build Logs** del frontend
2. Verifica que `VITE_API_URL` esté correcta
3. Abre consola del navegador (F12) para ver errores

### Error: "Database connection failed"

**Causa**: `DATABASE_URL` no configurada o incorrecta

**Solución**:
1. Verifica que `DATABASE_URL=${db.DATABASE_URL}` esté en el backend
2. Verifica que la base de datos esté creada
3. Verifica **Connection Details** de la base de datos

---

## 📚 Recursos Adicionales

- **Documentación de App Platform**: https://docs.digitalocean.com/products/app-platform/
- **Soporte de DigitalOcean**: https://www.digitalocean.com/support

---

## 💰 Costos

- **Backend**: $5/mes (Basic XXS)
- **Frontend**: $0/mes (gratis)
- **PostgreSQL**: $15/mes (Basic)
- **Total**: ~$20/mes

**Nota**: Con el crédito de $200, tendrás aproximadamente 10 meses gratis.

---

¡Listo! Sigue estos pasos y tu aplicación estará en producción. 🚀

¿Tienes alguna duda en algún paso específico?
