#!/bin/bash

# Script para instalar certificados SSL con Let's Encrypt
# Dominio: kellyapp.fromcolombiawithcoffees.com

set -e

echo "🔒 Instalación de Certificados SSL para Kelly App"
echo "=================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

DOMAIN="kellyapp.fromcolombiawithcoffees.com"

# Detect OS and set nginx paths accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (Homebrew)
    NGINX_DIR="/opt/homebrew/etc/nginx"
    NGINX_SERVERS_DIR="$NGINX_DIR/servers"
    NGINX_CONFIG="$NGINX_SERVERS_DIR/kellyapp.conf"
    NGINX_ENABLED=""
else
    # Linux (Debian/Ubuntu)
    NGINX_CONFIG="/etc/nginx/sites-available/kellyapp.conf"
    NGINX_ENABLED="/etc/nginx/sites-enabled/kellyapp.conf"
fi

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script debe ejecutarse como root (usa sudo)"
    exit 1
fi

# 1. Verificar que nginx está instalado
print_info "Verificando instalación de nginx..."
if ! command -v nginx &> /dev/null; then
    print_error "nginx no está instalado"
    print_info "Instalando nginx..."
    
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y nginx
    else
        print_error "Sistema operativo no soportado. Por favor instala nginx manualmente."
        exit 1
    fi
    print_success "nginx instalado"
else
    print_success "nginx está instalado"
fi

# 2. Verificar que la configuración de nginx existe
print_info "Verificando configuración de nginx..."
if [ ! -f "$NGINX_CONFIG" ]; then
    print_warning "Configuración de nginx no encontrada en $NGINX_CONFIG"
    print_info "Copiando configuración..."
    
    # Buscar el archivo de configuración en el proyecto
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_CONFIG="$SCRIPT_DIR/nginx/kellyapp.conf"
    
    if [ -f "$PROJECT_CONFIG" ]; then
        cp "$PROJECT_CONFIG" "$NGINX_CONFIG"
        print_success "Configuración copiada"
    else
        print_error "No se encontró la configuración en $PROJECT_CONFIG"
        print_info "Por favor, crea la configuración manualmente o copia nginx/kellyapp.conf a $NGINX_CONFIG"
        exit 1
    fi
else
    print_success "Configuración de nginx encontrada"
fi

# 3. Crear enlace simbólico si no existe (solo Linux)
if [[ "$OSTYPE" != "darwin"* ]]; then
    if [ ! -L "$NGINX_ENABLED" ]; then
        print_info "Creando enlace simbólico..."
        ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
        print_success "Enlace simbólico creado"
    fi
fi

# 4. Verificar configuración de nginx (sin SSL primero)
print_info "Verificando configuración de nginx..."
# Temporalmente comentar SSL para que nginx pueda iniciar
sed -i.bak 's/^[[:space:]]*ssl_certificate/#ssl_certificate/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_certificate_key/#ssl_certificate_key/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_protocols/#ssl_protocols/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_ciphers/#ssl_ciphers/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_prefer_server_ciphers/#ssl_prefer_server_ciphers/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_session_cache/#ssl_session_cache/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_session_timeout/#ssl_session_timeout/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/^[[:space:]]*ssl_session_tickets/#ssl_session_tickets/g' "$NGINX_CONFIG" 2>/dev/null || true

# Cambiar listen 443 a listen 80 temporalmente
sed -i.bak 's/listen 443 ssl http2;/listen 80;/g' "$NGINX_CONFIG" 2>/dev/null || true
sed -i.bak 's/listen \[::\]:443 ssl http2;/listen [::]:80;/g' "$NGINX_CONFIG" 2>/dev/null || true

if nginx -t; then
    print_success "Configuración de nginx es válida"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        nginx -s reload 2>/dev/null || brew services restart nginx 2>/dev/null || true
    else
        systemctl reload nginx || service nginx reload
    fi
    print_success "nginx recargado"
else
    print_error "Error en la configuración de nginx"
    print_info "Restaurando backup..."
    mv "$NGINX_CONFIG.bak" "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi

# 5. Verificar que el dominio apunta al servidor
print_info "Verificando DNS..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "unknown")

if [ "$DOMAIN_IP" = "$SERVER_IP" ] || [ "$DOMAIN_IP" != "" ]; then
    print_success "DNS configurado correctamente (IP: $DOMAIN_IP)"
else
    print_warning "Verifica que el dominio $DOMAIN apunte a este servidor (IP: $SERVER_IP)"
    print_warning "IP del dominio: $DOMAIN_IP"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. Instalar certbot
print_info "Verificando instalación de certbot..."
if ! command -v certbot &> /dev/null; then
    print_info "Instalando certbot..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (Homebrew)
        if command -v brew &> /dev/null; then
            brew install certbot
            print_success "certbot instalado"
        else
            print_error "Homebrew no está instalado. Por favor instala certbot manualmente: brew install certbot"
            exit 1
        fi
    elif [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y certbot python3-certbot-nginx
        print_success "certbot instalado"
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y certbot python3-certbot-nginx
        print_success "certbot instalado"
    else
        print_error "Sistema operativo no soportado. Por favor instala certbot manualmente."
        exit 1
    fi
else
    print_success "certbot está instalado"
fi

# 7. Restaurar configuración original antes de obtener certificado
print_info "Restaurando configuración de nginx..."
if [ -f "$NGINX_CONFIG.bak" ]; then
    mv "$NGINX_CONFIG.bak" "$NGINX_CONFIG"
    print_success "Configuración restaurada"
fi

# 8. Obtener certificado SSL
print_info "Obteniendo certificado SSL de Let's Encrypt..."
print_warning "Esto puede tomar unos minutos..."

if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@fromcolombiawithcoffees.com --redirect; then
    print_success "Certificado SSL instalado correctamente"
else
    print_error "Error al obtener el certificado SSL"
    print_info "Intentando con modo interactivo..."
    certbot --nginx -d $DOMAIN
fi

# 9. Verificar renovación automática
print_info "Verificando renovación automática..."
if certbot renew --dry-run; then
    print_success "Renovación automática configurada correctamente"
else
    print_warning "Hubo un problema con la renovación automática"
fi

# 10. Verificar que nginx funciona con SSL
print_info "Verificando configuración final de nginx..."
if nginx -t; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        nginx -s reload 2>/dev/null || brew services restart nginx 2>/dev/null || true
    else
        systemctl reload nginx || service nginx reload
    fi
    print_success "nginx recargado con configuración SSL"
else
    print_error "Error en la configuración de nginx después de instalar SSL"
    exit 1
fi

# 11. Verificar certificado
print_info "Verificando certificado SSL..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    print_success "Certificado SSL funcionando correctamente"
    echo ""
    print_success "✅ SSL instalado exitosamente!"
    echo ""
    print_info "Puedes acceder a tu aplicación en: https://$DOMAIN"
else
    print_warning "El certificado se instaló, pero hay un problema al acceder al sitio"
    print_info "Verifica los logs: sudo tail -f /var/log/nginx/kellyapp_error.log"
fi

echo ""
print_info "Próximos pasos:"
echo "  1. Verifica que tu aplicación esté corriendo en los puertos 3025 (frontend) y 3026 (backend)"
echo "  2. Accede a https://$DOMAIN en tu navegador"
echo "  3. Los certificados se renovarán automáticamente cada 90 días"

