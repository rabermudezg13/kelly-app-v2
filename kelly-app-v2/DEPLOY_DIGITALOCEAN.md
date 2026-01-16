# 🚀 Guía de Deploy en DigitalOcean

## 📋 Opciones de Deploy

### Opción 1: Droplet con Docker (Recomendado - Más Control)
- ✅ Más económico (~$6-12/mes)
- ✅ Control total del servidor
- ✅ Usa Docker Compose (ya lo tienes configurado)
- ⚠️ Requiere configuración manual

### Opción 2: App Platform (Más Fácil)
- ✅ Deploy automático desde GitHub
- ✅ SSL automático
- ✅ Escalado automático
- ⚠️ Más caro (~$12-25/mes)

---

## 🎯 OPCIÓN 1: Droplet con Docker (Recomendado)

### Paso 1: Crear Droplet en DigitalOcean

1. **Inicia sesión en DigitalOcean**: https://cloud.digitalocean.com
2. **Crea un Droplet**:
   - **Imagen**: Ubuntu 22.04 LTS
   - **Plan**: Basic - Regular Intel (2GB RAM / 1 vCPU) - $12/mes (mínimo recomendado)
   - **Región**: Elige la más cercana a tus usuarios
   - **Autenticación**: SSH keys (recomendado) o Password
   - **Nombre**: `kelly-app-production`

### Paso 2: Conectarte al Droplet

```bash
# Desde tu máquina local
ssh root@TU_IP_DEL_DROPLET
```

### Paso 3: Configurar el Servidor

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### Paso 4: Configurar Firewall

```bash
# Instalar UFW (firewall)
apt install ufw -y

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir puertos de la app (temporal, luego usaremos nginx)
ufw allow 3025/tcp
ufw allow 3026/tcp

# Activar firewall
ufw enable
```

### Paso 5: Subir el Código al Servidor

**Opción A: Desde GitHub (Recomendado)**

```bash
# En el servidor
apt install git -y

# Clonar tu repositorio
cd /root
git clone https://github.com/TU_USUARIO/TU_REPO.git kelly-app
cd kelly-app/kelly-app-v2
```

**Opción B: Usando SCP (desde tu máquina local)**

```bash
# Desde tu máquina local
scp -r kelly-app-v2 root@TU_IP_DEL_DROPLET:/root/
```

### Paso 6: Configurar Variables de Entorno

```bash
# En el servidor
cd /root/kelly-app-v2/backend

# Crear archivo .env
nano .env
```

Agrega estas variables:

```env
# Backend .env
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

```bash
# Guardar y salir (Ctrl+X, luego Y, luego Enter)

# Frontend - crear .env.production
cd /root/kelly-app-v2/frontend
nano .env.production
```

```env
# Frontend .env.production
VITE_API_URL=https://api.tu-dominio.com/api
```

### Paso 7: Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
apt install nginx -y

# Crear configuración
nano /etc/nginx/sites-available/kelly-app
```

Pega esta configuración:

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Certificados SSL (se configurarán con Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3026;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3026/health;
    }
}
```

```bash
# Activar configuración
ln -s /etc/nginx/sites-available/kelly-app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### Paso 8: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL (reemplaza tu-dominio.com con tu dominio)
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir las instrucciones en pantalla
# Certbot configurará automáticamente Nginx
```

### Paso 9: Iniciar la Aplicación con Docker

```bash
cd /root/kelly-app-v2

# Construir y levantar contenedores
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar que estén corriendo
docker compose -f docker-compose.prod.yml ps
```

### Paso 10: Configurar Auto-start en Reinicio

```bash
# Crear servicio systemd para Docker Compose
nano /etc/systemd/system/kelly-app.service
```

```ini
[Unit]
Description=Kelly App Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/kelly-app-v2
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Activar servicio
systemctl daemon-reload
systemctl enable kelly-app.service
systemctl start kelly-app.service
```

### Paso 11: Configurar Dominio en DigitalOcean

1. Ve a **Networking** > **Domains** en DigitalOcean
2. Agrega tu dominio
3. Configura los DNS records:
   - **A Record**: `@` → IP de tu Droplet
   - **A Record**: `www` → IP de tu Droplet

### Paso 12: Actualizar CORS y Variables

```bash
# Editar .env del backend
cd /root/kelly-app-v2/backend
nano .env
```

Actualiza `CORS_ORIGINS` con tu dominio real:

```env
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

```bash
# Reiniciar backend
cd /root/kelly-app-v2
docker compose -f docker-compose.prod.yml restart backend
```

---

## 🎯 OPCIÓN 2: App Platform (Más Fácil)

### Paso 1: Preparar Repositorio

1. Sube tu código a GitHub
2. Asegúrate de tener `docker-compose.prod.yml` o Dockerfiles

### Paso 2: Crear App en DigitalOcean

1. Ve a **App Platform** en DigitalOcean
2. Click **Create App**
3. Conecta tu repositorio de GitHub
4. Selecciona el branch (main/master)

### Paso 3: Configurar Backend

1. **Component Type**: Web Service
2. **Source Directory**: `backend`
3. **Build Command**: `docker build -t backend .`
4. **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8080`
5. **HTTP Port**: 8080
6. **Environment Variables**:
   - `PYTHONUNBUFFERED=1`
   - `CORS_ORIGINS=https://tu-app.ondigitalocean.app`
   - `SECRET_KEY=tu-clave-secreta`

### Paso 4: Configurar Frontend

1. **Component Type**: Static Site
2. **Source Directory**: `frontend`
3. **Build Command**: `npm ci && npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL=https://tu-backend.ondigitalocean.app/api`

### Paso 5: Deploy

1. Click **Create Resources**
2. DigitalOcean construirá y desplegará automáticamente
3. SSL se configura automáticamente

---

## 🔧 Comandos Útiles

### Ver logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Reiniciar servicios
```bash
docker compose -f docker-compose.prod.yml restart
```

### Detener servicios
```bash
docker compose -f docker-compose.prod.yml down
```

### Actualizar código
```bash
# Si usas Git
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup de base de datos
```bash
# El backup se guarda en ./backend/backups/
# Puedes configurar un cron job para backups automáticos
```

---

## 🔒 Seguridad

1. **Firewall**: Ya configurado con UFW
2. **SSL**: Configurado con Let's Encrypt
3. **Variables de Entorno**: Nunca subas `.env` a GitHub
4. **Backups**: Configura backups automáticos de la base de datos

---

## 📊 Monitoreo

### Ver uso de recursos
```bash
htop
df -h  # Espacio en disco
free -h  # Memoria
```

### Ver logs de Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🆘 Solución de Problemas

### La app no inicia
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs

# Verificar puertos
netstat -tulpn | grep -E '3025|3026'
```

### Error de conexión
```bash
# Verificar firewall
ufw status

# Verificar Nginx
nginx -t
systemctl status nginx
```

### Base de datos no funciona
```bash
# Verificar permisos
ls -la backend/kelly_app.db

# Verificar logs del backend
docker compose -f docker-compose.prod.yml logs backend
```

---

## 💰 Costos Estimados

- **Droplet (2GB RAM)**: ~$12/mes
- **Dominio**: ~$12/año
- **Total**: ~$13/mes

---

## ✅ Checklist de Deploy

- [ ] Droplet creado
- [ ] Docker instalado
- [ ] Código subido al servidor
- [ ] Variables de entorno configuradas
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Dominio apuntando al servidor
- [ ] Aplicación corriendo
- [ ] Firewall configurado
- [ ] Auto-start configurado
- [ ] Backups configurados

---

¿Necesitas ayuda con algún paso específico?
