# 🚀 Deploy en DigitalOcean App Platform con Base de Datos

## 📋 Resumen

Esta guía te llevará paso a paso para desplegar la aplicación Kelly App en **DigitalOcean App Platform** con una **base de datos PostgreSQL** integrada.

## ✅ Ventajas de App Platform

- ✅ Deploy automático desde GitHub
- ✅ SSL automático (HTTPS)
- ✅ Base de datos PostgreSQL incluida
- ✅ Escalado automático
- ✅ Monitoreo integrado
- ✅ Backups automáticos de base de datos

## 📊 Costos Estimados

- **Backend**: $5/mes (Basic XXS)
- **Frontend**: $0/mes (Static Site - gratis)
- **PostgreSQL Database**: $15/mes (Basic - 1GB RAM, 10GB storage)
- **Total**: ~$20/mes

---

## 🎯 Paso 1: Preparar el Repositorio

### 1.1 Subir código a GitHub

```bash
# Si aún no tienes el código en GitHub
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"
git init
git add .
git commit -m "Initial commit for App Platform deployment"
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 1.2 Verificar archivos necesarios

Asegúrate de tener estos archivos en tu repositorio:
- ✅ `backend/requirements.txt` (con `psycopg2-binary`)
- ✅ `backend/Dockerfile` (opcional, App Platform puede construir automáticamente)
- ✅ `.do/app.yaml` (configuración de App Platform)

---

## 🎯 Paso 2: Crear App en DigitalOcean

### 2.1 Acceder a App Platform

1. Ve a https://cloud.digitalocean.com
2. Click en **App Platform** en el menú lateral
3. Click en **Create App**

### 2.2 Conectar Repositorio

1. Selecciona **GitHub**
2. Autoriza DigitalOcean si es necesario
3. Selecciona tu repositorio
4. Selecciona la rama `main` (o la que uses)
5. Click **Next**

### 2.3 Configurar Backend

1. **Detect Components**: App Platform detectará automáticamente el backend
2. Si no lo detecta, agrega manualmente:
   - **Type**: Web Service
   - **Name**: `backend`
   - **Source Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
   - **HTTP Port**: `8080`
   - **Environment**: `Python`

### 2.4 Configurar Variables de Entorno del Backend

Agrega estas variables de entorno:

```
PYTHONUNBUFFERED=1
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-generada-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Nota**: `DATABASE_URL` se configurará automáticamente cuando agregues la base de datos.

### 2.5 Configurar Frontend

1. **Type**: Static Site
2. **Name**: `frontend`
3. **Source Directory**: `frontend`
4. **Build Command**: `npm ci && npm run build`
5. **Output Directory**: `dist`

### 2.6 Configurar Variable de Entorno del Frontend

Agrega esta variable de entorno:

```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

Esto conectará automáticamente el frontend con el backend.

### 2.7 Agregar Base de Datos PostgreSQL

1. Click en **Add Resource** > **Database**
2. Selecciona **PostgreSQL**
3. **Version**: 15 (o la más reciente)
4. **Plan**: Basic ($15/mes) - 1GB RAM, 10GB storage
5. **Database Name**: `kelly_app`
6. **Database User**: `kelly_app_user`

### 2.8 Conectar Base de Datos al Backend

1. En la configuración del backend, agrega variable de entorno:
   - **Key**: `DATABASE_URL`
   - **Value**: `${db.DATABASE_URL}`
   - **Scope**: Run Time

   App Platform inyectará automáticamente la URL de conexión.

### 2.9 Configurar CORS

En las variables de entorno del backend, agrega:

```
CORS_ORIGINS=${frontend.PUBLIC_URL}
```

O si tienes un dominio personalizado:

```
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### 2.10 Configurar Rutas

- **Backend**: `/api/*` → Backend service
- **Frontend**: `/*` → Frontend static site

### 2.11 Review y Deploy

1. Revisa la configuración
2. Click **Create Resources**
3. App Platform comenzará a construir y desplegar

---

## 🎯 Paso 3: Configurar Dominio Personalizado (Opcional)

### 3.1 Agregar Dominio

1. En tu App, ve a **Settings** > **Domains**
2. Click **Add Domain**
3. Ingresa tu dominio (ej: `kellyapp.com`)
4. Sigue las instrucciones para configurar DNS

### 3.2 Configurar DNS

En tu proveedor de dominios, agrega estos registros:

- **CNAME**: `@` → `your-app.ondigitalocean.app`
- **CNAME**: `www` → `your-app.ondigitalocean.app`

O si App Platform te da una IP:

- **A Record**: `@` → IP proporcionada
- **A Record**: `www` → IP proporcionada

### 3.3 SSL Automático

App Platform configurará SSL automáticamente cuando el dominio esté configurado.

---

## 🎯 Paso 4: Migrar Datos de SQLite a PostgreSQL

### 4.1 Exportar Datos de SQLite

```bash
# En tu máquina local
cd backend

# Instalar herramienta de migración
pip install sqlalchemy psycopg2-binary

# Crear script de migración
python migrate_to_postgresql.py
```

### 4.2 Script de Migración

Crea `backend/migrate_to_postgresql.py`:

```python
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# SQLite (origen)
sqlite_url = "sqlite:///./kelly_app.db"
sqlite_engine = create_engine(sqlite_url)

# PostgreSQL (destino) - usar DATABASE_URL de App Platform
postgres_url = os.getenv("DATABASE_URL")  # De App Platform
postgres_engine = create_engine(postgres_url)

# Crear tablas en PostgreSQL
from app.database import Base
Base.metadata.create_all(bind=postgres_engine)

# Migrar datos (ejemplo básico)
# Necesitarás adaptar esto según tus modelos
```

### 4.3 Importar Datos

Una vez que la app esté desplegada, puedes usar el script de migración o importar manualmente.

---

## 🎯 Paso 5: Verificar Deploy

### 5.1 Verificar Backend

1. Ve a tu App en DigitalOcean
2. Click en el servicio **backend**
3. Ve a **Runtime Logs** para ver los logs
4. Verifica que no haya errores

### 5.2 Verificar Base de Datos

1. En tu App, ve a la base de datos
2. Click en **Connection Details**
3. Verifica que el backend se conecte correctamente

### 5.3 Verificar Frontend

1. Ve a la URL de tu app
2. Verifica que cargue correctamente
3. Prueba hacer login

---

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

**Backend:**
```
PYTHONUNBUFFERED=1
DATABASE_URL=${db.DATABASE_URL}  # Automático
SECRET_KEY=tu-clave-secreta
CORS_ORIGINS=${frontend.PUBLIC_URL}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Frontend:**
```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

### Health Checks

App Platform verificará automáticamente:
- Backend: `http://localhost:8080/health`
- Frontend: Disponibilidad del sitio estático

### Escalado

Puedes escalar el backend:
1. Ve a **Settings** > **App-Level Settings**
2. Ajusta **Instance Size** y **Instance Count**

---

## 📊 Monitoreo

### Logs

- **Backend Logs**: App > Backend Service > Runtime Logs
- **Build Logs**: App > Backend Service > Build Logs
- **Database Logs**: App > Database > Logs

### Métricas

App Platform muestra:
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔄 Actualizar la Aplicación

### Deploy Automático

Si configuraste `deploy_on_push: true`, cada push a `main` desplegará automáticamente.

### Deploy Manual

1. Ve a tu App
2. Click **Actions** > **Force Rebuild**
3. O haz un commit vacío: `git commit --allow-empty -m "Trigger deploy"`

---

## 🆘 Solución de Problemas

### Backend no inicia

1. Verifica **Build Logs** para errores de construcción
2. Verifica **Runtime Logs** para errores de ejecución
3. Verifica variables de entorno

### Base de datos no conecta

1. Verifica que `DATABASE_URL` esté configurada
2. Verifica **Connection Details** de la base de datos
3. Verifica que el backend tenga acceso a la base de datos

### Frontend no carga

1. Verifica **Build Logs** del frontend
2. Verifica que `VITE_API_URL` esté correcta
3. Verifica la consola del navegador para errores

### CORS errors

1. Verifica `CORS_ORIGINS` en el backend
2. Asegúrate de incluir la URL del frontend

---

## 📝 Checklist de Deploy

- [ ] Código subido a GitHub
- [ ] App creada en App Platform
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Base de datos funciona
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL activo

---

## 💡 Tips

1. **Backups**: App Platform hace backups automáticos de la base de datos
2. **Staging**: Puedes crear un ambiente de staging con otro branch
3. **Rollback**: Puedes hacer rollback a versiones anteriores desde **Deployments**
4. **Costos**: Monitorea el uso en **Billing** para evitar sorpresas

---

¿Necesitas ayuda con algún paso específico?
