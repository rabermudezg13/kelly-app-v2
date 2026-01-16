#!/bin/bash

# Script para configurar Nginx para Kelly App
# Dominio: kellyapp.fromcolombiawithcoffees.com

set -e

echo "⚙️  Configuración de Nginx para Kelly App"
echo "==========================================="
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
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Use no-ssl config first, then install SSL later
CONFIG_FILE="$PROJECT_DIR/nginx/kellyapp-no-ssl.conf"

# Detect OS and set nginx paths accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (Homebrew)
    NGINX_DIR="/opt/homebrew/etc/nginx"
    NGINX_SERVERS_DIR="$NGINX_DIR/servers"
    NGINX_TARGET="$NGINX_SERVERS_DIR/kellyapp.conf"
    NGINX_AVAILABLE=""
    NGINX_ENABLED=""
else
    # Linux (Debian/Ubuntu)
    NGINX_AVAILABLE="/etc/nginx/sites-available/kellyapp.conf"
    NGINX_ENABLED="/etc/nginx/sites-enabled/kellyapp.conf"
    NGINX_TARGET="$NGINX_AVAILABLE"
    NGINX_SERVERS_DIR=""
fi

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script debe ejecutarse como root (usa sudo)"
    exit 1
fi

# 1. Verificar que nginx está instalado
print_info "Verificando instalación de nginx..."
if ! command -v nginx &> /dev/null; then
    print_warning "nginx no está instalado. Instalando..."
    
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

# 2. Verificar que el archivo de configuración existe
print_info "Verificando archivo de configuración..."
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "No se encontró el archivo de configuración en: $CONFIG_FILE"
    exit 1
fi
print_success "Archivo de configuración encontrado"

# 3. Crear directorio de logs si no existe
print_info "Creando directorio de logs..."
mkdir -p /var/log/nginx
print_success "Directorio de logs listo"

# 4. Copiar configuración
print_info "Copiando configuración de nginx..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: crear directorio servers si no existe
    if [ ! -d "$NGINX_SERVERS_DIR" ]; then
        mkdir -p "$NGINX_SERVERS_DIR"
        print_info "Directorio $NGINX_SERVERS_DIR creado"
    fi
    cp "$CONFIG_FILE" "$NGINX_TARGET"
    print_success "Configuración copiada a $NGINX_TARGET"
else
    # Linux: usar sites-available/sites-enabled
    cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
    print_success "Configuración copiada a $NGINX_AVAILABLE"
    
    # Crear enlace simbólico
    print_info "Creando enlace simbólico..."
    if [ -L "$NGINX_ENABLED" ]; then
        print_warning "Enlace simbólico ya existe. Eliminando..."
        rm "$NGINX_ENABLED"
    fi
    ln -s "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    print_success "Enlace simbólico creado"
fi

# 6. Verificar que no hay conflictos con otras configuraciones
print_info "Verificando configuraciones existentes..."
if [[ "$OSTYPE" != "darwin"* ]]; then
    if [ -f /etc/nginx/sites-enabled/default ]; then
        print_warning "Configuración 'default' encontrada. Deshabilitando..."
        rm -f /etc/nginx/sites-enabled/default
        print_success "Configuración 'default' deshabilitada"
    fi
fi

# 7. Verificar sintaxis de nginx
print_info "Verificando sintaxis de configuración de nginx..."
if nginx -t; then
    print_success "Sintaxis de configuración correcta"
else
    print_error "Error en la sintaxis de configuración"
    print_info "Revisa los errores arriba y corrige la configuración"
    exit 1
fi

# 8. Verificar que los puertos no estén en uso por otras configuraciones
print_info "Verificando puertos..."
if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
    print_warning "Puerto 80 está en uso"
    print_info "Verificando qué está usando el puerto 80..."
    lsof -i :80 2>/dev/null || ss -tulpn | grep :80 || true
fi

if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
    print_warning "Puerto 443 está en uso"
    print_info "Verificando qué está usando el puerto 443..."
    lsof -i :443 2>/dev/null || ss -tulpn | grep :443 || true
fi

# 9. Recargar nginx
print_info "Recargando nginx..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: usar nginx -s reload o brew services
    if nginx -s reload 2>/dev/null; then
        print_success "nginx recargado correctamente"
    elif brew services restart nginx 2>/dev/null; then
        print_success "nginx reiniciado correctamente (brew services)"
    else
        print_warning "No se pudo recargar nginx automáticamente"
        print_info "Intenta manualmente: sudo nginx -s reload"
    fi
else
    # Linux: usar systemctl
    if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
        print_success "nginx recargado correctamente"
    else
        print_warning "No se pudo recargar nginx. Intentando reiniciar..."
        if systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null; then
            print_success "nginx reiniciado correctamente"
        else
            print_error "No se pudo reiniciar nginx"
            print_info "Intenta manualmente: sudo systemctl restart nginx"
        fi
    fi
fi

# 10. Verificar que nginx está corriendo
print_info "Verificando estado de nginx..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: verificar con pgrep o brew services
    if pgrep nginx > /dev/null 2>&1; then
        print_success "nginx está corriendo"
    else
        print_warning "nginx no está corriendo"
        print_info "Iniciando nginx..."
        if brew services start nginx 2>/dev/null || nginx 2>/dev/null; then
            print_success "nginx iniciado"
        else
            print_error "No se pudo iniciar nginx"
            print_info "Intenta manualmente: brew services start nginx"
        fi
    fi
else
    # Linux: usar systemctl
    if systemctl is-active --quiet nginx || pgrep nginx > /dev/null; then
        print_success "nginx está corriendo"
    else
        print_error "nginx no está corriendo"
        print_info "Intentando iniciar nginx..."
        if systemctl start nginx 2>/dev/null || service nginx start 2>/dev/null; then
            print_success "nginx iniciado"
        else
            print_error "No se pudo iniciar nginx"
            exit 1
        fi
    fi
fi

# 11. Habilitar nginx para que inicie al arrancar
print_info "Habilitando nginx para inicio automático..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: usar brew services
    if brew services start nginx 2>/dev/null; then
        print_success "nginx habilitado para inicio automático (brew services)"
    else
        print_warning "No se pudo habilitar inicio automático (puede que ya esté habilitado)"
    fi
else
    # Linux: usar systemctl
    if systemctl enable nginx 2>/dev/null; then
        print_success "nginx habilitado para inicio automático"
    else
        print_warning "No se pudo habilitar inicio automático (puede que ya esté habilitado)"
    fi
fi

# 12. Verificar firewall
print_info "Verificando firewall..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "80/tcp" && ufw status | grep -q "443/tcp"; then
        print_success "Puertos 80 y 443 están abiertos en el firewall"
    else
        print_warning "Puertos 80 y 443 no están abiertos en el firewall"
        read -p "¿Abrir puertos 80 y 443 en el firewall? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ufw allow 80/tcp
            ufw allow 443/tcp
            print_success "Puertos abiertos en el firewall"
        fi
    fi
elif command -v firewall-cmd &> /dev/null; then
    print_info "Firewall-cmd detectado. Verifica manualmente los puertos 80 y 443"
else
    print_info "No se detectó firewall. Asegúrate de que los puertos 80 y 443 estén abiertos"
fi

# 13. Mostrar resumen
echo ""
print_success "✅ Configuración de nginx completada!"
echo ""
print_info "Resumen:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - Configuración copiada a: $NGINX_TARGET"
else
    echo "  - Configuración copiada a: $NGINX_AVAILABLE"
    echo "  - Enlace simbólico creado en: $NGINX_ENABLED"
fi
echo "  - Dominio configurado: $DOMAIN"
echo "  - Frontend: puerto 3025"
echo "  - Backend: puerto 3026"
echo ""
print_info "Próximos pasos:"
echo "  1. Asegúrate de que tu aplicación esté corriendo:"
echo "     - Frontend en puerto 3025"
echo "     - Backend en puerto 3026"
echo "  2. Verifica que el DNS apunta a este servidor:"
echo "     dig $DOMAIN"
echo "  3. Prueba la configuración (HTTP):"
echo "     curl -I http://$DOMAIN"
echo "  4. Instala certificados SSL:"
echo "     sudo ./install-ssl.sh"
echo "     (Esto actualizará automáticamente la configuración para usar SSL)"
echo ""
print_info "Para ver los logs:"
echo "  sudo tail -f /var/log/nginx/kellyapp_error.log"
echo "  sudo tail -f /var/log/nginx/kellyapp_access.log"

