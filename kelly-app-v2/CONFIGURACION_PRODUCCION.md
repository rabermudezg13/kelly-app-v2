# 🔒 Configuración de Producción - Resumen

## ✅ Cambios Realizados

### 1. Protección de Secretos en `.gitignore`

Se actualizó el `.gitignore` para proteger:
- ✅ Archivos `.env` (backend y frontend)
- ✅ Bases de datos (`*.db`, `*.sqlite`)
- ✅ Certificados SSL (`*.key`, `*.pem`)
- ✅ Archivos de credenciales (`secrets/`, `credentials.json`)
- ✅ Logs y backups

### 2. Variables de Entorno

#### Backend (`backend/.env.example`)
- `SECRET_KEY` - Clave secreta para JWT (generar con `openssl rand -hex 32`)
- `ADMIN_EMAIL` - Email del usuario admin
- `ADMIN_PASSWORD` - Contraseña del usuario admin
- `CORS_ORIGINS` - Orígenes permitidos para CORS

#### Frontend (`frontend/.env.example`)
- `VITE_API_URL` - URL de la API (http://localhost:3026/api en desarrollo, https://kellyapp.fromcolombiawithcoffees.com/api en producción)

### 3. Código Actualizado para Usar Variables de Entorno

- ✅ `backend/app/api/auth.py` - Ahora usa `os.getenv()` para `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- ✅ `backend/app/services/user_service.py` - Ahora usa `os.getenv()` para `ADMIN_EMAIL` y `ADMIN_PASSWORD`
- ✅ `backend/main.py` - Ahora usa `os.getenv()` para `CORS_ORIGINS`

### 4. Configuración de Nginx

Creada configuración en `nginx/kellyapp.conf` para:
- ✅ Dominio: `kellyapp.fromcolombiawithcoffees.com`
- ✅ Frontend: Puerto 3025 (proxy reverso)
- ✅ Backend: Puerto 3026 (proxy reverso a `/api/`)
- ✅ SSL/TLS configurado
- ✅ Headers de seguridad
- ✅ Redirección HTTP → HTTPS

**Importante:** Esta configuración NO afecta otras aplicaciones. Solo maneja el dominio `kellyapp.fromcolombiawithcoffees.com`.

## 🚀 Pasos para Deployment

### 1. Configurar Variables de Entorno

```bash
cd kelly-app-v2/backend
cp .env.example .env
# Editar .env con tus valores reales

cd ../frontend
cp .env.example .env
# Editar .env con tus valores reales
```

### 2. Instalar y Configurar Nginx

```bash
# Copiar configuración
sudo cp kelly-app-v2/nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf

# Verificar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

### 3. Configurar SSL

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com
```

### 4. Iniciar Aplicación

**Backend:**
```bash
cd kelly-app-v2/backend
source venv/bin/activate
python main.py
```

**Frontend:**
```bash
cd kelly-app-v2/frontend
npm run dev -- --host 0.0.0.0 --port 3025
```

O usar los servicios systemd (ver `DEPLOYMENT.md` para detalles completos).

### 5. Verificar

- Backend: `curl https://kellyapp.fromcolombiawithcoffees.com/api/health`
- Frontend: Abrir `https://kellyapp.fromcolombiawithcoffees.com` en navegador

## 📝 Notas Importantes

1. **No afecta otras apps:** La configuración de nginx solo maneja `kellyapp.fromcolombiawithcoffees.com`. Otras aplicaciones no se ven afectadas.

2. **Puertos locales:** Los puertos 3025 y 3026 solo deben ser accesibles desde localhost. Nginx actúa como proxy reverso.

3. **Secretos:** NUNCA subas archivos `.env` al repositorio. Están protegidos en `.gitignore`.

4. **SSL:** Actualiza las rutas de certificados en `nginx/kellyapp.conf` si usas certificados diferentes a Let's Encrypt.

## 📚 Documentación Completa

Para más detalles, consulta:
- `DEPLOYMENT.md` - Guía completa de deployment
- `nginx/kellyapp.conf` - Configuración de nginx
- `deploy.sh` - Script automatizado de deployment

