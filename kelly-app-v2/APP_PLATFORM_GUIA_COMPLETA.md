# 🚀 Guía Completa - DigitalOcean App Platform

## 📋 Resumen Ejecutivo

Esta guía te llevará paso a paso para desplegar Kelly App en **DigitalOcean App Platform** con **PostgreSQL** como base de datos.

**Costo estimado**: ~$20/mes
- Backend: $5/mes
- Frontend: $0/mes (gratis)
- PostgreSQL: $15/mes

---

## ✅ Paso 1: Preparar el Código

### 1.1 Verificar que tienes todo

Asegúrate de tener estos archivos en tu repositorio:

```
kelly-app-v2/
├── .do/
│   └── app.yaml          # Configuración de App Platform
├── backend/
│   ├── requirements.txt  # Con psycopg2-binary
│   ├── main.py
│   └── ...
└── frontend/
    ├── package.json
    ├── .env.production    # Opcional
    └── ...
```

### 1.2 Subir a GitHub

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Si no tienes git inicializado
git init
git add .
git commit -m "Prepare for App Platform deployment"

# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

## ✅ Paso 2: Crear App en DigitalOcean

### 2.1 Acceder a App Platform

1. Ve a https://cloud.digitalocean.com
2. Click en **App Platform** (menú lateral)
3. Click **Create App**

### 2.2 Conectar Repositorio

1. Selecciona **GitHub**
2. Autoriza DigitalOcean si es necesario
3. Busca y selecciona tu repositorio
4. Selecciona branch: `main`
5. Click **Next**

### 2.3 Configurar Componentes

App Platform puede detectar automáticamente o puedes configurar manualmente:

#### Backend (Web Service)

- **Name**: `backend`
- **Source Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
- **HTTP Port**: `8080`
- **Environment**: `Python`

#### Frontend (Static Site)

- **Name**: `frontend`
- **Source Directory**: `frontend`
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`

#### Base de Datos (PostgreSQL)

- **Name**: `db`
- **Engine**: PostgreSQL
- **Version**: 15
- **Plan**: Basic ($15/mes)
- **Database Name**: `kelly_app`
- **Database User**: `kelly_app_user`

### 2.4 Configurar Variables de Entorno

#### Backend Variables:

```
PYTHONUNBUFFERED=1
DATABASE_URL=${db.DATABASE_URL}
SECRET_KEY=tu-clave-secreta-muy-larga-genera-con-openssl-rand-hex-32
CORS_ORIGINS=${frontend.PUBLIC_URL}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Importante**: 
- `DATABASE_URL` se inyecta automáticamente desde la base de datos
- `CORS_ORIGINS` usa la URL del frontend automáticamente

#### Frontend Variables:

```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

### 2.5 Configurar Rutas

- **Backend**: `/api/*` → Backend service
- **Frontend**: `/*` → Frontend static site

### 2.6 Review y Deploy

1. Revisa toda la configuración
2. Click **Create Resources**
3. Espera a que termine el deploy (5-10 minutos)

---

## ✅ Paso 3: Verificar Deploy

### 3.1 Verificar Backend

1. Ve a tu App en DigitalOcean
2. Click en **backend** service
3. Ve a **Runtime Logs**
4. Verifica que no haya errores
5. Prueba: `https://tu-app.ondigitalocean.app/api/health`

### 3.2 Verificar Base de Datos

1. Ve a la base de datos en tu App
2. Click **Connection Details**
3. Verifica que el backend se conecte

### 3.3 Verificar Frontend

1. Ve a la URL de tu app
2. Debería cargar el frontend
3. Prueba hacer login

---

## ✅ Paso 4: Migrar Datos (Si tienes datos en SQLite)

### 4.1 Obtener DATABASE_URL

1. En tu App, ve a la base de datos
2. Click **Connection Details**
3. Copia la **Connection String**

### 4.2 Ejecutar Migración

```bash
# En tu máquina local
cd backend

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Ejecutar migración
python migrate_to_postgresql.py
```

---

## ✅ Paso 5: Configurar Dominio Personalizado

### 5.1 Agregar Dominio

1. En tu App, ve a **Settings** > **Domains**
2. Click **Add Domain**
3. Ingresa tu dominio (ej: `kellyapp.com`)

### 5.2 Configurar DNS

En tu proveedor de dominios:

- **CNAME**: `@` → `your-app.ondigitalocean.app`
- **CNAME**: `www` → `your-app.ondigitalocean.app`

### 5.3 SSL Automático

App Platform configurará SSL automáticamente cuando el dominio esté verificado.

### 5.4 Actualizar CORS

Actualiza `CORS_ORIGINS` en el backend:

```
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

---

## 🔧 Configuración Avanzada

### Health Checks

App Platform verificará automáticamente:
- Backend: `GET /health`
- Frontend: Disponibilidad del sitio

### Escalado

Para escalar el backend:

1. Ve a **Settings** > **App-Level Settings**
2. Ajusta **Instance Size**:
   - Basic XXS: $5/mes (512MB RAM)
   - Basic XS: $12/mes (1GB RAM)
   - Basic S: $24/mes (2GB RAM)
3. Ajusta **Instance Count** para múltiples instancias

### Backups

App Platform hace backups automáticos de la base de datos:
- **Frequency**: Diario
- **Retention**: 7 días (gratis)
- Puedes restaurar desde **Database** > **Backups**

---

## 📊 Monitoreo

### Logs

- **Backend Runtime Logs**: App > Backend > Runtime Logs
- **Backend Build Logs**: App > Backend > Build Logs
- **Frontend Build Logs**: App > Frontend > Build Logs
- **Database Logs**: App > Database > Logs

### Métricas

App Platform muestra:
- CPU usage
- Memory usage
- Request count
- Response time
- Database connections

---

## 🔄 Actualizar la Aplicación

### Deploy Automático

Si configuraste `deploy_on_push: true` en `.do/app.yaml`, cada push a `main` desplegará automáticamente.

### Deploy Manual

1. Ve a tu App
2. Click **Actions** > **Force Rebuild**
3. O desde terminal: `git commit --allow-empty -m "Trigger deploy" && git push`

---

## 🆘 Solución de Problemas

### Backend no inicia

**Síntomas**: Error en Runtime Logs

**Soluciones**:
1. Verifica **Build Logs** para errores de construcción
2. Verifica variables de entorno
3. Verifica que `DATABASE_URL` esté configurada
4. Verifica que el puerto sea `8080`

### Base de datos no conecta

**Síntomas**: Error de conexión en logs

**Soluciones**:
1. Verifica que `DATABASE_URL=${db.DATABASE_URL}` esté configurada
2. Verifica **Connection Details** de la base de datos
3. Verifica que el backend tenga acceso (debería ser automático)

### Frontend no carga

**Síntomas**: Página en blanco o errores

**Soluciones**:
1. Verifica **Build Logs** del frontend
2. Verifica que `VITE_API_URL` esté correcta
3. Abre consola del navegador (F12) para ver errores
4. Verifica que el build se completó exitosamente

### CORS errors

**Síntomas**: Errores de CORS en consola del navegador

**Soluciones**:
1. Verifica `CORS_ORIGINS` en el backend
2. Asegúrate de incluir la URL exacta del frontend
3. Reinicia el backend después de cambiar CORS

### Error 502 Bad Gateway

**Síntomas**: Error 502 al acceder a la app

**Soluciones**:
1. Verifica que el backend esté corriendo (Runtime Logs)
2. Verifica que el puerto sea `8080`
3. Verifica health check: `/health` debería responder

---

## 📝 Checklist Completo

### Antes del Deploy
- [ ] Código subido a GitHub
- [ ] `requirements.txt` incluye `psycopg2-binary`
- [ ] `.do/app.yaml` configurado (opcional)
- [ ] Variables de entorno preparadas

### Durante el Deploy
- [ ] App creada en App Platform
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas
- [ ] Rutas configuradas

### Después del Deploy
- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Base de datos funciona
- [ ] Datos migrados (si aplica)
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL activo

---

## 💡 Tips y Mejores Prácticas

1. **Staging Environment**: Crea un ambiente de staging con otro branch
2. **Environment Variables**: Usa variables de entorno para secrets
3. **Backups**: Configura backups automáticos de la base de datos
4. **Monitoring**: Revisa logs regularmente
5. **Updates**: Mantén las dependencias actualizadas
6. **Costs**: Monitorea el uso en **Billing**

---

## 📚 Archivos de Referencia

- `DEPLOY_APP_PLATFORM.md` - Guía detallada
- `.do/app.yaml` - Configuración de App Platform
- `backend/migrate_to_postgresql.py` - Script de migración

---

¿Necesitas ayuda con algún paso específico?
