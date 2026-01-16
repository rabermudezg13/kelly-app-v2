# ⚙️ Comandos Rápidos para Configurar Nginx

## Opción 1: Script Automatizado (Más Fácil)

```bash
cd kelly-app-v2
chmod +x configure-nginx.sh
sudo ./configure-nginx.sh
```

## Opción 2: Comandos Manuales (Paso a Paso)

### 1. Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2. Copiar Configuración (sin SSL primero)

```bash
cd kelly-app-v2
sudo cp nginx/kellyapp-no-ssl.conf /etc/nginx/sites-available/kellyapp.conf
```

### 3. Crear Enlace Simbólico

```bash
sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf
```

### 4. Deshabilitar Configuración Default

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 5. Verificar Sintaxis

```bash
sudo nginx -t
```

### 6. Recargar Nginx

```bash
sudo systemctl reload nginx
```

### 7. Abrir Puertos en Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 8. Verificar que Funciona

```bash
# Ver estado
sudo systemctl status nginx

# Probar
curl -I http://localhost
```

## Después de Configurar Nginx

### 1. Instalar SSL

```bash
sudo ./install-ssl.sh
```

Esto automáticamente actualizará la configuración para usar SSL.

### 2. Verificar Logs

```bash
sudo tail -f /var/log/nginx/kellyapp_error.log
```

## Comandos Útiles

```bash
# Reiniciar nginx
sudo systemctl restart nginx

# Recargar configuración
sudo systemctl reload nginx

# Ver estado
sudo systemctl status nginx

# Ver configuración
sudo nginx -T | grep -A 20 "kellyapp"
```

