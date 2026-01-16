# 🚀 Comandos para Deploy en App Platform

## ✅ Tu Repositorio

**URL**: https://github.com/rabermudezg13/KellyApp2026.git

---

## 📤 Paso 1: Subir Cambios a GitHub

```bash
cd "/Users/rodrigobermudez/projects/new Kelly App/kelly-app-v2"

# Ver qué archivos han cambiado
git status

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Prepare for DigitalOcean App Platform deployment

- Add PostgreSQL support (psycopg2-binary)
- Update database config for PostgreSQL/SQLite
- Add App Platform configuration (.do/app.yaml)
- Add deployment documentation
- Update .gitignore"

# Subir a GitHub
git push origin main
```

---

## 🌐 Paso 2: Crear App en DigitalOcean App Platform

### 2.1 Acceder a App Platform

1. Ve a https://cloud.digitalocean.com
2. Click en **App Platform** (menú lateral)
3. Click **Create App**

### 2.2 Conectar Repositorio

1. Selecciona **GitHub**
2. Autoriza DigitalOcean si es necesario
3. Busca: `rabermudezg13/KellyApp2026`
4. Selecciona branch: `main`
5. Click **Next**

### 2.3 Configuración Automática

Si tienes `.do/app.yaml`, App Platform lo detectará automáticamente. Solo necesitas:

1. **Review** la configuración
2. **Agregar variables de entorno**:
   - `SECRET_KEY` (genera con: `openssl rand -hex 32`)
3. Click **Create Resources**

### 2.4 Configuración Manual (Si no detecta .do/app.yaml)

#### Backend:
- **Type**: Web Service
- **Source Directory**: `new Kelly App/kelly-app-v2/backend`
- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
- **HTTP Port**: `8080`

**Variables de Entorno:**
```
PYTHONUNBUFFERED=1
DATABASE_URL=${db.DATABASE_URL}
SECRET_KEY=tu-clave-generada
CORS_ORIGINS=${frontend.PUBLIC_URL}
```

#### Frontend:
- **Type**: Static Site
- **Source Directory**: `new Kelly App/kelly-app-v2/frontend`
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`

**Variables de Entorno:**
```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

#### Base de Datos:
- **Type**: PostgreSQL
- **Plan**: Basic ($15/mes)
- **Name**: `db`

---

## ✅ Paso 3: Verificar Deploy

1. Espera 5-10 minutos a que termine el build
2. Ve a **Runtime Logs** del backend
3. Verifica que no haya errores
4. Prueba: `https://tu-app.ondigitalocean.app/api/health`
5. Prueba: `https://tu-app.ondigitalocean.app` (frontend)

---

## 🔧 Generar SECRET_KEY

```bash
openssl rand -hex 32
```

Copia el resultado y úsalo como valor de `SECRET_KEY` en App Platform.

---

## 📋 Checklist Final

- [ ] Código subido a GitHub
- [ ] `.do/app.yaml` en el repositorio
- [ ] App creada en App Platform
- [ ] Repositorio conectado
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas
- [ ] SECRET_KEY generado y configurado
- [ ] Deploy exitoso
- [ ] App funcionando

---

## 🆘 Si hay Problemas

### Build falla
- Verifica **Build Logs**
- Verifica que `requirements.txt` tenga `psycopg2-binary`

### Backend no inicia
- Verifica **Runtime Logs**
- Verifica que `DATABASE_URL` esté configurada
- Verifica que el puerto sea `8080`

### Frontend no carga
- Verifica **Build Logs**
- Verifica que `VITE_API_URL` esté correcta
- Verifica consola del navegador (F12)

---

¿Listo para hacer el deploy?
