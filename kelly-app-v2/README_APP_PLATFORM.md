# 🚀 Deploy en DigitalOcean App Platform - Resumen

## ⚡ Inicio Rápido (5 pasos)

### 1. Subir código a GitHub
```bash
git add .
git commit -m "Ready for App Platform"
git push
```

### 2. Crear App en DigitalOcean
- Ve a https://cloud.digitalocean.com
- **App Platform** > **Create App**
- Conecta GitHub

### 3. Configurar Componentes

**Backend:**
- Source: `backend`
- Build: `pip install -r requirements.txt`
- Run: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
- Port: `8080`

**Frontend:**
- Source: `frontend`
- Build: `npm ci && npm run build`
- Output: `dist`

**Base de Datos:**
- PostgreSQL Basic ($15/mes)

### 4. Variables de Entorno

**Backend:**
```
DATABASE_URL=${db.DATABASE_URL}  ← Automático
SECRET_KEY=tu-clave-secreta
CORS_ORIGINS=${frontend.PUBLIC_URL}  ← Automático
```

**Frontend:**
```
VITE_API_URL=${backend.PUBLIC_URL}/api  ← Automático
```

### 5. Deploy
Click **Create Resources** y espera.

---

## 📚 Documentación Completa

- **`APP_PLATFORM_GUIA_COMPLETA.md`** - Guía detallada paso a paso
- **`APP_PLATFORM_PASOS_RAPIDOS.md`** - Resumen rápido
- **`DEPLOY_APP_PLATFORM.md`** - Guía alternativa

---

## 💰 Costos

- Backend: $5/mes
- Frontend: $0/mes (gratis)
- PostgreSQL: $15/mes
- **Total: ~$20/mes**

---

## ✅ Checklist

- [ ] Código en GitHub
- [ ] App creada
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Base de datos creada
- [ ] Variables configuradas
- [ ] Deploy exitoso
- [ ] App funcionando
