#!/bin/bash

# Script para desinstalar los servicios de launchd
# Uso: ./uninstall-launchd.sh

cd "$(dirname "$0")"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Desinstalando servicios de launchd...${NC}"
echo ""

# Detener y descargar servicios
echo -e "${BLUE}📋 Deteniendo servicios...${NC}"
launchctl unload ~/Library/LaunchAgents/com.kellyapp.backend.plist 2>/dev/null
launchctl unload ~/Library/LaunchAgents/com.kellyapp.frontend.plist 2>/dev/null

# Eliminar archivos plist
echo -e "${BLUE}🗑️  Eliminando archivos de configuración...${NC}"
rm -f ~/Library/LaunchAgents/com.kellyapp.backend.plist
rm -f ~/Library/LaunchAgents/com.kellyapp.frontend.plist

echo ""
echo -e "${GREEN}✅ Servicios desinstalados correctamente!${NC}"
echo ""
echo "💡 Los servidores ya no se iniciarán automáticamente al reiniciar"
echo ""
