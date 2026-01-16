# 🔒 Comandos Rápidos para Instalar SSL

## Opción 1: Script Automatizado (Más Fácil)

```bash
cd kelly-app-v2
chmod +x install-ssl.sh
sudo ./install-ssl.sh
```

## Opción 2: Comandos Manuales (Paso a Paso)

### 1. Instalar Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Verificar que Nginx está corriendo

```bash
sudo systemctl status nginx
```

Si no está corriendo:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Copiar configuración de Nginx (si no lo has hecho)

```bash
sudo cp kelly-app-v2/nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf
sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Obtener Certificado SSL

**Reemplaza `tu-email@example.com` con tu email real:**

```bash
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com --non-interactive --agree-tos --email tu-email@example.com --redirect
```

O si prefieres modo interactivo (te pedirá el email):

```bash
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com
```

### 5. Verificar que Funciona

```bash
# Verificar certificado
sudo certbot certificates

# Probar en navegador
# Abre: https://kellyapp.fromcolombiawithcoffees.com
```

### 6. Verificar Renovación Automática

```bash
sudo certbot renew --dry-run
```

## ✅ Listo!

Después de ejecutar estos comandos, tu sitio debería estar disponible en:
**https://kellyapp.fromcolombiawithcoffees.com**

El certificado se renovará automáticamente cada 90 días.

## 🔧 Si hay Problemas

### Error: "Domain not pointing to this server"

Verifica que el DNS esté configurado:
```bash
dig kellyapp.fromcolombiawithcoffees.com
curl ifconfig.me
```

### Error: "Port 80 is already in use"

Verifica qué está usando el puerto 80:
```bash
sudo lsof -i :80
```

### Ver logs de nginx

```bash
sudo tail -f /var/log/nginx/kellyapp_error.log
```

