# 🔒 Instalación de Certificados SSL

## Método Rápido (Recomendado)

Ejecuta el script automatizado:

```bash
cd kelly-app-v2
chmod +x install-ssl.sh
sudo ./install-ssl.sh
```

El script automáticamente:
1. ✅ Verifica/instala nginx
2. ✅ Verifica/instala certbot
3. ✅ Configura nginx
4. ✅ Obtiene certificado SSL de Let's Encrypt
5. ✅ Configura renovación automática
6. ✅ Verifica que todo funcione

## Método Manual

### 1. Instalar Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx
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

### 3. Verificar que el dominio apunta al servidor

```bash
# Ver IP del servidor
curl ifconfig.me

# Ver IP del dominio
dig kellyapp.fromcolombiawithcoffees.com +short
```

Ambas IPs deben coincidir.

### 4. Verificar configuración de Nginx

Asegúrate de que la configuración esté en `/etc/nginx/sites-available/kellyapp.conf`:

```bash
sudo cp kelly-app-v2/nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf
sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf
sudo nginx -t
```

### 5. Obtener Certificado SSL

**Modo automático (recomendado):**
```bash
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com --non-interactive --agree-tos --email tu-email@example.com --redirect
```

**Modo interactivo:**
```bash
sudo certbot --nginx -d kellyapp.fromcolombiawithcoffees.com
```

Certbot automáticamente:
- Obtiene el certificado
- Configura nginx para usar SSL
- Configura redirección HTTP → HTTPS
- Configura renovación automática

### 6. Verificar Renovación Automática

```bash
sudo certbot renew --dry-run
```

### 7. Verificar que Funciona

```bash
# Verificar certificado
curl -I https://kellyapp.fromcolombiawithcoffees.com

# Verificar en navegador
# Abre: https://kellyapp.fromcolombiawithcoffees.com
```

## Solución de Problemas

### Error: "Domain not pointing to this server"

**Solución:**
1. Verifica que el DNS del dominio apunte correctamente:
   ```bash
   dig kellyapp.fromcolombiawithcoffees.com
   ```
2. Espera unos minutos para que los cambios de DNS se propaguen
3. Verifica que el puerto 80 esté abierto:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Error: "Port 80 is already in use"

**Solución:**
Si otra aplicación está usando el puerto 80, detén nginx temporalmente:
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d kellyapp.fromcolombiawithcoffees.com
sudo systemctl start nginx
```

### Error: "nginx configuration test failed"

**Solución:**
1. Verifica la configuración:
   ```bash
   sudo nginx -t
   ```
2. Revisa los logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```
3. Asegúrate de que la configuración tenga el formato correcto

### El certificado expiró

**Solución:**
Renueva manualmente:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

O verifica que la renovación automática esté configurada:
```bash
sudo systemctl status certbot.timer
```

## Verificar Estado del Certificado

```bash
# Ver información del certificado
sudo certbot certificates

# Ver fecha de expiración
echo | openssl s_client -servername kellyapp.fromcolombiawithcoffees.com -connect kellyapp.fromcolombiawithcoffees.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Renovación Automática

Let's Encrypt renueva automáticamente los certificados. Para verificar:

```bash
# Ver estado del timer
sudo systemctl status certbot.timer

# Ver logs de renovación
sudo journalctl -u certbot.timer
```

Los certificados se renuevan automáticamente cuando quedan menos de 30 días para expirar.

## Notas Importantes

1. **Email de contacto:** Let's Encrypt enviará notificaciones al email que proporciones
2. **Renovación:** Los certificados expiran cada 90 días, pero se renuevan automáticamente
3. **Firewall:** Asegúrate de que los puertos 80 y 443 estén abiertos
4. **DNS:** El dominio debe apuntar al servidor antes de obtener el certificado

