#!/bin/bash

# Script de configuración inicial para DigitalOcean Droplet
# Ejecutar como root en el servidor

set -e

echo "🚀 Configurando servidor DigitalOcean para Kelly App..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Actualizar sistema
echo -e "${BLUE}📦 Actualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar Docker
echo -e "${BLUE}🐳 Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Docker ya está instalado${NC}"
fi

# Instalar Docker Compose
echo -e "${BLUE}🐳 Instalando Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    apt install docker-compose-plugin -y
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose ya está instalado${NC}"
fi

# Instalar Nginx
echo -e "${BLUE}🌐 Instalando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx ya está instalado${NC}"
fi

# Instalar Certbot
echo -e "${BLUE}🔒 Instalando Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ Certbot instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Certbot ya está instalado${NC}"
fi

# Configurar Firewall
echo -e "${BLUE}🔥 Configurando firewall...${NC}"
if ! command -v ufw &> /dev/null; then
    apt install ufw -y
fi

# Permitir puertos necesarios
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3025/tcp # Frontend (temporal, luego solo nginx)
ufw allow 3026/tcp # Backend (temporal, luego solo nginx)

# Activar firewall
echo "y" | ufw enable
echo -e "${GREEN}✅ Firewall configurado${NC}"

# Instalar Git
echo -e "${BLUE}📦 Instalando Git...${NC}"
apt install git -y

echo ""
echo -e "${GREEN}✅ Configuración inicial completada!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Clonar tu repositorio: git clone TU_REPO /root/kelly-app"
echo "   2. Configurar variables de entorno en backend/.env"
echo "   3. Configurar Nginx con tu dominio"
echo "   4. Obtener certificado SSL: certbot --nginx -d tu-dominio.com"
echo "   5. Ejecutar: docker compose -f docker-compose.prod.yml up -d --build"
echo ""
