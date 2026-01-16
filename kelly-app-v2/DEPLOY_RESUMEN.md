# 🚀 Resumen Rápido - Deploy en DigitalOcean

## ⚡ Inicio Rápido (5 minutos)

### 1. Crear Droplet
- Ubuntu 22.04 LTS
- 2GB RAM / 1 vCPU ($12/mes)
- SSH keys o password

### 2. Conectarte
```bash
ssh root@TU_IP
```

### 3. Ejecutar Script de Setup
```bash
# Subir el script al servidor o copiarlo
wget https://raw.githubusercontent.com/TU_REPO/setup-digitalocean.sh
chmod +x setup-digitalocean.sh
./setup-digitalocean.sh
```

### 4. Subir Código
```bash
# Opción A: Git
git clone TU_REPO /root/kelly-app
cd /root/kelly-app/kelly-app-v2

# Opción B: SCP (desde tu máquina)
# scp -r kelly-app-v2 root@TU_IP:/root/
```

### 5. Configurar Variables
```bash
cd /root/kelly-app/kelly-app-v2/backend
nano .env
```

```env
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://tu-dominio.com
SECRET_KEY=tu-clave-secreta-muy-larga
```

### 6. Configurar Nginx
```bash
# Copiar configuración
cp nginx/nginx-digitalocean.conf /etc/nginx/sites-available/kelly-app

# Editar dominio
nano /etc/nginx/sites-available/kelly-app
# Reemplazar "tu-dominio.com" con tu dominio real

# Activar
ln -s /etc/nginx/sites-available/kelly-app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 7. SSL
```bash
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 8. Deploy
```bash
cd /root/kelly-app/kelly-app-v2
docker compose -f docker-compose.prod.yml up -d --build
```

### 9. Verificar
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

## 📝 Comandos Útiles

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Actualizar código
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Backup manual
./backup-database.sh

# Ver estado
docker compose -f docker-compose.prod.yml ps
```

## 🔧 Troubleshooting

```bash
# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Verificar puertos
netstat -tulpn | grep -E '3025|3026'

# Reiniciar todo
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## 📚 Documentación Completa

Ver `DEPLOY_DIGITALOCEAN.md` para guía detallada.
