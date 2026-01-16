# ⚙️ Configurar Nginx - Guía Rápida

## Método Rápido (Recomendado)

Ejecuta el script automatizado:

```bash
cd kelly-app-v2
chmod +x configure-nginx.sh
sudo ./configure-nginx.sh
```

El script automáticamente:
1. ✅ Verifica/instala nginx
2. ✅ Copia la configuración
3. ✅ Crea enlaces simbólicos
4. ✅ Verifica la sintaxis
5. ✅ Recarga nginx
6. ✅ Configura firewall

## Método Manual

### 1. Instalar Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y nginx
```

**CentOS/RHEL:**
```bash
sudo yum install -y nginx
```

### 2. Copiar Configuración

```bash
cd kelly-app-v2
sudo cp nginx/kellyapp.conf /etc/nginx/sites-available/kellyapp.conf
```

### 3. Crear Enlace Simbólico

```bash
sudo ln -s /etc/nginx/sites-available/kellyapp.conf /etc/nginx/sites-enabled/kellyapp.conf
```

### 4. Deshabilitar Configuración Default (opcional)

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

O si hay errores, reinicia:

```bash
sudo systemctl restart nginx
```

### 7. Verificar Estado

```bash
sudo systemctl status nginx
```

### 8. Abrir Puertos en Firewall

**UFW (Ubuntu):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

**Firewall-cmd (CentOS):**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Verificar que Funciona

### 1. Verificar que Nginx está corriendo

```bash
sudo systemctl status nginx
```

### 2. Verificar que responde

```bash
curl -I http://localhost
```

### 3. Verificar logs

```bash
# Logs de error
sudo tail -f /var/log/nginx/kellyapp_error.log

# Logs de acceso
sudo tail -f /var/log/nginx/kellyapp_access.log

# Logs generales
sudo tail -f /var/log/nginx/error.log
```

### 4. Verificar configuración activa

```bash
sudo nginx -T | grep -A 20 "server_name kellyapp"
```

## Estructura de la Configuración

La configuración de nginx está en:
- **Archivo fuente:** `kelly-app-v2/nginx/kellyapp.conf`
- **Ubicación en servidor:** `/etc/nginx/sites-available/kellyapp.conf`
- **Enlace simbólico:** `/etc/nginx/sites-enabled/kellyapp.conf`

### Características de la Configuración

- ✅ **Dominio:** `kellyapp.fromcolombiawithcoffees.com`
- ✅ **Frontend:** Proxy reverso a puerto 3025
- ✅ **Backend:** Proxy reverso a puerto 3026 (ruta `/api/`)
- ✅ **SSL:** Preparado para certificados Let's Encrypt
- ✅ **Seguridad:** Headers de seguridad configurados
- ✅ **Redirección:** HTTP → HTTPS

## Solución de Problemas

### Error: "nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)"

**Solución:**
```bash
# Ver qué está usando el puerto 80
sudo lsof -i :80
# O
sudo ss -tulpn | grep :80

# Detener el servicio que está usando el puerto
# Luego reiniciar nginx
sudo systemctl restart nginx
```

### Error: "nginx: [emerg] duplicate listen options"

**Solución:**
Verifica que no haya otra configuración escuchando en los mismos puertos:
```bash
sudo grep -r "listen 80" /etc/nginx/sites-enabled/
sudo grep -r "listen 443" /etc/nginx/sites-enabled/
```

### Error: "502 Bad Gateway"

**Solución:**
1. Verifica que la aplicación esté corriendo:
   ```bash
   # Frontend (puerto 3025)
   curl http://localhost:3025
   
   # Backend (puerto 3026)
   curl http://localhost:3026/api/health
   ```

2. Verifica los logs:
   ```bash
   sudo tail -f /var/log/nginx/kellyapp_error.log
   ```

### Error: "nginx: configuration file /etc/nginx/nginx.conf test failed"

**Solución:**
```bash
# Ver errores específicos
sudo nginx -t

# Verificar sintaxis del archivo de configuración
sudo nginx -T | grep -A 5 -B 5 "error"
```

### Nginx no inicia

**Solución:**
```bash
# Ver logs del sistema
sudo journalctl -u nginx -n 50

# Verificar permisos
sudo ls -la /var/log/nginx/
sudo chown -R www-data:www-data /var/log/nginx/
```

## Comandos Útiles

```bash
# Reiniciar nginx
sudo systemctl restart nginx

# Recargar configuración (sin downtime)
sudo systemctl reload nginx

# Ver estado
sudo systemctl status nginx

# Ver configuración completa
sudo nginx -T

# Ver solo la configuración de kellyapp
sudo nginx -T | grep -A 100 "server_name kellyapp"

# Ver procesos de nginx
ps aux | grep nginx

# Ver puertos en uso
sudo netstat -tulpn | grep nginx
```

## Próximos Pasos

Después de configurar nginx:

1. ✅ **Instalar SSL:** `sudo ./install-ssl.sh`
2. ✅ **Iniciar aplicación:** Asegúrate de que frontend y backend estén corriendo
3. ✅ **Verificar DNS:** El dominio debe apuntar al servidor
4. ✅ **Probar:** Accede a `http://kellyapp.fromcolombiawithcoffees.com`

