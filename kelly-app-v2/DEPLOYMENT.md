# 🚀 Guía de Deployment - Kelly App

## 📋 Configuración de Producción

### 1. Protección de Secretos

Todos los secretos y claves están protegidos en `.gitignore`. **NUNCA** subas archivos `.env` al repositorio.

#### Archivos protegidos:
- `.env` (backend y frontend)
- `*.db` (bases de datos)
- `*.key`, `*.pem` (certificados SSL)
- `secrets/`, `credentials.json`
- Logs y backups

### 2. Configuración de Variables de Entorno

#### Backend (`.env` en `kelly-app-v2/backend/`)

```bash
# Database
DATABASE_URL=sqlite:///./kelly_app.db

# JWT Secret Key (generar con: openssl rand -hex 32)
SECRET_KEY=tu-clave-secreta-generada-aqui

# JWT Algorithm
ALGORITHM=HS256

# Token Expiration (en minutos)
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Admin User Credentials
ADMIN_EMAIL=cculturausallc@gmail.com
ADMIN_PASSWORD=tu-contraseña-segura-aqui

# Server Configuration
HOST=0.0.0.0
PORT=3026

# CORS Origins (separados por comas)
CORS_ORIGINS=https://kellyapp.fromcolombiawithcoffees.com,http://localhost:3025
```

#### Frontend (`.env` en `kelly-app-v2/frontend/`)

```bash
# API Base URL (producción)
VITE_API_URL=https://kellyapp.fromcolombiawithcoffees.com/api
```

### 3. Instalación de Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Verificar que nginx está corriendo
sudo systemctl status nginx
```

### 4. Configuración de Nginx

1. **Copiar la configuración:**
   ```bash
   sudo cp kelly-app-v2/nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf
   ```

2. **Crear enlace simbólico:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf
   ```

3. **Verificar configuración:**
   ```bash
   sudo nginx -t
   ```

4. **Recargar nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

### 5. Configuración de SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

**Nota:** Si ya tienes certificados SSL, actualiza las rutas en `kellyapp.conf`:
- `ssl_certificate`
- `ssl_certificate_key`

### 6. Iniciar Aplicación en Producción

#### Backend (con systemd)

Crear servicio: `/etc/systemd/system/kelly-backend.service`

```ini
[Unit]
Description=Kelly App Backend API
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/kelly-app-v2/backend
Environment="PATH=/ruta/a/kelly-app-v2/backend/venv/bin"
ExecStart=/ruta/a/kelly-app-v2/backend/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y iniciar servicio
sudo systemctl enable kelly-backend
sudo systemctl start kelly-backend
sudo systemctl status kelly-backend
```

#### Frontend (con systemd o PM2)

**Opción 1: Con systemd**

Crear servicio: `/etc/systemd/system/kelly-frontend.service`

```ini
[Unit]
Description=Kelly App Frontend
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/kelly-app-v2/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 3025
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Opción 2: Con PM2 (recomendado para producción)**

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
cd kelly-app-v2/frontend
pm2 start npm --name "kelly-frontend" -- run dev -- --host 0.0.0.0 --port 3025

# Guardar configuración
pm2 save
pm2 startup
```

### 7. Verificación

1. **Verificar backend:**
   ```bash
   curl https://kellyapp.fromcolombiawithcoffees.com/api/health
   ```

2. **Verificar frontend:**
   Abrir en navegador: `https://kellyapp.fromcolombiawithcoffees.com`

3. **Verificar logs:**
   ```bash
   # Backend
   sudo journalctl -u kelly-backend -f
   
   # Frontend (si usas PM2)
   pm2 logs kelly-frontend
   
   # Nginx
   sudo tail -f /var/log/nginx/kellyapp_error.log
   ```

### 8. Firewall

Asegúrate de que los puertos estén abiertos:

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Los puertos 3025 y 3026 solo deben ser accesibles localmente (no abrir en firewall)
```

### 9. Actualización de Código

```bash
# Pull latest code
cd /ruta/a/kelly-app-v2
git pull origin main

# Backend - reiniciar servicio
sudo systemctl restart kelly-backend

# Frontend - reiniciar
pm2 restart kelly-frontend
# O si usas systemd:
sudo systemctl restart kelly-frontend
```

### 10. Troubleshooting

#### Backend no responde
```bash
# Verificar que está corriendo
sudo systemctl status kelly-backend

# Ver logs
sudo journalctl -u kelly-backend -n 50

# Verificar puerto
netstat -tlnp | grep 3026
```

#### Frontend no responde
```bash
# Verificar que está corriendo
pm2 status
# O
sudo systemctl status kelly-frontend

# Ver logs
pm2 logs kelly-frontend
```

#### Nginx no funciona
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/kellyapp_error.log

# Verificar que el dominio apunta correctamente
dig kellyapp.fromcolombiawithcoffees.com
```

## 🔒 Seguridad

- ✅ Todos los secretos están en `.env` (no en git)
- ✅ SSL/TLS habilitado con Let's Encrypt
- ✅ Headers de seguridad configurados en nginx
- ✅ CORS configurado solo para dominios permitidos
- ✅ Firewall configurado correctamente

## 📝 Notas Importantes

1. **No afecta otras apps:** La configuración de nginx solo afecta al dominio `kellyapp.fromcolombiawithcoffees.com`. Otras aplicaciones en otros dominios no se ven afectadas.

2. **Puertos locales:** Los puertos 3025 y 3026 solo deben ser accesibles desde localhost. Nginx actúa como proxy reverso.

3. **Base de datos:** En producción, considera migrar de SQLite a PostgreSQL o MySQL para mejor rendimiento y escalabilidad.

4. **Backups:** Configura backups regulares de la base de datos:
   ```bash
   # Ejemplo de backup diario
   0 2 * * * cp /ruta/a/kelly-app-v2/backend/kelly_app.db /backups/kelly_app_$(date +\%Y\%m\%d).db
   ```

