# ⚡ Pasos Rápidos - App Platform

## 🎯 Deploy en 10 Minutos

### 1. Subir Código a GitHub
```bash
cd kelly-app-v2
git add .
git commit -m "Ready for App Platform"
git push
```

### 2. Crear App en DigitalOcean

1. Ve a https://cloud.digitalocean.com
2. **App Platform** > **Create App**
3. Conecta GitHub y selecciona tu repo

### 3. Configurar Backend

- **Type**: Web Service
- **Source**: `backend`
- **Build**: `pip install -r requirements.txt`
- **Run**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
- **Port**: `8080`

**Variables de Entorno:**
```
PYTHONUNBUFFERED=1
DATABASE_URL=${db.DATABASE_URL}
SECRET_KEY=tu-clave-secreta
CORS_ORIGINS=${frontend.PUBLIC_URL}
```

### 4. Configurar Frontend

- **Type**: Static Site
- **Source**: `frontend`
- **Build**: `npm ci && npm run build`
- **Output**: `dist`

**Variables de Entorno:**
```
VITE_API_URL=${backend.PUBLIC_URL}/api
```

### 5. Agregar Base de Datos

- **Type**: PostgreSQL
- **Plan**: Basic ($15/mes)
- **Name**: `kelly_app`

### 6. Deploy

Click **Create Resources** y espera 5-10 minutos.

### 7. Verificar

- Backend: `https://tu-app.ondigitalocean.app/api/health`
- Frontend: `https://tu-app.ondigitalocean.app`

---

## 📋 Variables de Entorno Importantes

### Backend
```
DATABASE_URL=${db.DATABASE_URL}  ← Automático
SECRET_KEY=genera-con-openssl-rand-hex-32
CORS_ORIGINS=${frontend.PUBLIC_URL}  ← Automático
```

### Frontend
```
VITE_API_URL=${backend.PUBLIC_URL}/api  ← Automático
```

---

## 🔧 Comandos Útiles

### Generar SECRET_KEY
```bash
openssl rand -hex 32
```

### Ver logs
- App Platform > Tu App > Backend > Runtime Logs

### Reiniciar
- App Platform > Tu App > Actions > Force Rebuild

---

## 💰 Costos

- Backend: $5/mes
- Frontend: $0/mes (gratis)
- PostgreSQL: $15/mes
- **Total: ~$20/mes**

---

Ver `DEPLOY_APP_PLATFORM.md` para guía completa.
