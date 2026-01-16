#!/bin/bash

# Script para instalar los servicios de launchd (inicio automático)
# Uso: ./install-launchd.sh

cd "$(dirname "$0")"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Instalando servicios de launchd...${NC}"
echo ""

# Verificar que los archivos plist existen
if [ ! -f "com.kellyapp.backend.plist" ] || [ ! -f "com.kellyapp.frontend.plist" ]; then
    echo -e "${RED}❌ Error: No se encontraron los archivos .plist${NC}"
    exit 1
fi

# Detener servicios si ya están instalados
echo -e "${YELLOW}🛑 Deteniendo servicios existentes (si existen)...${NC}"
launchctl unload ~/Library/LaunchAgents/com.kellyapp.backend.plist 2>/dev/null
launchctl unload ~/Library/LaunchAgents/com.kellyapp.frontend.plist 2>/dev/null

# Crear directorio LaunchAgents si no existe
mkdir -p ~/Library/LaunchAgents

# Copiar archivos plist
echo -e "${BLUE}📋 Copiando archivos de configuración...${NC}"
cp com.kellyapp.backend.plist ~/Library/LaunchAgents/
cp com.kellyapp.frontend.plist ~/Library/LaunchAgents/

# Cargar servicios
echo -e "${BLUE}🚀 Cargando servicios...${NC}"
launchctl load ~/Library/LaunchAgents/com.kellyapp.backend.plist
launchctl load ~/Library/LaunchAgents/com.kellyapp.frontend.plist

echo ""
echo -e "${GREEN}✅ Servicios instalados correctamente!${NC}"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver estado:     launchctl list | grep kellyapp"
echo "   Iniciar:        launchctl start com.kellyapp.backend"
echo "                   launchctl start com.kellyapp.frontend"
echo "   Detener:        launchctl stop com.kellyapp.backend"
echo "                   launchctl stop com.kellyapp.frontend"
echo "   Desinstalar:    ./uninstall-launchd.sh"
echo ""
echo "💡 Los servidores se iniciarán automáticamente al reiniciar tu Mac"
echo ""
