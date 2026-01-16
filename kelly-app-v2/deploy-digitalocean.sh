#!/bin/bash

# Script de deploy para DigitalOcean
# Uso: ./deploy-digitalocean.sh

set -e

echo "🚀 Iniciando deploy en DigitalOcean..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio kelly-app-v2"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "   Instala Docker primero: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    echo "   Instala Docker Compose: apt install docker-compose-plugin -y"
    exit 1
fi

echo -e "${BLUE}📦 Construyendo imágenes...${NC}"
docker compose -f docker-compose.prod.yml build

echo -e "${BLUE}🛑 Deteniendo contenedores existentes...${NC}"
docker compose -f docker-compose.prod.yml down

echo -e "${BLUE}🚀 Iniciando contenedores...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✅ Deploy completado!${NC}"
echo ""
echo "📋 Verificar estado:"
echo "   docker compose -f docker-compose.prod.yml ps"
echo ""
echo "📋 Ver logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "📋 Reiniciar:"
echo "   docker compose -f docker-compose.prod.yml restart"
echo ""
